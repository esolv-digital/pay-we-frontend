# Auto-Redirect to Login on 401 (Unauthorized)

## Overview
The application now automatically redirects users to the login page when it receives a 401 (Unauthorized) response from the API, and properly cleans up all authentication data.

## Implementation Details

### 1. API Client Interceptor ([src/lib/api/client.ts](src/lib/api/client.ts))

The Axios response interceptor handles 401 errors in the following way:

```typescript
// When 401 is received:
1. Check if already retried (prevent infinite loops)
2. If not retried yet:
   - Try to refresh the token via /auth/refresh
   - If refresh succeeds: Retry original request
   - If refresh fails: Clean up and redirect to login
3. If already retried and still 401:
   - Clean up and redirect to login
```

### 2. Cleanup Process

When a 401 error occurs and token refresh fails, the following cleanup happens:

**`clearAuthAndRedirect()` method:**

```typescript
1. Clear localStorage (removes persisted auth store)
2. Clear sessionStorage (removes any session data)
3. Call /auth/logout endpoint (fire-and-forget)
   - Clears HTTP-only cookies
   - Notifies Laravel backend
4. Redirect to /login page
```

### 3. Logout Endpoint ([src/app/api/auth/logout/route.ts](src/app/api/auth/logout/route.ts))

The logout endpoint ensures complete cleanup:

```typescript
1. Get access_token from cookies
2. If token exists:
   - Call Laravel /api/v1/auth/logout
3. Delete access_token cookie
4. Delete token_expires_at cookie
5. Return success response
```

**Important:** Even if Laravel logout fails, cookies are still cleared on the Next.js side.

## User Experience Flow

### Scenario 1: Token Expires While User is Active

```
User → Makes API request → 401 Error
   ↓
API Client → Tries to refresh token
   ↓
Refresh succeeds → Request retried → User continues working ✓
```

### Scenario 2: Token Expires and Refresh Fails

```
User → Makes API request → 401 Error
   ↓
API Client → Tries to refresh token
   ↓
Refresh fails (401)
   ↓
Clean up:
- localStorage cleared
- sessionStorage cleared
- Cookies cleared via logout endpoint
   ↓
Redirect to /login → User sees login page
```

### Scenario 3: User is Already Logged Out on Backend

```
User → Makes API request → 401 Error
   ↓
API Client → Skips refresh (already retried)
   ↓
Clean up immediately → Redirect to /login
```

## Protected Routes

The following routes **skip** auto-retry and cleanup:

- `/login` - Already on login page
- `/register` - Already on public page
- `/` - Landing page (public)
- `/auth/*` - Auth endpoints themselves

This prevents infinite loops and unnecessary redirects.

## Console Logging

For debugging, the following logs are output:

```
[API Client] Token refresh failed. Cleaning up and redirecting to login...
[API Client] 401 after retry. Cleaning up and redirecting to login...
[API Client] Redirecting to login page...
```

## Benefits

✅ **Automatic cleanup** - No manual intervention needed
✅ **Security** - All auth data is cleared on logout
✅ **User-friendly** - Smooth redirect to login page
✅ **No infinite loops** - Retry logic prevents repeated failures
✅ **Complete cleanup** - localStorage, sessionStorage, and cookies all cleared
✅ **Backend notification** - Laravel is informed of logout
✅ **Graceful handling** - Works even if backend is down

## Testing

To test the auto-redirect:

1. **Expire token manually:**
   - Login to app
   - Delete `access_token` cookie in DevTools
   - Try to navigate or make an API call
   - Should auto-redirect to login

2. **Backend returns 401:**
   - Login to app
   - Stop Laravel backend
   - Make any protected API call
   - Should see cleanup logs and redirect to login

3. **Token refresh failure:**
   - Login to app
   - Modify /auth/refresh endpoint to return 401
   - Make any API call
   - Should redirect to login after failed refresh

## Edge Cases Handled

✅ Server-side rendering (window check)
✅ Already on public routes (skip redirect)
✅ Auth endpoints (skip retry)
✅ Infinite retry loops (retry flag)
✅ Backend unavailable (fire-and-forget logout)
✅ LocalStorage cleared properly (Zustand persist removed)

## Related Files

- [src/lib/api/client.ts](src/lib/api/client.ts) - Main interceptor
- [src/app/api/auth/logout/route.ts](src/app/api/auth/logout/route.ts) - Logout endpoint
- [src/lib/stores/auth-store.ts](src/lib/stores/auth-store.ts) - Auth state (persisted)
- [src/middleware.ts](src/middleware.ts) - Route protection

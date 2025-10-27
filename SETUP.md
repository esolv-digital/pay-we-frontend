# PayWe Frontend Setup Guide

## Prerequisites

Before running the frontend, ensure you have:
- Node.js 18+ installed
- Yarn package manager
- Laravel API backend running (default: `http://localhost:8000`)

## Environment Configuration

The frontend requires the Laravel API backend to be running. The connection settings are configured in `.env.local`:

```env
# Laravel API (server-side only - used by Next.js API routes)
LARAVEL_API_URL=http://localhost:8000

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Starting the Development Server

1. **Start the Laravel API backend first:**
   ```bash
   # Navigate to Laravel project
   cd ../backend
   php artisan serve
   # Should start on https://backend.pay-we.test
   ```

2. **Start the Next.js frontend:**
   ```bash
   # In the frontend directory
   yarn dev
   # Should start on http://localhost:3001
   ```

## Architecture: Backend for Frontend (BFF) Pattern

The frontend uses the BFF pattern, which means:

```
User → Next.js Frontend (localhost:3001)
         ↓
     Next.js API Routes (/api/*)
         ↓
     Laravel API (localhost:8000)
```

**Why BFF?**
- Tokens stored in HTTP-only cookies (more secure)
- Laravel credentials never exposed to client
- Centralized error handling
- Easy to add caching/transformation layer

## Available Routes

### Public Routes (No Authentication)
- `/` - Landing page with beautiful modern UI
- `/login` - Sign in page
- `/register` - Create new account
- `/onboarding` - Complete organization setup (after registration)

### Protected Routes (Authentication Required)
- `/vendor/dashboard` - Vendor dashboard
- `/vendor/transactions` - View transactions
- `/vendor/payment-pages` - Manage payment pages
- `/admin/dashboard` - Admin dashboard (super admins only)

## Authentication Flow

Based on the OpenAPI specification:

1. **New User:**
   ```
   Register (/register)
     ↓
   Backend returns: requires_onboarding: true
     ↓
   Auto-redirect to /onboarding
     ↓
   User sets up organization
     ↓
   Redirect to /vendor/dashboard
   ```

2. **Existing User:**
   ```
   Login (/login)
     ↓
   Check requires_onboarding flag
     ↓
   If false: → Dashboard
   If true: → Onboarding
   ```

## API Routes (Next.js BFF Layer)

All API routes proxy to Laravel API:

- `POST /api/auth/register` → Laravel: `/api/v1/auth/register`
- `POST /api/auth/login` → Laravel: `/api/v1/auth/login`
- `POST /api/auth/logout` → Laravel: `/api/v1/auth/logout`
- `GET /api/auth/me` → Laravel: `/api/v1/auth/me`
- `POST /api/onboarding/organization` → Laravel: `/api/v1/onboarding/organization`

## Error Handling

### Connection Refused Error

If you see:
```
Login error: Error [AggregateError]: ECONNREFUSED
```

**Solution:**
1. Check if Laravel API is running: `curl http://localhost:8000`
2. Verify `LARAVEL_API_URL` in `.env.local`
3. Check Laravel logs for errors

### 401 Errors on Login Page

This has been fixed. The frontend now:
- Skips user authentication checks on public routes
- Doesn't attempt token refresh on auth endpoints
- Shows clear error messages for connection issues

## Technology Stack

- **Framework:** Next.js 15.5.4 with App Router
- **React:** 19.1.0
- **TypeScript:** Strict mode
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (New York style)
- **State Management:** Zustand + TanStack Query
- **Form Handling:** React Hook Form + Zod
- **Icons:** lucide-react

## Development Tips

1. **Hot Reload:** Changes to frontend code trigger instant updates
2. **Type Safety:** All API types match OpenAPI spec exactly
3. **Error Messages:** Check browser console and terminal for detailed errors
4. **API Testing:** Use browser DevTools Network tab to inspect API calls

## Troubleshooting

### Port Already in Use
If port 3001 is taken, Next.js will automatically use the next available port. Check terminal output for the actual URL.

### TypeScript Errors
Run `yarn tsc --noEmit` to check for type errors without building.

### Styling Issues
Clear Next.js cache: `rm -rf .next && yarn dev`

## Next Steps

1. Ensure Laravel API is running and accessible
2. Test the complete auth flow:
   - Register new account
   - Complete onboarding
   - Access vendor dashboard
3. Check that cookies are being set properly (DevTools → Application → Cookies)

## Support

For issues or questions, refer to:
- [Agent.md](./Agent.md) - Project architecture details
- OpenAPI documentation in project root
- Next.js 15 documentation

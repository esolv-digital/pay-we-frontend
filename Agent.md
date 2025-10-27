# Agent.md - PayWe Payment Hub Frontend

## Project Architecture

This is a **Next.js 15** payment platform frontend built with the **Backend for Frontend (BFF)** pattern, designed to integrate with a Laravel API backend. The project is in **early setup stage** - currently only scaffolded with Next.js boilerplate and minimal shadcn/ui components.

### Key Architecture Pattern: BFF (Backend for Frontend)

**Critical:** Never call the Laravel API directly from client components. All backend communication flows through Next.js API routes:

```
Client Components → Next.js API Routes (/src/app/api/*) → Laravel Backend
```

This pattern:
- Keeps Laravel credentials server-side only
- Manages authentication tokens via HTTP-only cookies
- Provides a security layer and request/response transformation
- Enables automatic token refresh without client involvement

## Technology Stack

**Framework:** Next.js 15.5.4 (App Router) with Turbopack
**React:** v19.1.0
**TypeScript:** Strict mode enabled
**Styling:** Tailwind CSS v4 + shadcn/ui (New York style)
**State Management:**
- Server state: TanStack Query (@tanstack/react-query v5)
- Client state: Zustand (not yet installed)
- Form state: React Hook Form + Zod (not yet installed)

**UI Components:** shadcn/ui with CVA (class-variance-authority)
**Icons:** lucide-react

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login, register)
│   ├── (dashboard)/         # Protected routes
│   │   ├── admin/          # Admin-only features
│   │   └── vendor/         # Vendor features
│   ├── api/                # BFF API routes (server-side only)
│   │   ├── auth/           # Auth endpoints (login, logout, refresh)
│   │   ├── admin/          # Admin endpoints (proxy to Laravel)
│   │   └── vendor/         # Vendor endpoints (proxy to Laravel)
│   └── layout.tsx
│
├── lib/
│   ├── api/                # API clients
│   │   ├── client.ts       # Frontend client (calls Next.js routes)
│   │   ├── laravel-client.ts  # Server-side Laravel client
│   │   ├── auth.ts         # Auth API methods
│   │   ├── admin.ts        # Admin API methods
│   │   └── vendor.ts       # Vendor API methods
│   │
│   ├── hooks/              # React hooks
│   │   ├── use-auth.ts
│   │   ├── use-transactions.ts
│   │   └── use-payment-pages.ts
│   │
│   ├── stores/             # Zustand stores
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   │
│   └── utils/
│       ├── cn.ts           # Class name utility (clsx + tailwind-merge)
│       └── validators.ts   # Zod schemas
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   └── layouts/            # Layout components (sidebars, headers)
│
├── types/                  # TypeScript type definitions
│   ├── auth.ts
│   ├── user.ts
│   ├── transaction.ts
│   └── payment-page.ts
│
└── middleware.ts           # Route protection (auth check)
```

## Current State (Fresh Setup)

**What exists:**
- Next.js 15 with App Router
- TypeScript configuration with `@/*` path alias
- Tailwind CSS v4 configured
- shadcn/ui initialized (New York style, neutral theme)
- One UI component: Button ([src/components/ui/button.tsx](src/components/ui/button.tsx))
- TanStack Query installed

**What's missing (needs implementation):**
- All API routes under `/src/app/api/*`
- Type definitions in `/src/types/*`
- API clients in `/src/lib/api/*`
- React hooks in `/src/lib/hooks/*`
- Zustand stores (package not installed)
- React Hook Form + Zod (packages not installed)
- Authentication flow and middleware
- Dashboard layouts and pages
- Form components

## Development Workflow

### Running the App

```bash
npm run dev        # Development with Turbopack (default port 3000)
npm run build      # Production build with Turbopack
npm run start      # Start production server
npm run lint       # ESLint check
```

### Adding shadcn/ui Components

The project uses shadcn/ui CLI. Add components with:

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/` with:
- New York style
- Neutral base color
- CSS variables enabled
- lucide-react icons

### Path Aliases

TypeScript is configured with `@/*` pointing to `src/*`:

```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## Authentication Pattern (To Be Implemented)

### Token Management

1. **Login Flow:**
   - Client calls `/api/auth/login` with credentials
   - Next.js API route forwards to Laravel `/api/v1/auth/login`
   - Laravel returns `access_token` and user data
   - Next.js sets HTTP-only cookie with token
   - Returns user data to client (without exposing token)

2. **Authenticated Requests:**
   - Client calls Next.js API routes (e.g., `/api/vendor/transactions`)
   - Next.js reads token from HTTP-only cookie
   - Forwards request to Laravel with `Authorization: Bearer {token}`
   - Returns data to client

3. **Token Refresh:**
   - Axios interceptor in frontend client detects 401 responses
   - Automatically calls `/api/auth/refresh`
   - Next.js route refreshes token with Laravel
   - Updates HTTP-only cookie
   - Retries original request

### Role-Based Access Control

The system supports two role hierarchies:

**Platform Roles:** `super_admin`, `platform_admin`, `support_staff`, `vendor`
**Organization Roles:** `owner`, `admin`, `finance`, `operator`, `viewer`

Check permissions using Zustand store methods:
```typescript
const { hasRole, hasPermission, hasOrganizationPermission } = useAuthStore()

if (hasRole('super_admin')) { /* admin only */ }
if (hasOrganizationPermission('manage_payment_pages')) { /* org permission */ }
```

## Styling Conventions

### Tailwind CSS Usage

Use the `cn()` utility from [src/lib/utils.ts](src/lib/utils.ts) for conditional class merging:

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  className  // Allow prop overrides
)} />
```

### shadcn/ui Component Pattern

All UI components follow this structure:
- Use `class-variance-authority` (CVA) for variants
- Forward refs with proper TypeScript types
- Accept `className` prop for customization
- Use Radix UI primitives where applicable

Example from Button component:
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: { variant: {...}, size: {...} },
    defaultVariants: { variant: "default", size: "default" }
  }
)
```

## Type Safety

### Type Definitions (Planned)

All API types will be defined in `src/types/*`:
- Match Laravel API response structures exactly
- Use TypeScript utility types for reusability
- Define Zod schemas in `src/lib/utils/validators.ts` for runtime validation

### API Response Pattern

Expected structure for all API responses:
```typescript
interface ApiResponse<T> {
  data: T
  message?: string
  meta?: PaginationMeta  // For paginated responses
}
```

## Critical Implementation Notes

### Environment Variables

When implementing, create `.env.local` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000          # For client-side
LARAVEL_API_URL=http://localhost:8000              # For server-side
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Security Checklist

- ✅ Never expose Laravel API tokens to client
- ✅ Use HTTP-only cookies for token storage
- ✅ Implement CSRF protection in forms
- ✅ Validate all inputs with Zod before API calls
- ✅ Use middleware for route protection
- ✅ Check permissions on both frontend and backend

### Data Fetching Pattern

Use TanStack Query for all server state:

```typescript
// Good: Server state with React Query
const { data, isLoading } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: () => vendorApi.getTransactions(filters)
})

// Use Zustand only for client state (UI, preferences)
const { sidebarOpen, toggleSidebar } = useUIStore()
```

### Form Pattern (To Be Implemented)

Standard pattern for forms:
1. Define Zod schema in `src/lib/utils/validators.ts`
2. Use `react-hook-form` with `@hookform/resolvers/zod`
3. Wrap mutations with TanStack Query's `useMutation`
4. Handle optimistic updates for better UX

## Testing

Playwright is installed for E2E testing. Test files go in `tests/` or `__tests__/`.

## Next Implementation Steps

Based on the design document in the user's message, implement in this order:

1. Install missing dependencies (zustand, react-hook-form, zod, axios)
2. Create type definitions in `src/types/*`
3. Build API clients (frontend + Laravel server-side)
4. Implement authentication flow + middleware
5. Create Zustand stores for auth and UI state
6. Build protected layouts (admin, vendor)
7. Implement dashboard pages with TanStack Query hooks
8. Add form components with validation

## Additional Resources

- Project uses Turbopack (Next.js 15's default bundler)
- ESLint with Next.js config and TanStack Query plugin
- Consider adding Prettier for consistent formatting

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

---

## Public Payment Pages Implementation

### Overview
The PayWe frontend supports two URL formats for public payment pages:

1. **Short URL Format** (Legacy): `/pay/{short_url}` - e.g., `/pay/Xorp2Pto`
2. **SEO-Friendly URL Format** (Recommended): `/pay/{vendor_slug}/{payment_page_slug}` - e.g., `/pay/qqq-YM2D/product-purchase`

### Architecture & Design Principles

This implementation follows **SOLID** principles and **DRY** (Don't Repeat Yourself):

#### Single Responsibility Principle (SRP)
- **API Routes**: Each route handles one specific endpoint (payment page retrieval or transaction creation)
- **Components**: `PaymentPageForm` component is responsible only for rendering the payment form
- **Page Components**: Short URL and SEO URL pages only handle data fetching and routing logic

#### Open/Closed Principle (OCP)
- The system is open for extension (new payment methods, customizations) but closed for modification
- New URL formats can be added without modifying existing code

#### Liskov Substitution Principle (LSP)
- Both short URL and SEO URL pages can be used interchangeably
- They both return the same payment page structure and behavior

#### Interface Segregation Principle (ISP)
- Public API methods have focused, clean interfaces
- Each method does one thing well

#### Dependency Inversion Principle (DIP)
- All components depend on abstractions (`publicApi`, `PaymentPage` types) not concrete implementations
- Laravel client is abstracted away from the components

#### DRY (Don't Repeat Yourself)
- **Shared Component**: `PaymentPageForm` is used by both URL formats
- **Type Definitions**: `CreateTransactionData` interface is reused across all transaction methods
- **API Client**: Both URL formats use the same underlying API client

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── pay/
│   │       ├── [short_url]/
│   │       │   ├── route.ts                          # Short URL API endpoint
│   │       │   └── transactions/
│   │       │       └── route.ts                      # Short URL transaction endpoint
│   │       └── [vendor_slug]/
│   │           └── [payment_page_slug]/
│   │               ├── route.ts                      # SEO URL API endpoint
│   │               └── transactions/
│   │                   └── route.ts                  # SEO URL transaction endpoint
│   └── (public)/
│       └── pay/
│           ├── [slug]/
│           │   └── page.tsx                          # Short URL public page
│           └── [vendor_slug]/
│               └── [payment_page_slug]/
│                   └── page.tsx                      # SEO URL public page
├── components/
│   └── payment/
│       └── payment-page-form.tsx                     # Shared payment form component (DRY)
└── lib/
    └── api/
        └── public.ts                                 # Public API client methods
```

### API Endpoints

#### Backend (Laravel)
```
GET  /api/v1/pay/{short_url}                          # Get payment page by short URL
POST /api/v1/pay/{short_url}/transactions             # Create transaction via short URL
GET  /api/v1/pay/{vendor_slug}/{payment_page_slug}    # Get payment page by SEO URL
POST /api/v1/pay/{vendor_slug}/{payment_page_slug}/transactions  # Create transaction via SEO URL
```

#### Frontend (Next.js API Routes - BFF Pattern)
```
GET  /api/pay/{short_url}                             # Proxies to backend short URL
POST /api/pay/{short_url}/transactions                # Proxies to backend transactions
GET  /api/pay/{vendor_slug}/{payment_page_slug}       # Proxies to backend SEO URL
POST /api/pay/{vendor_slug}/{payment_page_slug}/transactions  # Proxies to backend SEO transactions
```

#### Frontend (Public Pages)
```
/pay/{short_url}                                      # Short URL payment page
/pay/{vendor_slug}/{payment_page_slug}                # SEO-friendly payment page
```

### Public API Methods

Located in [src/lib/api/public.ts](src/lib/api/public.ts):

```typescript
// Short URL methods
publicApi.getPaymentPageByShortUrl(shortUrl: string): Promise<PaymentPage>
publicApi.createTransaction(shortUrl: string, data: CreateTransactionData): Promise<Transaction>

// SEO URL methods
publicApi.getPaymentPageBySeoUrl(vendorSlug: string, paymentPageSlug: string): Promise<PaymentPage>
publicApi.createTransactionBySeoUrl(vendorSlug: string, paymentPageSlug: string, data: CreateTransactionData): Promise<Transaction>

// Transaction lookup
publicApi.getTransactionByReference(reference: string): Promise<Transaction>
```

### Component Usage

#### PaymentPageForm Component

**Location:** [src/components/payment/payment-page-form.tsx](src/components/payment/payment-page-form.tsx)

Shared component that handles all payment form logic (following **DRY** principle):

```typescript
interface PaymentPageFormProps {
  paymentPage: PaymentPage;
  onSubmit: (data: CreateTransactionData) => Promise<unknown>;
}
```

**Features:**
- Handles all form validation using React Hook Form + Zod
- Supports customization (colors, themes, logos)
- Manages transaction creation state
- Handles success/error states
- Supports all payment page types (fixed, flexible, donation)
- Collects customer info and shipping address when configured

**SOLID Principles Applied:**
- **SRP**: Only responsible for rendering the payment form UI
- **OCP**: Customizations can be extended via metadata without modifying the component
- **DIP**: Depends on `PaymentPage` abstraction, not concrete implementation

### SEO Benefits

The SEO-friendly URL format provides:

1. **Better Search Engine Ranking**: Readable URLs with keywords
2. **Improved User Experience**: Users can understand the URL structure
3. **Better Sharing**: URLs are more descriptive when shared on social media
4. **Brand Recognition**: Vendor slug in URL reinforces brand identity

### Example URLs

**Short URL (Legacy)**
```
https://pay-we.com/pay/Xorp2Pto
```

**SEO URL (Recommended)**
```
https://pay-we.com/pay/qqq-YM2D/product-purchase
```

Both URLs render the exact same payment page using the shared `PaymentPageForm` component, but the SEO URL is:
- More descriptive
- Better for search engines
- Easier to remember
- Better for brand recognition

### Payment Pages List

The payment pages list ([src/app/(dashboard)/vendor/payment-pages/page.tsx](src/app/(dashboard)/vendor/payment-pages/page.tsx)) displays:

- Payment page title and status
- Amount type (fixed, flexible, donation)
- Short URL code
- **Preview Page** button that opens the SEO-friendly URL in a new tab
- View and Edit buttons for management

The preview link uses the SEO-friendly format when vendor data is available, falling back to short URL if not:

```typescript
href={page.vendor ? `/pay/${page.vendor.slug}/${page.slug}` : `/pay/${page.short_url}`}
```

### Error Handling

All API routes include proper error handling:

- **503 Service Unavailable**: When backend API is unreachable (`ECONNREFUSED`)
- **404 Not Found**: When payment page doesn't exist
- **500 Internal Server Error**: For other backend errors
- Validation errors are returned with proper status codes and error details

### Security

- All public endpoints are **unauthenticated** (as intended for public payment pages)
- No sensitive data is exposed in responses
- HTTP-only cookies are used for authenticated routes (not applicable to public pages)
- CORS is handled at the Next.js API route level
- Input validation on all transaction creation endpoints

### Testing URLs

**Short URL Example:**
```
http://localhost:3000/pay/Xorp2Pto
```

**SEO URL Example:**
```
http://localhost:3000/pay/qqq-YM2D/product-purchase
```

### Future Enhancements

Potential improvements following SOLID principles:

1. **Payment Gateway Integration**: Add payment provider adapters (Stripe, PayPal, etc.) using Strategy pattern
2. **Analytics Tracking**: Add event tracking for page views and conversions (Observer pattern)
3. **A/B Testing**: Support for testing different page customizations (Strategy pattern)
4. **Multi-language Support**: Internationalization for payment pages (i18n)
5. **Custom Domain Support**: Allow vendors to use custom domains (requires DNS configuration)
6. **QR Code Generation**: Generate QR codes for payment pages on-the-fly

### Best Practices for Extension

When extending this implementation:

1. **Always use the shared component** (`PaymentPageForm`) for consistency (DRY)
2. **Add new URL formats as new routes**, don't modify existing ones (OCP)
3. **Keep API methods focused** on single responsibility (SRP)
4. **Use TypeScript types** for all data structures (type safety)
5. **Document SOLID principles** in comments for complex logic
6. **Test both URL formats** when making changes
7. **Follow the BFF pattern** - never call Laravel API directly from client

### Related Files

- **Types**: [src/types/payment-page.ts](src/types/payment-page.ts), [src/types/vendor.ts](src/types/vendor.ts)
- **API Client**: [src/lib/api/client.ts](src/lib/api/client.ts), [src/lib/api/laravel-client.ts](src/lib/api/laravel-client.ts)
- **Public API**: [src/lib/api/public.ts](src/lib/api/public.ts)
- **Hooks**: [src/lib/hooks/use-payment-pages.ts](src/lib/hooks/use-payment-pages.ts)
- **Utils**: [src/lib/utils/format.ts](src/lib/utils/format.ts), [src/lib/utils/error-handler.ts](src/lib/utils/error-handler.ts)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy for authentication and route protection.
 *
 * This implements the BFF pattern as per Agent.md:
 * - Token-based authentication using HTTP-only cookies
 * - Public routes allow unauthenticated access
 * - Protected routes require authentication token
 * - Organization checks happen client-side via useOrganizationCheck hook
 *
 * Flow:
 * 1. Check if route is public (login, register, home)
 * 2. For protected routes, verify authentication token exists
 * 3. Redirect to login if token missing
 * 4. Organization verification happens in DashboardLayout via useOrganizationCheck
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for certain paths
  const shouldSkip =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || // Skip files with extensions (images, fonts, etc.)
    pathname === '/favicon.ico';

  if (shouldSkip) {
    return NextResponse.next();
  }

  // Get token and user context from cookies
  const token = request.cookies.get('access_token')?.value;
  const userContext = request.cookies.get('user_context')?.value as 'admin' | 'vendor' | undefined;

  // Onboarding route is protected but doesn't require organization check here
  // (organization check happens client-side)
  const isOnboardingRoute = pathname.startsWith('/onboarding');

  // Protected dashboard routes that require authentication AND organization
  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isDashboardRoute = isAdminRoute || isVendorRoute;

  // If trying to access protected route without token, redirect to login
  if (!token && (isDashboardRoute || isOnboardingRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Enforce context-based route protection
  // Only enforce if we have a user_context cookie (set on login/context switch)
  // This prevents users from accessing wrong dashboards after context switch
  if (token && userContext && isDashboardRoute) {
    if (userContext === 'admin' && isVendorRoute) {
      // Admin context trying to access vendor route - redirect to admin dashboard
      console.log(`[Proxy] Admin context user trying to access vendor route: ${pathname}, redirecting to admin dashboard`);
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    if (userContext === 'vendor' && isAdminRoute) {
      // Vendor context trying to access admin route - redirect to vendor dashboard
      console.log(`[Proxy] Vendor context user trying to access admin route: ${pathname}, redirecting to vendor dashboard`);
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }
  }

  // Redirect authenticated users from home page to their appropriate dashboard
  if (token && pathname === '/') {
    if (userContext === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      // Default to vendor dashboard if no context or vendor context
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};

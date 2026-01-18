import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for authentication and route protection.
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
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for certain paths
  const shouldSkipMiddleware =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || // Skip files with extensions (images, fonts, etc.)
    pathname === '/favicon.ico';

  if (shouldSkipMiddleware) {
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
  // Admin users cannot access vendor routes and vice versa
  // if (token && userContext && isDashboardRoute) {
  //   if (userContext === 'admin' && isVendorRoute) {
  //     // Admin trying to access vendor route - redirect to admin dashboard
  //     console.log(`[Middleware] Admin user trying to access vendor route: ${pathname}, redirecting to admin dashboard`);
  //     return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  //   }

  //   if (userContext === 'vendor' && isAdminRoute) {
  //     // Vendor trying to access admin route - redirect to vendor dashboard
  //     console.log(`[Middleware] Vendor user trying to access admin route: ${pathname}, redirecting to vendor dashboard`);
  //     return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  //   }
  // }

  // // If authenticated and trying to access login/register page
  // // Let the login page handle the redirect based on user context
  // // (Admin users should go to /admin/dashboard, vendors to /vendor/dashboard)
  // // So we DON'T redirect here - let the client-side login handler decide

  // // Only redirect from home page based on user context
  // if (token && pathname === '/') {
  //   if (userContext === 'admin') {
  //     return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  //   } else {
  //     // Default to vendor dashboard if no context or vendor context
  //     return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  //   }
  // }

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

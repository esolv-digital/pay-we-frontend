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

  // Get token from cookie
  const token = request.cookies.get('access_token')?.value;

  // Onboarding route is protected but doesn't require organization check here
  // (organization check happens client-side)
  const isOnboardingRoute = pathname.startsWith('/onboarding');

  // Protected dashboard routes that require authentication AND organization
  const isDashboardRoute = pathname.startsWith('/admin') || pathname.startsWith('/vendor');

  // If trying to access protected route without token, redirect to login
  if (!token && (isDashboardRoute || isOnboardingRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login/register page
  // Redirect to vendor dashboard (organization check will happen client-side)
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  }

  // If authenticated and on home page, redirect to vendor dashboard
  // Organization check will happen in DashboardLayout via useOrganizationCheck
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

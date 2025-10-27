import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('access_token')?.value;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Onboarding route is protected but doesn't require organization
  const isOnboardingRoute = pathname.startsWith('/onboarding');

  // If trying to access protected route without token
  if (!token && !isPublicRoute && !isOnboardingRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access onboarding without token, redirect to login
  if (!token && isOnboardingRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated and trying to access login/register page, redirect to vendor dashboard
  // (organization check will happen client-side and redirect to onboarding if needed)
  if (token && (pathname === '/login' || pathname === '/register')) {
    // Don't redirect directly to dashboard, let the client-side check handle routing
    // This ensures proper organization check happens
    return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  }

  // If authenticated and on home page, redirect to vendor dashboard
  // The OnboardingCheck component will redirect to /onboarding if no organization
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

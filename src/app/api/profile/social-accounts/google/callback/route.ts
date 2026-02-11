import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * GET /api/profile/social-accounts/google/callback
 * Handles the Google OAuth callback for account linking
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Forward query params to the backend callback
    const searchParams = request.nextUrl.searchParams.toString();
    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.get<{ data: unknown }>(
      `/profile/social-accounts/google/callback?${searchParams}`
    );

    // Redirect to settings page on success
    const redirectUrl = new URL('/vendor/settings', request.url);
    redirectUrl.searchParams.set('tab', 'security');
    redirectUrl.searchParams.set('google_linked', 'true');

    return NextResponse.redirect(redirectUrl);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
    };

    console.error('[/api/profile/social-accounts/google/callback] Error:', apiError.response?.data?.message || 'Unknown error');

    const redirectUrl = new URL('/vendor/settings', request.url);
    redirectUrl.searchParams.set('tab', 'security');
    redirectUrl.searchParams.set('google_link_error', apiError.response?.data?.message || 'Failed to link Google account');

    return NextResponse.redirect(redirectUrl);
  }
}

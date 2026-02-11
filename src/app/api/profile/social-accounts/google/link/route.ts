import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLaravelApiBaseUrl } from '@/lib/api/config';

/**
 * GET /api/profile/social-accounts/google/link
 * Redirects to Google OAuth for account linking.
 * Passes the auth token as a query param so the backend can identify the user.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      );
    }

    // Redirect to the backend OAuth endpoint with the token
    const baseUrl = getLaravelApiBaseUrl();
    const redirectUrl = `${baseUrl}/profile/social-accounts/google/link?token=${encodeURIComponent(token)}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error: unknown) {
    console.error('[/api/profile/social-accounts/google/link] Error:', error);

    return NextResponse.json(
      { error: 'Failed to initiate Google linking', message: 'An error occurred' },
      { status: 500 }
    );
  }
}

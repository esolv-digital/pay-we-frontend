import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

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

    // Call Laravel API
    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.get<{ data: unknown }>('/auth/me');

    return NextResponse.json({ data: response.data });
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string }; status?: number }; code?: string };
    const status = apiError.response?.status || 500;

    // Log detailed error information
    console.error('\n========================================');
    console.error('[/api/auth/me] Error fetching user');
    console.error('========================================');
    console.error('Status:', status);
    console.error('Error Code:', apiError.code);
    console.error('Message:', apiError.response?.data?.message || 'Unknown error');
    console.error('========================================\n');

    // Handle 401 - User is unauthenticated, clear cookies and return 401
    // The frontend will automatically logout the user
    if (status === 401) {
      const response = NextResponse.json(
        {
          error: 'Unauthenticated',
          message: 'Your session has expired. Please login again.',
        },
        { status: 401 }
      );

      // Clear the access token cookie
      response.cookies.delete('access_token');

      return response;
    }

    // For other errors, return appropriate status
    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status }
    );
  }
}

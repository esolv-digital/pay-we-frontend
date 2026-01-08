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
    const response = await laravelClient.get<{
      success: boolean;
      status: string;
      message: string;
      data: {
        contexts: {
          admin: boolean;
          vendor: boolean;
        };
        default_context: 'admin' | 'vendor';
      };
    }>('/auth/contexts');

    // Update user context cookie to keep it in sync
    if (response.data.default_context) {
      const maxAge = 60 * 60 * 24 * 30; // 30 days in seconds
      cookieStore.set('user_context', response.data.default_context, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      status: 'success',
      message: response.message,
      data: response.data,
    });
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string }; status?: number }; code?: string };
    const status = apiError.response?.status || 500;

    console.error('\n========================================');
    console.error('[/api/auth/contexts] Error fetching contexts');
    console.error('========================================');
    console.error('Status:', status);
    console.error('Error Code:', apiError.code);
    console.error('Message:', apiError.response?.data?.message || 'Unknown error');
    console.error('========================================\n');

    if (status === 401) {
      const response = NextResponse.json(
        {
          error: 'Unauthenticated',
          message: 'Your session has expired. Please login again.',
        },
        { status: 401 }
      );
      response.cookies.delete('access_token');
      response.cookies.delete('user_context');
      return response;
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch contexts',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status }
    );
  }
}

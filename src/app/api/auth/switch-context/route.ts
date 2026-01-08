import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { context_type, password, require_verification } = body;

    // Call Laravel API
    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.post<{
      success: boolean;
      status: string;
      message: string;
      data: {
        user: unknown;
        access_token: string;
        token_type: string;
        context: 'admin' | 'vendor';
      };
    }>('/auth/switch-context', {
      context_type,
      password,
      require_verification,
    });

    const { user, access_token, token_type, context } = response.data;

    // Update HTTP-only cookie with new token
    const maxAge = 60 * 60 * 24 * 30; // 30 days in seconds

    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    // Return response
    return NextResponse.json({
      success: true,
      status: 'success',
      message: response.message,
      data: {
        user,
        access_token,
        token_type,
        context,
      },
    });
  } catch (error: unknown) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
        status?: number;
      };
      code?: string;
    };

    console.error('\n========================================');
    console.error('[/api/auth/switch-context] Error switching context');
    console.error('========================================');
    console.error('Status:', apiError.response?.status);
    console.error('Error Code:', apiError.code);
    console.error('Message:', apiError.response?.data?.message || 'Unknown error');
    console.error('Errors:', apiError.response?.data?.errors);
    console.error('========================================\n');

    const status = apiError.response?.status || 500;

    if (status === 401) {
      const response = NextResponse.json(
        {
          error: 'Unauthenticated',
          message: 'Your session has expired. Please login again.',
        },
        { status: 401 }
      );
      response.cookies.delete('access_token');
      return response;
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to switch context',
        errors: apiError.response?.data?.errors || {},
      },
      { status }
    );
  }
}

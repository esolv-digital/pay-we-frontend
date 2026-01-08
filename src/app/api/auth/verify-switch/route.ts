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
    const { password } = body;

    // Call Laravel API
    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.post<{
      success: boolean;
      status: string;
      message: string;
      data: {
        verified: boolean;
      };
    }>('/auth/verify-switch', {
      password,
    });

    return NextResponse.json({
      success: true,
      status: 'success',
      message: response.message,
      data: response.data,
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
    console.error('[/api/auth/verify-switch] Error verifying password');
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
        message: apiError.response?.data?.message || 'Password verification failed',
        errors: apiError.response?.data?.errors || {},
      },
      { status }
    );
  }
}

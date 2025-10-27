import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Call Laravel API
    const laravelClient = createLaravelClient();
    const response = await laravelClient.post<{
      success: boolean;
      status: string;
      message: string;
      data: {
        user: unknown;
        access_token: string;
        token_type: string;
      };
    }>('/api/v1/auth/login', {
      email,
      password,
    });

    const { user, access_token, token_type } = response.data;

    // Set HTTP-only cookie (expires in 30 days by default)
    const cookieStore = await cookies();
    const maxAge = 60 * 60 * 24 * 30; // 30 days in seconds

    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    // Return response matching frontend expectation
    return NextResponse.json({
      success: true,
      status: 'success',
      message: 'Login successful.',
      data: {
        user,
        access_token,
        token_type,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
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

    // Handle connection errors
    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Cannot connect to backend API. Please ensure the Laravel API is running.',
          errors: {},
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Invalid credentials',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 401 }
    );
  }
}

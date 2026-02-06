import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * GET /api/onboarding/status
 * Get current onboarding status for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Unauthorized',
          errors: {},
        },
        { status: 401 }
      );
    }

    // Call Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.get('onboarding/status');

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get onboarding status error:', error);
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
          message: 'Cannot connect to backend API',
          errors: {},
        },
        { status: 503 }
      );
    }

    // Handle 401 - User is unauthenticated
    if (apiError.response?.status === 401) {
      const response = NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Unauthorized',
          errors: {},
        },
        { status: 401 }
      );

      // Clear the access token cookie
      response.cookies.delete('access_token');

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to fetch onboarding status',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

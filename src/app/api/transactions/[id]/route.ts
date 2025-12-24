import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * GET /api/transactions/[id]
 * Get detailed information about a specific transaction
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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
    const response = await laravelClient.get(`/transactions/${id}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get transaction error:', error);
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
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

    // Handle 404 - Transaction not found
    if (apiError.response?.status === 404) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Transaction not found',
          errors: {},
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to fetch transaction',
        errors: {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

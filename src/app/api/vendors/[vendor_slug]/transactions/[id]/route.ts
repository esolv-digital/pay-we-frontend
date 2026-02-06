import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * GET /api/vendors/[vendor_slug]/transactions/[id]
 * Get single transaction detail in vendor context
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; id: string }> }
) {
  try {
    const { vendor_slug, id } = await context.params;
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

    // Call Laravel API - vendor-specific transaction endpoint
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.get(`vendors/${vendor_slug}/transactions/${id}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get vendor transaction detail error:', error);
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

    // Handle 404 - Transaction not found for this vendor
    if (apiError.response?.status === 404) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Transaction not found for this vendor',
          errors: {},
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to fetch transaction details',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

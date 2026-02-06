import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * POST /api/vendors/[vendor_slug]/disbursements/toggle-auto-payout
 * Toggle automatic payout setting for vendor
 * This is an alias for the payouts/auto-payout endpoint
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string }> }
) {
  try {
    const { vendor_slug } = await context.params;
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

    // Get request body
    const body = await request.json();

    // Call Laravel API - disbursements/toggle-auto-payout endpoint (alias for payouts/auto-payout)
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.post(
      `vendors/${vendor_slug}/disbursements/toggle-auto-payout`,
      body
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Toggle auto-payout error:', error);
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
        message: apiError.response?.data?.message || 'Failed to toggle auto-payout setting',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

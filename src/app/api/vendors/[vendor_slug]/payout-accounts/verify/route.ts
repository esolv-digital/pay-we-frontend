import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * POST /api/vendors/[vendor_slug]/payout-accounts/verify
 * Verify bank account details before saving
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

    const body = await request.json();

    // Call Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.post(
      `/vendors/${vendor_slug}/payout-accounts/verify`,
      body
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Verify payout account error:', error);
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

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to verify account',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

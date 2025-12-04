import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Public Transaction Verification API Route
 *
 * GET /api/public/transactions/{reference}
 *
 * Used by the payment callback page to verify transaction status
 * after payment gateway redirect.
 *
 * SOLID Principles:
 * - SRP: Single responsibility - verify transaction by reference
 * - DIP: Depends on Laravel client abstraction
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await context.params;

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Transaction reference is required',
          errors: {},
        },
        { status: 400 }
      );
    }

    // Call Laravel API to get transaction by reference
    // This endpoint should verify the transaction status with the payment gateway
    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(`/public/transactions/${reference}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get transaction by reference error:', error);
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
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
        message: apiError.response?.data?.message || 'Failed to fetch transaction',
        errors: {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

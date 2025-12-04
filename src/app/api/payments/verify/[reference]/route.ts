import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Payment Verification API Route (BFF Pattern)
 *
 * POST /api/payments/verify/{reference}
 *
 * Proxies payment verification requests to Laravel backend.
 * Used by callback page to check transaction status after payment.
 *
 * SOLID Principles:
 * - SRP: Single responsibility - proxy payment verification
 * - DIP: Depends on Laravel client abstraction
 */
export async function POST(
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

    // Call Laravel API to verify payment
    const laravelClient = createLaravelClient();
    const response = await laravelClient.post(`/payments/verify/${reference}`, {});

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
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
        message: apiError.response?.data?.message || 'Failed to verify payment',
        errors: {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

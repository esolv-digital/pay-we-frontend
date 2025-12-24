import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Payment Initiation API Route (BFF Pattern)
 *
 * POST /api/payments/initiate
 *
 * Proxies payment initiation requests to Laravel backend.
 * This route creates a transaction and returns the Paystack/WePay authorization URL.
 *
 * SOLID Principles:
 * - SRP: Single responsibility - proxy payment initiation
 * - DIP: Depends on Laravel client abstraction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.payment_page_id) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'payment_page_id is required',
          errors: { payment_page_id: ['The payment_page_id field is required.'] },
        },
        { status: 400 }
      );
    }

    if (!body.amount) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'amount is required',
          errors: { amount: ['The amount field is required.'] },
        },
        { status: 400 }
      );
    }

    if (!body.currency_code) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'currency_code is required',
          errors: { currency_code: ['The currency_code field is required.'] },
        },
        { status: 400 }
      );
    }

    // Note: customer_email validation is handled by Laravel backend
    // Some payment gateways (Wipay, Paystack) don't require customer details

    // Call Laravel API to initiate payment
    const laravelClient = createLaravelClient();
    const response = await laravelClient.post('/payments/initiate', body);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Payment initiation error:', error);
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
          message: 'Cannot connect to backend API. Please ensure the backend server is running.',
          errors: {},
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to initiate payment',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

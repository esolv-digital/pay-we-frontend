import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Wipay Webhook Callback API Route (BFF Pattern)
 *
 * GET /api/webhooks/wipay/callback
 *
 * Proxies Wipay callback data to Laravel backend for processing.
 * This route receives callback parameters from Wipay and forwards them to the backend.
 *
 * SOLID Principles:
 * - SRP: Single responsibility - proxy Wipay callback
 * - DIP: Depends on Laravel client abstraction
 *
 * Flow:
 * 1. Wipay redirects user to frontend /payment/callback/wipay
 * 2. Frontend page calls this API route with all callback params
 * 3. This route forwards to Laravel backend
 * 4. Backend validates hash, updates transaction
 * 5. Returns transaction reference to frontend
 * 6. Frontend redirects to /payment/verification
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract Wipay callback parameters
    const callbackData = {
      status: searchParams.get('status'),
      transaction_id: searchParams.get('transaction_id'),
      order_id: searchParams.get('order_id'),
      total: searchParams.get('total'),
      hash: searchParams.get('hash'),
      date: searchParams.get('date'),
      currency: searchParams.get('currency'),
      card: searchParams.get('card'),
      message: searchParams.get('message'),
      data: searchParams.get('data'),
    };

    // Validate we have minimum required data
    if (!callbackData.order_id) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Missing transaction reference (order_id)',
          errors: { order_id: ['The order_id field is required.'] },
        },
        { status: 400 }
      );
    }

    // Log callback in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Wipay Callback API] Processing callback:', callbackData);
    }

    // Call Laravel backend webhook
    // Pass all query parameters to backend
    const laravelClient = createLaravelClient();
    const queryString = searchParams.toString();
    const response = await laravelClient.get(`/webhooks/wipay/callback?${queryString}`);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Wipay Callback API] Backend response:', response);
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[Wipay Callback API] Error:', error);
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
        message: apiError.response?.data?.message || 'Failed to process Wipay callback',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

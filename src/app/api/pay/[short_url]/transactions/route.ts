import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Public Transaction Creation API Route
 *
 * POST /api/pay/[short_url]/transactions - Create a transaction for a payment page (no auth required)
 *
 * This is a public endpoint that doesn't require authentication.
 * It proxies requests to the Laravel backend's /api/v1/pay/{short_url}/transactions endpoint.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ short_url: string }> }
) {
  try {
    const { short_url } = await context.params;
    const body = await request.json();

    // Call Laravel API without authentication (public endpoint)
    const laravelClient = createLaravelClient();
    const response = await laravelClient.post(
      `/api/v1/pay/${short_url}/transactions`,
      body
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Create transaction error:', error);
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
        message: apiError.response?.data?.message || 'Failed to create transaction',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Public Payment Page API Route
 *
 * GET /api/pay/[short_url] - Get payment page by short URL (no auth required)
 *
 * This is a public endpoint that doesn't require authentication.
 * It proxies requests to the Laravel backend's /api/v1/pay/{short_url} endpoint.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ short_url: string }> }
) {
  try {
    const { short_url } = await context.params;

    // Call Laravel API without authentication (public endpoint)
    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(`/api/v1/pay/${short_url}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get public payment page error:', error);
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
        message: apiError.response?.data?.message || 'Payment page not found',
        errors: {},
      },
      { status: apiError.response?.status || 404 }
    );
  }
}

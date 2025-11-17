import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Public Payment Page API Route (SEO-Friendly URL)
 *
 * GET /api/pay/[vendor_slug]/[payment_page_slug] - Get payment page by vendor slug and page slug (no auth required)
 *
 * This is a public endpoint that doesn't require authentication.
 * It provides an SEO-friendly alternative to the short URL format.
 * Proxies requests to the Laravel backend's /api/v1/pay/{vendor_slug}/{payment_page_slug} endpoint.
 *
 * Single Responsibility: Handle public payment page retrieval via SEO-friendly URLs
 * Open/Closed: Open for extension via different payment page configurations
 * Liskov Substitution: Can replace short URL endpoint without breaking functionality
 * Interface Segregation: Focused interface for public payment page access
 * Dependency Inversion: Depends on Laravel client abstraction, not concrete implementation
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; payment_page_slug: string }> }
) {
  try {
    const { vendor_slug, payment_page_slug } = await context.params;

    // Call Laravel API without authentication (public endpoint)
    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(`/api/v1/pay/${vendor_slug}/${payment_page_slug}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get public payment page (SEO URL) error:', error);
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

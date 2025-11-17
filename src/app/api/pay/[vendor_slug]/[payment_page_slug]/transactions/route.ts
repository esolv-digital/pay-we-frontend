import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Public Transaction Creation API Route (SEO-Friendly URL)
 *
 * POST /api/pay/[vendor_slug]/[payment_page_slug]/transactions - Create a transaction for a payment page (no auth required)
 *
 * This is a public endpoint that doesn't require authentication.
 * It provides an SEO-friendly alternative to the short URL format.
 * Proxies requests to the Laravel backend's /api/v1/pay/{vendor_slug}/{payment_page_slug}/transactions endpoint.
 *
 * Single Responsibility: Handle public transaction creation via SEO-friendly URLs
 * Open/Closed: Open for extension via different transaction types
 * Liskov Substitution: Can replace short URL endpoint without breaking functionality
 * Interface Segregation: Focused interface for public transaction creation
 * Dependency Inversion: Depends on Laravel client abstraction, not concrete implementation
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; payment_page_slug: string }> }
) {
  try {
    const { vendor_slug, payment_page_slug } = await context.params;
    const body = await request.json();

    // Call Laravel API without authentication (public endpoint)
    const laravelClient = createLaravelClient();
    const response = await laravelClient.post(
      `/api/v1/pay/${vendor_slug}/${payment_page_slug}/transactions`,
      body
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Create transaction (SEO URL) error:', error);
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

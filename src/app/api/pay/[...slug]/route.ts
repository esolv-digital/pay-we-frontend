import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * Unified Public Payment Page API Route
 *
 * Handles:
 * - GET /api/pay/{short_url} - Get payment page (short URL)
 * - GET /api/pay/{vendor_slug}/{payment_page_slug} - Get payment page (SEO URL)
 * - POST /api/pay/{short_url}/transactions - Create transaction (short URL)
 * - POST /api/pay/{vendor_slug}/{payment_page_slug}/transactions - Create transaction (SEO URL)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await context.params;

    // Remove 'transactions' if present at the end
    const isTransactionEndpoint = slug[slug.length - 1] === 'transactions';
    if (isTransactionEndpoint) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Method not allowed. Use POST for transactions.',
          errors: {},
        },
        { status: 405 }
      );
    }

    // Determine URL format
    const isShortUrl = slug.length === 1;

    let apiUrl: string;
    if (isShortUrl) {
      // Short URL format: /api/v1/pay/{short_url}
      apiUrl = `/api/v1/pay/${slug[0]}`;
    } else if (slug.length === 2) {
      // SEO URL format: /api/v1/pay/{vendor_slug}/{payment_page_slug}
      apiUrl = `/api/v1/pay/${slug[0]}/${slug[1]}`;
    } else {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Invalid URL format',
          errors: {},
        },
        { status: 400 }
      );
    }

    // Call Laravel API (public endpoint, no auth required)
    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(apiUrl);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get payment page error:', error);
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
        message: apiError.response?.data?.message || 'Failed to fetch payment page',
        errors: {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

/**
 * Handle transaction creation
 * POST /api/pay/{short_url}/transactions or
 * POST /api/pay/{vendor_slug}/{payment_page_slug}/transactions
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await context.params;

    // Check if this is a transactions endpoint
    const isTransactionEndpoint = slug[slug.length - 1] === 'transactions';

    if (!isTransactionEndpoint) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Invalid endpoint. Use /transactions for creating transactions.',
          errors: {},
        },
        { status: 404 }
      );
    }

    // Remove 'transactions' from the end to get the payment page identifier
    const paymentPageSlug = slug.slice(0, -1);

    // Determine URL format
    const isShortUrl = paymentPageSlug.length === 1;

    let apiUrl: string;
    if (isShortUrl) {
      // Short URL format: /api/v1/pay/{short_url}/transactions
      apiUrl = `/api/v1/pay/${paymentPageSlug[0]}/transactions`;
    } else if (paymentPageSlug.length === 2) {
      // SEO URL format: /api/v1/pay/{vendor_slug}/{payment_page_slug}/transactions
      apiUrl = `/api/v1/pay/${paymentPageSlug[0]}/${paymentPageSlug[1]}/transactions`;
    } else {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Invalid URL format',
          errors: {},
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Call Laravel API (public endpoint, no auth required)
    const laravelClient = createLaravelClient();
    const response = await laravelClient.post(apiUrl, body);

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

import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * GET /api/providers
 *
 * Proxy to backend /providers endpoint for fetching payment providers
 * (banks and mobile money) based on country, currency, and payment method.
 *
 * Query Parameters:
 * - country: Country code or name (default: 'ghana')
 * - currency: Currency code (default: 'GHS')
 * - payment_method: 'bank_transfer' | 'mobile_money' | undefined (for all)
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country') || 'ghana';
    const currency = searchParams.get('currency') || 'GHS';
    const paymentMethod = searchParams.get('payment_method');

    // Build query string
    const params = new URLSearchParams();
    params.append('country', country);
    params.append('currency', currency);
    if (paymentMethod) {
      params.append('payment_method', paymentMethod);
    }

    // Call Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.get(`/providers?${params.toString()}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get providers error:', error);
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
        message: apiError.response?.data?.message || 'Failed to fetch providers',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

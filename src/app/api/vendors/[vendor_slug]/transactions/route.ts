import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * GET /api/vendors/[vendor_slug]/transactions
 * List vendor transactions with advanced filtering, sorting, and pagination
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string }> }
) {
  try {
    const { vendor_slug } = await context.params;
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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    // Add all query parameters from the request
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const apiUrl = `/vendors/${vendor_slug}/transactions${queryString ? `?${queryString}` : ''}`;

    // Call Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.get(apiUrl);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get vendor transactions error:', error);
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

    // Handle connection errors
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

    // Handle 401 - User is unauthenticated
    if (apiError.response?.status === 401) {
      const response = NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Unauthorized',
          errors: {},
        },
        { status: 401 }
      );

      // Clear the access token cookie
      response.cookies.delete('access_token');

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to fetch transactions',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

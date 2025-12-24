import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * GET /api/vendors/[vendor_slug]/transactions/export
 * Export transactions to CSV or Excel format
 * This endpoint streams the file directly to the browser for download
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

    // Get query parameters for filtering and export format
    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    // Add all query parameters from the request
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const apiUrl = `/vendors/${vendor_slug}/transactions/export${queryString ? `?${queryString}` : ''}`;

    // Call Laravel API with streaming support
    const laravelClient = createLaravelClient(accessToken);
    const baseURL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api/v1';

    // Fetch the file directly using native fetch with streaming
    const response = await fetch(`${baseURL}${apiUrl}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json, text/csv, application/vnd.ms-excel',
      },
    });

    if (!response.ok) {
      // If the response is not ok, it might be a JSON error response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        return NextResponse.json(
          {
            success: false,
            status: 'error',
            message: errorData.message || 'Failed to export transactions',
            errors: errorData.errors || {},
          },
          { status: response.status }
        );
      }

      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Failed to export transactions',
          errors: {},
        },
        { status: response.status }
      );
    }

    // Get the file content
    const blob = await response.blob();

    // Get filename from Content-Disposition header or create default
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'transactions.csv';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create response with file download
    const fileResponse = new NextResponse(blob);

    // Set headers for file download
    fileResponse.headers.set('Content-Type', response.headers.get('content-type') || 'text/csv');
    fileResponse.headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return fileResponse;
  } catch (error: unknown) {
    console.error('Export transactions error:', error);
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
        status?: number;
      };
      code?: string;
      message?: string;
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

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.message || apiError.response?.data?.message || 'Failed to export transactions',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

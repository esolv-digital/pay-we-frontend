import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; id: string }> }
) {
  try {
    const { vendor_slug, id } = await context.params;
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

    // Call Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.get(
      `/api/v1/vendors/${vendor_slug}/payment-pages/${id}`
    );

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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; id: string }> }
) {
  try {
    const { vendor_slug, id } = await context.params;
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

    const body = await request.json();

    // Call Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.put(
      `/api/v1/vendors/${vendor_slug}/payment-pages/${id}`,
      body
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Update payment page error:', error);
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
        message: apiError.response?.data?.message || 'Failed to update payment page',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; id: string }> }
) {
  try {
    const { vendor_slug, id } = await context.params;
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

    // Call Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.delete(
      `/api/v1/vendors/${vendor_slug}/payment-pages/${id}`
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Delete payment page error:', error);
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
        message: apiError.response?.data?.message || 'Failed to delete payment page',
        errors: {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

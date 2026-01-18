import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

/**
 * GET /api/vendors/[vendor_slug]/payout-accounts/[account_id]
 * Get a single payout account
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; account_id: string }> }
) {
  try {
    const { vendor_slug, account_id } = await context.params;
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
      `/vendors/${vendor_slug}/payout-accounts/${account_id}`
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get payout account error:', error);
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
        message: apiError.response?.data?.message || 'Failed to fetch payout account',
        errors: {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/vendors/[vendor_slug]/payout-accounts/[account_id]
 * Update a payout account (label, is_default)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; account_id: string }> }
) {
  try {
    const { vendor_slug, account_id } = await context.params;
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
      `/vendors/${vendor_slug}/payout-accounts/${account_id}`,
      body
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Update payout account error:', error);
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
        message: apiError.response?.data?.message || 'Failed to update payout account',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

/**
 * DELETE /api/vendors/[vendor_slug]/payout-accounts/[account_id]
 * Delete a payout account
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ vendor_slug: string; account_id: string }> }
) {
  try {
    const { vendor_slug, account_id } = await context.params;
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
      `/vendors/${vendor_slug}/payout-accounts/${account_id}`
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Delete payout account error:', error);
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
        message: apiError.response?.data?.message || 'Failed to delete payout account',
        errors: {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

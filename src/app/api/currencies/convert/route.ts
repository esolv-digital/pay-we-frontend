import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/currencies/convert
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');

    if (!from || !to || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameters: from, to, amount'
        },
        { status: 400 }
      );
    }

    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(
      `/currencies/convert?from=${from}&to=${to}&amount=${amount}`
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[Currency Convert API] Error:', error);

    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; errors?: unknown }
      }
    };

    if (err.response?.status === 422) {
      return NextResponse.json(
        {
          success: false,
          message: err.response.data?.message,
          errors: err.response.data?.errors
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to convert currency' },
      { status: err.response?.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/currencies/rates
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(`/currencies/rates?${params.toString()}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[Currency Rates API] Error:', error);

    const status = (error as { response?: { status?: number } }).response?.status || 500;
    return NextResponse.json(
      { success: false, message: 'Failed to fetch currency rates' },
      { status }
    );
  }
}

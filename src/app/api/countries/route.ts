import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/countries
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const can_send = searchParams.get('can_send');
    const can_receive = searchParams.get('can_receive');

    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (can_send) params.append('can_send', can_send);
    if (can_receive) params.append('can_receive', can_receive);

    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(`/countries?${params.toString()}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[Countries API] Error:', error);

    const err = error as { code?: string; message?: string; response?: { status?: number } };
    if (err.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch countries' },
      { status: err.response?.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/countries/[code]/payment-methods
 * Public endpoint - no authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(`/countries/${code}/payment-methods`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error(`[Payment Methods API] Error:`, error);

    const status = (error as { response?: { status?: number } }).response?.status || 500;
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment methods' },
      { status }
    );
  }
}

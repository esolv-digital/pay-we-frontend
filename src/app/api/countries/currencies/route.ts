import { NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/countries/currencies
 * Public endpoint - no authentication required
 */
export async function GET() {
  try {
    const laravelClient = createLaravelClient();
    const response = await laravelClient.get('/countries/currencies');

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[Currencies API] Error:', error);

    const status = (error as { response?: { status?: number } }).response?.status || 500;
    return NextResponse.json(
      { success: false, message: 'Failed to fetch currencies' },
      { status }
    );
  }
}

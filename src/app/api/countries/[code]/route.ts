import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/countries/[code]
 * Public endpoint - no authentication required
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const resolvedParams = await params;
  try {
    const { code } = resolvedParams;
    const laravelClient = createLaravelClient();
    const response = await laravelClient.get(`/countries/${code}`);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error(`[Country API] Error fetching ${resolvedParams.code}:`, error);

    const status = (error as { response?: { status?: number } }).response?.status || 500;
    if (status === 404) {
      return NextResponse.json(
        { success: false, message: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch country' },
      { status }
    );
  }
}

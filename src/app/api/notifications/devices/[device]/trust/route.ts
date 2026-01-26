import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * POST /api/notifications/devices/[device]/trust
 * Trust a device
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ device: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      );
    }

    const { device } = await params;
    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.post<{ data: unknown }>(`/notifications/devices/${device}/trust`);

    return NextResponse.json({ data: response.data });
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
      code?: string;
    };

    console.error('[/api/notifications/devices/[device]/trust] POST Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to trust device',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

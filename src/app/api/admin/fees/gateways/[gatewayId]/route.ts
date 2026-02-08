import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/admin/fees/gateways/[gatewayId]
 * Get fees for a specific gateway
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gatewayId: string }> }
) {
  try {
    const { gatewayId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      );
    }

    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.get<{ data: unknown }>(`/admin/fees/gateways/${gatewayId}`);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
      code?: string;
    };

    console.error('[/api/admin/fees/gateways/[gatewayId]] GET Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch gateway fees',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/admin/fees/gateways/[gatewayId]
 * Update fees for a specific gateway
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ gatewayId: string }> }
) {
  try {
    const { gatewayId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.put<{ data: unknown }>(`/admin/fees/gateways/${gatewayId}`, body);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number };
      code?: string;
    };

    console.error('[/api/admin/fees/gateways/[gatewayId]] PUT Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update gateway fees',
        message: apiError.response?.data?.message || 'An error occurred',
        errors: apiError.response?.data?.errors,
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * PUT /api/admin/countries/[id]/gateways
 * Update gateways for a country
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const response = await laravelClient.put<{ data: unknown }>(`/admin/countries/${id}/gateways`, body);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number };
      code?: string;
    };

    console.error('[/api/admin/countries/[id]/gateways] PUT Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update country gateways',
        message: apiError.response?.data?.message || 'An error occurred',
        errors: apiError.response?.data?.errors,
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

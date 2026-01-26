import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/admin/messaging-providers
 * List all messaging providers
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.get<{ data: unknown }>(
      `/admin/messaging-providers${queryString ? `?${queryString}` : ''}`
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
      code?: string;
    };

    console.error('[/api/admin/messaging-providers] GET Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch messaging providers',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

/**
 * POST /api/admin/messaging-providers
 * Create a new messaging provider
 */
export async function POST(request: Request) {
  try {
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
    const response = await laravelClient.post<{ data: unknown }>('/admin/messaging-providers', body);

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number };
      code?: string;
    };

    console.error('[/api/admin/messaging-providers] POST Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create messaging provider',
        message: apiError.response?.data?.message || 'An error occurred',
        errors: apiError.response?.data?.errors,
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

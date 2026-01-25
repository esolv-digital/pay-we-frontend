import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/profile
 * Get current user profile
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      );
    }

    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.get<{ data: unknown }>('/profile');

    return NextResponse.json({ data: response.data });
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
      code?: string;
    };

    console.error('[/api/profile] GET Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update user profile
 */
export async function PUT(request: NextRequest) {
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
    const response = await laravelClient.put<{ data: unknown }>('/profile', body);

    return NextResponse.json({ data: response.data });
  } catch (error: unknown) {
    const apiError = error as {
      response?: {
        data?: { message?: string; errors?: Record<string, string[]> };
        status?: number;
      };
      code?: string;
    };

    console.error('[/api/profile] PUT Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update profile',
        message: apiError.response?.data?.message || 'An error occurred',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

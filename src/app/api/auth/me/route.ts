import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

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

    // Call Laravel API
    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.get<{ data: unknown }>('/api/v1/auth/me');

    return NextResponse.json({ data: response.data });
  } catch (error: unknown) {
    console.error('Get user error:', error);
    const apiError = error as { response?: { data?: { message?: string }; status?: number } };

    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        message: apiError.response?.data?.message || 'Unauthorized',
      },
      { status: apiError.response?.status || 401 }
    );
  }
}

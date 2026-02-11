import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * POST /api/auth/email/verification-notification
 * Resend verification email
 * Rate limited: 6 requests per minute
 */
export async function POST() {
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
    const response = await laravelClient.post<{ message: string }>('/auth/email/verification-notification');

    return NextResponse.json({ data: response });
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string; success?: boolean }; status?: number };
      code?: string;
    };

    console.error('[/api/auth/email/verification-notification] POST Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to send verification email',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

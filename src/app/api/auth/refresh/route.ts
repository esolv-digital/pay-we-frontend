import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token to refresh' },
        { status: 401 }
      );
    }

    // Call Laravel refresh endpoint
    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.post<{
      data: {
        access_token: string;
        expires_in: number;
      };
    }>('/api/v1/auth/refresh');

    const { access_token, expires_in } = response.data;

    // Update cookie
    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in,
      path: '/',
    });

    cookieStore.set('token_expires_at', String(Date.now() + expires_in * 1000), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in,
      path: '/',
    });

    return NextResponse.json({
      data: {
        tokens: {
          access_token,
          expires_in,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Token refresh error:', error);

    // Clear invalid token
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('token_expires_at');

    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    );
  }
}

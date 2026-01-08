import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (token) {
      // Call Laravel logout
      const laravelClient = createLaravelClient(token);
      await laravelClient.post('/auth/logout');
    }

    // Clear cookies
    cookieStore.delete('access_token');
    cookieStore.delete('token_expires_at');
    cookieStore.delete('user_context');

    return NextResponse.json({
      data: { message: 'Logged out successfully' },
    });
  } catch {
    // Even if Laravel logout fails, clear cookies
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('token_expires_at');
    cookieStore.delete('user_context');

    return NextResponse.json({
      data: { message: 'Logged out' },
    });
  }
}

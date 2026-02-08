import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * POST /api/admin/payout-accounts/[id]/flag
 * Flag a payout account
 */
export async function POST(
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
    const response = await laravelClient.post<{ data: unknown }>(`/admin/payout-accounts/${id}/flag`, body);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number };
      code?: string;
    };

    console.error('[/api/admin/payout-accounts/[id]/flag] POST Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to flag payout account',
        message: apiError.response?.data?.message || 'An error occurred',
        errors: apiError.response?.data?.errors,
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

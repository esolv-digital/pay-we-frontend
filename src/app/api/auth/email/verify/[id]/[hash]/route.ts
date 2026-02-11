import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * GET /api/auth/email/verify/[id]/[hash]
 * Verify email address from verification link
 * Auth NOT required — the link includes signed params
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; hash: string }> }
) {
  try {
    const { id, hash } = await context.params;
    const expires = request.nextUrl.searchParams.get('expires');
    const signature = request.nextUrl.searchParams.get('signature');

    if (!expires) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing expires parameter' },
        { status: 400 }
      );
    }

    const laravelClient = createLaravelClient();
    let url = `/auth/email/verify/${encodeURIComponent(id)}/${encodeURIComponent(hash)}?expires=${encodeURIComponent(expires)}`;
    if (signature) {
      url += `&signature=${encodeURIComponent(signature)}`;
    }

    const response = await laravelClient.get<{ data: unknown }>(url);

    return NextResponse.json({ data: response.data ?? response });
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string; success?: boolean }; status?: number };
      code?: string;
    };

    console.error('[/api/auth/email/verify] GET Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Verification failed',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

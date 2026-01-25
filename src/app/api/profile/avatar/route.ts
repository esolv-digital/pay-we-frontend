import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createLaravelClient } from '@/lib/api/laravel-client';

/**
 * POST /api/profile/avatar
 * Upload profile avatar
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    const avatarFile = formData.get('avatar');

    if (!avatarFile || !(avatarFile instanceof File)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No avatar file provided' },
        { status: 400 }
      );
    }

    // Create a new FormData to send to Laravel
    const laravelFormData = new FormData();
    laravelFormData.append('avatar', avatarFile);

    const laravelClient = createLaravelClient(token);
    const response = await laravelClient.post<{ data: { avatar_url: string } }>(
      '/profile/avatar',
      laravelFormData
    );

    return NextResponse.json({ data: response.data });
  } catch (error: unknown) {
    const apiError = error as {
      response?: {
        data?: { message?: string; errors?: Record<string, string[]> };
        status?: number;
      };
      code?: string;
    };

    console.error('[/api/profile/avatar] POST Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to upload avatar',
        message: apiError.response?.data?.message || 'An error occurred',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

/**
 * DELETE /api/profile/avatar
 * Delete profile avatar
 */
export async function DELETE() {
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
    await laravelClient.delete('/profile/avatar');

    return NextResponse.json({ data: { message: 'Avatar deleted successfully' } });
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string }; status?: number };
      code?: string;
    };

    console.error('[/api/profile/avatar] DELETE Error:', apiError.response?.data?.message || 'Unknown error');

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to delete avatar',
        message: apiError.response?.data?.message || 'An error occurred',
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, country_code } = body;

    // Get access token from cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Unauthorized. Please login first.',
          errors: {},
        },
        { status: 401 }
      );
    }

    // Call Laravel API with access token
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.post<{
      success: boolean;
      status: string;
      message: string;
      data: {
        organization: unknown;
        vendor: unknown;
        onboarding_complete: boolean;
      };
    }>('/api/v1/onboarding/organization', {
      name,
      type: type || 'individual',
      country_code,
    });

    // Return response
    return NextResponse.json({
      success: true,
      status: 'success',
      message: response.message || 'Organization setup completed successfully! You can now access your dashboard.',
      data: response.data,
    });
  } catch (error: unknown) {
    console.error('Onboarding error:', error);
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
        status?: number;
      };
      code?: string;
    };

    // Handle connection errors
    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Cannot connect to backend API. Please ensure the Laravel API is running.',
          errors: {},
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: apiError.response?.data?.errors ? 'validation_error' : 'error',
        message: apiError.response?.data?.message || 'Onboarding failed',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 400 }
    );
  }
}

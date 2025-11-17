import { NextRequest, NextResponse } from 'next/server';
import { createLaravelClient } from '@/lib/api/laravel-client';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ organization: string }> }
) {
  try {
    const { organization } = await context.params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Unauthorized',
          errors: {},
        },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();

    // Add organization_id to formData for Laravel validation
    formData.append('organization_id', organization);

    // Map 'document' field to appropriate Laravel field based on document_type
    const documentType = formData.get('document_type') as string;
    const documentFile = formData.get('document');

    if (documentFile && documentType) {
      // Map frontend document_type to Laravel field names
      const fieldMapping: Record<string, string> = {
        'passport': 'id_document',
        'national_id': 'id_document',
        'drivers_license': 'id_document',
        'proof_of_address': 'proof_of_address',
        'business_registration': 'registration_certificate',
        'tax_certificate': 'registration_certificate',
      };

      const laravelFieldName = fieldMapping[documentType] || 'id_document';
      formData.delete('document');
      formData.append(laravelFieldName, documentFile);
    }

    // Forward to Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const apiUrl = `/api/v1/organizations/${organization}/kyc/submit`;
    console.log('Posting to Laravel:', apiUrl);
    const response = await laravelClient.post(apiUrl, formData);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('KYC submission error:', error);
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

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Cannot connect to backend API',
          errors: {},
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to submit KYC document',
        errors: apiError.response?.data?.errors || {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ organization: string }> }
) {
  try {
    const { organization } = await context.params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Unauthorized',
          errors: {},
        },
        { status: 401 }
      );
    }

    // Call Laravel API
    const laravelClient = createLaravelClient(accessToken);
    const response = await laravelClient.get(
      `/api/v1/organizations/${organization}/kyc/documents`
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Get KYC documents error:', error);
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
        };
        status?: number;
      };
      code?: string;
    };

    if (apiError.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          status: 'error',
          message: 'Cannot connect to backend API',
          errors: {},
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: apiError.response?.data?.message || 'Failed to fetch KYC documents',
        errors: {},
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

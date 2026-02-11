import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLaravelApiBaseUrl } from './config';
import { createLaravelClient } from './laravel-client';

// ============================================================================
// ADMIN PROXY UTILITIES (DRY)
// ============================================================================

/**
 * Normalize paginated responses from the backend.
 *
 * The backend uses `paginatedResponseWithKey()` which returns named keys:
 *   { success: true, data: { vendors: [...], meta: {...} } }
 *
 * The frontend expects a standard `data` key:
 *   { success: true, data: { data: [...], meta: {...} } }
 *
 * This function transforms the named key into `data` so the frontend
 * `apiClient.get()` → `response.data.data` chain works correctly.
 */
function normalizePaginatedResponse(response: Record<string, unknown>): Record<string, unknown> {
  const data = response?.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const dataObj = data as Record<string, unknown>;
    // Check if this is a paginated response with a named items key
    if (dataObj.meta && !dataObj.data) {
      const itemsKey = Object.keys(dataObj).find(
        (k) => k !== 'meta' && Array.isArray(dataObj[k])
      );
      if (itemsKey) {
        return {
          ...response,
          data: {
            data: dataObj[itemsKey],
            meta: dataObj.meta,
          },
        };
      }
    }
  }
  return response;
}

/**
 * Extract the access token from cookies and return a 401 if missing.
 */
async function getTokenOrFail(): Promise<
  { token: string; error?: never } | { token?: never; error: NextResponse }
> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'No token found' },
        { status: 401 }
      ),
    };
  }
  return { token };
}

/**
 * Build a consistent error response from a caught proxy error.
 */
function buildErrorResponse(error: unknown, context: string): NextResponse {
  const apiError = error as {
    response?: { data?: { message?: string }; status?: number };
    code?: string;
  };

  console.error(`[${context}] Error:`, apiError.response?.data?.message || 'Unknown error');

  if (apiError.code === 'ECONNREFUSED') {
    return NextResponse.json(
      { error: 'Service Unavailable', message: 'Cannot connect to backend API' },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      error: `Failed to process request`,
      message: apiError.response?.data?.message || 'An error occurred',
    },
    { status: apiError.response?.status || 500 }
  );
}

/**
 * Proxy a GET request to the Laravel admin backend.
 *
 * Handles: token extraction, query string forwarding, response normalization, error handling.
 *
 * @param request  - The incoming Next.js request
 * @param backendPath - The backend path (e.g. `/admin/vendors`)
 * @param options  - Optional: skip paginated response normalization
 */
export async function adminProxyGet(
  request: Request,
  backendPath: string,
  options?: { skipNormalization?: boolean }
): Promise<NextResponse> {
  try {
    const auth = await getTokenOrFail();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullPath = `${backendPath}${queryString ? `?${queryString}` : ''}`;

    const client = createLaravelClient(auth.token);
    const response = await client.get<Record<string, unknown>>(fullPath);

    const normalized = options?.skipNormalization
      ? response
      : normalizePaginatedResponse(response);

    return NextResponse.json(normalized);
  } catch (error) {
    return buildErrorResponse(error, backendPath);
  }
}

/**
 * Proxy a POST request to the Laravel admin backend.
 */
export async function adminProxyPost(
  request: Request,
  backendPath: string
): Promise<NextResponse> {
  try {
    const auth = await getTokenOrFail();
    if (auth.error) return auth.error;

    let body: unknown = undefined;
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text);
    } catch {
      // No body or invalid JSON — OK for POST without body
    }

    const client = createLaravelClient(auth.token);
    const response = await client.post<Record<string, unknown>>(backendPath, body);

    return NextResponse.json(response);
  } catch (error) {
    return buildErrorResponse(error, `POST ${backendPath}`);
  }
}

/**
 * Proxy a PUT request to the Laravel admin backend.
 */
export async function adminProxyPut(
  request: Request,
  backendPath: string
): Promise<NextResponse> {
  try {
    const auth = await getTokenOrFail();
    if (auth.error) return auth.error;

    const body = await request.json();

    const client = createLaravelClient(auth.token);
    const response = await client.put<Record<string, unknown>>(backendPath, body);

    return NextResponse.json(response);
  } catch (error) {
    return buildErrorResponse(error, `PUT ${backendPath}`);
  }
}

/**
 * Proxy a DELETE request to the Laravel admin backend.
 */
export async function adminProxyDelete(
  request: Request,
  backendPath: string
): Promise<NextResponse> {
  try {
    const auth = await getTokenOrFail();
    if (auth.error) return auth.error;

    const client = createLaravelClient(auth.token);
    const response = await client.delete<Record<string, unknown>>(backendPath);

    return NextResponse.json(response);
  } catch (error) {
    return buildErrorResponse(error, `DELETE ${backendPath}`);
  }
}

/**
 * Proxy a PATCH request to the Laravel admin backend.
 */
export async function adminProxyPatch(
  request: Request,
  backendPath: string
): Promise<NextResponse> {
  try {
    const auth = await getTokenOrFail();
    if (auth.error) return auth.error;

    const body = await request.json();

    const client = createLaravelClient(auth.token);
    const response = await client.patch<Record<string, unknown>>(backendPath, body);

    return NextResponse.json(response);
  } catch (error) {
    return buildErrorResponse(error, `PATCH ${backendPath}`);
  }
}

/**
 * Forward a request through the proxy to the Laravel backend,
 * preserving cookies in both directions (browser ↔ backend).
 *
 * This is required for endpoints where the backend stores state
 * in the session (e.g., 2FA setup).
 */
export async function proxyToBackend(
  endpoint: string,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    request?: NextRequest;
  }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No token found' },
      { status: 401 }
    );
  }

  // Collect all cookies from the browser to forward to the backend
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const baseUrl = getLaravelApiBaseUrl();
  const url = `${baseUrl}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  // Forward Referer/Origin if present
  if (options.request) {
    const referer = options.request.headers.get('referer');
    if (referer) headers['Referer'] = referer;
  }

  const fetchOptions: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.body && options.method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const backendResponse = await fetch(url, fetchOptions);

  // Parse the response body
  const responseBody = await backendResponse.json();

  // Build the proxy response
  const proxyResponse = NextResponse.json(
    { data: responseBody.data ?? responseBody },
    { status: backendResponse.status }
  );

  // Forward Set-Cookie headers from the backend to the browser
  const setCookieHeaders = backendResponse.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookieHeaders) {
    proxyResponse.headers.append('Set-Cookie', cookie);
  }

  return proxyResponse;
}
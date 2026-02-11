import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helpers';

/**
 * POST /api/profile/two-factor/disable
 * Disable 2FA (requires password)
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend('profile/two-factor/disable', { method: 'POST', body, request });
}

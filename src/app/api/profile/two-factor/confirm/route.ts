import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/proxy-helpers';

/**
 * POST /api/profile/two-factor/confirm
 * Confirm 2FA setup with TOTP code
 * Uses cookie-forwarding proxy to preserve backend session state
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend('profile/two-factor/confirm', {
    method: 'POST',
    body,
    request,
  });
}

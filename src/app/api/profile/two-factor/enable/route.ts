import { proxyToBackend } from '@/lib/api/proxy-helpers';

/**
 * POST /api/profile/two-factor/enable
 * Enable 2FA - generates secret and QR code
 * Uses cookie-forwarding proxy to preserve backend session state
 */
export async function POST() {
  return proxyToBackend('profile/two-factor/enable', { method: 'POST' });
}

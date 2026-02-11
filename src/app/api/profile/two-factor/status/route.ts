import { proxyToBackend } from '@/lib/api/proxy-helpers';

/**
 * GET /api/profile/two-factor/status
 * Get 2FA status
 */
export async function GET() {
  return proxyToBackend('profile/two-factor/status', { method: 'GET' });
}

import { proxyToBackend } from '@/lib/api/proxy-helpers';

/**
 * POST /api/profile/two-factor/recovery-codes
 * Regenerate recovery codes
 */
export async function POST() {
  return proxyToBackend('profile/two-factor/recovery-codes', { method: 'POST' });
}

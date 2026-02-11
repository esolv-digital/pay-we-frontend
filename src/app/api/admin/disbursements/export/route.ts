import { adminProxyGet } from '@/lib/api/proxy-helpers';

export async function GET(request: Request) {
  return adminProxyGet(request, '/admin/disbursements/export', { skipNormalization: true });
}

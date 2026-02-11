import { adminProxyGet } from '@/lib/api/proxy-helpers';

export async function GET(request: Request) {
  return adminProxyGet(request, '/admin/roles/statistics', { skipNormalization: true });
}

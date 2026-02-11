import { adminProxyPost } from '@/lib/api/proxy-helpers';

export async function POST(request: Request) {
  return adminProxyPost(request, '/admin/assign-roles');
}

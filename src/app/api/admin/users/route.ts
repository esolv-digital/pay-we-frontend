import { adminProxyGet, adminProxyPost } from '@/lib/api/proxy-helpers';

export async function GET(request: Request) {
  return adminProxyGet(request, '/admin/users');
}

export async function POST(request: Request) {
  return adminProxyPost(request, '/admin/users');
}

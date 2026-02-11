import { adminProxyGet, adminProxyPost } from '@/lib/api/proxy-helpers';

export async function GET(request: Request) {
  return adminProxyGet(request, '/admin/messaging-providers');
}

export async function POST(request: Request) {
  return adminProxyPost(request, '/admin/messaging-providers');
}

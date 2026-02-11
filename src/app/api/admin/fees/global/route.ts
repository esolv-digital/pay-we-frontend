import { adminProxyGet, adminProxyPost, adminProxyPut } from '@/lib/api/proxy-helpers';

export async function GET(request: Request) {
  return adminProxyGet(request, '/admin/fees/global');
}

export async function POST(request: Request) {
  return adminProxyPost(request, '/admin/fees/global');
}

export async function PUT(request: Request) {
  return adminProxyPut(request, '/admin/fees/global');
}

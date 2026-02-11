import { adminProxyGet, adminProxyPut } from '@/lib/api/proxy-helpers';

export async function GET(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return adminProxyGet(request, `/admin/fees/organizations/${orgId}`);
}

export async function PUT(request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return adminProxyPut(request, `/admin/fees/organizations/${orgId}`);
}

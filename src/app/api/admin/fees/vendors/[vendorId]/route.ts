import { adminProxyGet, adminProxyPut } from '@/lib/api/proxy-helpers';

export async function GET(request: Request, { params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  return adminProxyGet(request, `/admin/fees/vendors/${vendorId}`);
}

export async function PUT(request: Request, { params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  return adminProxyPut(request, `/admin/fees/vendors/${vendorId}`);
}

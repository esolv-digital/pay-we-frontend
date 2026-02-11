import { adminProxyGet, adminProxyPut, adminProxyDelete } from '@/lib/api/proxy-helpers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyGet(request, `/admin/gateways/${id}`, { skipNormalization: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyPut(request, `/admin/gateways/${id}`);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyDelete(request, `/admin/gateways/${id}`);
}

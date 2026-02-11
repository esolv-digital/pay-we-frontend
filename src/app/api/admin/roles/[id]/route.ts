import { adminProxyGet, adminProxyPut, adminProxyDelete } from '@/lib/api/proxy-helpers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyGet(request, `/admin/roles/${id}`, { skipNormalization: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyPut(request, `/admin/roles/${id}`);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyDelete(request, `/admin/roles/${id}`);
}

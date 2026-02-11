import { adminProxyPut } from '@/lib/api/proxy-helpers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyPut(request, `/admin/kyc/${id}/status`);
}

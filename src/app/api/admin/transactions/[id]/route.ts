import { adminProxyGet } from '@/lib/api/proxy-helpers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyGet(request, `/admin/transactions/${id}`, { skipNormalization: true });
}

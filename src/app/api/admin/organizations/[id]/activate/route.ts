import { adminProxyPost } from '@/lib/api/proxy-helpers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyPost(request, `/admin/organizations/${id}/activate`);
}

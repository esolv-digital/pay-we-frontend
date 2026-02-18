import { adminProxyGet, adminProxyPut } from '@/lib/api/proxy-helpers';

// Note: The [id] param carries the country ISO alpha-2 code (e.g. "GH"), not a numeric ID.
// Countries cannot be deleted — use POST /toggle-status instead.

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyGet(request, `/admin/countries/${id}`, { skipNormalization: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adminProxyPut(request, `/admin/countries/${id}`);
}

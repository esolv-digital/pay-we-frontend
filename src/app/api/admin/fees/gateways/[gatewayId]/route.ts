import { adminProxyGet, adminProxyPut } from '@/lib/api/proxy-helpers';

export async function GET(request: Request, { params }: { params: Promise<{ gatewayId: string }> }) {
  const { gatewayId } = await params;
  return adminProxyGet(request, `/admin/fees/gateways/${gatewayId}`);
}

export async function PUT(request: Request, { params }: { params: Promise<{ gatewayId: string }> }) {
  const { gatewayId } = await params;
  return adminProxyPut(request, `/admin/fees/gateways/${gatewayId}`);
}

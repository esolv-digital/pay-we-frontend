/**
 * Admin Fee Management Page
 *
 * Comprehensive fee configuration with:
 * - Global fee settings
 * - Gateway-level fee overrides
 * - Organization & vendor-level fee overrides
 * - Fee statistics
 */

'use client';

import { useState } from 'react';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useAdminFeeOverview,
  useAdminFeeStatistics,
  useUpdateGlobalFees,
} from '@/lib/hooks/use-admin-fees';
import type { FeeBearer } from '@/lib/api/admin-fees';
import { DollarSign, BarChart3, Wrench, Settings, Info } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';

const FEE_BEARER_LABELS: Record<string, string> = {
  customer: 'Customer pays fees',
  vendor: 'Vendor absorbs fees',
  split: 'Split between customer & vendor',
  inherit: 'Inherit from vendor settings',
};

export default function AdminFeesPage() {
  const [editingGlobal, setEditingGlobal] = useState(false);
  const [globalForm, setGlobalForm] = useState({
    platform_fee_percentage: 0,
    gateway_fee_percentage: 0,
    flat_fee: 0,
    fee_bearer: 'customer' as FeeBearer,
  });

  const { data: overviewData, isLoading } = useAdminFeeOverview();
  const { data: statsData } = useAdminFeeStatistics();
  const { mutate: updateGlobalFees, isPending: isUpdating } = useUpdateGlobalFees();

  const overview = overviewData;
  const statistics = statsData;

  const handleEditGlobal = () => {
    if (overview?.global) {
      setGlobalForm({
        platform_fee_percentage: overview.global.platform_fee_percentage,
        gateway_fee_percentage: overview.global.gateway_fee_percentage,
        flat_fee: overview.global.flat_fee,
        fee_bearer: overview.global.fee_bearer,
      });
    }
    setEditingGlobal(true);
  };

  const handleSaveGlobal = () => {
    updateGlobalFees(globalForm, {
      onSuccess: () => setEditingGlobal(false),
    });
  };

  const stats = [
    { label: 'Total Fees Collected', value: statistics?.total_fees_collected ? `$${statistics.total_fees_collected.toLocaleString()}` : '$0', subtext: 'All time', icon: DollarSign, color: 'green' },
    { label: 'Avg Fee Rate', value: statistics?.avg_fee_percentage ? `${statistics.avg_fee_percentage}%` : '0%', subtext: 'Effective rate', icon: BarChart3, color: 'blue' },
    { label: 'Gateway Overrides', value: overview?.gateway_overrides?.length ?? 0, subtext: 'Custom gateway fees', icon: Wrench, color: 'purple' },
    { label: 'Org/Vendor Overrides', value: (overview?.organization_overrides_count ?? 0) + (overview?.vendor_overrides_count ?? 0), subtext: 'Custom overrides', icon: Settings, color: 'indigo' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_FEES}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600 mt-1">Configure platform fees, gateway overrides, and custom pricing</p>
          </div>
        </div>

        {/* Fee Hierarchy Info */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Fee Hierarchy (highest priority first)</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs">
                <li><strong>Payment Page</strong> &mdash; fee bearer override, include_fees_in_amount</li>
                <li><strong>Vendor</strong> &mdash; custom platform fee type/value, gateway fee bearer</li>
                <li><strong>Organization</strong> &mdash; fee overrides in org settings</li>
                <li><strong>Country + Gateway</strong> &mdash; platform_fee_percentage + per-gateway fee_percentage (managed in Country Management)</li>
                <li><strong>Global Platform</strong> &mdash; default rates configured below</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
                <IconBadge icon={stat.icon} color={stat.color} />
              </div>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </Card>
        ) : (
          <>
            {/* Global Fee Configuration */}
            <Card className="p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Global Fee Configuration</h2>
                <Can permission={PERMISSIONS.ADMIN_MANAGE_FEES}>
                  {!editingGlobal ? (
                    <Button variant="outline" onClick={handleEditGlobal}>Edit</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingGlobal(false)}>Cancel</Button>
                      <Button onClick={handleSaveGlobal} disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </Can>
              </div>

              {editingGlobal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Fee %</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={globalForm.platform_fee_percentage}
                      onChange={(e) => setGlobalForm((prev) => ({ ...prev, platform_fee_percentage: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gateway Fee %</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={globalForm.gateway_fee_percentage}
                      onChange={(e) => setGlobalForm((prev) => ({ ...prev, gateway_fee_percentage: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flat Fee</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={globalForm.flat_fee}
                      onChange={(e) => setGlobalForm((prev) => ({ ...prev, flat_fee: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee Bearer</label>
                    <select
                      aria-label="Fee bearer"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={globalForm.fee_bearer}
                      onChange={(e) => setGlobalForm((prev) => ({ ...prev, fee_bearer: e.target.value as FeeBearer }))}
                    >
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="split">Split</option>
                    </select>
                  </div>
                </div>
              ) : overview?.global ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <dt className="text-sm text-gray-500">Platform Fee</dt>
                    <dd className="text-2xl font-bold text-gray-900">{overview.global.platform_fee_percentage}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Gateway Fee</dt>
                    <dd className="text-2xl font-bold text-gray-900">{overview.global.gateway_fee_percentage}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Flat Fee</dt>
                    <dd className="text-2xl font-bold text-gray-900">${overview.global.flat_fee}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Fee Bearer</dt>
                    <dd className="text-lg font-semibold text-gray-900">{FEE_BEARER_LABELS[overview.global.fee_bearer as keyof typeof FEE_BEARER_LABELS]}</dd>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No global fees configured</p>
              )}
            </Card>

            {/* Gateway Fee Overrides */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gateway Fee Overrides</h2>
              {overview?.gateway_overrides && overview.gateway_overrides.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gateway</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flat Fee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bearer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {overview.gateway_overrides.map((override: any) => (
                        <tr key={override.gateway_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{override.gateway_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{override.fee_percentage}%</td>
                          <td className="px-6 py-4 text-sm text-gray-900">${override.flat_fee}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">{override.fee_bearer}</td>
                          <td className="px-6 py-4">
                            <Badge className={override.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {override.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No gateway-level fee overrides configured</p>
              )}
            </Card>

            {/* Override Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Overrides</h2>
                <p className="text-4xl font-bold text-gray-900">{overview?.organization_overrides_count ?? 0}</p>
                <p className="text-sm text-gray-500 mt-2">Organizations with custom fee configurations</p>
              </Card>
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Overrides</h2>
                <p className="text-4xl font-bold text-gray-900">{overview?.vendor_overrides_count ?? 0}</p>
                <p className="text-sm text-gray-500 mt-2">Vendors with custom fee configurations</p>
              </Card>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}

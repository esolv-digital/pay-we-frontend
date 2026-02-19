/**
 * Admin Countries Management Page
 *
 * Manage platform countries with:
 * - Country listing with filters (region, status, capabilities)
 * - Activate/deactivate country toggle (countries cannot be deleted)
 * - Payment methods & gateway assignment
 * - Statistics overview
 *
 * Reference: backend/docs/COUNTRY_AND_FEE_SYSTEM_API.md
 */

'use client';

import { useState } from 'react';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import {
  useAdminCountriesList,
  useAdminCountryStatistics,
  useToggleCountryStatus,
} from '@/lib/hooks/use-admin-countries';
import type { CountryFilters } from '@/lib/api/admin-countries';
import { Globe, CheckCircle, Pause, CreditCard, Flag, AlertTriangle, Building2, Zap } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';

const REGIONS = [
  { label: 'All Regions', value: '' },
  { label: 'Africa', value: 'africa' },
  { label: 'Caribbean', value: 'caribbean' },
  { label: 'North America', value: 'north_america' },
  { label: 'South America', value: 'south_america' },
  { label: 'Europe', value: 'europe' },
  { label: 'Asia', value: 'asia' },
  { label: 'Oceania', value: 'oceania' },
];

export default function AdminCountriesPage() {
  const [filters, setFilters] = useState<CountryFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'name',
    sort_direction: 'asc',
  });

  const { data, isLoading, isError, error } = useAdminCountriesList(filters);
  const { data: statsData } = useAdminCountryStatistics();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCountryStatus();

  const handleFilterChange = (key: keyof CountryFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: key !== 'page' ? 1 : prev.page,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, per_page: 20, sort_by: 'name', sort_direction: 'asc' });
  };

  const handleToggleStatus = (code: string, currentlyActive: boolean) => {
    const action = currentlyActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} this country?`)) {
      toggleStatus(code);
    }
  };

  const statistics = statsData;
  const stats = [
    { label: 'Total Countries', value: statistics?.total ?? 0, subtext: 'Configured', icon: Globe, color: 'blue' },
    { label: 'Active', value: statistics?.active ?? 0, subtext: 'Currently enabled', icon: CheckCircle, color: 'green' },
    { label: 'Inactive', value: (statistics?.total ?? 0) - (statistics?.active ?? 0), subtext: 'Disabled', icon: Pause, color: 'gray' },
    { label: 'Gateways', value: statistics?.active_gateways ?? 0, subtext: `${statistics?.total_gateways ?? 0} total`, icon: Zap, color: 'purple' },
    { label: 'Payment Methods', value: statistics?.active_payment_methods ?? 0, subtext: `${statistics?.total_payment_methods ?? 0} total`, icon: CreditCard, color: 'indigo' },
    { label: 'Organizations', value: statistics?.total_organizations ?? 0, subtext: 'Registered', icon: Building2, color: 'emerald' },
  ];

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Country Management</h1>
            <p className="text-gray-600 mt-1">
              Configure supported countries, payment methods, and gateways
            </p>
          </div>
          <Can permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
            <Link href="/admin/countries/create">
              <Button>
                <span className="mr-2">+</span>
                Add Country
              </Button>
            </Link>
          </Can>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
                <IconBadge icon={stat.icon} color={stat.color} />
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                type="text"
                placeholder="Country name, code, or currency..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                aria-label="Filter by region"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                aria-label="Filter by status"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.is_active === undefined ? '' : String(filters.is_active)}
                onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Countries List */}
        {isError ? (
          <Card className="p-12 text-center">
            <IconBadge icon={AlertTriangle} variant="empty-state" color="red" />
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Error Loading Countries</h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Failed to load countries.'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </Card>
        ) : isLoading ? (
          <Card className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : !data?.data || data.data.length === 0 ? (
          <Card className="p-12 text-center">
            <IconBadge icon={Globe} variant="empty-state" color="blue" />
            <h2 className="text-2xl font-semibold mb-2">No Countries Found</h2>
            <p className="text-gray-600">
              {Object.keys(filters).length > 4 ? 'Try adjusting your filters' : 'No countries configured yet'}
            </p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capabilities</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orgs</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.data.map((country) => (
                      <tr key={country.code} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-3"><Flag className="h-5 w-5 text-gray-400" /></div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{country.name}</div>
                              <div className="text-xs text-gray-500">{country.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {country.region?.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {country.currency_symbol} ({country.currency_code})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {country.can_send && <Badge variant="outline" className="text-xs">Send</Badge>}
                            {country.can_receive && <Badge variant="outline" className="text-xs">Receive</Badge>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={country.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {country.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {country.platform_fee_percentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {country.organizations_count ?? 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={ADMIN_ROUTES.COUNTRY_DETAILS(country.code)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Can permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
                              <button
                                onClick={() => handleToggleStatus(country.code, country.is_active)}
                                disabled={isToggling}
                                className={country.is_active
                                  ? 'text-amber-600 hover:text-amber-900'
                                  : 'text-green-600 hover:text-green-900'
                                }
                              >
                                {country.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </Can>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {data.meta && data.meta.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {data.meta.from} to {data.meta.to} of {data.meta.total} countries
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handlePageChange(data.meta.current_page - 1)} disabled={data.meta.current_page === 1}>
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {data.meta.current_page} of {data.meta.last_page}
                  </span>
                  <Button variant="outline" onClick={() => handlePageChange(data.meta.current_page + 1)} disabled={data.meta.current_page === data.meta.last_page}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PermissionGuard>
  );
}

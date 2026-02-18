/**
 * Admin Country Detail Page
 *
 * Full country management including:
 * - Country info display + inline edit (name, fees, capabilities, limits)
 * - Toggle active/inactive status (countries cannot be deleted)
 * - Payment methods management (replace-all via PUT)
 * - Gateway assignments with per-gateway fee_percentage (replace-all via PUT)
 * - Fee hierarchy explanation
 *
 * Reference: backend/docs/COUNTRY_AND_FEE_SYSTEM_API.md
 * The [id] URL param carries the country ISO alpha-2 code (e.g. "GH").
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PermissionGuard, Can } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import {
  useAdminCountry,
  useUpdateCountry,
  useToggleCountryStatus,
  useUpdateCountryPaymentMethods,
  useUpdateCountryGateways,
} from '@/lib/hooks/use-admin-countries';
import type { CountryPaymentMethod, CountryGateway } from '@/types/country';
import { AlertTriangle, Info } from 'lucide-react';
import { IconBadge } from '@/components/ui/icon-badge';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'crypto', label: 'Crypto' },
];

const GATEWAY_OPTIONS = [
  { value: 'paystack', label: 'Paystack' },
  { value: 'flutterwave', label: 'Flutterwave' },
  { value: 'wipay', label: 'WiPay' },
];

const REGION_OPTIONS = [
  { value: 'africa', label: 'Africa' },
  { value: 'caribbean', label: 'Caribbean' },
  { value: 'north_america', label: 'North America' },
  { value: 'south_america', label: 'South America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'oceania', label: 'Oceania' },
];

export default function CountryDetailPage() {
  const params = useParams();
  const countryCode = params?.id as string;

  const { data: country, isLoading, error } = useAdminCountry(countryCode);
  const { mutate: updateCountry, isPending: isUpdating } = useUpdateCountry();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCountryStatus();
  const { mutate: updatePaymentMethods, isPending: isUpdatingPM } = useUpdateCountryPaymentMethods();
  const { mutate: updateGateways, isPending: isUpdatingGW } = useUpdateCountryGateways();

  const [editingInfo, setEditingInfo] = useState(false);
  const [editingPM, setEditingPM] = useState(false);
  const [editingGW, setEditingGW] = useState(false);

  // Country info form state
  const [infoForm, setInfoForm] = useState({
    name: '',
    region: '',
    platform_fee_percentage: 0,
    min_transaction_amount: 0,
    max_transaction_amount: 0,
    can_send: true,
    can_receive: true,
  });

  // Payment methods form state
  const [pmForm, setPmForm] = useState<Array<{
    payment_method: string;
    is_active: boolean;
    is_default: boolean;
    display_order: number;
    additional_fee_percentage: number;
  }>>([]);

  // Gateways form state
  const [gwForm, setGwForm] = useState<Array<{
    gateway: string;
    is_active: boolean;
    is_default: boolean;
    priority: number;
    fee_percentage: number;
    supports_payouts: boolean;
    supported_currencies: string;
    supported_payment_methods: string;
  }>>([]);

  const handleEditInfo = () => {
    if (!country) return;
    setInfoForm({
      name: country.name,
      region: country.region,
      platform_fee_percentage: Number(country.platform_fee_percentage) || 0,
      min_transaction_amount: Number(country.min_transaction_amount) || 0,
      max_transaction_amount: Number(country.max_transaction_amount) || 0,
      can_send: country.can_send,
      can_receive: country.can_receive,
    });
    setEditingInfo(true);
  };

  const handleSaveInfo = () => {
    if (!country) return;
    updateCountry(
      { code: country.code, data: infoForm },
      { onSuccess: () => setEditingInfo(false) }
    );
  };

  const handleEditPM = () => {
    if (!country) return;
    setPmForm(
      country.payment_methods?.length > 0
        ? country.payment_methods.map((pm) => ({
            payment_method: pm.payment_method,
            is_active: pm.is_active,
            is_default: pm.is_default,
            display_order: pm.display_order,
            additional_fee_percentage: Number(pm.additional_fee_percentage) || 0,
          }))
        : [{ payment_method: 'card', is_active: true, is_default: true, display_order: 1, additional_fee_percentage: 0 }]
    );
    setEditingPM(true);
  };

  const handleSavePM = () => {
    if (!country) return;
    updatePaymentMethods(
      { code: country.code, data: { payment_methods: pmForm } },
      { onSuccess: () => setEditingPM(false) }
    );
  };

  const handleAddPM = () => {
    setPmForm((prev) => [
      ...prev,
      { payment_method: 'card', is_active: true, is_default: false, display_order: prev.length + 1, additional_fee_percentage: 0 },
    ]);
  };

  const handleRemovePM = (index: number) => {
    setPmForm((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditGW = () => {
    if (!country) return;
    setGwForm(
      country.gateways && country.gateways.length > 0
        ? country.gateways.map((gw) => ({
            gateway: gw.gateway,
            is_active: gw.is_active,
            is_default: gw.is_default,
            priority: gw.priority,
            fee_percentage: Number(gw.fee_percentage) || 0,
            supports_payouts: gw.supports_payouts,
            supported_currencies: gw.supported_currencies?.join(', ') || '',
            supported_payment_methods: gw.supported_payment_methods?.join(', ') || '',
          }))
        : [{ gateway: 'paystack', is_active: true, is_default: true, priority: 100, fee_percentage: 0, supports_payouts: false, supported_currencies: '', supported_payment_methods: '' }]
    );
    setEditingGW(true);
  };

  const handleSaveGW = () => {
    if (!country) return;
    const payload = gwForm.map((gw) => ({
      gateway: gw.gateway,
      is_active: gw.is_active,
      is_default: gw.is_default,
      priority: gw.priority,
      fee_percentage: gw.fee_percentage,
      supports_payouts: gw.supports_payouts,
      supported_currencies: gw.supported_currencies.split(',').map((s) => s.trim()).filter(Boolean),
      supported_payment_methods: gw.supported_payment_methods.split(',').map((s) => s.trim()).filter(Boolean),
    }));
    updateGateways(
      { code: country.code, data: { gateways: payload } },
      { onSuccess: () => setEditingGW(false) }
    );
  };

  const handleAddGW = () => {
    setGwForm((prev) => [
      ...prev,
      { gateway: 'paystack', is_active: true, is_default: false, priority: 50, fee_percentage: 0, supports_payouts: false, supported_currencies: '', supported_payment_methods: '' },
    ]);
  };

  const handleRemoveGW = (index: number) => {
    setGwForm((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <Card className="p-6"><div className="space-y-4"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div></Card>
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <IconBadge icon={AlertTriangle} variant="empty-state" color="red" />
          <h2 className="text-2xl font-semibold mb-2">Country Not Found</h2>
          <p className="text-gray-600 mb-4">The requested country could not be found.</p>
          <Link href={ADMIN_ROUTES.COUNTRIES}><Button>Back to Countries</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={ADMIN_ROUTES.COUNTRIES} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">
            &larr; Back to Countries
          </Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{country.name}</h1>
              <p className="text-gray-600 mt-1">Code: {country.code} &middot; {country.currency_symbol} ({country.currency_code})</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={country.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {country.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Can permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
                <Button
                  variant={country.is_active ? 'outline' : 'default'}
                  onClick={() => toggleStatus(country.code)}
                  disabled={isToggling}
                  size="sm"
                >
                  {isToggling ? 'Processing...' : country.is_active ? 'Deactivate Country' : 'Activate Country'}
                </Button>
              </Can>
            </div>
          </div>
        </div>

        {/* Fee Hierarchy Info */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Fee Hierarchy</p>
              <p>
                Total fee = <strong>Platform Fee</strong> ({country.platform_fee_percentage}%) +{' '}
                <strong>Gateway Fee</strong> (per gateway below) +{' '}
                <strong>Payment Method Fee</strong> (additional % below).
                Fee bearer (customer/vendor/split) is set at the vendor or payment page level.
              </p>
            </div>
          </div>
        </Card>

        {/* Country Info */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Country Information</h2>
            <Can permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
              {!editingInfo ? (
                <Button variant="outline" size="sm" onClick={handleEditInfo}>Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingInfo(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveInfo} disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </Can>
          </div>

          {editingInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input value={infoForm.name} onChange={(e) => setInfoForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  aria-label="Region"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={infoForm.region}
                  onChange={(e) => setInfoForm((p) => ({ ...p, region: e.target.value }))}
                >
                  {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee %</label>
                <Input type="number" step="0.01" min="0" max="100" value={infoForm.platform_fee_percentage} onChange={(e) => setInfoForm((p) => ({ ...p, platform_fee_percentage: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Transaction</label>
                <Input type="number" step="0.01" min="0" value={infoForm.min_transaction_amount} onChange={(e) => setInfoForm((p) => ({ ...p, min_transaction_amount: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Transaction</label>
                <Input type="number" step="0.01" min="0" value={infoForm.max_transaction_amount} onChange={(e) => setInfoForm((p) => ({ ...p, max_transaction_amount: Number(e.target.value) }))} />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={infoForm.can_send} onChange={(e) => setInfoForm((p) => ({ ...p, can_send: e.target.checked }))} className="rounded border-gray-300" />
                  <span className="text-sm">Can Send</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={infoForm.can_receive} onChange={(e) => setInfoForm((p) => ({ ...p, can_receive: e.target.checked }))} className="rounded border-gray-300" />
                  <span className="text-sm">Can Receive</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <dl className="space-y-3">
                <div><dt className="text-sm text-gray-500">Name</dt><dd className="font-medium text-gray-900">{country.name}</dd></div>
                <div><dt className="text-sm text-gray-500">Code</dt><dd className="font-medium text-gray-900">{country.code}</dd></div>
                <div><dt className="text-sm text-gray-500">Region</dt><dd className="font-medium text-gray-900 capitalize">{country.region?.replace(/_/g, ' ')}</dd></div>
              </dl>
              <dl className="space-y-3">
                <div><dt className="text-sm text-gray-500">Currency</dt><dd className="font-medium text-gray-900">{country.currency_symbol} ({country.currency_code})</dd></div>
                <div><dt className="text-sm text-gray-500">Phone Code</dt><dd className="font-medium text-gray-900">{country.phone_code}</dd></div>
                <div>
                  <dt className="text-sm text-gray-500">Capabilities</dt>
                  <dd className="flex gap-2 mt-1">
                    <Badge variant={country.can_send ? 'default' : 'outline'}>{country.can_send ? 'Can Send' : 'Cannot Send'}</Badge>
                    <Badge variant={country.can_receive ? 'default' : 'outline'}>{country.can_receive ? 'Can Receive' : 'Cannot Receive'}</Badge>
                  </dd>
                </div>
              </dl>
              <dl className="space-y-3">
                <div><dt className="text-sm text-gray-500">Platform Fee</dt><dd className="font-medium text-gray-900">{country.platform_fee_percentage}%</dd></div>
                <div><dt className="text-sm text-gray-500">Min Transaction</dt><dd className="font-medium text-gray-900">{country.currency_symbol}{country.min_transaction_amount}</dd></div>
                <div><dt className="text-sm text-gray-500">Max Transaction</dt><dd className="font-medium text-gray-900">{country.currency_symbol}{country.max_transaction_amount}</dd></div>
              </dl>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
              <Can permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
                {!editingPM ? (
                  <Button variant="outline" size="sm" onClick={handleEditPM}>Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingPM(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSavePM} disabled={isUpdatingPM}>
                      {isUpdatingPM ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </Can>
            </div>

            {editingPM ? (
              <div className="space-y-4">
                {pmForm.map((pm, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <select
                        aria-label="Payment method"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                        value={pm.payment_method}
                        onChange={(e) => setPmForm((prev) => prev.map((p, i) => i === idx ? { ...p, payment_method: e.target.value } : p))}
                      >
                        {PAYMENT_METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <button type="button" onClick={() => handleRemovePM(idx)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Fee %</label>
                        <Input type="number" step="0.01" min="0" max="100" value={pm.additional_fee_percentage} onChange={(e) => setPmForm((prev) => prev.map((p, i) => i === idx ? { ...p, additional_fee_percentage: Number(e.target.value) } : p))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Order</label>
                        <Input type="number" min="0" value={pm.display_order} onChange={(e) => setPmForm((prev) => prev.map((p, i) => i === idx ? { ...p, display_order: Number(e.target.value) } : p))} className="h-8 text-sm" />
                      </div>
                      <div className="flex items-end gap-2 pb-0.5">
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={pm.is_active} onChange={(e) => setPmForm((prev) => prev.map((p, i) => i === idx ? { ...p, is_active: e.target.checked } : p))} className="rounded border-gray-300" />
                          Active
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={pm.is_default} onChange={(e) => setPmForm((prev) => prev.map((p, i) => i === idx ? { ...p, is_default: e.target.checked } : p))} className="rounded border-gray-300" />
                          Default
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddPM} className="w-full">+ Add Payment Method</Button>
              </div>
            ) : country.payment_methods && country.payment_methods.length > 0 ? (
              <div className="space-y-3">
                {country.payment_methods.map((pm: CountryPaymentMethod) => (
                  <div key={pm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{pm.payment_method.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-500">Fee: {pm.additional_fee_percentage}% &middot; Order: {pm.display_order}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={pm.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {pm.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {pm.is_default && <Badge variant="outline">Default</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No payment methods configured</p>
            )}
          </Card>

          {/* Gateways */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Assigned Gateways</h2>
              <Can permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
                {!editingGW ? (
                  <Button variant="outline" size="sm" onClick={handleEditGW}>Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingGW(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveGW} disabled={isUpdatingGW}>
                      {isUpdatingGW ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </Can>
            </div>

            {editingGW ? (
              <div className="space-y-4">
                {gwForm.map((gw, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <select
                        aria-label="Gateway"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                        value={gw.gateway}
                        onChange={(e) => setGwForm((prev) => prev.map((g, i) => i === idx ? { ...g, gateway: e.target.value } : g))}
                      >
                        {GATEWAY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <button type="button" onClick={() => handleRemoveGW(idx)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Fee %</label>
                        <Input type="number" step="0.01" min="0" max="100" value={gw.fee_percentage} onChange={(e) => setGwForm((prev) => prev.map((g, i) => i === idx ? { ...g, fee_percentage: Number(e.target.value) } : g))} className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Priority</label>
                        <Input type="number" min="0" value={gw.priority} onChange={(e) => setGwForm((prev) => prev.map((g, i) => i === idx ? { ...g, priority: Number(e.target.value) } : g))} className="h-8 text-sm" />
                      </div>
                      <div className="flex items-end gap-2 pb-0.5">
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={gw.is_active} onChange={(e) => setGwForm((prev) => prev.map((g, i) => i === idx ? { ...g, is_active: e.target.checked } : g))} className="rounded border-gray-300" />
                          Active
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={gw.is_default} onChange={(e) => setGwForm((prev) => prev.map((g, i) => i === idx ? { ...g, is_default: e.target.checked } : g))} className="rounded border-gray-300" />
                          Default
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Supported Currencies (comma-separated)</label>
                        <Input value={gw.supported_currencies} onChange={(e) => setGwForm((prev) => prev.map((g, i) => i === idx ? { ...g, supported_currencies: e.target.value } : g))} placeholder="GHS, USD" className="h-8 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Payment Methods (comma-separated)</label>
                        <Input value={gw.supported_payment_methods} onChange={(e) => setGwForm((prev) => prev.map((g, i) => i === idx ? { ...g, supported_payment_methods: e.target.value } : g))} placeholder="card, bank, mobile_money" className="h-8 text-sm" />
                      </div>
                    </div>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={gw.supports_payouts} onChange={(e) => setGwForm((prev) => prev.map((g, i) => i === idx ? { ...g, supports_payouts: e.target.checked } : g))} className="rounded border-gray-300" />
                      Supports Payouts
                    </label>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddGW} className="w-full">+ Add Gateway</Button>
              </div>
            ) : country.gateways && country.gateways.length > 0 ? (
              <div className="space-y-3">
                {country.gateways.map((gw: CountryGateway) => (
                  <div key={gw.gateway} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 capitalize">{gw.gateway}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={gw.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {gw.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {gw.is_default && <Badge variant="outline">Default</Badge>}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Fee: <span className="font-medium text-gray-700">{gw.fee_percentage}%</span> &middot; Priority: {gw.priority}</p>
                      {gw.supports_payouts && <p className="text-green-600">Supports payouts</p>}
                      {gw.supported_currencies?.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span>Currencies:</span>
                          {gw.supported_currencies.map((c) => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                        </div>
                      )}
                      {gw.supported_payment_methods?.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span>Methods:</span>
                          {gw.supported_payment_methods.map((m) => <Badge key={m} variant="outline" className="text-xs capitalize">{m.replace(/_/g, ' ')}</Badge>)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No gateways assigned</p>
            )}
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}

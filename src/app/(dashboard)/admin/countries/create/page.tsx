/**
 * Create Country Page
 *
 * Form for adding a new country to the platform.
 * Validates against backend constraints (COUNTRY_AND_FEE_SYSTEM_API.md):
 * - code: max 3 chars, unique ISO alpha-2
 * - name: max 255 chars
 * - currency_code: max 10 chars (ISO 4217)
 * - region: must be valid enum
 * - platform_fee_percentage: 0-100
 * - min/max transaction amounts: >= 0
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ADMIN_ROUTES } from '@/lib/config/routes';
import { useCreateCountry } from '@/lib/hooks/use-admin-countries';
import type { CreateCountryRequest } from '@/lib/api/admin-countries';

const REGION_OPTIONS = [
  { value: 'africa', label: 'Africa' },
  { value: 'caribbean', label: 'Caribbean' },
  { value: 'north_america', label: 'North America' },
  { value: 'south_america', label: 'South America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'oceania', label: 'Oceania' },
];

export default function CreateCountryPage() {
  const router = useRouter();
  const { mutate: createCountry, isPending } = useCreateCountry();

  const [form, setForm] = useState<CreateCountryRequest>({
    code: '',
    name: '',
    currency_code: '',
    currency_symbol: '',
    region: 'africa',
    phone_code: '',
    is_active: true,
    can_send: true,
    can_receive: true,
    platform_fee_percentage: 0,
    min_transaction_amount: 0,
    max_transaction_amount: 1000000,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.code || form.code.length > 3) {
      newErrors.code = 'Country code is required (max 3 characters)';
    }
    if (!form.name || form.name.length > 255) {
      newErrors.name = 'Country name is required (max 255 characters)';
    }
    if (!form.currency_code || form.currency_code.length > 10) {
      newErrors.currency_code = 'Currency code is required (max 10 characters)';
    }
    if (!form.region) {
      newErrors.region = 'Region is required';
    }
    if (form.platform_fee_percentage !== undefined && (form.platform_fee_percentage < 0 || form.platform_fee_percentage > 100)) {
      newErrors.platform_fee_percentage = 'Fee must be between 0 and 100';
    }
    if (form.min_transaction_amount !== undefined && form.min_transaction_amount < 0) {
      newErrors.min_transaction_amount = 'Must be 0 or greater';
    }
    if (form.max_transaction_amount !== undefined && form.max_transaction_amount < 0) {
      newErrors.max_transaction_amount = 'Must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      currency_code: form.currency_code.toUpperCase(),
    };

    createCountry(payload, {
      onSuccess: (data) => {
        router.push(ADMIN_ROUTES.COUNTRY_DETAILS(data?.code || payload.code));
      },
    });
  };

  const updateField = <K extends keyof CreateCountryRequest>(key: K, value: CreateCountryRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <PermissionGuard permission={PERMISSIONS.ADMIN_MANAGE_COUNTRIES}>
      <div className="p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={ADMIN_ROUTES.COUNTRIES} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center">
            &larr; Back to Countries
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Add Country</h1>
          <p className="text-gray-600 mt-1">Configure a new country for the platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="GH"
                  maxLength={3}
                />
                {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code}</p>}
                <p className="text-xs text-gray-500 mt-1">ISO 3166-1 alpha-2 (e.g., GH, NG, TT)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ghana"
                  maxLength={255}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  aria-label="Region"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={form.region}
                  onChange={(e) => updateField('region', e.target.value)}
                >
                  {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {errors.region && <p className="text-sm text-red-600 mt-1">{errors.region}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Code</label>
                <Input
                  value={form.phone_code}
                  onChange={(e) => updateField('phone_code', e.target.value)}
                  placeholder="+233"
                  maxLength={10}
                />
              </div>
            </div>
          </Card>

          {/* Currency */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Currency</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Code <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.currency_code}
                  onChange={(e) => updateField('currency_code', e.target.value.toUpperCase().slice(0, 10))}
                  placeholder="GHS"
                  maxLength={10}
                />
                {errors.currency_code && <p className="text-sm text-red-600 mt-1">{errors.currency_code}</p>}
                <p className="text-xs text-gray-500 mt-1">ISO 4217 (e.g., GHS, NGN, USD)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <Input
                  value={form.currency_symbol}
                  onChange={(e) => updateField('currency_symbol', e.target.value)}
                  placeholder="₵"
                  maxLength={10}
                />
              </div>
            </div>
          </Card>

          {/* Fees & Limits */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fees & Transaction Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee %</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.platform_fee_percentage}
                  onChange={(e) => updateField('platform_fee_percentage', Number(e.target.value))}
                />
                {errors.platform_fee_percentage && <p className="text-sm text-red-600 mt-1">{errors.platform_fee_percentage}</p>}
                <p className="text-xs text-gray-500 mt-1">PayWe&apos;s revenue fee on every transaction</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Transaction Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.min_transaction_amount}
                  onChange={(e) => updateField('min_transaction_amount', Number(e.target.value))}
                />
                {errors.min_transaction_amount && <p className="text-sm text-red-600 mt-1">{errors.min_transaction_amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Transaction Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.max_transaction_amount}
                  onChange={(e) => updateField('max_transaction_amount', Number(e.target.value))}
                />
                {errors.max_transaction_amount && <p className="text-sm text-red-600 mt-1">{errors.max_transaction_amount}</p>}
              </div>
            </div>
          </Card>

          {/* Capabilities */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
                <span className="text-xs text-gray-500">(country is enabled in the system)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.can_send}
                  onChange={(e) => updateField('can_send', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Can Send</span>
                <span className="text-xs text-gray-500">(payments can be initiated from here)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.can_receive}
                  onChange={(e) => updateField('can_receive', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Can Receive</span>
                <span className="text-xs text-gray-500">(vendors can operate here)</span>
              </label>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link href={ADMIN_ROUTES.COUNTRIES}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Country'}
            </Button>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}

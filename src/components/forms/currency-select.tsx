'use client';

import { useEffect } from 'react';
import { useCountry } from '@/lib/hooks/use-countries';
import { useCurrencies } from '@/lib/hooks/use-countries';
import { useAuth } from '@/lib/hooks/use-auth';
import type { CurrencyInfo } from '@/types/country';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CurrencySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  /**
   * If true, only shows the currency from the organization's country
   * If false, shows all supported currencies
   */
  restrictToOrganization?: boolean;
  /**
   * If true, automatically sets the currency to organization's currency when loaded
   * Only applies when restrictToOrganization is true and no value is provided
   */
  autoSetDefault?: boolean;
}

/**
 * Currency Select Component
 *
 * SOLID Principles:
 * - Single Responsibility: Handles currency selection UI
 * - Open/Closed: Can be extended via props without modification
 * - Liskov Substitution: Works wherever a currency selector is needed
 * - Interface Segregation: Clean props interface
 * - Dependency Inversion: Depends on hooks abstraction
 *
 * DRY: Reusable across payment page creation and other forms
 */
export function CurrencySelect({
  value,
  onValueChange,
  label = 'Currency',
  placeholder = 'Select currency',
  error,
  restrictToOrganization = true,
  autoSetDefault = true,
}: CurrencySelectProps) {
  const { user } = useAuth();
  const organization = user?.organizations?.[0];
  const organizationCountryCode = organization?.country_code;

  // Fetch organization's country to get its currency
  const { data: organizationCountry, isLoading: isLoadingCountry } = useCountry(
    organizationCountryCode || ''
  );

  // Fetch all currencies (fallback if not restricting to organization)
  const { data: allCurrencies, isLoading: isLoadingCurrencies } = useCurrencies();

  const isLoading = restrictToOrganization ? isLoadingCountry : isLoadingCurrencies;

  // Determine which currencies to show
  const currencies: Array<{ code: string; symbol: string; name?: string }> = (() => {
    if (restrictToOrganization && organizationCountry) {
      // Show only the organization's country currency
      return [
        {
          code: organizationCountry.currency_code,
          symbol: organizationCountry.currency_symbol,
          name: `${organizationCountry.name} ${organizationCountry.currency_code}`,
        },
      ];
    } else if (!restrictToOrganization && allCurrencies) {
      // Show all supported currencies
      return allCurrencies.map((curr: CurrencyInfo) => ({
        code: curr.code,
        symbol: curr.symbol,
        name: `${curr.code} - ${curr.example_country}`,
      }));
    }
    return [];
  })();

  // Smart default handling:
  // Use explicit value if provided, otherwise fall back to organization's currency
  // This ensures there's always a valid value for the form
  const effectiveValue = value || (restrictToOrganization ? organizationCountry?.currency_code : undefined);

  // Auto-set the form value to organization currency when available
  useEffect(() => {
    if (
      autoSetDefault &&
      !value &&
      restrictToOrganization &&
      organizationCountry?.currency_code &&
      currencies.length > 0
    ) {
      // Set the form value immediately when org currency is available
      onValueChange(organizationCountry.currency_code);
    }
  }, [autoSetDefault, value, restrictToOrganization, organizationCountry, currencies.length, onValueChange]);

  // Find the currency to display
  const displayCurrency = currencies.find((c) => c.code === effectiveValue);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={effectiveValue} onValueChange={onValueChange} disabled={isLoading}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={isLoading ? 'Loading...' : placeholder}>
            {effectiveValue && displayCurrency && (
              <>
                {displayCurrency.symbol} {displayCurrency.code}
              </>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {isLoading && (
            <SelectItem value="loading" disabled>
              Loading currencies...
            </SelectItem>
          )}
          {!isLoading && currencies.length === 0 && (
            <SelectItem value="no-currencies" disabled>
              No currencies available
            </SelectItem>
          )}
          {!isLoading &&
            currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code}
                {currency.name && ` - ${currency.name}`}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {effectiveValue && restrictToOrganization && organizationCountry && !isLoading && (
        <p className="text-xs text-gray-500">
          Currency based on organization&apos;s country: {organizationCountry.name}
        </p>
      )}
    </div>
  );
}

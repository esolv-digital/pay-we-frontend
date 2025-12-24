'use client';

import { useEffect } from 'react';
import { useCountries } from '@/lib/hooks/use-countries';
import { useAuth } from '@/lib/hooks/use-auth';
import type { Country } from '@/types/country';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  region?: string; // Filter by region
  canSend?: boolean; // Filter countries that can send
  canReceive?: boolean; // Filter countries that can receive
  /**
   * If true, automatically sets the country to organization's country when loaded
   * Only applies when no value is provided
   */
  autoSetDefault?: boolean;
}

export function CountrySelect({
  value,
  onValueChange,
  label = 'Country',
  placeholder = 'Select a country',
  error,
  region,
  canSend,
  canReceive,
  autoSetDefault = false,
}: CountrySelectProps) {
  const { user } = useAuth();
  const organization = user?.organizations?.[0];
  const { data: countries, isLoading } = useCountries({
    region,
    can_send: canSend,
    can_receive: canReceive,
  });

  // Auto-set default country from organization when:
  // 1. autoSetDefault is true
  // 2. No value is currently set
  // 3. Organization has a country code
  // 4. Countries have loaded
  useEffect(() => {
    if (
      autoSetDefault &&
      !value &&
      organization?.country_code &&
      countries &&
      countries.length > 0
    ) {
      // Check if organization's country is in the filtered list
      const orgCountryInList = countries.some(
        (c: Country) => c.code === organization.country_code
      );
      if (orgCountryInList) {
        onValueChange(organization.country_code);
      }
    }
  }, [autoSetDefault, value, organization, countries, onValueChange]);

  // Display the current value or show the default from organization
  const displayValue = value || (autoSetDefault ? organization?.country_code : undefined);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={displayValue} onValueChange={onValueChange} disabled={isLoading}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={isLoading ? 'Loading...' : placeholder}>
            {displayValue && countries && countries.length > 0 && (
              <>
                {countries.find((c: Country) => c.code === displayValue)?.name} (
                {countries.find((c: Country) => c.code === displayValue)?.currency_code})
              </>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {isLoading && (
            <SelectItem value="loading" disabled>
              Loading countries...
            </SelectItem>
          )}
          {!isLoading && (!countries || countries.length === 0) && (
            <SelectItem value="no-countries" disabled>
              No countries available
            </SelectItem>
          )}
          {!isLoading &&
            countries?.map((country: Country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name} ({country.currency_code})
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {autoSetDefault && organization?.country_code && !isLoading && (
        <p className="text-xs text-gray-500">
          Default country based on your organization
        </p>
      )}
    </div>
  );
}

'use client';

import { useCountries } from '@/lib/hooks/use-countries';
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
}: CountrySelectProps) {
  const { data: countries, isLoading } = useCountries({
    region,
    can_send: canSend,
    can_receive: canReceive,
  });

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading && (
            <SelectItem value="loading" disabled>
              Loading countries...
            </SelectItem>
          )}
          {countries?.map((country: Country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name} ({country.currency_code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

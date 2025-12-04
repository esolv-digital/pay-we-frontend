'use client';

import { useState, useEffect } from 'react';
import { useCurrencyConverter } from '@/lib/hooks/use-currency-converter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrencyConverterProps {
  defaultFrom?: string;
  defaultTo?: string;
  defaultAmount?: number;
  onConversionChange?: (data: {
    from: string;
    to: string;
    amount: number;
    convertedAmount: number;
    rate: number;
  }) => void;
}

export function CurrencyConverter({
  defaultFrom = 'USD',
  defaultTo = 'NGN',
  defaultAmount = 100,
  onConversionChange,
}: CurrencyConverterProps) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [amount, setAmount] = useState(defaultAmount);

  const { data: conversion, isLoading } = useCurrencyConverter(
    from,
    to,
    amount,
    amount > 0
  );

  useEffect(() => {
    if (conversion && onConversionChange) {
      onConversionChange({
        from: conversion.from_currency,
        to: conversion.to_currency,
        amount: conversion.amount,
        convertedAmount: conversion.converted_amount,
        rate: conversion.rate,
      });
    }
  }, [conversion, onConversionChange]);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'GHS', name: 'Ghanaian Cedi' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'TTD', name: 'Trinidad Dollar' },
    { code: 'JMD', name: 'Jamaican Dollar' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
        </div>

        {isLoading && (
          <div className="text-center text-muted-foreground">
            Converting...
          </div>
        )}

        {conversion && !isLoading && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="text-2xl font-bold">
              {conversion.converted_amount.toFixed(2)} {conversion.to_currency}
            </div>
            <div className="text-sm text-muted-foreground">
              1 {conversion.from_currency} = {conversion.rate} {conversion.to_currency}
            </div>
            <div className="text-xs text-muted-foreground">
              Source: {conversion.source}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

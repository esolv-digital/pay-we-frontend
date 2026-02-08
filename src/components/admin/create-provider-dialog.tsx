'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateMessagingProvider } from '@/lib/hooks/use-admin-notifications';
import type { MessagingProviderChannel } from '@/types';

const CHANNEL_OPTIONS: { value: MessagingProviderChannel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const DRIVER_OPTIONS: Record<MessagingProviderChannel, { value: string; label: string }[]> = {
  email: [
    { value: 'resend', label: 'Resend' },
    { value: 'maileroo', label: 'Maileroo' },
  ],
  sms: [{ value: 'twilio', label: 'Twilio' }],
  whatsapp: [{ value: 'twilio', label: 'Twilio' }],
};

const providerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  driver: z.string().min(1, 'Driver is required'),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  is_active: z.boolean(),
  is_primary: z.boolean(),
  priority: z.number().min(0).max(100),
  // Email credentials
  api_key: z.string().optional(),
  from_email: z.string().email().optional().or(z.literal('')),
  from_name: z.string().optional(),
  // Twilio credentials
  account_sid: z.string().optional(),
  auth_token: z.string().optional(),
  from_number: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface CreateProviderDialogProps {
  onClose: () => void;
}

export function CreateProviderDialog({ onClose }: CreateProviderDialogProps) {
  const [selectedChannel, setSelectedChannel] = useState<MessagingProviderChannel>('email');
  const createProvider = useCreateMessagingProvider();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      channel: 'email',
      is_active: true,
      is_primary: false,
      priority: 1,
    },
  });

  const watchedDriver = watch('driver');

  const handleChannelChange = (channel: MessagingProviderChannel) => {
    setSelectedChannel(channel);
    setValue('channel', channel);
    setValue('driver', '');
  };

  const onSubmit = (data: ProviderFormData) => {
    // Build credentials based on driver
    const credentials: Record<string, string> = {};

    if (data.driver === 'resend' || data.driver === 'maileroo') {
      if (data.api_key) credentials.api_key = data.api_key;
      if (data.from_email) credentials.from_email = data.from_email;
      if (data.from_name) credentials.from_name = data.from_name;
    } else if (data.driver === 'twilio') {
      if (data.account_sid) credentials.account_sid = data.account_sid;
      if (data.auth_token) credentials.auth_token = data.auth_token;
      if (data.from_number) credentials.from = data.from_number;
    }

    createProvider.mutate(
      {
        name: data.name,
        driver: data.driver,
        channel: data.channel,
        is_active: data.is_active,
        is_primary: data.is_primary,
        priority: data.priority,
        credentials,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  const isEmailDriver = watchedDriver === 'resend' || watchedDriver === 'maileroo';
  const isTwilioDriver = watchedDriver === 'twilio';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Add Messaging Provider</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure a new email, SMS, or WhatsApp provider
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Provider Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Primary Email Provider"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Channel */}
          <div>
            <Label>Channel</Label>
            <div className="flex gap-2 mt-1">
              {CHANNEL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChannelChange(option.value)}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    selectedChannel === option.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Driver */}
          <div>
            <Label htmlFor="driver">Driver</Label>
            <select
              id="driver"
              {...register('driver')}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a driver</option>
              {DRIVER_OPTIONS[selectedChannel].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.driver && (
              <p className="text-sm text-red-600 mt-1">{errors.driver.message}</p>
            )}
          </div>

          {/* Email Credentials */}
          {isEmailDriver && (
            <>
              <div>
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  {...register('api_key')}
                  placeholder="Enter API key"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  type="email"
                  {...register('from_email')}
                  placeholder="noreply@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  {...register('from_name')}
                  placeholder="Your Company"
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Twilio Credentials */}
          {isTwilioDriver && (
            <>
              <div>
                <Label htmlFor="account_sid">Account SID</Label>
                <Input
                  id="account_sid"
                  {...register('account_sid')}
                  placeholder="ACxxxxxxxxxxxxxxxx"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="auth_token">Auth Token</Label>
                <Input
                  id="auth_token"
                  type="password"
                  {...register('auth_token')}
                  placeholder="Enter auth token"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="from_number">From Number</Label>
                <Input
                  id="from_number"
                  {...register('from_number')}
                  placeholder="+1234567890"
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority (0-100)</Label>
            <Input
              id="priority"
              type="number"
              {...register('priority', { valueAsNumber: true })}
              min={0}
              max={100}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers have higher priority
            </p>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('is_active')}
                aria-label="Active"
                className="rounded border-gray-300"
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('is_primary')}
                aria-label="Primary"
                className="rounded border-gray-300"
              />
              <span className="text-sm">Primary</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={createProvider.isPending}
          >
            {createProvider.isPending ? 'Creating...' : 'Create Provider'}
          </Button>
        </div>
      </div>
    </div>
  );
}

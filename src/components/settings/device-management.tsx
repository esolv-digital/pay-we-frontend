'use client';

import { useState } from 'react';
import { useDevices, useTrustDevice, useRemoveDevice } from '@/lib/hooks/use-notifications';
import type { UserDevice } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Device icon based on device type
function DeviceIcon({ deviceName }: { deviceName: string }) {
  const name = deviceName.toLowerCase();

  if (name.includes('mobile') || name.includes('phone') || name.includes('iphone') || name.includes('android')) {
    return (
      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  }

  if (name.includes('tablet') || name.includes('ipad')) {
    return (
      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  }

  // Default: Desktop
  return (
    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

// Confirm dialog component
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Device card component
function DeviceCard({
  device,
  isCurrentDevice,
  onTrust,
  onRemove,
  isTrusting,
  isRemoving,
}: {
  device: UserDevice;
  isCurrentDevice: boolean;
  onTrust: () => void;
  onRemove: () => void;
  isTrusting: boolean;
  isRemoving: boolean;
}) {
  return (
    <div
      className={cn(
        'border rounded-lg p-4',
        isCurrentDevice && 'border-blue-500 bg-blue-50/50'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
          <DeviceIcon deviceName={device.device_name} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-gray-900">{device.device_name}</h3>
            {isCurrentDevice && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                Current Device
              </span>
            )}
            {device.is_trusted && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                Trusted
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {device.browser} on {device.os}
          </p>

          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>
              Last active:{' '}
              {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
            </p>
            <p>
              IP: {device.last_ip} ({device.last_country})
            </p>
            <p>
              First seen:{' '}
              {formatDistanceToNow(new Date(device.first_seen_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!device.is_trusted && !isCurrentDevice && (
            <button
              type="button"
              onClick={onTrust}
              disabled={isTrusting}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              {isTrusting ? 'Trusting...' : 'Trust'}
            </button>
          )}
          {!isCurrentDevice && (
            <button
              type="button"
              onClick={onRemove}
              disabled={isRemoving}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DeviceManagement() {
  const { data: devices, isLoading } = useDevices();
  const trustDevice = useTrustDevice();
  const removeDevice = useRemoveDevice();

  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  // TODO: Implement current device detection based on device fingerprint
  // For now, we'll assume the most recently seen device is the current one
  const currentDeviceId = devices?.[0]?.id;

  const handleTrust = (deviceId: string) => {
    trustDevice.mutate(deviceId);
  };

  const handleRemove = (deviceId: string) => {
    setConfirmRemove(deviceId);
  };

  const confirmRemoveDevice = () => {
    if (confirmRemove) {
      removeDevice.mutate(confirmRemove, {
        onSettled: () => setConfirmRemove(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Device Management</h2>
      <p className="text-gray-600 mb-6">
        Manage devices that have accessed your account. Trusted devices won&apos;t trigger
        security alerts.
      </p>

      {!devices || devices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No devices found</p>
          <p className="text-sm text-gray-400 mt-1">
            Devices will appear here after you log in
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              isCurrentDevice={device.id === currentDeviceId}
              onTrust={() => handleTrust(device.id)}
              onRemove={() => handleRemove(device.id)}
              isTrusting={trustDevice.isPending}
              isRemoving={removeDevice.isPending}
            />
          ))}
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">Note:</span> Removing a device will require
          re-authentication on next login and may trigger a security alert. The device
          will be automatically re-added when you log in again.
        </p>
      </div>

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={!!confirmRemove}
        title="Remove Device"
        message="Are you sure you want to remove this device? You will need to log in again from this device, and it may trigger a security alert."
        confirmLabel="Remove Device"
        onConfirm={confirmRemoveDevice}
        onCancel={() => setConfirmRemove(null)}
        isLoading={removeDevice.isPending}
      />
    </div>
  );
}

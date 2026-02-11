'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from '@/lib/hooks/use-profile';
import { useResendVerification } from '@/lib/hooks/use-email-verification';
import { cn } from '@/lib/utils';
import { Mail, AlertTriangle } from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const resendVerification = useResendVerification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
    },
    values: profile ? {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number || '',
    } : undefined,
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate({
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number || undefined,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    uploadAvatar.mutate(file, {
      onSuccess: () => {
        setAvatarPreview(null);
      },
      onError: () => {
        setAvatarPreview(null);
      },
    });
  };

  const handleDeleteAvatar = () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      deleteAvatar.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

      {/* Email Verification Banner */}
      {profile && !profile.email_verified_at && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800">
                Email not verified
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your email address <span className="font-medium">{profile.email}</span> has not been verified.
                Please check your inbox for the verification email or request a new one.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => resendVerification.mutate()}
                  disabled={resendVerification.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  {resendVerification.isPending ? 'Sending...' : 'Resend Verification Email'}
                </button>
                {resendVerification.isSuccess && (
                  <span className="text-sm text-green-700">Sent! Check your inbox.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Profile Picture
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {avatarPreview || profile?.avatar_url ? (
                <img
                  src={avatarPreview || profile?.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-400">
                  {profile?.first_name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            {uploadAvatar.isPending && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              aria-label="Upload profile picture"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
            >
              Change Photo
            </button>
            {profile?.avatar_url && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                disabled={deleteAvatar.isPending}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          JPG, PNG, or GIF. Max size 2MB.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              id="first_name"
              type="text"
              {...form.register('first_name')}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                form.formState.errors.first_name ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {form.formState.errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.first_name.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              id="last_name"
              type="text"
              {...form.register('last_name')}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                form.formState.errors.last_name ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {form.formState.errors.last_name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.last_name.message}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Contact support to change your email address.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone_number"
              type="tel"
              {...form.register('phone_number')}
              placeholder="+233 XX XXX XXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Account Status */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-medium mb-4">Account Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={cn(
                'w-2 h-2 rounded-full',
                profile?.email_verified_at ? 'bg-green-500' : 'bg-yellow-500'
              )}></span>
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">
                {profile?.email_verified_at ? 'Verified' : 'Not verified'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'w-2 h-2 rounded-full',
                profile?.two_factor_enabled ? 'bg-green-500' : 'bg-gray-300'
              )}></span>
              <span className="text-gray-600">2FA:</span>
              <span className="font-medium">
                {profile?.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'w-2 h-2 rounded-full',
                profile?.google_connected ? 'bg-green-500' : 'bg-gray-300'
              )}></span>
              <span className="text-gray-600">Google:</span>
              <span className="font-medium">
                {profile?.google_connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={updateProfile.isPending || !form.formState.isDirty}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

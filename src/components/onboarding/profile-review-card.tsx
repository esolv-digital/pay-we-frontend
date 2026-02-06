'use client';

/**
 * Profile Review Card Component
 *
 * Displays user and organization information in a read-only format
 */

import { Building2, Mail, Phone, User, Globe, MapPin } from 'lucide-react';

interface ProfileReviewCardProps {
  user: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    email: string;
    phone?: string;
  };
  organization: {
    name: string;
    type: 'individual' | 'corporate';
    country_code: string;
    country_name?: string;
  };
}

export function ProfileReviewCard({ user, organization }: ProfileReviewCardProps) {
  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-24 text-sm text-gray-600">Name:</div>
            <div className="flex-1 text-sm font-medium text-gray-900">{fullName}</div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="w-20 text-sm text-gray-600">Email:</div>
            <div className="flex-1 text-sm text-gray-900">{user.email}</div>
          </div>

          {user.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="w-20 text-sm text-gray-600">Phone:</div>
              <div className="flex-1 text-sm text-gray-900">{user.phone}</div>
            </div>
          )}
        </div>
      </div>

      {/* Organization Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Organization Information</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-24 text-sm text-gray-600">Name:</div>
            <div className="flex-1 text-sm font-medium text-gray-900">
              {organization.name}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="w-20 text-sm text-gray-600">Type:</div>
            <div className="flex-1 text-sm text-gray-900 capitalize">
              {organization.type}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="w-20 text-sm text-gray-600">Country:</div>
            <div className="flex-1 text-sm text-gray-900">
              {organization.country_name || organization.country_code}
            </div>
          </div>
        </div>
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Good to know:</strong> You can update your personal profile and
              organization details anytime in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

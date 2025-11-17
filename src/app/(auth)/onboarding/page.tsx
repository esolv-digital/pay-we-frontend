'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, type OnboardingFormData } from '@/lib/utils/validators';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, LogOut } from 'lucide-react';

export default function OnboardingPage() {
  const { completeOnboarding, isOnboardingPending, logout } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      type: 'individual',
    },
  });

  const selectedType = watch('type');

  const onSubmit = (data: OnboardingFormData) => {
    completeOnboarding(data);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-4 px-4 py-1 bg-blue-50 text-blue-700 border-blue-200">
              Step 2 of 2
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Setup</h1>
            <p className="text-gray-600 mt-2">
              Set up your organization to start accepting payments
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Organization Name */}
        <div>
          <Label htmlFor="name">Organization Name *</Label>
          <Input
            {...register('name')}
            type="text"
            id="name"
            placeholder="Acme Corporation"
            className="mt-2"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            This will be displayed to your customers
          </p>
        </div>

        {/* Organization Type */}
        <div>
          <Label>Organization Type *</Label>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <label
              className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedType === 'individual'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                {...register('type')}
                type="radio"
                value="individual"
                className="sr-only"
              />
              <Building2 className={`w-8 h-8 mb-2 ${
                selectedType === 'individual' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                selectedType === 'individual' ? 'text-blue-900' : 'text-gray-900'
              }`}>
                Individual
              </span>
              <span className="text-sm text-gray-500 text-center mt-1">
                For sole proprietors and freelancers
              </span>
            </label>

            <label
              className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedType === 'corporate'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                {...register('type')}
                type="radio"
                value="corporate"
                className="sr-only"
              />
              <Globe className={`w-8 h-8 mb-2 ${
                selectedType === 'corporate' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                selectedType === 'corporate' ? 'text-blue-900' : 'text-gray-900'
              }`}>
                Corporate
              </span>
              <span className="text-sm text-gray-500 text-center mt-1">
                For registered companies and businesses
              </span>
            </label>
          </div>
          {errors.type && (
            <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Country Code */}
        <div>
          <Label htmlFor="country_code">Country Code *</Label>
          <Input
            {...register('country_code')}
            type="text"
            id="country_code"
            placeholder="NG"
            maxLength={2}
            className="mt-2 uppercase"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.country_code && (
            <p className="text-red-600 text-sm mt-1">{errors.country_code.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            ISO 3166-1 alpha-2 country code (e.g., NG for Nigeria, US for United States, GB for United Kingdom)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>What happens next?</strong>
            <br />
            After completing this setup, you&apos;ll be able to:
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
            <li>Access your dashboard</li>
            <li>Create payment pages</li>
            <li>Accept payments from customers</li>
            <li>View transaction history</li>
          </ul>
        </div>

        <Button
          type="submit"
          disabled={isOnboardingPending}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isOnboardingPending ? 'Setting up...' : 'Complete Setup'}
        </Button>
      </form>
    </div>
  );
}

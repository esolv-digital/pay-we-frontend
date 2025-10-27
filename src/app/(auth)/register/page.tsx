'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/utils/validators';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const { register: registerUser, isRegisterPending, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to home
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">Get started with PayWe payment platform</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              {...register('first_name')}
              type="text"
              id="first_name"
              placeholder="John"
              className="mt-2"
            />
            {errors.first_name && (
              <p className="text-red-600 text-sm mt-1">{errors.first_name.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              {...register('last_name')}
              type="text"
              id="last_name"
              placeholder="Doe"
              className="mt-2"
            />
            {errors.last_name && (
              <p className="text-red-600 text-sm mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Middle Name */}
        <div>
          <Label htmlFor="middle_name">Middle Name (Optional)</Label>
          <Input
            {...register('middle_name')}
            type="text"
            id="middle_name"
            placeholder="Michael"
            className="mt-2"
          />
          {errors.middle_name && (
            <p className="text-red-600 text-sm mt-1">{errors.middle_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            {...register('email')}
            type="email"
            id="email"
            placeholder="you@example.com"
            className="mt-2"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="+1234567890"
            className="mt-2"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Password */}
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              {...register('password')}
              type="password"
              id="password"
              placeholder="••••••••"
              className="mt-2"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Password Confirmation */}
          <div>
            <Label htmlFor="password_confirmation">Confirm Password *</Label>
            <Input
              {...register('password_confirmation')}
              type="password"
              id="password_confirmation"
              placeholder="••••••••"
              className="mt-2"
            />
            {errors.password_confirmation && (
              <p className="text-red-600 text-sm mt-1">{errors.password_confirmation.message}</p>
            )}
          </div>
        </div>

        {registerError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">
              {registerError.message || 'Registration failed. Please try again.'}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isRegisterPending}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isRegisterPending ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Create Admin Dialog
 *
 * Form dialog for creating a new platform administrator.
 * Uses react-hook-form + zod for validation.
 *
 * ISO 27001: Strong password policy enforced via schema validation.
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateAdmin } from '@/lib/hooks/use-admin-management';
import type { AdminRole } from '@/lib/api/admin-management';

const ROLE_OPTIONS: { value: AdminRole; label: string; description: string }[] = [
  {
    value: 'Platform Admin',
    label: 'Platform Admin',
    description: 'Can manage platform operations with scoped permissions',
  },
  {
    value: 'Super Admin',
    label: 'Super Admin',
    description: 'Full unrestricted access to all platform features',
  },
];

const createAdminSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(100),
    last_name: z.string().min(1, 'Last name is required').max(100),
    middle_name: z.string().max(100).optional(),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[a-z]/, 'Must include a lowercase letter')
      .regex(/[0-9]/, 'Must include a number')
      .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    password_confirmation: z.string().min(1, 'Please confirm the password'),
    role: z.enum(['Super Admin', 'Platform Admin']),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdminDialog({ open, onOpenChange }: CreateAdminDialogProps) {
  const createAdmin = useCreateAdmin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      role: 'Platform Admin',
    },
  });

  const onSubmit = (data: CreateAdminFormData) => {
    createAdmin.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name || null,
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: data.role,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Administrator</DialogTitle>
          <DialogDescription>
            Add a new platform administrator. They will receive an email with login instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="John"
                className="mt-1"
              />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Doe"
                className="mt-1"
              />
              {errors.last_name && (
                <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input
              id="middle_name"
              {...register('middle_name')}
              placeholder="Optional"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="admin@example.com"
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+233..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <select
              id="role"
              {...register('role')}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Min. 8 characters"
                className="mt-1"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password_confirmation">Confirm Password *</Label>
              <Input
                id="password_confirmation"
                type="password"
                {...register('password_confirmation')}
                placeholder="Re-enter password"
                className="mt-1"
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-600 mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createAdmin.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAdmin.isPending}>
              {createAdmin.isPending ? 'Creating...' : 'Create Administrator'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

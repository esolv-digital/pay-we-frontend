/**
 * Edit Admin Dialog
 *
 * Form dialog for updating an existing administrator's details.
 * Pre-populates with current admin data.
 */

'use client';

import { useEffect } from 'react';
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
import { useUpdateAdmin } from '@/lib/hooks/use-admin-management';
import type { AdminUser, AdminRole } from '@/lib/api/admin-management';

const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: 'Platform Admin', label: 'Platform Admin' },
  { value: 'Super Admin', label: 'Super Admin' },
];

const editAdminSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional(),
  role: z.enum(['Super Admin', 'Platform Admin']),
});

type EditAdminFormData = z.infer<typeof editAdminSchema>;

interface EditAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUser;
}

export function EditAdminDialog({ open, onOpenChange, admin }: EditAdminDialogProps) {
  const updateAdmin = useUpdateAdmin();

  const currentRole: AdminRole = admin.admin.is_super_admin ? 'Super Admin' : 'Platform Admin';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditAdminFormData>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      phone: admin.phone || '',
      role: currentRole,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        phone: admin.phone || '',
        role: currentRole,
      });
    }
  }, [open, admin, currentRole, reset]);

  const onSubmit = (data: EditAdminFormData) => {
    updateAdmin.mutate(
      {
        id: admin.id,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || undefined,
          role: data.role,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Administrator</DialogTitle>
          <DialogDescription>
            Update details for {admin.full_name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_first_name">First Name *</Label>
              <Input
                id="edit_first_name"
                {...register('first_name')}
                className="mt-1"
              />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit_last_name">Last Name *</Label>
              <Input
                id="edit_last_name"
                {...register('last_name')}
                className="mt-1"
              />
              {errors.last_name && (
                <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="edit_email">Email Address *</Label>
            <Input
              id="edit_email"
              type="email"
              {...register('email')}
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="edit_phone">Phone Number</Label>
            <Input
              id="edit_phone"
              type="tel"
              {...register('phone')}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit_role">Role *</Label>
            <select
              id="edit_role"
              {...register('role')}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateAdmin.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateAdmin.isPending || !isDirty}>
              {updateAdmin.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

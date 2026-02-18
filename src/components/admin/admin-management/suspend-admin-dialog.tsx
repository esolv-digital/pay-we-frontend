/**
 * Suspend Admin Dialog
 *
 * Collects suspension reason (required) and optional duration.
 * ISO 27001: Ensures audit trail by requiring a reason for access revocation.
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
import { useSuspendAdmin } from '@/lib/hooks/use-admin-management';
import type { AdminUser } from '@/lib/api/admin-management';

const suspendSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
  duration_days: z.number().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days').optional(),
});

type SuspendFormData = z.infer<typeof suspendSchema>;

interface SuspendAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUser;
}

export function SuspendAdminDialog({ open, onOpenChange, admin }: SuspendAdminDialogProps) {
  const suspendAdmin = useSuspendAdmin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuspendFormData>({
    resolver: zodResolver(suspendSchema),
  });

  const onSubmit = (data: SuspendFormData) => {
    suspendAdmin.mutate(
      {
        id: admin.id,
        data: {
          reason: data.reason,
          duration_days: data.duration_days || undefined,
        },
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suspend Administrator</DialogTitle>
          <DialogDescription>
            Suspend access for <strong>{admin.full_name}</strong>. They will be unable to log in or perform any admin actions until reactivated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="suspend_reason">Reason for Suspension *</Label>
            <textarea
              id="suspend_reason"
              {...register('reason')}
              placeholder="Provide a detailed reason for this suspension..."
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {errors.reason && (
              <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="suspend_duration">Duration (days)</Label>
            <Input
              id="suspend_duration"
              type="number"
              {...register('duration_days', { valueAsNumber: true })}
              min={1}
              max={365}
              placeholder="Leave empty for indefinite"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for indefinite suspension. Set a value for auto-reactivation.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={suspendAdmin.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={suspendAdmin.isPending}
            >
              {suspendAdmin.isPending ? 'Suspending...' : 'Suspend Administrator'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

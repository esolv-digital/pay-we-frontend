'use client';

import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDemoteAdmin } from '@/lib/hooks/use-admin-management';
import type { AdminUser } from '@/lib/api/admin-management';

interface DemoteAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUser;
}

export function DemoteAdminDialog({ open, onOpenChange, admin }: DemoteAdminDialogProps) {
  const { mutate: demoteAdmin, isPending } = useDemoteAdmin();

  const handleDemote = () => {
    demoteAdmin(admin.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Admin Rights</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all platform administrator roles from{' '}
            <span className="font-semibold text-gray-900">{admin.full_name}</span>.
            {admin.has_vendor_access
              ? ' They will retain their vendor/organization access and only appear in the User Management section.'
              : ' They will lose all platform access.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDemote}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove Admin Rights
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

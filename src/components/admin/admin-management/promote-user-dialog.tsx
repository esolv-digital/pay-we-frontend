'use client';

import { useState } from 'react';
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
import { usePromoteUser } from '@/lib/hooks/use-admin-management';
import type { AdminRole } from '@/lib/api/admin-management';

interface PromoteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; first_name: string; last_name: string };
}

export function PromoteUserDialog({ open, onOpenChange, user }: PromoteUserDialogProps) {
  const [role, setRole] = useState<AdminRole>('Platform Admin');
  const { mutate: promoteUser, isPending } = usePromoteUser();

  const handlePromote = () => {
    promoteUser(
      { id: user.id, data: { role } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promote to Administrator</AlertDialogTitle>
          <AlertDialogDescription>
            Grant platform administrator access to{' '}
            <span className="font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </span>
            . They will become a dual user with both admin and vendor/organization access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <label htmlFor="promote-role" className="block text-sm font-medium text-gray-700 mb-1">
            Admin Role
          </label>
          <select
            id="promote-role"
            aria-label="Select admin role"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
          >
            <option value="Platform Admin">Platform Admin</option>
            <option value="Super Admin">Super Admin</option>
          </select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePromote} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Promote to Admin
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

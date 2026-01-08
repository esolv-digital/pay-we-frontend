'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Store, ChevronDown, Loader2 } from 'lucide-react';
import type { ContextType } from '@/types';

interface PasswordVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
  isPending: boolean;
  targetContext: ContextType;
}

function PasswordVerificationDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  targetContext,
}: PasswordVerificationDialogProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(password);
    }
  };

  const handleClose = () => {
    setPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Your Password</DialogTitle>
          <DialogDescription>
            Please enter your password to switch to the {targetContext} dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !password.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContextSwitcher() {
  const {
    currentContext,
    availableContexts,
    hasMultipleContexts,
    switchContext,
    isSwitchContextPending,
  } = useAuth();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [targetContext, setTargetContext] = useState<ContextType | null>(null);

  // Don't show switcher if user doesn't have multiple contexts
  if (!hasMultipleContexts) {
    return null;
  }

  const handleContextSwitch = (context: ContextType) => {
    // Don't switch if already in this context
    if (context === currentContext) {
      return;
    }

    // For switching to admin, require password verification
    if (context === 'admin') {
      setTargetContext(context);
      setShowPasswordDialog(true);
    } else {
      // For switching to vendor, no password required
      switchContext({
        context_type: context,
        require_verification: false,
      });
    }
  };

  const handlePasswordConfirm = (password: string) => {
    if (targetContext) {
      switchContext(
        {
          context_type: targetContext,
          password,
          require_verification: true,
        },
        {
          onSuccess: () => {
            setShowPasswordDialog(false);
            setTargetContext(null);
          },
        }
      );
    }
  };

  const getContextIcon = (context: ContextType) => {
    return context === 'admin' ? (
      <Shield className="mr-2 h-4 w-4" />
    ) : (
      <Store className="mr-2 h-4 w-4" />
    );
  };

  const getContextLabel = (context: ContextType) => {
    return context === 'admin' ? 'Admin Dashboard' : 'Vendor Dashboard';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center">
              {currentContext && getContextIcon(currentContext)}
              {currentContext && getContextLabel(currentContext)}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Switch Context</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {availableContexts?.admin && (
            <DropdownMenuItem
              onClick={() => handleContextSwitch('admin')}
              disabled={currentContext === 'admin' || isSwitchContextPending}
              className="cursor-pointer"
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
              {currentContext === 'admin' && (
                <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
              )}
            </DropdownMenuItem>
          )}

          {availableContexts?.vendor && (
            <DropdownMenuItem
              onClick={() => handleContextSwitch('vendor')}
              disabled={currentContext === 'vendor' || isSwitchContextPending}
              className="cursor-pointer"
            >
              <Store className="mr-2 h-4 w-4" />
              <span>Vendor Dashboard</span>
              {currentContext === 'vendor' && (
                <span className="ml-auto text-xs text-muted-foreground">(Current)</span>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PasswordVerificationDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onConfirm={handlePasswordConfirm}
        isPending={isSwitchContextPending}
        targetContext={targetContext || 'admin'}
      />
    </>
  );
}

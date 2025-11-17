import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Permissions
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasOrganizationPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Check if user has platform role
      hasRole: (role:string|string[]) => {
        const { user } = get();
        if (!user) return false;

        // Super admin has all roles
        if (user.is_super_admin) return true;

        const roles = Array.isArray(role) ? role : [role];
        return !!(user.roles && user.roles.some((r) => roles.includes(r.name)));
      },

      // Check if user has platform permission
      hasPermission: (permission:string) => {
        const { user } = get();
        if (!user) return false;

        // Super admin has all permissions
        if (user.is_super_admin) return true;
        if (user.roles && user.roles.some((r) => r.name === 'super_admin')) return true;

        return !!(user.permissions && user.permissions.includes(permission));
      },

      // Check if user has organization permission
      // hasOrganizationPermission: (permission) => {
      hasOrganizationPermission: () => {
        // const { user } = get();
        return false;
        // if (!user || !user.default_organization) return false;

        // return user.default_organization.member_permissions.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

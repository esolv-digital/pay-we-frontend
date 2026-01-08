import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, ContextType, UserContexts } from '@/types';
import type { PermissionWithSource, Role } from '@/types/permissions';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;

  // Context state
  currentContext: ContextType | null;
  availableContexts: UserContexts | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setContext: (context: ContextType, contexts?: UserContexts) => void;
  logout: () => void;

  // Context helpers
  canSwitchToContext: (context: ContextType) => boolean;
  hasMultipleContexts: () => boolean;

  // Permissions (legacy - kept for backwards compatibility)
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasOrganizationPermission: (permission: string) => boolean;

  // New permission helpers
  getUserPermissions: () => PermissionWithSource[];
  getUserRoles: () => Role[];
  isSuperAdmin: () => boolean;
  isPlatformAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasHydrated: false,
      currentContext: null,
      availableContexts: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      setContext: (context, contexts) => {
        const updates: Partial<AuthState> = { currentContext: context };
        if (contexts) {
          updates.availableContexts = contexts;
        }
        set(updates);
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          currentContext: null,
          availableContexts: null,
        }),

      // Check if user can switch to a specific context
      canSwitchToContext: (context) => {
        const { availableContexts } = get();
        if (!availableContexts) return false;
        return availableContexts[context] === true;
      },

      // Check if user has multiple contexts available
      hasMultipleContexts: () => {
        const { availableContexts } = get();
        if (!availableContexts) return false;
        return availableContexts.admin && availableContexts.vendor;
      },

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

      // Get all user permissions with source information
      getUserPermissions: () => {
        const { user } = get();
        return user?.admin?.platform_permissions || [];
      },

      // Get user roles
      getUserRoles: () => {
        const { user } = get();
        return user?.admin?.platform_roles || [];
      },

      // Check if user is Super Admin
      isSuperAdmin: () => {
        const { user } = get();
        return user?.admin?.is_super_admin || user?.is_super_admin || false;
      },

      // Check if user is Platform Admin
      isPlatformAdmin: () => {
        const { user } = get();
        return user?.admin?.is_platform_admin || false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        currentContext: state.currentContext,
        availableContexts: state.availableContexts,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when rehydration completes
        state?.setHasHydrated(true);
      },
    }
  )
);

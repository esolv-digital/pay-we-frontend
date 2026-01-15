/**
 * Admin User Management React Query Hooks
 *
 * Provides React Query hooks for managing admin user operations.
 * Includes caching, optimistic updates, and automatic refetching.
 *
 * @module lib/hooks/use-admin-users
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminUsersApi,
  type User,
  type UserFilters,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '@/lib/api/admin-users';
import type { PaginatedResponse, ApiResponse } from '@/types/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for admin users
 */
export const adminUsersKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUsersKeys.all, 'list'] as const,
  list: (filters: UserFilters) =>
    [...adminUsersKeys.lists(), filters] as const,
  details: () => [...adminUsersKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUsersKeys.details(), id] as const,
  statistics: () => [...adminUsersKeys.all, 'statistics'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch paginated list of users with filters
 *
 * @param filters - User filters
 * @param options - React Query options
 * @returns Query result with users data
 *
 * @example
 * ```tsx
 * function UsersList() {
 *   const { data, isLoading, error } = useAdminUsersList({
 *     status: 'active',
 *     role: 'Platform Admin',
 *     page: 1,
 *     per_page: 20,
 *   });
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       {data?.data.map(user => (
 *         <UserCard key={user.id} user={user} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminUsersList(
  filters: UserFilters = {},
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: adminUsersKeys.list(filters),
    queryFn: () => adminUsersApi.list(filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to fetch a single user by ID
 *
 * @param id - User ID
 * @param options - React Query options
 * @returns Query result with user details
 *
 * @example
 * ```tsx
 * function UserDetail({ userId }: { userId: string }) {
 *   const { data, isLoading } = useAdminUser(userId);
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <h1>{data?.data.first_name} {data?.data.last_name}</h1>
 *       <p>Email: {data?.data.email}</p>
 *       <p>Status: {data?.data.status}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminUser(
  id: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ApiResponse<User>, Error>({
    queryKey: adminUsersKeys.detail(id),
    queryFn: () => adminUsersApi.get(id),
    staleTime: 60_000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? !!id,
  });
}

/**
 * Hook to fetch user statistics
 *
 * @param options - React Query options
 * @returns Query result with user statistics
 *
 * @example
 * ```tsx
 * function UserStatistics() {
 *   const { data, isLoading } = useAdminUserStatistics();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <Card>
 *         <h3>Total Users</h3>
 *         <p>{data?.data.total_users}</p>
 *       </Card>
 *       <Card>
 *         <h3>Active Users</h3>
 *         <p>{data?.data.active_users}</p>
 *       </Card>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminUserStatistics(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: adminUsersKeys.statistics(),
    queryFn: () => adminUsersApi.getStatistics(),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to create a new user
 *
 * @returns Mutation hook for creating users
 *
 * @example
 * ```tsx
 * function CreateUserForm() {
 *   const { mutate: createUser, isPending } = useCreateUser();
 *
 *   const handleSubmit = (data: CreateUserRequest) => {
 *     createUser(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="first_name" />
 *       <input name="last_name" />
 *       <input name="email" type="email" />
 *       <input name="password" type="password" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Creating...' : 'Create User'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => adminUsersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.all,
      });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      console.error('Create user error:', error);
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
}

/**
 * Hook to update an existing user
 *
 * @returns Mutation hook for updating users
 *
 * @example
 * ```tsx
 * function EditUserForm({ userId }: { userId: string }) {
 *   const { mutate: updateUser, isPending } = useUpdateUser();
 *
 *   const handleSubmit = (data: UpdateUserRequest) => {
 *     updateUser({ id: userId, data });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="first_name" />
 *       <input name="last_name" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Saving...' : 'Save Changes'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserRequest;
    }) => adminUsersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(variables.id),
      });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      console.error('Update user error:', error);
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a user
 *
 * @returns Mutation hook for deleting users
 *
 * @example
 * ```tsx
 * function DeleteUserButton({ userId }: { userId: string }) {
 *   const { mutate: deleteUser, isPending } = useDeleteUser();
 *
 *   const handleDelete = () => {
 *     if (confirm('Are you sure you want to delete this user?')) {
 *       deleteUser(userId);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={isPending}>
 *       {isPending ? 'Deleting...' : 'Delete User'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUsersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.all,
      });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Delete user error:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
}

/**
 * Hook to suspend a user
 *
 * @returns Mutation hook for suspending users
 *
 * @example
 * ```tsx
 * function SuspendUserButton({ userId }: { userId: string }) {
 *   const { mutate: suspendUser, isPending } = useSuspendUser();
 *
 *   const handleSuspend = () => {
 *     const reason = prompt('Reason for suspension:');
 *     if (reason) {
 *       suspendUser({ id: userId, reason });
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleSuspend} disabled={isPending}>
 *       {isPending ? 'Suspending...' : 'Suspend User'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminUsersApi.suspend(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(variables.id),
      });
      toast.success('User suspended successfully');
    },
    onError: (error: Error) => {
      console.error('Suspend user error:', error);
      toast.error(`Failed to suspend user: ${error.message}`);
    },
  });
}

/**
 * Hook to activate a suspended user
 *
 * @returns Mutation hook for activating users
 *
 * @example
 * ```tsx
 * function ActivateUserButton({ userId }: { userId: string }) {
 *   const { mutate: activateUser, isPending } = useActivateUser();
 *
 *   return (
 *     <button
 *       onClick={() => activateUser(userId)}
 *       disabled={isPending}
 *     >
 *       {isPending ? 'Activating...' : 'Activate User'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUsersApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(id),
      });
      toast.success('User activated successfully');
    },
    onError: (error: Error) => {
      console.error('Activate user error:', error);
      toast.error(`Failed to activate user: ${error.message}`);
    },
  });
}

/**
 * Hook to assign roles to a user
 *
 * @returns Mutation hook for assigning roles
 *
 * @example
 * ```tsx
 * function AssignRolesButton({ userId }: { userId: string }) {
 *   const { mutate: assignRoles, isPending } = useAssignRolesToUser();
 *
 *   const handleAssignRoles = () => {
 *     assignRoles({
 *       userId,
 *       roles: ['Platform Admin', 'Vendor Admin'],
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleAssignRoles} disabled={isPending}>
 *       {isPending ? 'Assigning...' : 'Assign Roles'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useAssignRolesToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) =>
      adminUsersApi.assignRoles(userId, roles),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(variables.userId),
      });
      toast.success('Roles assigned successfully');
    },
    onError: (error: Error) => {
      console.error('Assign roles error:', error);
      toast.error(`Failed to assign roles: ${error.message}`);
    },
  });
}

/**
 * Hook to resend verification email
 *
 * @returns Mutation hook for resending verification email
 */
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.resendVerificationEmail(id),
    onSuccess: () => {
      toast.success('Verification email sent successfully');
    },
    onError: (error: Error) => {
      console.error('Resend verification email error:', error);
      toast.error(`Failed to send verification email: ${error.message}`);
    },
  });
}

/**
 * Hook to reset user password
 *
 * @returns Mutation hook for resetting password
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.resetPassword(id),
    onSuccess: () => {
      toast.success('Password reset email sent successfully');
    },
    onError: (error: Error) => {
      console.error('Reset password error:', error);
      toast.error(`Failed to send password reset email: ${error.message}`);
    },
  });
}

/**
 * Hook to invalidate user queries (useful after updates)
 *
 * @example
 * ```tsx
 * function RefreshButton() {
 *   const invalidateUsers = useInvalidateUsers();
 *
 *   return (
 *     <button onClick={invalidateUsers}>
 *       Refresh Users
 *     </button>
 *   );
 * }
 * ```
 */
export function useInvalidateUsers() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: adminUsersKeys.all,
    });
  };
}

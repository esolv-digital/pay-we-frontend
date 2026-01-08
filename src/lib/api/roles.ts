import { apiClient } from './client';
import { Role, Permission, GroupedPermissions } from '@/types/permissions';
import { AssignRolesRequest, AssignPermissionsRequest } from '@/types/auth';

/**
 * Roles and Permissions API Client
 * Follows Single Responsibility Principle
 */

interface RolesListParams {
  page?: number;
  per_page?: number;
  search?: string;
  with_permissions?: boolean;
}

interface RolesListResponse {
  success: boolean;
  status: string;
  message: string;
  data: {
    roles: Role[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

interface RoleResponse {
  success: boolean;
  status: string;
  message: string;
  data: Role;
}

interface CreateRoleRequest {
  name: string;
  permissions?: string[];
  guard_name?: string;
}

interface UpdateRoleRequest {
  name?: string;
  permissions?: string[];
}

interface PermissionsResponse {
  success: boolean;
  status: string;
  message: string;
  data: {
    permissions: Permission[] | GroupedPermissions;
  };
}

interface AssignRolesResponse {
  success: boolean;
  status: string;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      full_name: string;
    };
    roles: Role[];
    permissions: Permission[];
  };
}

interface AssignPermissionsResponse {
  success: boolean;
  status: string;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      full_name: string;
    };
    assigned_permissions: Permission[];
    all_permissions: Permission[];
  };
}

interface UsersListResponse {
  success: boolean;
  status: string;
  message: string;
  data: {
    users: Array<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      full_name: string;
      status: string;
      created_at: string;
    }>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

interface RoleStatisticsResponse {
  success: boolean;
  status: string;
  message: string;
  data: {
    total_roles: number;
    system_roles: number;
    custom_roles: number;
    roles_with_users: Array<{
      role_name: string;
      users_count: number;
    }>;
  };
}

/**
 * Roles Management
 */
export const rolesApi = {
  /**
   * List all roles
   */
  list: async (params?: RolesListParams) => {
    const response = await apiClient.get<RolesListResponse>('/admin/roles', {
      params,
    });
    return response.data;
  },

  /**
   * Get single role
   */
  get: async (id: number) => {
    const response = await apiClient.get<RoleResponse>(`/admin/roles/${id}`);
    return response.data;
  },

  /**
   * Create new role
   */
  create: async (data: CreateRoleRequest) => {
    const response = await apiClient.post<RoleResponse>('/admin/roles', data);
    return response.data;
  },

  /**
   * Update existing role
   */
  update: async (id: number, data: UpdateRoleRequest) => {
    const response = await apiClient.put<RoleResponse>(
      `/admin/roles/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete role
   */
  delete: async (id: number) => {
    const response = await apiClient.delete<{
      success: boolean;
      status: string;
      message: string;
      data: null;
    }>(`/admin/roles/${id}`);
    return response.data;
  },

  /**
   * Assign roles to user
   */
  assign: async (data: AssignRolesRequest) => {
    const response = await apiClient.post<AssignRolesResponse>(
      '/admin/roles/assign',
      data
    );
    return response.data;
  },

  /**
   * Get users by role
   */
  getUsers: async (
    roleId: number,
    params?: { page?: number; per_page?: number }
  ) => {
    const response = await apiClient.get<UsersListResponse>(
      `/admin/roles/${roleId}/users`,
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get role statistics
   */
  getStatistics: async () => {
    const response = await apiClient.get<RoleStatisticsResponse>(
      '/admin/roles/statistics'
    );
    return response.data;
  },
};

/**
 * Permissions Management
 */
export const permissionsApi = {
  /**
   * List all permissions
   */
  list: async (grouped = false) => {
    const response = await apiClient.get<PermissionsResponse>(
      '/admin/permissions',
      {
        params: { grouped },
      }
    );
    return response.data;
  },

  /**
   * Assign permissions to user
   */
  assign: async (data: AssignPermissionsRequest) => {
    const response = await apiClient.post<AssignPermissionsResponse>(
      '/admin/permissions/assign',
      data
    );
    return response.data;
  },

  /**
   * Get users with specific permission
   */
  getUsers: async (
    permission: string,
    params?: { page?: number; per_page?: number }
  ) => {
    const response = await apiClient.get<UsersListResponse>(
      `/admin/permissions/${encodeURIComponent(permission)}/users`,
      {
        params,
      }
    );
    return response.data;
  },
};

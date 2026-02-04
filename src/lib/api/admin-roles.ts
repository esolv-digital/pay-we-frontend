/**
 * Admin Roles & Permissions Management API Client
 *
 * Provides methods for admin users to manage roles and permissions.
 * Includes CRUD operations for roles, permission management, and role/permission assignment.
 *
 * @module lib/api/admin-roles
 */

import { apiClient } from './client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Role data structure
 */
export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: string[]; // Array of permission names
  users_count?: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Permission data structure
 */
export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  category?: string; // For grouped display
  created_at?: string;
}

/**
 * Grouped permissions structure
 */
export interface GroupedPermission {
  category: string;
  permissions: Permission[];
}

/**
 * Role filters
 */
export interface RoleFilters extends PaginationParams {
  search?: string; // Search by role name
  guard_name?: 'web' | 'api';
}

/**
 * Create role request
 */
export interface CreateRoleRequest {
  name: string;
  permissions?: string[]; // Array of permission names
  guard_name?: 'web' | 'api';
}

/**
 * Update role request
 */
export interface UpdateRoleRequest {
  name?: string;
  permissions?: string[];
  guard_name?: 'web' | 'api';
}

/**
 * Assign roles to user request
 */
export interface AssignRolesRequest {
  user_id: string;
  roles: string[]; // Array of role names
}

/**
 * Assign permissions to user request
 */
export interface AssignPermissionsRequest {
  user_id: string;
  permissions: string[]; // Array of permission names
}

/**
 * Role statistics
 */
export interface RoleStatistics {
  total_roles: number;
  total_permissions: number;
  roles_with_users: number;
  most_assigned_role: string;
  roles_by_user_count: Array<{
    role: string;
    count: number;
  }>;
}

/**
 * User data for role/permission assignment
 */
export interface UserWithRoles {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  roles: string[];
  permissions: string[];
  created_at: string;
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * List all roles with pagination
 *
 * @param filters - Role filters
 * @returns Paginated list of roles
 */
export async function list(
  filters?: RoleFilters
): Promise<PaginatedResponse<Role>> {
  return apiClient.get<PaginatedResponse<Role>>('/admin/roles', {
    params: filters,
  });
}

/**
 * Get single role details
 *
 * @param roleId - Role ID
 * @returns Role details
 */
export async function get(roleId: number): Promise<Role> {
  return apiClient.get<Role>(`/admin/roles/${roleId}`);
}

/**
 * Create a new role
 *
 * @param roleData - Role creation data
 * @returns Created role
 */
export async function create(roleData: CreateRoleRequest): Promise<Role> {
  return apiClient.post<Role>('/admin/roles', roleData);
}

/**
 * Update an existing role
 *
 * @param roleId - Role ID
 * @param roleData - Role update data
 * @returns Updated role
 */
export async function update(
  roleId: number,
  roleData: UpdateRoleRequest
): Promise<Role> {
  return apiClient.put<Role>(`/admin/roles/${roleId}`, roleData);
}

/**
 * Delete a role
 *
 * @param roleId - Role ID
 */
export async function deleteRole(roleId: number): Promise<void> {
  await apiClient.delete(`/admin/roles/${roleId}`);
}

/**
 * Get users with a specific role
 *
 * @param roleId - Role ID
 * @param filters - Pagination filters
 * @returns Paginated list of users with the role
 */
export async function getRoleUsers(
  roleId: number,
  filters?: PaginationParams
): Promise<PaginatedResponse<UserWithRoles>> {
  return apiClient.get<PaginatedResponse<UserWithRoles>>(
    `/admin/roles/${roleId}/users`,
    { params: filters }
  );
}

/**
 * Get role statistics
 *
 * @returns Role statistics
 */
export async function getStatistics(): Promise<RoleStatistics> {
  return apiClient.get<RoleStatistics>('/admin/roles/statistics');
}

// ============================================================================
// PERMISSIONS API
// ============================================================================

/**
 * Get all permissions
 *
 * @param grouped - Whether to group permissions by category
 * @returns List of permissions (grouped or flat)
 */
export async function getPermissions(
  grouped?: boolean
): Promise<Permission[] | { permissions: GroupedPermission[] }> {
  return apiClient.get<Permission[] | { permissions: GroupedPermission[] }>(
    '/admin/permissions',
    { params: { grouped: grouped ? 'true' : undefined } }
  );
}

/**
 * Get users with a specific permission
 *
 * @param permissionId - Permission ID
 * @param filters - Pagination filters
 * @returns Paginated list of users with the permission
 */
export async function getPermissionUsers(
  permissionId: number,
  filters?: PaginationParams
): Promise<PaginatedResponse<UserWithRoles>> {
  return apiClient.get<PaginatedResponse<UserWithRoles>>(
    `/admin/permissions/${permissionId}/users`,
    { params: filters }
  );
}

// ============================================================================
// ROLE & PERMISSION ASSIGNMENT API
// ============================================================================

/**
 * Assign roles to a user
 *
 * @param assignData - Role assignment data
 * @returns Updated user with roles
 */
export async function assignRoles(
  assignData: AssignRolesRequest
): Promise<UserWithRoles> {
  return apiClient.post<UserWithRoles>('/admin/assign-roles', assignData);
}

/**
 * Assign permissions directly to a user
 *
 * @param assignData - Permission assignment data
 * @returns Updated user with permissions
 */
export async function assignPermissions(
  assignData: AssignPermissionsRequest
): Promise<UserWithRoles> {
  return apiClient.post<UserWithRoles>('/admin/assign-permissions', assignData);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const adminRolesApi = {
  // Roles
  list,
  get,
  create,
  update,
  delete: deleteRole,
  getRoleUsers,
  getStatistics,

  // Permissions
  getPermissions,
  getPermissionUsers,

  // Assignment
  assignRoles,
  assignPermissions,
};

export default adminRolesApi;

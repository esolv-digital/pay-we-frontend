import { AuthUser } from '@/types/auth';
import {
  PermissionName,
  PermissionCheckOptions,
  SYSTEM_ROLES,
  PermissionWithSource,
} from '@/types/permissions';

/**
 * Permission Service - Centralized permission checking logic
 *
 * Follows Single Responsibility Principle:
 * - Only handles permission verification logic
 * - Doesn't manage state (delegates to auth store)
 * - Doesn't handle API calls (delegates to API layer)
 */
export class PermissionService {
  /**
   * Check if user has a specific permission
   *
   * @param user - Current authenticated user
   * @param permission - Permission name to check
   * @param options - Check options (direct only, etc.)
   * @returns true if user has permission
   */
  static hasPermission(
    user: AuthUser | null,
    permission: PermissionName,
    options: PermissionCheckOptions = {}
  ): boolean {
    if (!user) return false;

    // Super Admin has all permissions
    if (this.isSuperAdmin(user)) return true;

    const { directOnly = false } = options;

    // Check direct permissions
    const directPermissions = user.permissions || [];
    const hasDirectPermission = directPermissions.includes(permission);

    if (directOnly) {
      return hasDirectPermission;
    }

    // Check role-based permissions
    if (user.admin?.platform_permissions) {
      return user.admin.platform_permissions.some((p) => p.name === permission);
    }

    return hasDirectPermission;
  }

  /**
   * Check if user has ALL of the specified permissions
   *
   * @param user - Current authenticated user
   * @param permissions - Array of permission names
   * @param options - Check options
   * @returns true if user has all permissions
   */
  static hasAllPermissions(
    user: AuthUser | null,
    permissions: PermissionName[],
    options: PermissionCheckOptions = {}
  ): boolean {
    if (!user) return false;
    if (this.isSuperAdmin(user)) return true;

    return permissions.every((permission) =>
      this.hasPermission(user, permission, options)
    );
  }

  /**
   * Check if user has ANY of the specified permissions
   *
   * @param user - Current authenticated user
   * @param permissions - Array of permission names
   * @param options - Check options
   * @returns true if user has at least one permission
   */
  static hasAnyPermission(
    user: AuthUser | null,
    permissions: PermissionName[],
    options: PermissionCheckOptions = {}
  ): boolean {
    if (!user) return false;
    if (this.isSuperAdmin(user)) return true;

    return permissions.some((permission) =>
      this.hasPermission(user, permission, options)
    );
  }

  /**
   * Check if user has a specific role
   *
   * @param user - Current authenticated user
   * @param roleName - Role name to check
   * @returns true if user has role
   */
  static hasRole(user: AuthUser | null, roleName: string): boolean {
    if (!user) return false;

    const roles = user.admin?.platform_roles || [];
    return roles.some((role) => role.name === roleName);
  }

  /**
   * Check if user has ANY of the specified roles
   *
   * @param user - Current authenticated user
   * @param roleNames - Array of role names
   * @returns true if user has at least one role
   */
  static hasAnyRole(user: AuthUser | null, roleNames: string[]): boolean {
    if (!user) return false;

    return roleNames.some((roleName) => this.hasRole(user, roleName));
  }

  /**
   * Check if user has ALL of the specified roles
   *
   * @param user - Current authenticated user
   * @param roleNames - Array of role names
   * @returns true if user has all roles
   */
  static hasAllRoles(user: AuthUser | null, roleNames: string[]): boolean {
    if (!user) return false;

    return roleNames.every((roleName) => this.hasRole(user, roleName));
  }

  /**
   * Check if user is Super Admin
   *
   * @param user - Current authenticated user
   * @returns true if user is super admin
   */
  static isSuperAdmin(user: AuthUser | null): boolean {
    return user?.admin?.is_super_admin || user?.is_super_admin || false;
  }

  /**
   * Check if user is Platform Admin
   *
   * @param user - Current authenticated user
   * @returns true if user is platform admin
   */
  static isPlatformAdmin(user: AuthUser | null): boolean {
    return user?.admin?.is_platform_admin || false;
  }

  /**
   * Get all user permissions with source information
   *
   * @param user - Current authenticated user
   * @returns Array of permissions with source
   */
  static getAllPermissions(user: AuthUser | null): PermissionWithSource[] {
    if (!user) return [];

    return user.admin?.platform_permissions || [];
  }

  /**
   * Get only direct permissions (not from roles)
   *
   * @param user - Current authenticated user
   * @returns Array of direct permissions
   */
  static getDirectPermissions(user: AuthUser | null): PermissionWithSource[] {
    return this.getAllPermissions(user).filter((p) => p.source === 'direct');
  }

  /**
   * Get only role-based permissions
   *
   * @param user - Current authenticated user
   * @returns Array of role-based permissions
   */
  static getRolePermissions(user: AuthUser | null): PermissionWithSource[] {
    return this.getAllPermissions(user).filter((p) => p.source.startsWith('role:'));
  }

  /**
   * Check if a role is a system role (cannot be modified/deleted)
   *
   * @param roleName - Role name to check
   * @returns true if role is a system role
   */
  static isSystemRole(roleName: string): boolean {
    return SYSTEM_ROLES.includes(roleName as any);
  }

  /**
   * Check if user can modify a specific role
   *
   * @param user - Current authenticated user
   * @param roleName - Role to check
   * @returns true if user can modify the role
   */
  static canModifyRole(user: AuthUser | null, roleName: string): boolean {
    // System roles cannot be modified by anyone except Super Admin
    if (this.isSystemRole(roleName)) {
      return this.isSuperAdmin(user);
    }

    // Check if user has permission to update roles
    return this.hasPermission(user, 'Update Roles');
  }

  /**
   * Check if user can delete a specific role
   *
   * @param user - Current authenticated user
   * @param roleName - Role to check
   * @returns true if user can delete the role
   */
  static canDeleteRole(user: AuthUser | null, roleName: string): boolean {
    // System roles cannot be deleted
    if (this.isSystemRole(roleName)) {
      return false;
    }

    // Check if user has permission to delete roles
    return this.hasPermission(user, 'Delete Roles');
  }
}

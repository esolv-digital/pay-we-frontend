/**
 * Admin Roles & Permissions Management Page
 *
 * Comprehensive role management with:
 * - Role listing and statistics
 * - Permission matrix
 * - Role creation and editing
 * - User assignment tracking
 */

'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS, type Role } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRoles, useRoleStatistics } from '@/lib/hooks/use-roles-permissions';

export default function AdminRolesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch roles from API with permissions
  const { data: rolesData } = useRoles({
    with_permissions: true,
  });

  // Fetch role statistics
  const { data: statsData } = useRoleStatistics();

  const roles: Role[] = rolesData?.data?.roles || [];

  const stats = [
    {
      label: 'Total Roles',
      value: statsData?.total_roles?.toString() || roles.length.toString(),
      icon: '🔐',
      color: 'bg-blue-50'
    },
    {
      label: 'System Roles',
      value: statsData?.system_roles?.toString() || roles.filter((r: Role) => r.is_system).length.toString(),
      icon: '⚙️',
      color: 'bg-purple-50'
    },
    {
      label: 'Custom Roles',
      value: statsData?.custom_roles?.toString() || roles.filter((r: Role) => !r.is_system).length.toString(),
      icon: '✨',
      color: 'bg-green-50'
    },
    {
      label: 'Total Users',
      value: statsData?.roles_with_users
        ? statsData.roles_with_users.reduce((sum: number, role: { users_count: number }) => sum + role.users_count, 0).toString()
        : '0',
      icon: '👥',
      color: 'bg-yellow-50'
    },
  ];

  const permissionCategories = [
    {
      name: 'User Management',
      permissions: ['manage_users', 'view_users', 'invite_users', 'delete_users'],
    },
    {
      name: 'Organization Management',
      permissions: ['manage_organizations', 'view_organizations', 'manage_organization', 'view_organization'],
    },
    {
      name: 'Transaction Management',
      permissions: ['view_transactions', 'manage_transactions', 'export_transactions'],
    },
    {
      name: 'KYC/KYB Management',
      permissions: ['view_kyc', 'manage_kyc', 'approve_kyc', 'reject_kyc'],
    },
    {
      name: 'Payment Pages',
      permissions: ['create_payment_pages', 'edit_payment_pages', 'delete_payment_pages'],
    },
    {
      name: 'System Settings',
      permissions: ['manage_settings', 'view_logs', 'manage_roles'],
    },
  ];

  const filteredRoles = roles.filter((role: Role) =>
    role.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ROLES}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-1">
              Manage user roles and their permissions across the platform
            </p>
          </div>
          <Button>
            <span className="mr-2">+</span>
            Create Custom Role
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className={`p-6 ${stat.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search roles by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">Filters</Button>
          </div>
        </Card>

        {/* Roles List */}
        <div className="space-y-4 mb-8">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {role.display_name}
                    </h3>
                    {role.is_system && (
                      <Badge className="bg-blue-100 text-blue-800">System Role</Badge>
                    )}
                    <Badge className="bg-gray-100 text-gray-800">
                      {role.user_count} {role.user_count === 1 ? 'user' : 'users'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{role.description}</p>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.includes('*') ? (
                        <Badge className="bg-purple-100 text-purple-800">
                          All Permissions
                        </Badge>
                      ) : (
                        role.permissions.map((perm: string) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm.replace(/_/g, ' ')}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {!role.is_system && (
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Permission Matrix */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Permission Matrix</h2>
          <p className="text-gray-600 mb-6">
            Overview of permissions available in the system by category
          </p>

          <div className="space-y-6">
            {permissionCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.permissions.map((permission) => (
                    <div
                      key={permission}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-700">
                        {permission.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500">
              <strong>Note:</strong> System roles cannot be modified. Create custom roles to define
              specific permission sets for your organization.
            </p>
          </div>
        </Card>
      </div>
    </PermissionGuard>
  );
}

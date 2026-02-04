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
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminRolesList,
  useAdminRoleStatistics,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '@/lib/hooks/use-admin-roles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Shield, Users, Lock, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Role, CreateRoleRequest } from '@/lib/api/admin-roles';

export default function AdminRolesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    guard_name: 'api' as 'api' | 'web',
  });

  // Fetch roles from API
  const { data: rolesData, isLoading, error } = useAdminRolesList({ per_page: 50 });

  // Fetch role statistics
  const { data: statsData } = useAdminRoleStatistics();

  // Mutations
  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  const roles = rolesData?.data || [];
  const stats = statsData || {
    total_roles: roles.length,
    total_permissions: 0,
    roles_with_users: 0,
    most_assigned_role: '',
    roles_by_user_count: [],
  };

  const statisticsCards = [
    {
      label: 'Total Roles',
      value: stats.total_roles.toString(),
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Permissions',
      value: stats.total_permissions.toString(),
      icon: Lock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Active Roles',
      value: stats.roles_with_users.toString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Most Assigned',
      value: stats.most_assigned_role || 'N/A',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const filteredRoles = roles.filter((role: Role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData({ name: '', guard_name: 'api' });
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({ name: role.name, guard_name: role.guard_name as 'api' | 'web' });
    setShowEditDialog(true);
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  const handleCreate = () => {
    const data: CreateRoleRequest = {
      name: formData.name,
      guard_name: formData.guard_name,
      permissions: [],
    };

    createRole(data, {
      onSuccess: () => {
        setShowCreateDialog(false);
        setFormData({ name: '', guard_name: 'api' });
      },
    });
  };

  const handleUpdate = () => {
    if (!selectedRole) return;

    updateRole(
      {
        roleId: selectedRole.id,
        data: { name: formData.name },
      },
      {
        onSuccess: () => {
          setShowEditDialog(false);
          setSelectedRole(null);
          setFormData({ name: '', guard_name: 'api' });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedRole) return;

    deleteRole(selectedRole.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setSelectedRole(null);
      },
    });
  };

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ROLES}>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-1">
              Manage user roles and their permissions across the platform
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statisticsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search roles by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="p-8 mb-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to load roles</h3>
              <p className="mb-4 text-sm text-gray-600">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Roles List */}
        {!isLoading && !error && filteredRoles.length === 0 && (
          <Card className="p-12 text-center">
            <span className="text-6xl mb-4 block">🔐</span>
            <h2 className="text-2xl font-semibold mb-2">No Roles Found</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new role'}
            </p>
            <Button onClick={handleOpenCreate}>Create Role</Button>
          </Card>
        )}

        {!isLoading && !error && filteredRoles.length > 0 && (
          <div className="space-y-4">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{role.name}</h3>
                      <Badge className="bg-gray-100 text-gray-800">
                        {role.guard_name}
                      </Badge>
                      {role.users_count !== undefined && (
                        <Badge variant="outline">
                          {role.users_count} {role.users_count === 1 ? 'user' : 'users'}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Permissions ({role.permissions?.length || 0}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.slice(0, 10).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No permissions assigned</span>
                        )}
                        {role.permissions && role.permissions.length > 10 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/roles/${role.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(role)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDelete(role)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Top Roles by User Count */}
        {stats.roles_by_user_count && stats.roles_by_user_count.length > 0 && (
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Assigned Roles</h2>
            <div className="space-y-3">
              {stats.roles_by_user_count.slice(0, 5).map((roleStats) => (
                <div
                  key={roleStats.role}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{roleStats.role}</span>
                  <Badge variant="outline">{roleStats.count} users</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Create Role Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a new role with custom permissions for your platform.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Finance Manager"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="guard-name">Guard Type</Label>
                <select
                  id="guard-name"
                  aria-label="Select guard type"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={formData.guard_name}
                  onChange={(e) =>
                    setFormData({ ...formData, guard_name: e.target.value as 'api' | 'web' })
                  }
                >
                  <option value="api">API</option>
                  <option value="web">Web</option>
                </select>
              </div>

              <p className="text-sm text-gray-500">
                You can assign permissions after creating the role.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !formData.name.trim()}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Update the role name and settings.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  placeholder="Role name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating || !formData.name.trim()}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Role Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot
                be undone. Users with this role will lose their assigned permissions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  );
}

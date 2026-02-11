/**
 * Role Detail Page
 *
 * Displays detailed information about a role including:
 * - Role information
 * - Permission management
 * - Users with this role
 * - Role statistics
 */

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PermissionGuard } from '@/components/permissions';
import { PERMISSIONS } from '@/types/permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  useAdminRole,
  useRoleUsers,
  useAdminPermissions,
  useUpdateRole,
} from '@/lib/hooks/use-admin-roles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  ArrowLeft,
  Users,
  Shield,
  Edit,
  Save,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Permission, GroupedPermission } from '@/lib/api/admin-roles';

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = parseInt(params?.id as string);

  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchUsers, setSearchUsers] = useState('');

  // Fetch role details
  const { data: role, isLoading: isLoadingRole, error: roleError } = useAdminRole(roleId);

  // Fetch users with this role
  const { data: usersData, isLoading: isLoadingUsers } = useRoleUsers(roleId, { per_page: 20 });

  // Fetch all permissions
  const { data: permissionsData } = useAdminPermissions(true);

  // Update role mutation
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();

  if (isLoadingRole) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <Card className="p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (roleError || !role) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Role Not Found</h2>
          <p className="text-gray-600 mb-4">
            The requested role could not be found or you don't have permission to view it.
          </p>
          <Link href="/admin/roles">
            <Button>Back to Roles</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const users = usersData?.data || [];
  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const handleOpenPermissions = () => {
    setSelectedPermissions(role.permissions || []);
    setShowPermissionsDialog(true);
  };

  const handlePermissionToggle = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleSavePermissions = () => {
    updateRole(
      {
        roleId: role.id,
        data: {
          permissions: selectedPermissions,
        },
      },
      {
        onSuccess: () => {
          setShowPermissionsDialog(false);
        },
      }
    );
  };

  const groupedPermissions =
    permissionsData && 'permissions' in permissionsData
      ? (permissionsData.permissions as GroupedPermission[])
      : [];

  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_ROLES}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/roles"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Roles
          </Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{role.name}</h1>
              <p className="text-gray-600 mt-1">Role details and management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenPermissions}>
                <Edit className="mr-2 h-4 w-4" />
                Manage Permissions
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Permissions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {role.permissions?.length || 0}
                </p>
              </div>
              <div className="rounded-full p-3 bg-purple-50">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Users</p>
                <p className="text-3xl font-bold text-gray-900">{role.users_count || 0}</p>
              </div>
              <div className="rounded-full p-3 bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Guard Type</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{role.guard_name}</p>
              </div>
              <div className="rounded-full p-3 bg-green-50">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Permissions */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Permissions ({role.permissions?.length || 0})
            </h2>
            <Button variant="outline" size="sm" onClick={handleOpenPermissions}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>

          {role.permissions && role.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission: any, index: number) => {
                const name = typeof permission === 'string' ? permission : permission.name;
                return (
                  <Badge key={name ?? index} variant="outline">
                    {name}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="mx-auto h-12 w-12 mb-2 text-gray-400" />
              <p>No permissions assigned to this role</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleOpenPermissions}>
                Add Permissions
              </Button>
            </div>
          )}
        </Card>

        {/* Users with this Role */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Users with this Role ({role.users_count || 0})
            </h2>
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
            />
          </div>

          {isLoadingUsers ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 mb-2 text-gray-400" />
              <p>
                {searchUsers
                  ? 'No users found matching your search'
                  : 'No users have been assigned this role yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {user.roles && user.roles.length > 1 && (
                      <Badge variant="outline">+{user.roles.length - 1} more roles</Badge>
                    )}
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Permissions Management Dialog */}
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Permissions for {role.name}</DialogTitle>
              <DialogDescription>
                Select the permissions this role should have. Changes will affect all users with
                this role.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {groupedPermissions.length > 0 ? (
                <div className="space-y-6">
                  {groupedPermissions.map((group) => (
                    <div key={group.category} className="border-b pb-6 last:border-b-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                        {group.category.replace(/_/g, ' ')}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {group.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                          >
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={selectedPermissions.includes(permission.name)}
                              onCheckedChange={() => handlePermissionToggle(permission.name)}
                            />
                            <label
                              htmlFor={`perm-${permission.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading permissions...</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedPermissions.length} permissions
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePermissions} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}

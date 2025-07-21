'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useRole } from '@/hooks/useRole';
import axiosInstance from '@/lib/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Search, Shield, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Permission {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CreateRolePayload {
  name: string;
}

export default function PermissionsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddPermissionsDialogOpen, setIsAddPermissionsDialogOpen] =
    useState(false);
  const [isEditPermissionsDialogOpen, setIsEditPermissionsDialogOpen] =
    useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading: isPermissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () =>
      axiosInstance.get('/api/permissions/all').then((res) => res.data.data),
  });

  const { data: roles = [], isLoading: isRolesLoading } = useRole();

  const isLoading = isPermissionsLoading || isRolesLoading;

  const createRoleMutation = useMutation({
    mutationFn: (payload: CreateRolePayload) =>
      axiosInstance.post('/api/roles/create', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsCreateRoleDialogOpen(false);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) =>
      axiosInstance.delete(`/api/roles/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsDeleteDialogOpen(false);
    },
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: string[];
    }) =>
      axiosInstance.post(`/api/roles/${roleId}/permissions/assign`, {
        permissions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsAddPermissionsDialogOpen(false);
    },
  });

  const revokePermissionsMutation = useMutation({
    mutationFn: async ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: string[];
    }) => {
      console.log('roleId', roleId);
      console.log('permissions', permissions);
      await axiosInstance.put(`/api/roles/${roleId}/permissions`, {
        permissionNames: permissions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsEditPermissionsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateRole = (payload: CreateRolePayload) => {
    createRoleMutation.mutate(payload);
  };

  const handleDeleteRole = (roleId: string) => {
    deleteRoleMutation.mutate(roleId);
  };

  const handleAddPermissions = (roleId: string, permissionNames: string[]) => {
    assignPermissionsMutation.mutate({ roleId, permissions: permissionNames });
  };

  const handleEditPermissions = (roleId: string, permissionNames: string[]) => {
    revokePermissionsMutation.mutate({ roleId, permissions: permissionNames });
  };

  const filteredRoles = roles.filter((role: Role) => {
    const term = searchTerm.toLowerCase();
    return (
      role.name.toLowerCase().includes(term) ||
      role.permissions.some((p) => p.name.toLowerCase().includes(term))
    );
  });

  const getPermissionColor = (name: string) => {
    if (name.includes(':view')) return 'bg-blue-100 text-blue-800';
    if (name.includes(':create')) return 'bg-green-100 text-green-800';
    if (name.includes(':edit')) return 'bg-yellow-100 text-yellow-800';
    if (name.includes(':delete')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permissions Management</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for your application
          </p>
        </div>
        <Button onClick={() => setIsCreateRoleDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Roles & Assignments
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            All Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search roles or permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-4">
            {filteredRoles.map((role: Role) => (
              <Card key={role._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {role.name}
                      </CardTitle>
                      <CardDescription>
                        {role.permissions.length} permissions assigned
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {role.permissions.length > 0 ? (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedRole(role);
                              setIsEditPermissionsDialogOpen(true);
                            }}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Permissions
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedRole(role);
                            setIsAddPermissionsDialogOpen(true);
                          }}
                          variant="default"
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Permissions
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedRole(role);
                          setIsDeleteDialogOpen(true);
                        }}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.length === 0 ? (
                      <p className="text-muted-foreground">
                        No permissions assigned
                      </p>
                    ) : (
                      role.permissions.map((permission) => (
                        <div
                          key={permission._id}
                          className="flex items-center gap-1"
                        >
                          <Badge
                            className={getPermissionColor(permission.name)}
                          >
                            {permission.name}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>
                Manage all available permissions in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission: Permission) => (
                    <TableRow key={permission._id}>
                      <TableCell>
                        <Badge className={getPermissionColor(permission.name)}>
                          {permission.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {permission.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        {new Date(permission.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPermission(permission);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddPermissionsDialog
        isOpen={isAddPermissionsDialogOpen}
        onClose={() => setIsAddPermissionsDialogOpen(false)}
        role={selectedRole}
        allPermissions={permissions}
        onAdd={handleAddPermissions}
      />

      <EditPermissionsDialog
        isOpen={isEditPermissionsDialogOpen}
        onClose={() => setIsEditPermissionsDialogOpen(false)}
        role={selectedRole}
        allPermissions={permissions}
        onEdit={handleEditPermissions}
      />

      <EditPermissionDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingPermission(null);
        }}
        permission={editingPermission}
        onSave={() => {
          if (selectedRole && editingPermission) {
            handleEditPermissions(selectedRole._id, [editingPermission.name]);
            setIsEditDialogOpen(false);
          }
        }}
      />

      <CreateRoleDialog
        isOpen={isCreateRoleDialogOpen}
        onClose={() => setIsCreateRoleDialogOpen(false)}
        onCreate={handleCreateRole}
      />

      <DeleteRoleDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        role={selectedRole}
        onDelete={handleDeleteRole}
      />
    </div>
  );
}

interface DeleteRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onDelete: (roleId: string) => void;
}

function DeleteRoleDialog({
  isOpen,
  onClose,
  role,
  onDelete,
}: DeleteRoleDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (role) {
      setConfirmationText('');
    }
  }, [role]);

  const handleDelete = () => {
    if (role) {
      onDelete(role._id);
      onClose();
    }
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the role{' '}
            <strong>{role.name}</strong>? <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="confirmation">Type role name to confirm</Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Type "${role.name}" to confirm`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmationText !== role.name}
          >
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  allPermissions: Permission[];
  onAdd: (roleId: string, permissionNames: string[]) => void;
}

function AddPermissionsDialog({
  isOpen,
  onClose,
  role,
  allPermissions,
  onAdd,
}: AddPermissionsDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleSubmit = () => {
    if (role) {
      onAdd(role._id, selectedPermissions);
    }
  };

  if (!role) return null;

  // Filter out permissions that are already assigned
  const availablePermissions = allPermissions.filter(
    (permission) => !role.permissions.some((p) => p.name === permission.name)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Permissions to "{role.name}"</DialogTitle>
          <DialogDescription>
            Select permissions to add to this role
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-4">
          {availablePermissions.map((permission) => (
            <div key={permission._id} className="flex items-center space-x-2">
              <Checkbox
                id={`add-${permission._id}`}
                checked={selectedPermissions.includes(permission.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPermissions((prev) => [
                      ...prev,
                      permission.name,
                    ]);
                  } else {
                    setSelectedPermissions((prev) =>
                      prev.filter((name) => name !== permission.name)
                    );
                  }
                }}
              />
              <div className="flex-1">
                <Label
                  htmlFor={`add-${permission._id}`}
                  className="flex items-center gap-2"
                >
                  <Badge className={getPermissionColor(permission.name)}>
                    {permission.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {permission.description || 'No description'}
                  </span>
                </Label>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Selected Permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  allPermissions: Permission[];
  onEdit: (roleId: string, permissionNames: string[]) => void;
}

function EditPermissionsDialog({
  isOpen,
  onClose,
  role,
  allPermissions,
  onEdit,
}: EditPermissionsDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions.map((p) => p.name));
    }
  }, [role]);

  const handleSubmit = () => {
    if (role) {
      onEdit(role._id, selectedPermissions);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Permissions for "{role.name}"</DialogTitle>
          <DialogDescription>
            Select or deselect permissions for this role
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-4">
          {allPermissions.map((permission) => (
            <div key={permission._id} className="flex items-center space-x-2">
              <Checkbox
                id={`edit-${permission._id}`}
                checked={selectedPermissions.includes(permission.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPermissions((prev) => [
                      ...prev,
                      permission.name,
                    ]);
                  } else {
                    setSelectedPermissions((prev) =>
                      prev.filter((name) => name !== permission.name)
                    );
                  }
                }}
              />
              <div className="flex-1">
                <Label
                  htmlFor={`edit-${permission._id}`}
                  className="flex items-center gap-2"
                >
                  <Badge className={getPermissionColor(permission.name)}>
                    {permission.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {permission.description || 'No description'}
                  </span>
                </Label>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSave: (permission: Permission) => void;
}

function EditPermissionDialog({
  isOpen,
  onClose,
  permission,
  onSave,
}: EditPermissionDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (permission) {
      setName(permission.name);
      setDescription(permission.description);
    }
  }, [permission]);

  const handleSubmit = () => {
    if (permission) {
      onSave({
        ...permission,
        name,
        description,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  if (!permission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Permission</DialogTitle>
          <DialogDescription>
            Update the permission details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="permission-name">Permission Name</Label>
            <Input
              id="permission-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., user:create"
            />
          </div>
          <div>
            <Label htmlFor="permission-description">Description</Label>
            <Textarea
              id="permission-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this permission allows..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (role: CreateRolePayload) => void;
}

function CreateRoleDialog({
  isOpen,
  onClose,
  onCreate,
}: CreateRoleDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate({ name: name.trim() });
      setName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>Add a new role to the system</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., admin"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getPermissionColor(permissionName: string) {
  if (permissionName.includes(':view')) return 'bg-blue-100 text-blue-800';
  if (permissionName.includes(':create')) return 'bg-green-100 text-green-800';
  if (permissionName.includes(':edit')) return 'bg-yellow-100 text-yellow-800';
  if (permissionName.includes(':delete')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

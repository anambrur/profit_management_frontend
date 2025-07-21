'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import {
  Edit,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Types based on your API response
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

// Mock data based on your API response
const initialRoles: Role[] = [
  {
    _id: '6873f9210e7988c7b8e63fa1',
    name: 'admin',
    permissions: [
      {
        _id: '6873f9200e7988c7b8e63f72',
        name: 'order:create',
        description: '',
        createdAt: '2025-07-13T18:21:20.489Z',
        updatedAt: '2025-07-13T18:21:20.489Z',
        __v: 0,
      },
      {
        _id: '6873f9200e7988c7b8e63f7b',
        name: 'order:delete',
        description: '',
        createdAt: '2025-07-13T18:21:20.634Z',
        updatedAt: '2025-07-13T18:21:20.634Z',
        __v: 0,
      },
      {
        _id: '6873f9200e7988c7b8e63f78',
        name: 'order:edit',
        description: '',
        createdAt: '2025-07-13T18:21:20.588Z',
        updatedAt: '2025-07-13T18:21:20.588Z',
        __v: 0,
      },
      {
        _id: '6873f9200e7988c7b8e63f75',
        name: 'order:view',
        description: '',
        createdAt: '2025-07-13T18:21:20.540Z',
        updatedAt: '2025-07-13T18:21:20.540Z',
        __v: 0,
      },
    ],
    createdAt: '2025-07-13T18:21:21.464Z',
    updatedAt: '2025-07-13T18:21:21.568Z',
    __v: 1,
  },
  {
    _id: '6873ff91d0fc810ebda8c84f',
    name: 'user',
    permissions: [
      {
        _id: '6873f9200e7988c7b8e63f75',
        name: 'order:view',
        description: '',
        createdAt: '2025-07-13T18:21:20.540Z',
        updatedAt: '2025-07-13T18:21:20.540Z',
        __v: 0,
      },
      {
        _id: '6873f9200e7988c7b8e63f81',
        name: 'product:view',
        description: '',
        createdAt: '2025-07-13T18:21:20.724Z',
        updatedAt: '2025-07-13T18:21:20.724Z',
        __v: 0,
      },
    ],
    createdAt: '2025-07-13T18:48:49.361Z',
    updatedAt: '2025-07-20T10:13:14.976Z',
    __v: 2,
  },
  {
    _id: '6873ffd8d0fc810ebda8c851',
    name: 'manager',
    permissions: [],
    createdAt: '2025-07-13T18:50:00.113Z',
    updatedAt: '2025-07-13T18:50:00.113Z',
    __v: 0,
  },
];

// All available permissions
const allPermissions: Permission[] = [
  {
    _id: '6873f9200e7988c7b8e63f72',
    name: 'order:create',
    description: 'Create new orders',
    createdAt: '2025-07-13T18:21:20.489Z',
    updatedAt: '2025-07-13T18:21:20.489Z',
    __v: 0,
  },
  {
    _id: '6873f9200e7988c7b8e63f7b',
    name: 'order:delete',
    description: 'Delete orders',
    createdAt: '2025-07-13T18:21:20.634Z',
    updatedAt: '2025-07-13T18:21:20.634Z',
    __v: 0,
  },
  {
    _id: '6873f9200e7988c7b8e63f78',
    name: 'order:edit',
    description: 'Edit existing orders',
    createdAt: '2025-07-13T18:21:20.588Z',
    updatedAt: '2025-07-13T18:21:20.588Z',
    __v: 0,
  },
  {
    _id: '6873f9200e7988c7b8e63f75',
    name: 'order:view',
    description: 'View orders',
    createdAt: '2025-07-13T18:21:20.540Z',
    updatedAt: '2025-07-13T18:21:20.540Z',
    __v: 0,
  },
  {
    _id: '6873f9200e7988c7b8e63f81',
    name: 'product:view',
    description: 'View products',
    createdAt: '2025-07-13T18:21:20.724Z',
    updatedAt: '2025-07-13T18:21:20.724Z',
    __v: 0,
  },
  {
    _id: '6873f9200e7988c7b8e63f7e',
    name: 'product:create',
    description: 'Create new products',
    createdAt: '2025-07-13T18:21:20.679Z',
    updatedAt: '2025-07-13T18:21:20.679Z',
    __v: 0,
  },
  {
    _id: '6873f9200e7988c7b8e63f84',
    name: 'product:edit',
    description: 'Edit existing products',
    createdAt: '2025-07-13T18:21:20.772Z',
    updatedAt: '2025-07-13T18:21:20.772Z',
    __v: 0,
  },
  {
    _id: '6873f9200e7988c7b8e63f87',
    name: 'product:delete',
    description: 'Delete products',
    createdAt: '2025-07-13T18:21:20.818Z',
    updatedAt: '2025-07-13T18:21:20.818Z',
    __v: 0,
  },
  {
    _id: '6873f91f0e7988c7b8e63f4b',
    name: 'user:view',
    description: 'View users',
    createdAt: '2025-07-13T18:21:19.943Z',
    updatedAt: '2025-07-13T18:21:19.943Z',
    __v: 0,
  },
  {
    _id: '6873f91f0e7988c7b8e63f46',
    name: 'user:create',
    description: 'Create new users',
    createdAt: '2025-07-13T18:21:19.890Z',
    updatedAt: '2025-07-13T18:21:19.890Z',
    __v: 0,
  },
  {
    _id: '6873f91f0e7988c7b8e63f4f',
    name: 'user:edit',
    description: 'Edit existing users',
    createdAt: '2025-07-13T18:21:19.997Z',
    updatedAt: '2025-07-13T18:21:19.997Z',
    __v: 0,
  },
  {
    _id: '6873f9200e7988c7b8e63f53',
    name: 'user:delete',
    description: 'Delete users',
    createdAt: '2025-07-13T18:21:20.059Z',
    updatedAt: '2025-07-13T18:21:20.059Z',
    __v: 0,
  },
];

export default function PermissionsManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [permissions, setPermissions] = useState<Permission[]>(allPermissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreatePermissionDialogOpen, setIsCreatePermissionDialogOpen] =
    useState(false);

  // Filter roles based on search term
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.permissions.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Get permission color based on action
  const getPermissionColor = (permissionName: string) => {
    if (permissionName.includes(':view')) return 'bg-blue-100 text-blue-800';
    if (permissionName.includes(':create'))
      return 'bg-green-100 text-green-800';
    if (permissionName.includes(':edit'))
      return 'bg-yellow-100 text-yellow-800';
    if (permissionName.includes(':delete')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Assign permissions to role
  const handleAssignPermissions = (
    roleId: string,
    selectedPermissionIds: string[]
  ) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role._id === roleId) {
          const newPermissions = selectedPermissionIds.map(
            (id) => permissions.find((p) => p._id === id)!
          );
          return { ...role, permissions: newPermissions };
        }
        return role;
      })
    );
    setIsAssignDialogOpen(false);
    setSelectedRole(null);
  };

  // Remove permission from role
  const handleRemovePermission = (roleId: string, permissionId: string) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role._id === roleId) {
          return {
            ...role,
            permissions: role.permissions.filter((p) => p._id !== permissionId),
          };
        }
        return role;
      })
    );
  };

  // Edit permission
  const handleEditPermission = (updatedPermission: Permission) => {
    setPermissions((prevPermissions) =>
      prevPermissions.map((p) =>
        p._id === updatedPermission._id ? updatedPermission : p
      )
    );

    // Update permission in roles as well
    setRoles((prevRoles) =>
      prevRoles.map((role) => ({
        ...role,
        permissions: role.permissions.map((p) =>
          p._id === updatedPermission._id ? updatedPermission : p
        ),
      }))
    );

    setIsEditDialogOpen(false);
    setEditingPermission(null);
  };

  // Delete permission entirely
  const handleDeletePermission = (permissionId: string) => {
    setPermissions((prevPermissions) =>
      prevPermissions.filter((p) => p._id !== permissionId)
    );

    // Remove permission from all roles
    setRoles((prevRoles) =>
      prevRoles.map((role) => ({
        ...role,
        permissions: role.permissions.filter((p) => p._id !== permissionId),
      }))
    );
  };

  // Create new permission
  const handleCreatePermission = (
    newPermission: Omit<Permission, '_id' | 'createdAt' | 'updatedAt' | '__v'>
  ) => {
    const permission: Permission = {
      ...newPermission,
      _id: `new_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    setPermissions((prev) => [...prev, permission]);
    setIsCreatePermissionDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permissions Management</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for your application
          </p>
        </div>
        <Button onClick={() => setIsCreatePermissionDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Permission
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
            {filteredRoles.map((role) => (
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
                    <Button
                      onClick={() => {
                        setSelectedRole(role);
                        setIsAssignDialogOpen(true);
                      }}
                      variant="outline"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Permissions
                    </Button>
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove Permission
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "
                                  {permission.name}" from the "{role.name}"
                                  role?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRemovePermission(
                                      role._id,
                                      permission._id
                                    )
                                  }
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                  {permissions.map((permission) => (
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Permission
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {permission.name}"? This will remove it from
                                  all roles.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeletePermission(permission._id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Assign Permissions Dialog */}
      <AssignPermissionsDialog
        isOpen={isAssignDialogOpen}
        onClose={() => {
          setIsAssignDialogOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
        allPermissions={permissions}
        onAssign={handleAssignPermissions}
      />

      {/* Edit Permission Dialog */}
      <EditPermissionDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingPermission(null);
        }}
        permission={editingPermission}
        onSave={handleEditPermission}
      />

      {/* Create Permission Dialog */}
      <CreatePermissionDialog
        isOpen={isCreatePermissionDialogOpen}
        onClose={() => setIsCreatePermissionDialogOpen(false)}
        onCreate={handleCreatePermission}
      />
    </div>
  );
}

// Assign Permissions Dialog Component
function AssignPermissionsDialog({
  isOpen,
  onClose,
  role,
  allPermissions,
  onAssign,
}: {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  allPermissions: Permission[];
  onAssign: (roleId: string, permissionIds: string[]) => void;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Initialize selected permissions when dialog opens
  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions.map((p) => p._id));
    }
  }, [role]);

  const handleSubmit = () => {
    if (role) {
      onAssign(role._id, selectedPermissions);
    }
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions for "{role.name}"</DialogTitle>
          <DialogDescription>
            Select the permissions you want to assign to this role.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-4">
          {allPermissions.map((permission) => (
            <div key={permission._id} className="flex items-center space-x-2">
              <Checkbox
                id={permission._id}
                checked={selectedPermissions.includes(permission._id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPermissions((prev) => [...prev, permission._id]);
                  } else {
                    setSelectedPermissions((prev) =>
                      prev.filter((id) => id !== permission._id)
                    );
                  }
                }}
              />
              <div className="flex-1">
                <Label
                  htmlFor={permission._id}
                  className="flex items-center gap-2"
                >
                  <Badge
                    className={`${getPermissionColor(
                      permission.name
                    )} cursor-pointer`}
                  >
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

// Edit Permission Dialog Component
function EditPermissionDialog({
  isOpen,
  onClose,
  permission,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSave: (permission: Permission) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Initialize form when permission changes
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

// Create Permission Dialog Component
function CreatePermissionDialog({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    permission: Omit<Permission, '_id' | 'createdAt' | 'updatedAt' | '__v'>
  ) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate({
        name: name.trim(),
        description: description.trim(),
      });
      setName('');
      setDescription('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Permission</DialogTitle>
          <DialogDescription>
            Add a new permission to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-permission-name">Permission Name</Label>
            <Input
              id="new-permission-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., user:create"
            />
          </div>
          <div>
            <Label htmlFor="new-permission-description">Description</Label>
            <Textarea
              id="new-permission-description"
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
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Create Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function for permission colors (moved outside component to avoid recreation)
function getPermissionColor(permissionName: string) {
  if (permissionName.includes(':view')) return 'bg-blue-100 text-blue-800';
  if (permissionName.includes(':create')) return 'bg-green-100 text-green-800';
  if (permissionName.includes(':edit')) return 'bg-yellow-100 text-yellow-800';
  if (permissionName.includes(':delete')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

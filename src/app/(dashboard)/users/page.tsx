'use client';

import UserPageAdd from '@/components/add-user-page';
import UserPageEdit from '@/components/edit-user-page';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axiosInstance from '@/lib/axiosInstance';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  Crown,
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  address: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
}

type PageView = 'list' | 'add' | 'edit';
type StatusFilter = 'all' | 'active' | 'inactive';
type RoleFilter = 'all' | 'admin' | 'manager' | 'user';

export default function UsersListPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<PageView>('list');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<UserData[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/users/all-user');
      return response.data.users;
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || user.status === statusFilter;

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const userStats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
      admins: users.filter((u) => u.role === 'admin').length,
    }),
    [users]
  );

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      await axiosInstance.delete(`/api/users/delete-user/${deleteUser._id}`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleteUser(null);
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setCurrentPage('edit');
  };

  const handleAddUser = () => {
    setCurrentPage('add');
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState queryClient={queryClient} />;
  if (currentPage === 'add')
    return <AddUserPage onBack={() => setCurrentPage('list')} />;
  if (currentPage === 'edit' && editingUser) {
    return (
      <EditUserPage user={editingUser} onBack={() => setCurrentPage('list')} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderSection onAddUser={handleAddUser} />

        <StatsSection stats={userStats} />

        <FilterSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
        />

        <UsersTable
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={setDeleteUser}
          onCopy={copyToClipboard}
          getInitials={getInitials}
        />

        <DeleteConfirmationDialog
          user={deleteUser}
          onCancel={() => setDeleteUser(null)}
          onConfirm={handleDeleteUser}
        />
      </div>
    </div>
  );
}

// Extracted Components

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    </div>
  );
}

function ErrorState({ queryClient }: { queryClient: any }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Users
        </h2>
        <p className="text-gray-600 mb-4">
          There was a problem loading the user data.
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

function HeaderSection({ onAddUser }: { onAddUser: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Users className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>
      <Button onClick={onAddUser} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        Add New User
      </Button>
    </div>
  );
}

function StatsSection({
  stats,
}: {
  stats: { total: number; active: number; inactive: number; admins: number };
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={<Users className="h-6 w-6 text-blue-600" />}
        label="Total Users"
        value={stats.total}
        bgColor="bg-blue-100"
      />
      <StatCard
        icon={<UserCheck className="h-6 w-6 text-green-600" />}
        label="Active"
        value={stats.active}
        bgColor="bg-green-100"
      />
      <StatCard
        icon={<UserX className="h-6 w-6 text-red-600" />}
        label="Inactive"
        value={stats.inactive}
        bgColor="bg-red-100"
      />
      <StatCard
        icon={<Crown className="h-6 w-6 text-purple-600" />}
        label="Admins"
        value={stats.admins}
        bgColor="bg-purple-100"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${bgColor}`}>{icon}</div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSection({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  roleFilter: RoleFilter;
  onRoleChange: (value: RoleFilter) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name, email, or username..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Select value={roleFilter} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function UsersTable({
  users,
  onEdit,
  onDelete,
  onCopy,
  getInitials,
}: {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onCopy: (text: string, label: string) => void;
  getInitials: (name: string) => string;
}) {
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'active':
        return {
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case 'inactive':
        return {
          className: 'bg-red-100 text-red-800 hover:bg-red-200',
          icon: <XCircle className="h-4 w-4" />,
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          icon: null,
        };
    }
  };

  const getRoleBadgeProps = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
          icon: <Crown className="h-4 w-4" />,
        };
      case 'manager':
        return {
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          icon: <Shield className="h-4 w-4" />,
        };
      case 'user':
        return {
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          icon: <User className="h-4 w-4" />,
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          icon: <User className="h-4 w-4" />,
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users ({users.length})</CardTitle>
        <CardDescription>
          Manage user accounts, view details, and perform actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const statusProps = getStatusBadgeProps(user.status);
                const roleProps = getRoleBadgeProps(user.role);

                return (
                  <TableRow key={user._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.profileImage || '/placeholder.svg'}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-2 text-gray-400" />
                          <span className="truncate max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleProps.className}>
                        {roleProps.icon}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusProps.className}>
                        {statusProps.icon}
                        <span className="ml-1 capitalize">{user.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <span className="text-sm text-gray-600">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onCopy(user.email, 'Email')}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Copy Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onCopy(user.phone, 'Phone')}
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            Copy Phone
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onDelete(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {users.length === 0 && <EmptyState />}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
      <p className="text-gray-500 mb-4">
        Try adjusting your search or filter criteria
      </p>
    </div>
  );
}

function DeleteConfirmationDialog({
  user,
  onCancel,
  onConfirm,
}: {
  user: UserData | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!user} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{user?.name}"? This action cannot
            be undone. All user data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AddUserPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack} className="mb-6">
          ← Back to Users
        </Button>
        <UserPageAdd />
      </div>
    </div>
  );
}

function EditUserPage({
  user,
  onBack,
}: {
  user: UserData;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();

  const handleUserUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <UserPageEdit
          user={user as any}
          onBack={onBack}
          onUserUpdated={handleUserUpdated}
        />
      </div>
    </div>
  );
}

'use client';

import StorePageAdd from '@/components/add-store-page';
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
import { useStoresData } from '@/hooks/useStoreData';
import axiosInstance from '@/lib/axiosInstance';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  Clock,
  Copy,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Store,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface Store {
  _id: string;
  storeId: string;
  storeName: string;
  storeEmail: string;
  storeImage?: string;
  storeStatus: 'active' | 'inactive' | 'suspended' | 'pending';
  storeClientId: string;
  // Add other store properties as needed
}

export default function StoresListPage() {
  const { data: stores = [], isLoading, isError } = useStoresData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteStoreId, setDeleteStoreId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<'list' | 'add'>('list');

  const queryClient = useQueryClient();

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.storeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.storeId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || store.storeStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stores, searchTerm, statusFilter]);

  const handleDeleteStore = (storeId: string) => {
    setDeleteStoreId(storeId);
  };

  const confirmDelete = async () => {
    if (!deleteStoreId) return;

    try {
      await axiosInstance.delete(`/api/stores/store-delete/${deleteStoreId}`);
      toast.success('Store deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    } catch (error) {
      toast.error('Failed to delete store');
      console.error('Delete store error:', error);
    } finally {
      setDeleteStoreId('');
    }
  };

  const handleAddStore = () => {
    setCurrentPage('add');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'active':
        return {
          className: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        };
      case 'inactive':
        return {
          className: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-4 w-4 text-red-600" />,
        };
      case 'pending':
        return {
          className: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800',
          icon: null,
        };
    }
  };

  const stats = useMemo(
    () => [
      {
        label: 'Total Stores',
        value: stores.length,
        icon: <Store className="h-6 w-6 text-blue-600" />,
        bg: 'bg-blue-100',
      },
      {
        label: 'Active',
        value: stores.filter((s) => s.storeStatus === 'active').length,
        icon: <CheckCircle className="h-6 w-6 text-green-600" />,
        bg: 'bg-green-100',
      },
      {
        label: 'Inactive',
        value: stores.filter((s) => s.storeStatus === 'inactive').length,
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        bg: 'bg-red-100',
      },
    ],
    [stores]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState />;
  }

  if (currentPage === 'add') {
    return <AddStorePage onBack={() => setCurrentPage('list')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderSection onAddStore={handleAddStore} />

        <StatsSection stats={stats} />

        <FilterSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <StoresTable
          stores={filteredStores}
          onCopy={copyToClipboard}
          onDelete={handleDeleteStore}
          getInitials={getInitials}
          getStatusBadgeProps={getStatusBadgeProps}
        />

        <DeleteConfirmationDialog
          isOpen={!!deleteStoreId}
          onCancel={() => setDeleteStoreId('')}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}

// Extracted Components

function LoadingState() {
  return (
    <div className="p-10 text-center text-gray-600">Loading stores...</div>
  );
}

function ErrorState() {
  return (
    <div className="p-10 text-center text-red-600">Failed to load stores.</div>
  );
}

function HeaderSection({ onAddStore }: { onAddStore: () => void }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Store className="h-10 w-10 text-blue-600" />
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Stores Management
          </h1>
          <p className="text-gray-600">
            Manage all your stores and their configurations
          </p>
        </div>
      </div>
      <Button
        onClick={onAddStore}
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2 rounded-md shadow-md transition"
      >
        <Plus className="h-5 w-5" />
        Add New Store
      </Button>
    </div>
  );
}

function StatsSection({
  stats,
}: {
  stats: Array<{
    label: string;
    value: number;
    icon: React.ReactNode;
    bg: string;
  }>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
      {stats.map(({ label, value, icon, bg }) => (
        <Card key={label} className="shadow-sm rounded-lg">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-md ${bg}`}>{icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FilterSection({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1 max-w-lg">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search stores by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-lg"
          autoComplete="off"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function StoresTable({
  stores,
  onCopy,
  onDelete,
  getInitials,
  getStatusBadgeProps,
}: {
  stores: Store[];
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  getInitials: (name: string) => string;
  getStatusBadgeProps: (status: string) => {
    className: string;
    icon: React.ReactNode;
  };
}) {
  return (
    <Card className="shadow-none rounded-lg border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-xl font-semibold">
          All Stores ({stores.length})
        </CardTitle>
        <CardDescription>
          Manage your stores, view details, and perform actions
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Store ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => {
              const statusProps = getStatusBadgeProps(store.storeStatus);

              return (
                <TableRow key={store.storeId}>
                  <TableCell className="flex items-center gap-4 py-3 px-6">
                    <Avatar className="h-10 w-10 ring-1 ring-gray-300">
                      <AvatarImage
                        src={store.storeImage || '/placeholder.svg'}
                      />
                      <AvatarFallback>
                        {getInitials(store.storeName)}
                      </AvatarFallback>
                    </Avatar>
                    {store.storeName}
                  </TableCell>
                  <TableCell className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {store.storeId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(store.storeId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-6">
                    {store.storeEmail}
                  </TableCell>
                  <TableCell className="py-3 px-6">
                    <Badge
                      className={`inline-flex items-center gap-1 px-3 py-1 text-sm ${statusProps.className}`}
                    >
                      {statusProps.icon}
                      <span className="capitalize ml-1">
                        {store.storeStatus}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 rounded-full"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onCopy(store.storeClientId)}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Client ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(store._id)}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Store
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {stores.length === 0 && <EmptyState />}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <Store className="mx-auto h-14 w-14 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No stores found
      </h3>
      <p className="text-gray-600 mb-6">
        Get started by creating your first store
      </p>
      <Button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
        <Plus className="h-5 w-5" />
        Add Your First Store
      </Button>
    </div>
  );
}

function DeleteConfirmationDialog({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-md rounded-lg shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Store</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this store? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete Store
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AddStorePage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack} className="mb-6">
          ← Back to Stores
        </Button>
        <StorePageAdd />
      </div>
    </div>
  );
}

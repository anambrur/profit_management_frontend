'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import axiosInstance from '@/lib/axiosInstance';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpDown,
  BadgeX,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CornerDownLeft,
  CreditCard,
  DollarSign,
  Edit2,
  Hash,
  HelpCircle,
  Mail,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Save,
  StoreIcon,
  Trash,
  TrendingDown,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import type React from 'react';
import { JSX, useEffect, useRef, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { HiOutlineBadgeCheck } from 'react-icons/hi';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import AddProductHistory from './ProductAdd';

// Types
export interface ProductHistory {
  _id: string;
  productId: string;
  orderId: string;
  storeID: string;
  purchaseQuantity: number;
  receiveQuantity: number;
  lostQuantity: number;
  sendToWFS: number;
  Remaining: number;
  status: string;
  costOfPrice: string;
  sellPrice: string;
  email: string;
  card: string;
  supplier: {
    _id: string;
    name: string;
    link: string;
  };
  totalPrice: string;
  date: string;
  __v: number;
  product: Product;
  store: Store;
}

export interface Product {
  _id: string;
  mart: string;
  sku: string;
  condition: string;
  availability: string;
  wpid: string;
  upc: string;
  gtin: string;
  productName: string;
  productType: string;
  onHand: number;
  available: number;
  publishedStatus: string;
  lifecycleStatus: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  _id: string;
  storeId: string;
  storeName: string;
  storeEmail: string;
  storeClientId: string;
  storeClientSecret: string;
  storeStatus: 'active' | 'inactive' | 'suspended';
  storeImage: string;
  storeImagePublicId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductsTableProps {
  products: ProductHistory[];
  isLoading: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { formattedDate, time };
};

// Edit Popover Component
interface EditPopoverProps {
  value: string | number | Object;
  onSave: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'date';
  label: string;
  icon?: React.ReactNode;
}
type EditPopoverSupplierProps = {
  supplierName: string;
  supplierLink: string;
  onSave: (data: { supplierName: string; supplierLink: string }) => void;
  label?: string;
  icon?: React.ReactNode;
};

function EditPopover({
  value,
  onSave,
  type = 'text',
  label,
  icon,
}: EditPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ''));
  const handleSave = () => {
    onSave(editValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditValue(String(value || ''));
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {icon}
            <Label className="text-sm font-medium">{label}</Label>
          </div>
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-9"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              onClick={handleSave}
              className="h-8"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EditPopoverSelect({
  value,
  onSave,
  type = 'text',
  label,
  icon,
}: EditPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ''));
  const handleSave = () => {
    onSave(editValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditValue(String(value || ''));
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {icon}
            <Label className="text-sm font-medium">{label}</Label>
          </div>
          <Select onValueChange={setEditValue} defaultValue={editValue}>
            <SelectTrigger className="h-9 w-72 shadow-none">
              <SelectValue placeholder="" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="return-label-done">Return Label</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="return-request-sent">
                Return Request Sent
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              onClick={handleSave}
              className="h-8"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EditPopoverSupplier({
  supplierName,
  supplierLink,
  onSave,
  label = 'Supplier',
  icon,
}: EditPopoverSupplierProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(supplierName);
  const [link, setLink] = useState(supplierLink);

  const handleSave = () => {
    onSave({ supplierName: name, supplierLink: link });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setName(supplierName);
    setLink(supplierLink);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {icon}
            <Label className="text-sm font-medium">{label} Info</Label>
          </div>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Supplier Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label className="text-xs">Supplier Link</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Enter supplier link"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              onClick={handleSave}
              className="h-8"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Pagination Component
interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function PaginationControls({
  pagination,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const { page, totalPages, total, limit } = pagination;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-muted/20">
      {/* Results Info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div>
          Showing {startItem} to {endItem} of {total} results
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="limit-select" className="text-sm">
            Show:
          </Label>
          <Select
            value={limit.toString()}
            onValueChange={(value) => onLimitChange(Number.parseInt(value))}
          >
            <SelectTrigger id="limit-select" className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((pageNum, index) => (
            <div key={index}>
              {pageNum === '...' ? (
                <span className="px-2 py-1 text-sm text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Replace the axios import and replace the updateSingleField function with:
const updateSingleField = async (id: string, field: string, value: string) => {
  console.log('id', id);
  console.log('Field', field);
  console.log('Value', value);
  const res = await axiosInstance.patch(`/api/product-history/${id}/update`, {
    field,
    value,
  });
  return res.data;
};
const deleteProduct = async (id: string) => {
  const res = await axiosInstance.delete(
    `/api/product-history/delete-product-history/${id}`
  );
  return res.data;
};

export function ProductHistoryTable({
  products,
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
}: ProductsTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [spacePressed, setSpacePressed] = useState(false);
  const [editingData, setEditingData] = useState<Record<string, any>>({});
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: string;
      value: string;
    }) => {
      await updateSingleField(id, field, value);
      return { id, field, value };
    },
    onSuccess: (data) => {
      console.log('Field updated successfully:', data);
      client.invalidateQueries({ queryKey: ['productsHistory'] });
    },
    onError: (error) => {
      console.error('Error updating field:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteProduct(id);
      return { id };
    },
    onSuccess: (data) => {
      console.log('Product deleted successfully:', data);
      client.invalidateQueries({ queryKey: ['productsHistory'] });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });

  const handleFieldUpdate = (
    productId: string,
    field: string,
    value: string
  ) => {
    setEditingData((prev) => ({
      ...prev,
      [`${productId}-${field}`]: value,
    }));
    mutation.mutate({
      id: productId,
      field,
      value,
    });
  };

  const getStatusInfo = (status: string) => {
    const map: Record<
      string,
      {
        label: string;
        color: string;
        icon: JSX.Element;
      }
    > = {
      'in-transit': {
        label: 'In Transit',
        color: 'bg-primary text-primary-foreground capitalize',
        icon: <Truck className="w-4 h-4" />,
      },
      delivered: {
        label: 'Delivered',
        color: 'bg-secondary text-secondary-foreground',
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      'return-label-done': {
        label: 'Return Label Done',
        color: 'bg-destructive text-destructive-foreground',
        icon: <RotateCcw className="w-4 h-4" />,
      },
      refunded: {
        label: 'Refunded',
        color: 'bg-destructive text-destructive-foreground',
        icon: <CornerDownLeft className="w-4 h-4" />,
      },
      'return-request-sent': {
        label: 'Return Requested Sent',
        color: 'bg-destructive text-destructive-foreground',
        icon: <BadgeX className="w-4 h-4" />,
      },
    };

    return (
      map[status] || {
        label: status,
        color: 'bg-muted text-muted-foreground',
        icon: <HelpCircle className="w-4 h-4" />,
      }
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-4 border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg">
                <Skeleton className="h-5 w-5" />
              </div>
              <div>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-100 to-gray-100 border-b-2">
                  {[
                    'Product',
                    'Order ID',
                    'Supplier',
                    'UPC',
                    'Card',
                    'Purchase',
                    'Received',
                    'Lost',
                    'Sent to WFS',
                    'Remaining',
                    'Cost Price',
                    'Sell Price',
                    'Total Cost',
                    'WFS Cost',
                    'Remaining Price',
                    'Email',
                    'Status',
                    'Date & Time',
                    'Actions',
                  ].map((title, index) => (
                    <TableHead
                      key={index}
                      className="font-semibold text-slate-700 py-4"
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100">
                    {Array.from({ length: 18 }).map((_, j) => (
                      <TableCell key={j} className="py-6">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        </CardContent>
      </Card>
    );
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!spacePressed) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current!.offsetLeft);
    setScrollLeft(scrollRef.current!.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const x = e.pageX - scrollRef.current!.offsetLeft;
    const walk = x - startX;
    scrollRef.current!.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  return (
    <Card className="w-full border-0 overflow-hidden">
      <CardContent className="p-0">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100',
            spacePressed ? 'cursor-grab' : 'cursor-default',
            isDragging && 'cursor-grabbing'
          )}
          style={{ userSelect: isDragging ? 'none' : 'auto' }}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 hover:from-slate-150 hover:to-gray-150">
                <TableHead className="font-semibold min-w-[220px] text-slate-700 py-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Product
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[180px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-green-600" />
                    Order ID
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[160px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="h-4 w-4 text-purple-600" />
                    Supplier
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[120px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-orange-600" />
                    UPC
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[140px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-indigo-600" />
                    Card
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[100px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Purchase
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[100px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Received
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[100px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Lost
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[120px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-cyan-600" />
                    Sent to WFS
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[100px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-slate-600" />
                    Remaining
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[130px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Cost Price
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[130px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    Sell Price
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[130px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    Total Cost
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[140px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    WFS Cost
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[140px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-teal-600" />
                    Remaining Price
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[200px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-pink-600" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[200px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <HiOutlineBadgeCheck className="h-4 w-4 text-blue-600" />
                    Status
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[160px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    Date & Time
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[80px] text-slate-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: ProductHistory, index) => {
                const { formattedDate } = formatDate(product.date);
                const isHovered = hoveredRow === product._id;
                const remaining = product.receiveQuantity - product.sendToWFS;
                const totalCost =
                  product.purchaseQuantity * Number(product.costOfPrice);
                const wfsCost = product.sendToWFS * Number(product.costOfPrice);
                const remainingPrice = totalCost - wfsCost;

                return (
                  <TableRow
                    key={product._id}
                    className={cn(
                      'group transition-all duration-200 border-b border-slate-100',
                      isHovered
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm'
                        : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50',
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    )}
                    onMouseEnter={() => setHoveredRow(product._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Product */}
                    <TableCell className="py-6">
                      <div className="space-y-2">
                        {product.store?.storeName && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                          >
                            {product.store.storeName}
                          </Badge>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-semibold text-sm text-slate-800 truncate max-w-[200px] cursor-help leading-relaxed">
                                {product.product?.productName ||
                                  'Unnamed Product'}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs bg-slate-800 text-white"
                            >
                              <p className="text-sm">
                                {product.product?.productName ||
                                  'Unnamed Product'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>

                    {/* Order ID */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/orderId">
                        <Badge
                          variant={product.orderId ? 'outline' : 'secondary'}
                          className={cn(
                            'truncate max-w-[140px] text-sm font-medium transition-colors',
                            product.orderId
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {product.orderId || 'N/A'}
                        </Badge>
                        <EditPopover
                          value={product.orderId}
                          onSave={(value: string) =>
                            handleFieldUpdate(product._id, 'orderId', value)
                          }
                          label="Order ID"
                        />
                      </div>
                    </TableCell>

                    {/* Supplier */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/supplier">
                        <Badge
                          variant={
                            product.supplier?.name ? 'outline' : 'secondary'
                          }
                          className={cn(
                            'truncate max-w-[120px] text-sm font-medium transition-colors',
                            product.supplier?.name
                              ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {product.supplier?.name || 'No Supplier'}
                        </Badge>
                        <EditPopoverSupplier
                          supplierName={product.supplier?.name || 'No Supplier'}
                          supplierLink={product.supplier?.link || ''}
                          onSave={(data: any) =>
                            handleFieldUpdate(
                              product._id,
                              'supplier',
                              JSON.stringify(data)
                            )
                          }
                          label="Supplier"
                          icon={<StoreIcon className="w-4 h-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="py-6">
                      <code className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md font-mono border">
                        {product.product?.sku || 'N/A'}
                      </code>
                    </TableCell>

                    {/* Card */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/card">
                        <Badge
                          variant={product.card ? 'outline' : 'secondary'}
                          className={cn(
                            'truncate max-w-[100px] transition-colors',
                            product.card
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          {product.card || 'No Card'}
                        </Badge>
                        <EditPopover
                          value={product.card}
                          onSave={(value: string) =>
                            handleFieldUpdate(product._id, 'card', value)
                          }
                          label="Card"
                          icon={<CreditCard className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* Purchase Quantity */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/quantity">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                          {product.purchaseQuantity}
                        </span>
                        <EditPopover
                          value={product.purchaseQuantity}
                          onSave={(value: string) =>
                            handleFieldUpdate(
                              product._id,
                              'purchaseQuantity',
                              value
                            )
                          }
                          type="number"
                          label="Purchase Quantity"
                          icon={<Hash className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* Received */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/received">
                        <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md">
                          {Number(product.receiveQuantity) || 0}
                        </span>
                        <EditPopover
                          value={product.receiveQuantity}
                          onSave={(value: string) =>
                            handleFieldUpdate(
                              product._id,
                              'receiveQuantity',
                              value
                            )
                          }
                          type="number"
                          label="Received Quantity"
                          icon={<Hash className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* Lost */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/lost">
                        <span
                          className={cn(
                            'font-semibold px-2 py-1 rounded-md',
                            Number(product.lostQuantity) > 0
                              ? 'text-red-700 bg-red-50'
                              : 'text-gray-600 bg-gray-50'
                          )}
                        >
                          {Number(product.lostQuantity) || 0}
                        </span>
                        <EditPopover
                          value={product.lostQuantity}
                          onSave={(value: string) =>
                            handleFieldUpdate(
                              product._id,
                              'lostQuantity',
                              value
                            )
                          }
                          type="number"
                          label="Lost Quantity"
                          icon={<Hash className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* Sent to WFS */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/wfs">
                        <span className="font-semibold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md">
                          {Number(product.sendToWFS) || 0}
                        </span>
                        <EditPopover
                          value={product.sendToWFS}
                          onSave={(value: string) =>
                            handleFieldUpdate(product._id, 'sendToWFS', value)
                          }
                          type="number"
                          label="Sent to WFS"
                          icon={<Hash className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* Remaining */}
                    <TableCell className="py-6">
                      <span
                        className={cn(
                          'font-semibold px-2 py-1 rounded-md',
                          remaining > 0
                            ? 'text-emerald-700 bg-emerald-50'
                            : remaining < 0
                            ? 'text-red-700 bg-red-50'
                            : 'text-gray-600 bg-gray-50'
                        )}
                      >
                        {remaining}
                      </span>
                    </TableCell>

                    {/* Cost Price */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/cost">
                        <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md">
                          ${Math.ceil(Number(product.costOfPrice)) || 0}
                        </span>
                        <EditPopover
                          value={product.costOfPrice}
                          onSave={(value: string) =>
                            handleFieldUpdate(product._id, 'costOfPrice', value)
                          }
                          type="number"
                          label="Cost Price"
                          icon={<DollarSign className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* Sell Price */}
                    <TableCell className="py-6">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                        ${Math.ceil(Number(product.sellPrice)) || 0}
                      </span>
                    </TableCell>

                    {/* Total Cost */}
                    <TableCell className="py-6">
                      <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
                        ${totalCost.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* WFS Cost */}
                    <TableCell className="py-6">
                      <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-md">
                        ${wfsCost.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Remaining Price */}
                    <TableCell className="py-6">
                      <span
                        className={cn(
                          'font-semibold px-2 py-1 rounded-md',
                          remainingPrice > 0
                            ? 'text-teal-700 bg-teal-50'
                            : 'text-gray-600 bg-gray-50'
                        )}
                      >
                        ${remainingPrice.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/email">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm text-slate-600 truncate max-w-[160px] cursor-help bg-slate-50 px-2 py-1 rounded-md">
                                {product.email || 'No Email'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="bg-slate-800 text-white"
                            >
                              <p className="text-sm">
                                {product.email || 'No Email'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <EditPopover
                          value={product.email}
                          onSave={(value: string) =>
                            handleFieldUpdate(product._id, 'email', value)
                          }
                          type="email"
                          label="Email"
                          icon={<Mail className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/email">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* Get status info for color + icon */}
                              {(() => {
                                const statusInfo = getStatusInfo(
                                  product.status || 'no-status'
                                );

                                return (
                                  <span
                                    className={`text-sm truncate max-w-[160px] px-2 py-1 rounded-md flex items-center gap-1 ${statusInfo.color}`}
                                    title={product.status}
                                  >
                                    {statusInfo.icon}
                                    {statusInfo.label}
                                  </span>
                                );
                              })()}
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="bg-slate-800 text-white"
                            >
                              <p className="text-sm">
                                {product.email || 'No Email'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <EditPopoverSelect
                          value={product.status}
                          onSave={(value: string) =>
                            handleFieldUpdate(product._id, 'status', value)
                          }
                          type="text"
                          label="Status"
                          icon={<HiOutlineBadgeCheck className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>
                    {/* Date */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2 group/date">
                        <div className="text-sm bg-amber-50 px-2 py-1 rounded-md">
                          <div className="font-semibold text-amber-800">
                            {formattedDate}
                          </div>
                        </div>
                        <EditPopover
                          value={product.date.split('T')[0]}
                          onSave={(value: string) =>
                            handleFieldUpdate(product._id, 'date', value)
                          }
                          type="date"
                          label="Date"
                          icon={<Calendar className="h-4 w-4" />}
                        />
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-6">
                      <div className="flex items-center gap-1">
                        <AddProductHistory
                          productId={product.product._id}
                          node={
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200 transition-colors bg-transparent"
                            >
                              <Plus className="h-4 w-4 text-blue-600" />
                            </Button>
                          }
                          storeId={product.store._id}
                        />
                        <Dialog>
                          <form>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 transition-colors bg-transparent"
                              >
                                <Trash className="h-4 w-4 text-red-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>
                                  Delete Product History
                                </DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this product
                                  history? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>

                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="submit">Cancel</Button>
                                </DialogClose>
                                <Button
                                  size={
                                    deleteMutation.isPending
                                      ? 'icon'
                                      : 'default'
                                  }
                                  onClick={() =>
                                    deleteMutation.mutate(product._id)
                                  }
                                  disabled={deleteMutation.isPending}
                                  variant="destructive"
                                >
                                  {deleteMutation.isPending ? (
                                    <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    'Delete'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </form>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      </CardContent>
    </Card>
  );
}

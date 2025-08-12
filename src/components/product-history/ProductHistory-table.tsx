'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import axiosInstance from '@/lib/axiosInstance';
import { cn, stringToColor } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CornerDownLeft,
  HelpCircle,
  PencilLine,
  RotateCcw,
  Trash,
  Truck,
} from 'lucide-react';
import type React from 'react';
import { JSX, useEffect, useRef, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
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
import EditProductHistoryDialog, {
  ProductHistoryEdit,
} from './EditProductHistory';

// Types
export interface ProductHistory {
  _id: string;
  productId: string;
  orderId: string;
  storeID: string;
  sku: string;
  upc: string;
  orderQuantity: number;
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
  store: Store;
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

const updateProductHistory = () => {
  throw new Error('Function not implemented.');
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
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const client = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ProductHistoryEdit;
    }) => {
      const res = await axiosInstance.put(
        `/api/product-history/update/${id}`,
        data
      );
      return res.data;
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
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
    <Card className="w-full overflow-hidden shadow-none">
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
                <TableHead className="font-semibold min-w-[180px] text-slate-700">
                  Store Name
                </TableHead>
                <TableHead className="font-semibold min-w-[180px] text-slate-700">
                  Order ID
                </TableHead>
                <TableHead className="font-semibold min-w-[160px] text-slate-700">
                  UPC/SKU
                </TableHead>
                <TableHead className="font-semibold min-w-[100px] text-slate-700">
                  Purchase
                </TableHead>
                <TableHead className="font-semibold min-w-[100px] text-slate-700">
                  Lost
                </TableHead>
                <TableHead className="font-semibold min-w-[120px] text-slate-700">
                  Sent to WFS
                </TableHead>
                <TableHead className="font-semibold min-w-[100px] text-slate-700">
                  Remaining
                </TableHead>
                <TableHead className="font-semibold min-w-[160px] text-slate-700">
                  Order Quantity
                </TableHead>
                <TableHead className="font-semibold min-w-[130px] text-slate-700">
                  Cost Price
                </TableHead>
                <TableHead className="font-semibold min-w-[130px] text-slate-700">
                  Sell Price
                </TableHead>
                <TableHead className="font-semibold min-w-[130px] text-slate-700">
                  Total Cost
                </TableHead>
                <TableHead className="font-semibold min-w-[140px] text-slate-700">
                  WFS Cost
                </TableHead>
                <TableHead className="font-semibold min-w-[140px] text-slate-700">
                  Remaining Price
                </TableHead>
                <TableHead className="font-semibold min-w-[160px] text-slate-700">
                  Supplier
                </TableHead>
                <TableHead className="font-semibold min-w-[140px] text-slate-700">
                  Card
                </TableHead>
                <TableHead className="font-semibold min-w-[200px] text-slate-700">
                  Email
                </TableHead>
                <TableHead className="font-semibold min-w-[200px] text-slate-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold min-w-[160px] text-slate-700">
                  Date & Time
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
                const remaining =
                  product.purchaseQuantity -
                  product.sendToWFS -
                  product.lostQuantity;
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
                    {/* STORE NAME */}
                    <TableCell className="py-2">
                      <Badge
                        className="text-white"
                        style={{
                          backgroundColor: stringToColor(
                            product.store.storeName
                          ),
                        }}
                      >
                        {product.store.storeName || 'N/A'}
                      </Badge>
                    </TableCell>

                    {/* Order ID */}
                    <TableCell className="py-2">
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
                      </div>
                    </TableCell>

                    {/* SKU/UPC */}
                    <TableCell className="py-2 flex flex-col items-start">
                      <span className="text-xs text-gray-500 font-medium">
                        SKU: {product.sku}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        UPC: {product.upc}
                      </span>
                    </TableCell>

                    {/* Purchase Quantity */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2 group/quantity">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                          {product.purchaseQuantity}
                        </span>
                      </div>
                    </TableCell>

                    {/* Lost */}
                    <TableCell className="py-2">
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
                      </div>
                    </TableCell>

                    {/* Sent to WFS */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2 group/wfs">
                        <span className="font-semibold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md">
                          {Number(product.sendToWFS) || 0}
                        </span>
                      </div>
                    </TableCell>

                    {/* Remaining Quantity */}
                    <TableCell className="py-2">
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

                    {/* ORDER QUANTITY */}
                    <TableCell className="py-2 text-center">
                      <span>
                        {product.orderQuantity ? product.orderQuantity : 0}
                      </span>
                    </TableCell>

                    {/* Cost Price */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2 group/cost">
                        <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md">
                          ${Number(product.costOfPrice) || 0}
                        </span>
                      </div>
                    </TableCell>

                    {/* Sell Price */}
                    <TableCell className="py-2">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                        ${Number(product.sellPrice) || 0}
                      </span>
                    </TableCell>

                    {/* Total Cost */}
                    <TableCell className="py-2">
                      <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
                        ${totalCost.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* WFS Cost */}
                    <TableCell className="py-2">
                      <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-md">
                        ${wfsCost.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Remaining Price */}
                    <TableCell className="py-2">
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

                    {/* Supplier */}
                    <TableCell className="py-2">
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
                      </div>
                    </TableCell>

                    {/* Card */}
                    <TableCell className="py-2">
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
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="py-2">
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
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2">
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
                                {product.status || 'No Status'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2 group/date">
                        <div className="text-sm bg-amber-50 px-2 py-1 rounded-md">
                          <div className="font-semibold text-amber-800">
                            {formattedDate}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        <EditProductHistoryDialog
                          product={{
                            storeId: product.storeID,
                            sku: product.sku,
                            upc: product.upc,
                            supplierName: product.supplier?.name || '',
                            supplierLink: product.supplier?.link || '',
                            orderId: product.orderId || '',
                            status: product.status || '',
                            card: product.card || '',
                            purchase: product.purchaseQuantity || 0,
                            lost: product.lostQuantity || 0,
                            sentToWfs: product.sendToWFS || 0,
                            costOfPrice: Number(product.costOfPrice) || 0,
                            sellPrice: Number(product.sellPrice) || 0,
                            email: product.email || '',
                            dateTime:
                              formattedDate ||
                              new Date().toISOString().split('T')[0],
                          }}
                          onSave={async (updatedData) => {
                            await updateMutation.mutateAsync({
                              id: product._id,
                              data: updatedData,
                            });
                          }}
                        >
                          <Button variant="outline" size="icon">
                            <PencilLine className="h-4 w-4 mr-2" />
                          </Button>
                        </EditProductHistoryDialog>
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

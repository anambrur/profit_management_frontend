'use client';
import { Badge } from '@/components/ui/badge';
import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
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
import { useOrders, usePrefetchOrders } from '@/hooks/userOrder';
import { useAllowedStores } from '@/store/useAuthStore';
import { format } from 'date-fns';
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { BiPurchaseTag } from 'react-icons/bi';
import { FaCirclePlus } from 'react-icons/fa6';
import { GiProfit } from 'react-icons/gi';
import { GrOptimize } from 'react-icons/gr';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
export interface OrderedProduct {
  _id: string;
  quantity: number;
  productName: string;
  imageUrl: string;
  productSKU: string;
  PurchasePrice: string;
  sellPrice: string;
  tax: string;
  shipping: string;
}

export interface Order {
  _id: string;
  storeId: string;
  storeName: string;
  shipNodeType: 'SellerFulfilled' | 'Other';
  customerOrderId: string;
  status: 'Acknowledged' | 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
  customerName: string;
  customerAddress: string;
  products: OrderedProduct[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ApiResponse {
  success: boolean;
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const getStores = useAllowedStores();
  const { data, isLoading, error, refetch, isFetching } = useOrders({
    page,
    limit,
    search,
    status,
    fromDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    toDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    storeId: storeIds.length > 0 ? storeIds : '',
  });

  const { prefetchNextPage } = usePrefetchOrders();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLimitChange = (value: string) => {
    const newLimit = Number(value);
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (data && newPage < data.pages) {
      prefetchNextPage(newPage, limit, search, status);
    }
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => data && handlePageChange(data.pages);
  const goToPreviousPage = () => handlePageChange(Math.max(1, page - 1));
  const goToNextPage = () =>
    data && handlePageChange(Math.min(data.pages, page + 1));

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setStoreIds([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const hasFilters = Boolean(
    (search && search.trim().length > 0) ||
      (status && status.length > 0) ||
      (storeIds && storeIds.length > 0) ||
      (startDate && endDate)
  );

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
          <p className="text-destructive mb-4">Error: {error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
        <p className="text-muted-foreground">
          Failed to load orders. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const startIndex = (data.page - 1) * data.limit + 1;
  const endIndex = Math.min(data.page * data.limit, data.total);
  const TotalProfit =
    (data.sums.totalSellPrice ? data.sums.totalSellPrice : 0) -
    (data.sums.totalPurchaseCost ? data.sums.totalPurchaseCost : 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          value={data.total}
          title="Total Orders"
          description="Total Orders"
          isLoading={isLoading}
          icon={<FaCirclePlus />}
        />
        <SummaryCard
          value={data.sums.totalPurchaseCost ? data.sums.totalPurchaseCost : 0}
          title="Total Purchases"
          description="Total Purchases Price"
          isLoading={isLoading}
          icon={<BiPurchaseTag />}
        />
        <SummaryCard
          value={data.sums.totalSellPrice ? data.sums.totalSellPrice : 0}
          title="Total Sells"
          description="Total Sells Price"
          isLoading={isLoading}
          icon={<GrOptimize />}
        />
        <SummaryCard
          value={TotalProfit.toFixed(2)}
          title="Total Profits"
          description="Total Profit Amount"
          isLoading={isLoading}
          icon={<GiProfit />}
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <div className="w-full items-center gap-4 flex-1 min-w-[300px]">
          <SearchInput value={search} onChange={setSearch} />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal bg-transparent"
              >
                {storeIds.length > 0
                  ? `${storeIds.length} Store(s) Selected`
                  : 'Select Store(s)'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px]">
              <div className="flex flex-col gap-2">
                {getStores.map((store) => (
                  <label
                    key={store.storeId}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={storeIds.includes(store.storeId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStoreIds((prev) => [...prev, store.storeId]);
                        } else {
                          setStoreIds((prev) =>
                            prev.filter((id) => id !== store.storeId)
                          );
                        }
                      }}
                    />
                    {store.storeName}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal bg-transparent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : 'Pick start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal bg-transparent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Pick end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="default"
            disabled={!startDate || !endDate}
            onClick={() => {
              setPage(1);
              refetch();
            }}
          >
            Apply Filter
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filter
          </Button>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {search && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 py-1 text-muted-foreground"
            >
              Search: {search}
              <button
                onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {status && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 py-1 text-muted-foreground"
            >
              Status: {status}
              <button
                onClick={() => setStatus('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="relative overflow-x-auto">
          <Table className="text-sm w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] font-semibold text-foreground/80 bg-muted/30 py-4 pl-5">
                  Order Info
                </TableHead>
                <TableHead className="min-w-[280px] font-semibold text-foreground/80 bg-muted/30 py-4">
                  Products
                </TableHead>
                <TableHead className="min-w-[160px] font-semibold text-foreground/80 bg-muted/30 py-4">
                  Customer
                </TableHead>
                <TableHead className="min-w-[140px] font-semibold text-foreground/80 bg-muted/30 py-4">
                  Shipping
                </TableHead>
                <TableHead className="min-w-[120px] font-semibold text-foreground/80 bg-muted/30 py-4">
                  Status
                </TableHead>
                <TableHead className="min-w-[140px] font-semibold text-foreground/80 bg-muted/30 py-4">
                  Total Cost
                </TableHead>
                <TableHead className="min-w-[140px] font-semibold text-foreground/80 bg-muted/30 py-4">
                  Profit
                </TableHead>
                <TableHead className="text-right min-w-[120px] font-semibold text-foreground/80 bg-muted/30 py-4 pr-5">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="w-full">
              {data.orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="w-full flex items-center justify-center flex-col">
                      <p className="text-muted-foreground">No orders found.</p>
                      {hasFilters && (
                        <Button
                          onClick={clearFilters}
                          variant="outline"
                          className="mt-4 bg-transparent"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.orders.map((order: Order, index: any) => {
                  const totalPrice = order.products
                    .reduce(
                      (total, product) =>
                        total +
                        (Number(product.sellPrice) || 0) +
                        (Number(product.tax) || 0) +
                        (Number(product.shipping) || 0),
                      0
                    )
                    .toFixed(2);

                  const totalSellPrice = order.products
                    .reduce((total, p) => total + (Number(p.sellPrice) || 0), 0)
                    .toFixed(2);

                  const totalShipping = order.products
                    .reduce((total, p) => total + (Number(p.shipping) || 0), 0)
                    .toFixed(2);

                  const totalTax = order.products
                    .reduce((total, p) => total + (Number(p.tax) || 0), 0)
                    .toFixed(2);
                  return (
                    <TableRow
                      key={order._id}
                      className={`hover:bg-muted/30 transition-colors border-b border-border/30 group ${
                        index % 2 === 0 ? 'bg-muted' : ''
                      }`}
                    >
                      {/* ORDER INFO */}
                      <TableCell className="pl-5">
                        <div className="flex flex-col gap-1 py-1">
                          <Badge
                            variant="secondary"
                            className="w-fit text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {order.storeName}
                          </Badge>
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {order.customerOrderId}
                          </span>
                          <p className="text-xs text-muted-foreground/70 font-medium">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                      </TableCell>

                      {/* PRODUCT INFO */}
                      <TableCell className="space-y-4 max-w-[280px] py-1 truncate ">
                        {order.products?.map((product) => (
                          <div
                            key={product._id}
                            className="flex gap-3 p-2 rounded-md hover:bg-muted/20 transition-colors"
                          >
                            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200  flex-shrink-0">
                              <Image
                                src={
                                  product.imageUrl ||
                                  '/placeholder.svg?height=64&width=64' ||
                                  '/placeholder.svg'
                                }
                                alt={product.productName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 space-y-0.5 items-start min-w-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors text-sm truncate">
                                    {product.productName}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent className="w-80 text-balance text-justify leading-5">
                                  {product.productName}
                                </TooltipContent>
                              </Tooltip>

                              <div className="text-xs text-muted-foreground/80 font-mono bg-muted/30 px-2 py-1 rounded w-full flex justify-between items-center">
                                <span>SKU: {product.productSKU}</span>
                                <span className="font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                  Qty: {product.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </TableCell>

                      {/* CUSTOMER INFO */}
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <span className="cursor-pointer font-medium hover:underline hover:text-primary transition-colors text-foreground">
                              {order.customerName}
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72 p-4 bg-card border shadow-lg">
                            <p className="text-sm font-semibold mb-2 text-foreground">
                              Customer Details
                            </p>
                            <p className="text-sm text-muted-foreground mb-1">
                              Name: {order.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground mb-1 whitespace-pre-line mt-1">
                              Address: {order.customerAddress}
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>

                      {/* SHIPPING INFO */}
                      <TableCell>
                        <div className="flex flex-col gap-2 py-1">
                          <Badge
                            variant="outline"
                            className="w-fit text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {order.shipNodeType}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Status INFO */}
                      <TableCell>
                        <Badge
                          className={
                            order.status === 'Delivered'
                              ? 'capitalize text-xs px-3 py-1 bg-green-100 text-green-800 border-green-200 font-medium'
                              : order.status === 'Shipped'
                              ? 'capitalize text-xs px-3 py-1 bg-blue-100 text-blue-800 border-blue-200 font-medium'
                              : order.status === 'Acknowledged'
                              ? 'capitalize text-xs px-3 py-1 bg-orange-50 text-orange-700 border-orange-200 font-medium'
                              : order.status === 'Pending'
                              ? 'capitalize text-xs px-3 py-1 bg-yellow-50 text-yellow-700 border-yellow-200 font-medium'
                              : 'capitalize text-xs px-3 py-1 bg-red-100 text-red-800 border-red-200 font-medium'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>

                      {/* COST ITEM */}
                      <TableCell>
                        <div className="flex flex-col gap-2 py-1">
                          <span className="text-sm text-muted-foreground font-medium">
                            $
                            {order.products
                              .reduce(
                                (total, product) =>
                                  total +
                                  product.quantity *
                                    Number(product.PurchasePrice),
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                      </TableCell>

                      {/* PROFIT */}
                      <TableCell>
                        <div className="flex flex-col gap-2 py-1">
                          <span className="text-sm text-muted-foreground font-medium">
                            $
                            {order.products
                              .reduce(
                                (total, product) =>
                                  total +
                                  (Number(product.sellPrice) -
                                    Number(product.PurchasePrice)),
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                      </TableCell>

                      {/* TOTAL */}
                      <TableCell className="text-right pr-5">
                        <div className="flex flex-col gap-2 items-end py-1">
                          <span className="font-medium">
                            <div className="flex flex-col text-gray-500 text-xs">
                              <span>Sell Price: ${totalSellPrice}</span>
                              <span>Shipping: ${totalShipping}</span>
                              <span>Tax: ${totalTax}</span>
                            </div>
                            <div className="font-bold text-sm text-black/70 mt-2">
                              Total Price: ${totalPrice}
                            </div>
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {data.page} of {data.pages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
              onClick={goToFirstPage}
              disabled={data.page === 1 || isFetching}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={goToPreviousPage}
              disabled={data.page === 1 || isFetching}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={goToNextPage}
              disabled={data.page === data.pages || isFetching}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
              onClick={goToLastPage}
              disabled={data.page === data.pages || isFetching}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            {startIndex}-{endIndex} of {data.total}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <Input
      aria-label="Search orders"
      type="text"
      placeholder="Search orders..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
}

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const statuses = [
  'Acknowledged',
  'Pending',
  'Shipped',
  'Delivered',
  'Cancelled',
];

function StatusFilters({ value, onChange }: StatusFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Filter Status" />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const SummaryCard = ({
  title,
  icon,
  value,
  isLoading,
  description,
  valueClass = '',
}: {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  isLoading: boolean;
  description: string;
  valueClass?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

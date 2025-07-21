'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Product, usePrefetchProducts, useProducts } from '@/hooks/useProduct';
import { Store, useStoresData } from '@/hooks/useStoreData';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

interface ProductTableProps {
  initialPage?: number;
  initialLimit?: number;
}

export function ProductsTable({
  initialPage = 1,
  initialLimit = 50,
}: ProductTableProps) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('All Stock');
  const [storeId, setStoreId] = useState('All Marts');

  // Debounce search input to reduce unnecessary API calls
  const [debouncedSearch] = useDebounce(search, 500);

  const { data: stores } = useStoresData();
  const { data, isLoading, error, refetch, isFetching } = useProducts({
    page,
    limit,
    search: debouncedSearch,
    availability: availability === 'All Stock' ? undefined : availability,
    storeId: storeId === 'All Marts' ? undefined : storeId,
  });

  const { prefetchNextPage } = usePrefetchProducts();

  // Prefetch next page when approaching the end of current data
  useEffect(() => {
    if (data && page < data.pagination.pages) {
      prefetchNextPage(page + 1, limit, debouncedSearch, availability, storeId);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    availability,
    storeId,
    data,
    prefetchNextPage,
  ]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const handleLimitChange = useCallback((value: string) => {
    const newLimit = Number(value);
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const goToFirstPage = useCallback(
    () => handlePageChange(1),
    [handlePageChange]
  );
  const goToLastPage = useCallback(() => {
    if (data) handlePageChange(data.pagination.pages);
  }, [data, handlePageChange]);
  const goToPreviousPage = useCallback(
    () => handlePageChange(Math.max(1, page - 1)),
    [handlePageChange, page]
  );
  const goToNextPage = useCallback(() => {
    if (data) handlePageChange(Math.min(data.pagination.pages, page + 1));
  }, [data, handlePageChange, page]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    []
  );

  const handleAvailabilityChange = useCallback((value: string) => {
    setAvailability(value);
    setPage(1);
  }, []);

  const handleMartChange = useCallback((value: string) => {
    setStoreId(value);
    setPage(1);
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
          <p className="text-destructive mb-4">Error loading products</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!data || !data.success || data.data.length === 0) {
    return (
      <div className="space-y-4">
        <TableFilters
          search={search}
          onSearchChange={handleSearchChange}
          availability={availability}
          onAvailabilityChange={handleAvailabilityChange}
          storeId={storeId}
          onMartChange={handleMartChange}
          stores={stores}
        />

        <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
          <p className="text-muted-foreground">
            {data?.data.length === 0
              ? 'No products found'
              : 'Failed to load products'}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { data: products, pagination } = data;
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  return (
    <div className="space-y-4">
      <TableHeaderSection isFetching={isFetching} onRefresh={refetch} />

      <TableFilters
        search={search}
        onSearchChange={handleSearchChange}
        availability={availability}
        onAvailabilityChange={handleAvailabilityChange}
        storeId={storeId}
        onMartChange={handleMartChange}
        stores={stores}
      />

      <div className="rounded-lg border bg-card max-h-[70vh] overflow-y-scroll">
        <Table className="min-w-full table-auto  overflow-scroll">
          <TableHeader className="sticky left-0 z-20 bg-card min-w-[280px] border-r">
            <TableRow>
              <TableHead className="min-w-[280px] sticky left-0 z-20 bg-card">Product</TableHead>
              <TableHead className="min-w-[140px]">Category</TableHead>
              <TableHead className="min-w-[120px]">SKU</TableHead>
              <TableHead className="min-w-[160px]">Identifiers</TableHead>
              <TableHead className="min-w-[120px]">Stock</TableHead>
              <TableHead className="min-w-[140px]">Inventory</TableHead>
              <TableHead className="min-w-[100px]">Condition</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductRow
                key={product._id}
                product={product}
                formatDate={formatDate}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={pagination.page}
        pages={pagination.pages}
        limit={limit}
        total={pagination.total}
        startIndex={startIndex}
        endIndex={endIndex}
        onLimitChange={handleLimitChange}
        onFirstPage={goToFirstPage}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onLastPage={goToLastPage}
        isFetching={isFetching}
      />
    </div>
  );
}

// Extracted component for table skeleton
function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                'Product',
                'Category',
                'SKU',
                'Identifiers',
                'Stock',
                'Inventory',
                'Condition',
              ].map((h) => (
                <TableHead key={h} className="py-4">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  {Array(7)
                    .fill(0)
                    .map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-16 w-full" />
                      </TableCell>
                    ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

// Extracted component for table header
function TableHeaderSection({
  isFetching,
  onRefresh,
}: {
  isFetching: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Products</h2>
        {isFetching && (
          <div className="flex items-center text-sm text-muted-foreground">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Updating...
          </div>
        )}
      </div>
      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
        disabled={isFetching}
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
        />
        Refresh
      </Button>
    </div>
  );
}

// Extracted component for filters
function TableFilters({
  search,
  onSearchChange,
  availability,
  onAvailabilityChange,
  storeId,
  onMartChange,
  stores,
}: {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  availability: string;
  onAvailabilityChange: (value: string) => void;
  storeId: string;
  onMartChange: (value: string) => void;
  stores?: Store[];
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={onSearchChange}
          className="pl-10"
        />
      </div>
      <Select value={availability} onValueChange={onAvailabilityChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Stock" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Stock">All Stock</SelectItem>
          <SelectItem value="In_stock">In Stock</SelectItem>
          <SelectItem value="Out_of_stock">Out of Stock</SelectItem>
        </SelectContent>
      </Select>
      <Select value={storeId} onValueChange={onMartChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Marts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Marts">All Marts</SelectItem>
          {stores?.map((store) => (
            <SelectItem key={store.storeId} value={store.storeId}>
              {store.storeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Extracted component for product row
function ProductRow({
  product,
  formatDate,
}: {
  product: Product;
  formatDate: (date: string) => string;
}) {
  const stock = product.onHand ?? 0;
  const isLowStock = stock < 10 && stock > 0;
  const isOutOfStock = stock === 0;
  const availabilityLabel = product.availability
    ?.replace(/_/g, ' ')
    ?.replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <TableRow className="hover:bg-muted/30 transition-colors border-b border-border/30 group">
      <TableCell className="max-w-[280px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-pointer py-2">
                <Badge
                  variant="secondary"
                  className="mb-2 text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {product.mart}
                </Badge>
                <p className="truncate font-medium text-foreground group-hover:text-primary transition-colors">
                  {product.productName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {formatDate(product.updatedAt)}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="whitespace-pre-wrap break-words text-sm font-medium">
                {product.productName}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className="font-medium">
          {product.productType}
        </Badge>
      </TableCell>

      <TableCell className="font-mono text-sm font-medium">
        {product.sku}
      </TableCell>

      <TableCell>
        <div className="flex gap-y-1.5 flex-col items-start">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">WPID:</span> {product.wpid}
          </p>
          {product.upc && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">UPC:</span> {product.upc}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">GTIN:</span> {product.gtin}
          </p>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-2">
          <Badge
            className={
              product.availability === 'Out_of_stock'
                ? 'text-xs px-3 py-1 bg-red-100 text-red-800 border-red-200 font-medium'
                : 'text-xs px-3 py-1 bg-green-100 text-green-800 border-green-200 font-medium'
            }
          >
            {availabilityLabel || 'Unknown'}
          </Badge>
          {isLowStock && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-y-1 flex-col">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">On Hand:</span>{' '}
            <span className="text-foreground font-bold">{product.onHand}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Available:</span>{' '}
            <span className="text-foreground font-bold">
              {product.available}
            </span>
          </p>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-2">
          <Badge
            className={
              isOutOfStock
                ? 'text-xs px-2 py-1 bg-red-100 text-red-800 border-red-200 font-medium'
                : isLowStock
                ? 'text-xs px-2 py-1 bg-yellow-50 text-yellow-700 border-yellow-200 font-medium'
                : 'text-xs px-2 py-1 bg-green-100 text-green-800 border-green-200 font-medium'
            }
          >
            {product.condition || 'N/A'}
          </Badge>
          <Badge
            variant="outline"
            className={
              product.publishedStatus === 'PUBLISHED'
                ? 'text-xs bg-green-50 text-green-700 border-green-200'
                : product.publishedStatus === 'UNPUBLISHED'
                ? 'text-xs bg-gray-50 text-gray-700 border-gray-200'
                : 'text-xs bg-red-50 text-red-700 border-red-200'
            }
          >
            {product.publishedStatus}
          </Badge>
        </div>
      </TableCell>

      <TableCell>
        <Link href={`/product-history/product-history-list/${product._id}`}>
          <Button size="icon" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}

// Extracted component for pagination controls
function PaginationControls({
  page,
  pages,
  limit,
  total,
  startIndex,
  endIndex,
  onLimitChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  isFetching,
}: {
  page: number;
  pages: number;
  limit: number;
  total: number;
  startIndex: number;
  endIndex: number;
  onLimitChange: (value: string) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  isFetching: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select value={limit.toString()} onValueChange={onLimitChange}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 25, 50, 100].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page} of {pages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={onFirstPage}
            disabled={page === 1 || isFetching}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={onPreviousPage}
            disabled={page === 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={onNextPage}
            disabled={page === pages || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={onLastPage}
            disabled={page === pages || isFetching}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">
          {total === 0
            ? 'No products'
            : `${startIndex}-${endIndex} of ${total}`}
        </p>
      </div>
    </div>
  );
}

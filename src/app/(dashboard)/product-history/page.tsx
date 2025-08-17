'use client';

import AddProductHistoryDialog from '@/components/product-history/AddProductHistory';
import InventorySummary from '@/components/product-history/InventorySummary';
import { ProductHistoryTable } from '@/components/product-history/ProductHistory-table';
import { SearchFilter } from '@/components/product-history/searchFilter';
import { UploadDialog } from '@/components/product-history/UploadDialog';
import SelectStore from '@/components/SelectStore';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import axiosInstance from '@/lib/axiosInstance';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
interface SummaryData {
  totalPurchase: number;
  totalOrder: number;
  totalLost: number;
  totalSendToWFS: number;
  remainingOrderQuantity: number;
  totalLostCost: number;
  totalOrderAmount: number;
  totalCost: number;
  totalWFSCost: number;
  remainingQuantity: number;
  remainingCost: number;
}
// ✅ Interface kept same as before
export interface ProductHistory {
  _id: string;
  productId: string;
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
  store: Store;
  summary: SummaryData;
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

// ✅ Add Pagination Interface
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ API Response Interface
interface ApiResponse {
  success: boolean;
  products: ProductHistory[];
  summary: SummaryData;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getProducts = async ({
  search,
  storeId,
  page = 1,
  limit = 10,
  startDate,
  endDate,
}: {
  search?: string;
  storeId?: string;
  page?: number;
  limit?: number;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}) => {
  try {
    const res = await axiosInstance.get(
      '/api/product-history/get-all-product-history',
      {
        params: {
          search: search || '',
          storeID: storeId || '',
          page,
          limit,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
        withCredentials: true,
        timeout: 5000,
      }
    );

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    // Return the full response structure
    return {
      success: res.data.success || true,
      products: res.data.products || [],
      summary: res.data.summary || {},
      total: res.data.total || 0,
      page: res.data.page || page,
      limit: res.data.limit || limit,
      totalPages:
        res.data.totalPages || Math.ceil((res.data.total || 0) / limit),
    };
  } catch (error) {
    console.warn('Product API unavailable, using mock data:', error);
  }
};

export default function InventoryPage() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // ✅ Updated query with pagination
  const {
    data: apiResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'productsHistory',
      search,
      storeIds,
      pagination.page,
      pagination.limit,
      startDate,
      endDate,
    ],
    queryFn: () =>
      getProducts({
        search,
        storeId: storeIds.join(','),
        page: pagination.page,
        limit: pagination.limit,
        startDate: startDate,
        endDate: endDate,
      }),
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });

  // ✅ Use useEffect to update pagination when data changes
  useEffect(() => {
    if (apiResponse) {
      setPagination({
        total: apiResponse.total,
        page: apiResponse.page,
        limit: apiResponse.limit,
        totalPages: apiResponse.totalPages,
      });
    }
  }, [apiResponse]);

  // ✅ Handle page changes
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // ✅ Handle limit changes
  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({
      ...prev,
      limit,
      page: 1, // Reset to first page
      totalPages: Math.ceil(prev.total / limit),
    }));
  };

  // ✅ Handle search changes (reset to first page)
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // ✅ Handle store filter changes (reset to first page)
  const clearFilter = () => {
    setSearch('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStoreIds([]);
    refetch();
  };
  return (
    <div className="container mx-auto px-2">
      <div className="space-y-6">
        {/* 🔥 Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Purchase History
            </h1>
            <p className="text-muted-foreground">
              Manage your products and track stock levels
            </p>
          </div>
        </div>
        <div>
          <InventorySummary summary={apiResponse?.summary} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* 🔍 Search Filter */}
          <SearchFilter search={search} onSearchChange={handleSearchChange} />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
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
                className="w-[240px] justify-start text-left font-normal"
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
          <SelectStore
            selectedStores={storeIds}
            setSelectedStores={setStoreIds}
            isLoading={isLoading}
            clearSelection={() => setStoreIds([])}
            setPagination={setPagination}
            handleRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ['productsHistory'] })
            }
          />
          {search || startDate || endDate || storeIds.length > 0 ? (
            <Button variant="destructive" onClick={() => clearFilter()}>
              Clear Filters
            </Button>
          ) : null}
          <AddProductHistoryDialog>
            <Button>
              <Plus />
              Add History
            </Button>
          </AddProductHistoryDialog>
          <div className="flex gap-x-3">
            <UploadDialog>
              <Button>Upload</Button>
            </UploadDialog>
          </div>
        </div>

        {/* 📦 Product History Table with Pagination */}
        <ProductHistoryTable
          products={apiResponse?.products || []}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>
    </div>
  );
}

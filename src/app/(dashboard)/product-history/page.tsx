'use client';

import InventorySummary from '@/components/product-history/InventorySummary';
import { ProductHistoryTable } from '@/components/product-history/ProductHistory-table';
import { SearchFilter } from '@/components/product-history/searchFilter';
import { UploadDialog } from '@/components/product-history/UploadDialog';
import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
interface SummaryData {
  totalPurchase: number;
  totalReceive: number;
  totalLost: number;
  totalSendToWFS: number;
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
  product: Product;
  store: Store;
  summary: SummaryData;
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
  limit = 20,
}: {
  search?: string;
  storeId?: string;
  page?: number;
  limit?: number;
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
        },
        withCredentials: true,
        timeout: 5000, // 5 second timeout
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
  const [search, setSearch] = useState('');
  const [storeId, setStoreId] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // ✅ Updated query with pagination
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: [
      'productsHistory',
      search,
      storeId,
      pagination.page,
      pagination.limit,
    ],
    queryFn: () =>
      getProducts({
        search,
        storeId,
        page: pagination.page,
        limit: pagination.limit,
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
  const handleStoreChange = (newStoreId: string) => {
    setStoreId(newStoreId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
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
        <div className="">
          <InventorySummary
            summary={apiResponse?.summary}
            handleStoreChange={handleStoreChange}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* 🔍 Search Filter */}
          <SearchFilter search={search} onSearchChange={handleSearchChange} />
          <UploadDialog  />
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

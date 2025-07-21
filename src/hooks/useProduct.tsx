'use client';

import axiosInstance from '@/lib/axiosInstance';
import { useQuery, useQueryClient } from '@tanstack/react-query';
export interface Product {
  _id: string;
  mart: string;
  sku: string;
  condition: string;
  availability: 'In_stock' | 'Out_of_stock';
  wpid: string;
  upc?: string;
  gtin: string;
  productName: string;
  productType: string;
  onHand: number;
  available: number;
  publishedStatus: 'PUBLISHED' | 'UNPUBLISHED' | 'SYSTEM_PROBLEM';
  lifecycleStatus: 'ACTIVE' | 'RETIRED';
  __v: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface ProductsApiResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  data: Product[];
}

interface UseProductsParams {
  page: number;
  limit: number;
  search?: string;
  availability?: string;
  storeId?: string;
}

const fetchProducts = async (
  params: UseProductsParams
): Promise<ProductsApiResponse> => {
  try {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    if (params.search && params.search !== '')
      searchParams.append('search', params.search);
    if (
      params.availability &&
      params.availability !== '' &&
      params.availability !== 'All Stock'
    ) {
      searchParams.append('availability', params.availability);
    }
    if (
      params.storeId &&
      params.storeId !== '' &&
      params.storeId !== 'All Marts'
    ) {
      searchParams.append('mart', params.storeId);
    }

    const response = await axiosInstance.get(
      `/api/products/get-products?${searchParams.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error('Fetch products error:', error);
    throw error;
  }
};

export function useProducts(params: Partial<UseProductsParams> = {}) {
  const {
    page = 1,
    limit = 50,
    search = '',
    availability = '',
    storeId = '',
  } = params;

  return useQuery({
    queryKey: ['products', { page, limit, search, availability, storeId }],
    queryFn: () =>
      fetchProducts({ page, limit, search, availability, storeId }),
    placeholderData: (previousData) => previousData,
  });
}

export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  const prefetchNextPage = (
    currentPage: number,
    limit: number,
    search?: string,
    availability?: string,
    storeId?: string
  ) => {
    queryClient.prefetchQuery({
      queryKey: [
        'products',
        { page: currentPage + 1, limit, search, availability, storeId },
      ],
      queryFn: () =>
        fetchProducts({
          page: currentPage + 1,
          limit,
          search,
          availability,
          storeId,
        }),
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchNextPage };
}

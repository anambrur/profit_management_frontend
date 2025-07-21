'use client';

import axiosInstance from '@/lib/axiosInstance';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// Define the expected query parameters
export interface UseOrdersParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  storeId?: string;
}

// 🧠 Fetcher Function
const fetchOrders = async ({
  page,
  limit,
  search,
  status,
  storeId,
}: UseOrdersParams) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (storeId) params.append('storeId', storeId);

  const response = await axiosInstance.get(
    `/api/orders/get-orders?${params.toString()}`
  );

  return response.data;
};

// ✅ Main Hook
export function useOrders({
  page = 1,
  limit = 20,
  search = '',
  status = '',
  storeId = '',
}: Partial<UseOrdersParams> = {}) {
  return useQuery({
    queryKey: ['orders', { page, limit, search, status, storeId }],
    queryFn: () => fetchOrders({ page, limit, search, status, storeId }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

// ✅ Prefetch Hook (optional for pagination)
export function usePrefetchOrders() {
  const queryClient = useQueryClient();

  const prefetchNextPage = (
    currentPage: number,
    limit: number,
    search?: string,
    status?: string,
    storeId?: string
  ) => {
    queryClient.prefetchQuery({
      queryKey: [
        'orders',
        { page: currentPage + 1, limit, search, status, storeId },
      ],
      queryFn: () =>
        fetchOrders({
          page: currentPage + 1,
          limit,
          search,
          status,
          storeId,
        }),
      staleTime: 5 * 60 * 1000, // 5 min
    });
  };

  return { prefetchNextPage };
}

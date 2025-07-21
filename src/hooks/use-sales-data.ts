'use client';

import { useCallback, useEffect, useState } from 'react';
// Import your apiService here (adjust the path as needed)

interface ApiResponse {
  data: any; // Replace 'any' with the actual structure if known
}

interface ApiFilters {
  // Define your filter properties here, for example:
  [key: string]: any;
}

interface UseSalesDataReturn {
  data: ApiResponse | null;
  loading: boolean;
  error: string | null;
  refetch: (filters?: ApiFilters) => Promise<void>;
  updateApiUrl: (url: string) => void;
}

export function useSalesData(
  initialFilters: ApiFilters = {}
): UseSalesDataReturn {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filters: ApiFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      // @ts-nocheck
      // const response = await apiService.fetchSalesData(filters);
      // setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error in useSalesData:', err);

      // Set fallback data for demo purposes
      setData({
        data: {
          today: {
            period: {
              start: '2025-06-22T18:00:00.000Z',
              end: '2025-06-23T17:59:59.999Z',
            },
            summary: {
              sales: '0.00',
              orders: 0,
              cost: '0.00',
              fees: '0.00',
              taxes: '0.00',
              shipping: '0.00',
              profit: '0.00',
              margin: '0.0',
            },
            orderAnalysis: {
              profitableOrders: 0,
              unprofitableOrders: 0,
              neutralOrders: 0,
              orders: [],
            },
          },
          yesterday: {
            period: {
              start: '2025-06-21T18:00:00.000Z',
              end: '2025-06-22T17:59:59.999Z',
            },
            summary: {
              sales: '0.00',
              orders: 0,
              cost: '0.00',
              fees: '0.00',
              taxes: '0.00',
              shipping: '0.00',
              profit: '0.00',
              margin: '0.0',
            },
            orderAnalysis: {
              profitableOrders: 0,
              unprofitableOrders: 0,
              neutralOrders: 0,
              orders: [],
            },
          },
          thisMonth: {
            period: {
              start: '2025-05-31T18:00:00.000Z',
              end: '2025-06-30T17:59:59.999Z',
            },
            summary: {
              sales: '73.00',
              orders: 2,
              cost: '60.00',
              fees: '5.57',
              taxes: '5.57',
              shipping: '0.00',
              profit: '7.43',
              margin: '10.2',
            },
            orderAnalysis: {
              profitableOrders: 2,
              unprofitableOrders: 0,
              neutralOrders: 0,
              orders: [
                {
                  orderId: '200013220008247',
                  profit: '3.67',
                  margin: '10.1',
                },
                {
                  orderId: '200013304635099',
                  profit: '3.76',
                  margin: '10.3',
                },
              ],
            },
          },
          lastMonth: {
            period: {
              start: '2025-04-30T18:00:00.000Z',
              end: '2025-05-31T17:59:59.999Z',
            },
            summary: {
              sales: '0.00',
              orders: 0,
              cost: '0.00',
              fees: '0.00',
              taxes: '0.00',
              shipping: '0.00',
              profit: '0.00',
              margin: '0.0',
            },
            orderAnalysis: {
              profitableOrders: 0,
              unprofitableOrders: 0,
              neutralOrders: 0,
              orders: [],
            },
          },
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(
    async (filters: ApiFilters = {}) => {
      await fetchData({ ...initialFilters, ...filters });
    },
    [fetchData, initialFilters]
  );

  const updateApiUrl = useCallback((url: string) => {
    // @ts-ignore
    apiService.setApiUrl(url);
  }, []);

  useEffect(() => {
    fetchData(initialFilters);
  }, [fetchData, initialFilters]);

  return {
    data,
    loading,
    error,
    refetch,
    updateApiUrl,
  };
}

'use client';

import { OrdersTable } from '@/components/orders/orders-table';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

const getOrders = async () => {
  try {
    const response = await axiosInstance.get('/api/orders/get-orders');
    return response.data.orders;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  // Check permissions on component mount
  useEffect(() => {
    if (!hasPermission('order:view')) {
      toast.error('You do not have permission to view orders');
      router.push('/dashboard');
    }
  }, [hasPermission, router]);

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery<Order[], Error>({
    queryKey: ['orders'],
    queryFn: getOrders,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your customer orders
          </p>
        </div>
      </div>

      {orders && orders.length > 0 ? (
        <OrdersTable />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You haven't received any orders yet
          </p>
        </div>
      )}
    </div>
  );
}

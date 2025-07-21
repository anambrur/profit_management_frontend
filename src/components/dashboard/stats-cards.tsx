'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

interface StatsCardsProps {
  stats?: {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    totalCustomers: number;
    customersChange: number;
    totalProducts: number;
    productsChange: number;
  };
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue
        ? `$${stats.totalRevenue.toLocaleString()}`
        : '$0',
      change: stats?.revenueChange || 0,
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: stats?.totalOrders?.toLocaleString() || '0',
      change: stats?.ordersChange || 0,
      icon: ShoppingCart,
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers?.toLocaleString() || '0',
      change: stats?.customersChange || 0,
      icon: Users,
    },
    {
      title: 'Products',
      value: stats?.totalProducts?.toLocaleString() || '0',
      change: stats?.productsChange || 0,
      icon: Package,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className=" ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="bg-gray-50 dark:bg-gray-900 dark:border-gray-900"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {card.change > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span
                className={cn(
                  card.change > 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {Math.abs(card.change)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

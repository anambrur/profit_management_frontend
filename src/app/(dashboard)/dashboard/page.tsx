'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store, useStoresData } from '@/hooks/useStoreData';
import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CalendarIcon,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

export interface Period {
  start: string;
  end: string;
}

export interface Summary {
  sales: string;
  orders: number;
  cost: string;
  fees: string;
  taxes: string;
  shipping: string;
  profit: string;
  margin: string;
}

export interface Order {
  orderId: string;
  profit: string;
  margin: string;
}

export interface OrderAnalysis {
  profitableOrders: number;
  unprofitableOrders: number;
  neutralOrders: number;
  orders: Order[];
}

export interface PeriodData {
  period: Period;
  summary: Summary;
  orderAnalysis: OrderAnalysis;
}

export interface DashboardData {
  today: PeriodData;
  yesterday: PeriodData;
  thisMonth: PeriodData;
  lastMonth: PeriodData;
  custom?: PeriodData;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export default function Component() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [storeId, setStoreId] = useState<string>('');
  const { data: stores } = useStoresData();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profit'],
    queryFn: async (): Promise<DashboardResponse> => {
      const res = await axiosInstance.get('/api/profits/get-all-profits');
      return res.data;
    },
    refetchInterval: 10000,
  });

  const {
    data: customData,
    isLoading: isCustomLoading,
    refetch: refetchCustomData,
  } = useQuery({
    queryKey: ['customProfit', startDate, endDate, storeId],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/profits/get-all-profits', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          storeId: storeId || undefined,
        },
      });
      return res.data?.data?.custom;
    },
    enabled: false,
  });

  const salesData = data?.data;

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStoreId('');
  };

  const formatCurrency = (amount: string) =>
    `$${parseFloat(amount).toFixed(2)}`;
  const formatPercentage = (percentage: string) =>
    `${parseFloat(percentage).toFixed(1)}%`;

  const PeriodCard = ({
    title,
    data,
    icon: Icon,
    color,
  }: {
    title: string;
    data: PeriodData;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
              {formatCurrency(data.summary.sales)}
            </span>
            <Badge variant="secondary">{data.summary.orders} orders</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost:</span>
                <span>{formatCurrency(data.summary.cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fees:</span>
                <span>{formatCurrency(data.summary.fees)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes:</span>
                <span>{formatCurrency(data.summary.taxes)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>{formatCurrency(data.summary.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit:</span>
                <span className="font-medium">
                  {formatCurrency(data.summary.profit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margin:</span>
                <span className="font-medium">
                  {formatPercentage(data.summary.margin || '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-green-600">
                Profitable: {data.orderAnalysis.profitableOrders}
              </span>
              <span className="text-red-600">
                Unprofitable: {data.orderAnalysis.unprofitableOrders}
              </span>
              <span className="text-gray-600">
                Neutral: {data.orderAnalysis.neutralOrders}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {format(new Date(data.period.start), 'MMM dd')} -{' '}
            {format(new Date(data.period.end), 'MMM dd')}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError || !salesData)
    return <div className="p-6">Error loading data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Analytics Dashboard</h1>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Select onValueChange={(value) => setStoreId(value)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              {stores?.map((store: Store) => (
                <SelectItem key={store.storeId + 1} value={store.storeId}>
                  {store.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

          <Button
            variant="default"
            disabled={!startDate || !endDate || !storeId}
            onClick={() => refetchCustomData()}
          >
            Apply Filter
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PeriodCard
          title="Today"
          data={salesData.today}
          icon={DollarSign}
          color="text-blue-600"
        />
        <PeriodCard
          title="Yesterday"
          data={salesData.yesterday}
          icon={TrendingUp}
          color="text-green-600"
        />
        <PeriodCard
          title="This Month"
          data={salesData.thisMonth}
          icon={Package}
          color="text-purple-600"
        />
        <PeriodCard
          title="Last Month"
          data={salesData.lastMonth}
          icon={Users}
          color="text-orange-600"
        />

        {isCustomLoading ? (
          <Card className="w-full border-dashed border-2">
            <CardContent className="p-6">Loading custom data...</CardContent>
          </Card>
        ) : customData ? (
          <PeriodCard
            title="Custom"
            data={customData}
            icon={CalendarIcon}
            color="text-gray-600"
          />
        ) : (
          <Card className="w-full border-dashed border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custom Analytics
              </CardTitle>
              <div className="h-4 w-4 rounded border-2 border-dashed border-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-32 space-y-2">
                <div className="text-muted-foreground text-sm">
                  Select a custom date range
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {salesData.thisMonth.orderAnalysis.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>This Month's Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {salesData.thisMonth.orderAnalysis.orders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-mono text-sm">#{order.orderId}</span>
                  <div className="flex gap-4 text-sm">
                    <span>Profit: {formatCurrency(order.profit)}</span>
                    <span>Margin: {formatPercentage(order.margin)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

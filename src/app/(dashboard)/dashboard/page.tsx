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
import axiosInstance from '@/lib/axiosInstance';
import { useAllowedStores } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CalendarIcon,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
  last6Months: PeriodData;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export default function Component() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const stores = useAllowedStores();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profit', storeIds],
    queryFn: async (): Promise<DashboardResponse> => {
      const res = await axiosInstance.get('/api/profits/get-all-profits', {
        params: {
          storeIds: storeIds.join(',') || undefined,
        },
      });
      return res.data;
    },
    refetchInterval: 10000,
  });

  const {
    data: customData,
    isLoading: isCustomLoading,
    refetch: refetchCustomData,
  } = useQuery({
    queryKey: ['customProfit', startDate, endDate, storeIds],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/profits/get-all-profits', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          storeId: storeIds.join(',') || undefined,
        },
      });
      return res.data?.data?.custom;
    },
    enabled: false,
  });

  useEffect(() => {
    if (startDate && endDate) {
      refetchCustomData();
    }
  }, [startDate, endDate]);

  const salesData = data?.data;

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStoreIds([]);
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
                <span className="text-muted-foreground font-bold">Cost:</span>
                <span className="font-bold">
                  {formatCurrency(data.summary.cost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Fees:</span>
                <span className="font-bold">
                  {formatCurrency(data.summary.fees)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Taxes:</span>
                <span className="font-bold">
                  {formatCurrency(data.summary.taxes)}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">
                  Shipping:
                </span>
                <span className="font-bold">
                  {formatCurrency(data.summary.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Profit:</span>
                <span className="font-bold">
                  {formatCurrency(data.summary.profit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Margin:</span>
                <span className="font-bold">
                  {formatPercentage(data.summary.margin || '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-green-600 font-bold">
                Profitable: {data.orderAnalysis.profitableOrders}
              </span>
              <span className="text-red-600 font-bold">
                Unprofitable: {data.orderAnalysis.unprofitableOrders}
              </span>
              <span className="text-gray-600 font-bold">
                Neutral: {data.orderAnalysis.neutralOrders}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-bold">
            {format(new Date(data.period.start), 'MMM dd')} -{' '}
            {format(new Date(data.period.end), 'MMM dd')}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (isError || !salesData)
    return <div className="p-6">Error loading data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Analytics Dashboard</h1>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                {storeIds.length > 0
                  ? `${storeIds.length} Store(s) Selected`
                  : 'Select Store(s)'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px]">
              <div className="flex flex-col gap-2">
                {stores.map((store) => (
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
        <PeriodCard
          title="Last 6 Month"
          data={salesData.last6Months}
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
    </div>
  );
}

'use client';

import {
  AlertTriangle,
  Archive,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Warehouse,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStoresData } from '@/hooks/useStoreData';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

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

interface InventorySummaryProps {
  summary: SummaryData | undefined;
  handleStoreChange: (newStoreIds: string[]) => void; // Now multiple
}

export default function InventorySummary({
  summary,
  handleStoreChange,
}: InventorySummaryProps) {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const { data: stores = [], isLoading: isLoadingStores } = useStoresData();

  const formatCurrency = (value: number) => `$${Number(value || 0).toFixed(2)}`;

  const getSelectedStoreNames = () => {
    if (selectedStores.length === 0) return 'All Stores';
    const names = stores
      .filter((s) => selectedStores.includes(s._id as string))
      .map((s) => s.storeName);
    return names.length > 0 ? names.join(', ') : 'Selected Stores';
  };

  const handleCheckboxChange = (storeId: string, checked: boolean) => {
    setSelectedStores((prev) => {
      let newSelected;
      if (checked) {
        newSelected = [...prev, storeId];
      } else {
        newSelected = prev.filter((id) => id !== storeId);
      }
      handleStoreChange(newSelected);
      return newSelected;
    });
  };
  const clearSelection = () => {
    setSelectedStores([]);
    handleStoreChange([]);
  };

  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['productsHistory'] });
  };

  return (
    <div className="p-6 w-full mx-auto">
      {/* Store Selector */}
      <div className="flex items-center justify-between mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[200px]">
              Select Store(s) {selectedStores.length}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4 shadow-none" align="start">
            {isLoadingStores ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="flex flex-col max-h-60 overflow-auto space-y-2">
                {stores.map((store) => {
                  const checked = selectedStores.includes(store._id as string);
                  return (
                    <label
                      key={store._id}
                      className="inline-flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(store._id as string, !!checked)
                        }
                      />
                      <span>{store.storeName}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {selectedStores.length > 0 && (
              <Button
                variant="destructive"
                className="mt-3 w-full"
                onClick={clearSelection}
              >
                Clear All
              </Button>
            )}
          </PopoverContent>
        </Popover>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Showing data for: <strong>{getSelectedStoreNames()}</strong>
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Purchase"
          value={summary?.totalPurchase}
          isLoading={!summary}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="Units purchased"
        />
        <SummaryCard
          title="Total Received"
          value={summary?.totalReceive}
          isLoading={!summary}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="Units received"
        />
        <SummaryCard
          title="Total Lost"
          value={summary?.totalLost}
          isLoading={!summary}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          description="Units lost"
          valueClass="text-destructive"
        />
        <SummaryCard
          title="Sent to WFS"
          value={summary?.totalSendToWFS}
          isLoading={!summary}
          icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
          description="Units sent to WFS"
        />
        <SummaryCard
          title="Total Cost"
          value={formatCurrency(summary?.totalCost || 0)}
          isLoading={!summary}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total investment"
        />
        <SummaryCard
          title="WFS Cost"
          value={formatCurrency(summary?.totalWFSCost || 0)}
          isLoading={!summary}
          icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
          description="Warehouse cost"
        />
        <SummaryCard
          title="Remaining Quantity"
          value={summary?.remainingQuantity}
          isLoading={!summary}
          icon={<Archive className="h-4 w-4 text-muted-foreground" />}
          description="Units in stock"
        />
        <SummaryCard
          title="Remaining Cost"
          value={formatCurrency(summary?.remainingCost || 0)}
          isLoading={!summary}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Stock value"
        />
      </div>

      {/* Analytics */}
      {summary && (
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fulfillment Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnalysisItem
                label="Fulfillment Rate"
                value={
                  summary.totalPurchase > 0
                    ? (
                        (summary.totalReceive / summary.totalPurchase) *
                        100
                      ).toFixed(1) + '%'
                    : '0%'
                }
                variant="secondary"
              />
              <AnalysisItem
                label="WFS Allocation"
                value={
                  summary.totalReceive > 0
                    ? (
                        (summary.totalSendToWFS / summary.totalReceive) *
                        100
                      ).toFixed(1) + '%'
                    : '0%'
                }
                variant="outline"
              />
              <AnalysisItem
                label="Loss Rate"
                value={
                  summary.totalPurchase > 0
                    ? (
                        (summary.totalLost / summary.totalPurchase) *
                        100
                      ).toFixed(2) + '%'
                    : '0%'
                }
                variant="destructive"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnalysisItem
                label="WFS Cost Ratio"
                value={
                  summary.totalCost > 0
                    ? (
                        (summary.totalWFSCost / summary.totalCost) *
                        100
                      ).toFixed(1) + '%'
                    : '0%'
                }
                variant="secondary"
              />
              <AnalysisItem
                label="Remaining Value"
                value={
                  summary.totalCost > 0
                    ? (
                        (summary.remainingCost / summary.totalCost) *
                        100
                      ).toFixed(1) + '%'
                    : '0%'
                }
                variant="outline"
              />
              <AnalysisItem
                label="Avg Cost per Unit"
                value={
                  summary.totalPurchase > 0
                    ? formatCurrency(summary.totalCost / summary.totalPurchase)
                    : '$0.00'
                }
                variant="secondary"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

const SummaryCard = ({
  title,
  icon,
  value,
  isLoading,
  description,
  valueClass = '',
}: {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  isLoading: boolean;
  description: string;
  valueClass?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const AnalysisItem = ({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <Badge variant={variant}>{value}</Badge>
  </div>
);

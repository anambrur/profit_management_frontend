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
import { StoreSelector } from './StoreSlector';

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
  handleStoreChange: (newStoreId: string) => void;
}

export default function InventorySummary({
  summary,
  handleStoreChange,
}: InventorySummaryProps) {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const { data: stores = [], isLoading: isLoadingStores } = useStoresData();

  const formatCurrency = (value: number) => `$${Number(value || 0).toFixed(2)}`;

  const getSelectedStoreName = () => {
    if (selectedStore === 'all') return 'All Stores';
    const store = stores.find((s) => s._id === selectedStore);
    return store?.storeName || 'Unknown Store';
  };

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
    handleStoreChange(storeId); // Tell parent to filter
  };
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['productsHistory'] });
  };

  return (
    <div className="p-6 w-full mx-auto">
      {/* Store Selector */}
      <div className="flex items-center justify-between mb-6">
        <StoreSelector
          selectedStore={selectedStore}
          onStoreChange={handleStoreSelect}
          stores={stores}
          isLoading={isLoadingStores}
        />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Showing data for: <strong>{getSelectedStoreName()}</strong>
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

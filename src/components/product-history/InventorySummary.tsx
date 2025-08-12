'use client';

import {
  AlertTriangle,
  Archive,
  DollarSign,
  Package,
  ShoppingCart,
  Warehouse,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryData {
  totalPurchase: number;
  totalOrder: number;
  totalLost: number;
  remainingOrderQuantity: number;
  totalSendToWFS: number;
  totalCost: number;
  totalWFSCost: number;
  totalLostCost: number;
  remainingQuantity: number;
  remainingCost: number;
}

interface InventorySummaryProps {
  summary: SummaryData | undefined;
}

export default function InventorySummary({ summary }: InventorySummaryProps) {
  const formatCurrency = (value: number) => `$${Number(value || 0).toFixed(2)}`;
  return (
    <div className=" w-full mx-auto">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Purchase"
          value={summary?.totalPurchase}
          isLoading={!summary}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="Units purchased"
        />
        <SummaryCard
          title="Total Order"
          value={summary?.totalOrder}
          isLoading={!summary}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="Units ordered"
        />
        <SummaryCard
          title="Remaining Order Quantity"
          value={summary?.remainingOrderQuantity || 0}
          isLoading={!summary}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="Units remaining"
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
          title="Total Lost Amount"
          value={formatCurrency(summary?.totalLostCost || 0)}
          isLoading={!summary}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description="Lost cost"
        />
        <SummaryCard
          title="Total Cost"
          value={formatCurrency(summary?.totalCost || 0)}
          isLoading={!summary}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total investment"
        />
        <SummaryCard
          title="Sent to WFS"
          value={summary?.totalSendToWFS}
          isLoading={!summary}
          icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
          description="Units sent to WFS"
        />
        <SummaryCard
          title="Remaining WFS Quantity"
          value={summary?.remainingQuantity}
          isLoading={!summary}
          icon={<Archive className="h-4 w-4 text-muted-foreground" />}
          description="Units in stock"
        />
        <SummaryCard
          title="Total WFS Cost"
          value={formatCurrency(summary?.totalWFSCost || 0)}
          isLoading={!summary}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Warehouse cost"
        />
        <SummaryCard
          title="Remaining WFS Cost"
          value={formatCurrency(summary?.remainingCost || 0)}
          isLoading={!summary}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Stock value"
        />
      </div>
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
  <Card className="shadow-none rounded-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
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

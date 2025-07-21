'use client';

import { ProductsTable } from '@/components/inventory/products-table';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your products and track stock levels
          </p>
        </div>
      </div>
      {/* 📋 Product Table */}
      <ProductsTable />
    </div>
  );
}

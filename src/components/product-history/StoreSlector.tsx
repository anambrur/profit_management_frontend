'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store } from '@/hooks/useStoreData';
import { Loader2, LucideStore } from 'lucide-react';

interface StoreSelectorProps {
  selectedStore: string;
  onStoreChange: (storeId: string) => void;
  stores: Store[];
  isLoading: boolean; 
}

export function StoreSelector({
  selectedStore,
  onStoreChange,
  stores,
  isLoading,
}: StoreSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <LucideStore className="h-4 w-4 text-muted-foreground" />
      )}

      <Select
        value={selectedStore}
        onValueChange={onStoreChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a store..." />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Stores</SelectItem>
          {(stores ?? []).map((store) => (
            <SelectItem key={store._id} value={store._id}>
              <div className="flex flex-col text-sm">
                <span>{store.storeName}</span>
                <span className="text-xs text-muted-foreground">
                  {store.storeEmail}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

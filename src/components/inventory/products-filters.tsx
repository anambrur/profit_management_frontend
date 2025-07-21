'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';

// ✅ Store Interface
interface Store {
  storeId: string;
  storeName: string;
  storeEmail: string;
  storeClientId: string;
  storeClientSecret: string;
  storeImage?: string;
  storeImagePublicId?: string;
  storeStatus: 'active' | 'inactive' | 'suspended';
}

// ✅ Filters Props with storeId & availability
interface ProductsFiltersProps {
  filters: {
    storeId: string;
    search: string;
    availability: string;
  };
  onFiltersChange: (filters: {
    storeId: string;
    search: string;
    availability: string;
  }) => void;
}

// ✅ Fetch stores
const getStore = async (): Promise<Store[]> => {
  try {
    const response = await axiosInstance.get('/api/stores/get-all-store');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
};

export function ProductsFilters({
  filters,
  onFiltersChange,
}: ProductsFiltersProps) {
  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: getStore,
  });

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ storeId: '', search: '', availability: '' });
  };

  const hasActiveFilters =
    filters.storeId || filters.search || filters.availability;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border">
      {/* 🔍 Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products, SKU..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 🏬 Store Selector */}
      <Select
        value={filters.storeId}
        onValueChange={(value) => handleFilterChange('storeId', value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Stores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stores</SelectItem>
          {stores?.map((store: Store) => (
            <SelectItem key={store.storeId} value={store.storeId}>
              {store.storeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 📦 Availability Selector */}
      <Select
        value={filters.availability}
        onValueChange={(value) => handleFilterChange('availability', value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Availability</SelectItem>
          <SelectItem value="In_stock">In Stock</SelectItem>
          <SelectItem value="Out_of_stock">Out of Stock</SelectItem>
        </SelectContent>
      </Select>

      {/* ❌ Clear Button */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} size="icon">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

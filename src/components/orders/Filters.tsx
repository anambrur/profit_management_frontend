'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { format } from 'date-fns';
import { CalendarIcon, Filter, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { SelectedStoresDisplay, Store, StoreFilter } from './StoreFilter';

export interface FilterState {
  stores: string[];
  sku: string;
  orderId: string;
  dateRange: DateRange | undefined;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FiltersProps {
  stores: Store[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  showOrderId?: boolean;
  showDateRange?: boolean;
}

export function Filters({
  stores,
  filters,
  onFiltersChange,
  onReset,
  showOrderId = false,
  showDateRange = true,
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.stores.length > 0 ||
    filters.sku.trim() !== '' ||
    filters.orderId.trim() !== '' ||
    filters.dateRange !== undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter and search through the data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Always visible: Store filter and SKU search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="store-filter">Stores</Label>
            <StoreFilter
              stores={stores}
              selectedStores={filters.stores}
              onStoreChange={(storeIds) => updateFilter('stores', storeIds)}
              placeholder="All stores"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku-search">SKU Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="sku-search"
                placeholder="Search by SKU..."
                value={filters.sku}
                onChange={(e) => updateFilter('sku', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Selected stores display */}
        {filters.stores.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Stores:</Label>
            <SelectedStoresDisplay
              stores={stores}
              selectedStores={filters.stores}
              onRemoveStore={(storeId) =>
                updateFilter(
                  'stores',
                  filters.stores.filter((id) => id !== storeId)
                )
              }
            />
          </div>
        )}

        {/* Expandable filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showOrderId && (
                <div className="space-y-2">
                  <Label htmlFor="order-search">Order ID Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="order-search"
                      placeholder="Search by Order ID..."
                      value={filters.orderId}
                      onChange={(e) => updateFilter('orderId', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {showDateRange && (
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.from ? (
                          filters.dateRange.to ? (
                            <>
                              {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                              {format(filters.dateRange.to, 'LLL dd, y')}
                            </>
                          ) : (
                            format(filters.dateRange.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={filters.dateRange?.from}
                        selected={filters.dateRange}
                        onSelect={(range) => updateFilter('dateRange', range)}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sort-by">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="storeName">Store Name</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    {showOrderId && (
                      <SelectItem value="orderId">Order ID</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-order">Sort Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: 'asc' | 'desc') =>
                    updateFilter('sortOrder', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filters.stores.length > 0 &&
                  `${filters.stores.length} stores, `}
                {filters.sku && 'SKU filter, '}
                {filters.orderId && 'Order ID filter, '}
                {filters.dateRange && 'Date range, '}
                active
              </span>
              <span className="text-xs">Click Reset to clear all filters</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

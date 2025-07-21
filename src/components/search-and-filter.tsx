"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Store, CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface SearchAndFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  storeFilter: string
  onStoreChange: (value: string) => void
  stores: Array<{ id: string; name: string }>
  onClearAll: () => void
  hasActiveFilters: boolean
}

export function SearchAndFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  storeFilter,
  onStoreChange,
  stores,
  onClearAll,
  hasActiveFilters,
}: SearchAndFilterProps) {
  return (
    <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-3 items-end">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Start Date
            </Label>
            <div className="relative">
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="pl-10 bg-white"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              End Date
            </Label>
            <div className="relative">
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="pl-10 bg-white"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Store Filter */}
          <div className="space-y-2">
            <Label htmlFor="storeFilter" className="text-sm font-medium">
              Store
            </Label>
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <Select value={storeFilter} onValueChange={onStoreChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClearAll} className="flex items-center space-x-2">
              <X className="h-4 w-4" />
              <span>Clear All Filters</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

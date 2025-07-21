"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FilterStatusProps {
  filters: {
    startDate: string
    endDate: string
    storeId: string
  }
  stores: Array<{ id: string; name: string }>
  onClearFilter: (key: string) => void
  onClearAll: () => void
}

export function FilterStatus({ filters, stores, onClearFilter, onClearAll }: FilterStatusProps) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== "")

  if (activeFilters.length === 0) return null

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <span className="text-sm font-medium text-blue-900">Active Filters:</span>
        {filters.startDate && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>From: {new Date(filters.startDate).toLocaleDateString()}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onClearFilter("startDate")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.endDate && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>To: {new Date(filters.endDate).toLocaleDateString()}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onClearFilter("endDate")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.storeId && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>Store: {stores.find((s) => s.id === filters.storeId)?.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onClearFilter("storeId")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={onClearAll}>
        Clear All Filters
      </Button>
    </div>
  )
}

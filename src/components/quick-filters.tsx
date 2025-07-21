"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, TrendingUp, BarChart3 } from "lucide-react"

interface QuickFiltersProps {
  onQuickFilter: (type: string) => void
  activeFilter: string
}

export function QuickFilters({ onQuickFilter, activeFilter }: QuickFiltersProps) {
  const quickFilters = [
    { id: "today", label: "Today", icon: Clock, color: "bg-blue-500" },
    { id: "yesterday", label: "Yesterday", icon: Calendar, color: "bg-gray-500" },
    { id: "this-week", label: "This Week", icon: TrendingUp, color: "bg-green-500" },
    { id: "this-month", label: "This Month", icon: BarChart3, color: "bg-purple-500" },
    { id: "last-month", label: "Last Month", icon: Calendar, color: "bg-orange-500" },
    { id: "last-7-days", label: "Last 7 Days", icon: TrendingUp, color: "bg-indigo-500" },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id

        return (
          <Button
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onQuickFilter(filter.id)}
            className={`flex items-center space-x-2 ${
              isActive ? `${filter.color} text-white hover:opacity-90` : "hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
            {isActive && (
              <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                Active
              </Badge>
            )}
          </Button>
        )
      })}
    </div>
  )
}

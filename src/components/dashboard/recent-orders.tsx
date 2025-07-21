"use client"

import { useQuery } from "@tanstack/react-query"
import { getRecentOrders } from "@/lib/api/orders"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

export function RecentOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () => getRecentOrders(5),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 ml-auto" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders?.map((order) => (
        <div key={order.id} className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">{order.customer.name.charAt(0)}</span>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customer.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                order.status === "completed" ? "default" : order.status === "pending" ? "secondary" : "destructive"
              }
            >
              {order.status}
            </Badge>
            <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, X } from "lucide-react"
import { useState } from "react"

export function HelpTooltip() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowHelp(!showHelp)}
        className="flex items-center space-x-2"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Help</span>
      </Button>

      {showHelp && (
        <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">How to Use Dashboard</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600">Quick Filters</h4>
              <p className="text-gray-600">Click buttons like "Today", "This Week" for instant filtering</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600">Search Orders</h4>
              <p className="text-gray-600">Type order ID or keywords to find specific orders</p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600">Store Filter</h4>
              <p className="text-gray-600">Select specific store to view its performance only</p>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600">Custom Dates</h4>
              <p className="text-gray-600">Use date pickers for custom date ranges</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

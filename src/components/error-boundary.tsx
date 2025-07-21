"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  error: string
  onRetry: () => void
}

export function ErrorBoundary({ error, onRetry }: ErrorBoundaryProps) {
  return (
    <Card className="border-2 border-red-200 bg-red-50/30">
      <CardHeader>
        <CardTitle className="flex items-center text-red-700">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Error Loading Data
        </CardTitle>
        <CardDescription>There was a problem fetching your sales data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-100 p-3 rounded-lg border border-red-200">
          <p className="text-sm text-red-800 font-mono">{error}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-red-900">Troubleshooting Steps:</h4>
          <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
            <li>Check if your API URL is correct</li>
            <li>Verify your API is running and accessible</li>
            <li>Check your network connection</li>
            <li>Ensure API returns data in the expected format</li>
          </ul>
        </div>

        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}

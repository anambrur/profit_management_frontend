"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Globe, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { apiService } from "../services/api"

interface ApiSettingsProps {
  onApiUrlChange: (url: string) => void
  onRefresh: () => void
}

export function ApiSettings({ onApiUrlChange, onRefresh }: ApiSettingsProps) {
  const [apiUrl, setApiUrl] = useState("https://your-api-domain.com/api")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [showSettings, setShowSettings] = useState(false)

  const handleUpdateApiUrl = () => {
    onApiUrlChange(apiUrl)
    setConnectionStatus("idle")
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      const isConnected = await apiService.testConnection()
      setConnectionStatus(isConnected ? "success" : "error")
    } catch (error) {
      setConnectionStatus("error")
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setShowSettings(!showSettings)} className="flex items-center space-x-2">
        <Settings className="h-4 w-4" />
        <span>API Settings</span>
      </Button>

      {showSettings && (
        <Card className="border-2 border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-orange-600" />
              API Configuration
            </CardTitle>
            <CardDescription>Configure your API endpoint and test the connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API Base URL</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://your-api-domain.com/api"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter your complete API base URL. The dashboard will append endpoints like /sales-data
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button onClick={handleUpdateApiUrl} size="sm">
                  Update API URL
                </Button>
                <Button onClick={testConnection} variant="outline" size="sm" disabled={isTestingConnection}>
                  {isTestingConnection ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>

              {connectionStatus !== "idle" && (
                <Badge
                  variant={connectionStatus === "success" ? "default" : "destructive"}
                  className={
                    connectionStatus === "success"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }
                >
                  {connectionStatus === "success" ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {connectionStatus === "success" ? "Connected" : "Connection Failed"}
                </Badge>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Expected API Response Format:</h4>
              <pre className="text-xs text-blue-800 overflow-x-auto">
                {`{
  "data": {
    "today": { "period": {...}, "summary": {...}, "orderAnalysis": {...} },
    "yesterday": { "period": {...}, "summary": {...}, "orderAnalysis": {...} },
    "thisMonth": { "period": {...}, "summary": {...}, "orderAnalysis": {...} },
    "lastMonth": { "period": {...}, "summary": {...}, "orderAnalysis": {...} }
  }
}`}
              </pre>
            </div>

            <Button onClick={onRefresh} className="w-full" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data with New Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

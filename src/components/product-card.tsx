import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ExternalLink, AlertTriangle } from "lucide-react"

interface Product {
  id: number
  mart: string
  sku: string
  condition: string
  availability: string
  wpid: string
  upc: string
  gtin: string
  product_name: string
  product_type: string
  on_hand: number
  available: number
  published_status: string
  lifecycle_status: string
  store_id: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "In_stock":
        return "bg-green-100 text-green-800"
      case "Out_of_stock":
        return "bg-red-100 text-red-800"
      case "Limited_stock":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isLowStock = product.on_hand <= 2 && product.on_hand > 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <Badge variant="outline" className="text-xs">
              {product.product_type}
            </Badge>
          </div>
          {isLowStock && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
        </div>
        <CardTitle className="text-lg leading-tight">{product.product_name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">SKU:</span>
            <span className="text-sm font-mono">{product.sku}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge className={getAvailabilityColor(product.availability)}>
              {product.availability.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">On Hand:</span>
            <span className={`text-sm font-semibold ${isLowStock ? "text-yellow-600" : ""}`}>{product.on_hand}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Available:</span>
            <span className="text-sm font-semibold">{product.available}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div>
              <span className="block">UPC:</span>
              <span className="font-mono">{product.upc}</span>
            </div>
            <div>
              <span className="block">Store ID:</span>
              <span className="font-mono">{product.store_id}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button size="sm" className="flex-1">
            Update Stock
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

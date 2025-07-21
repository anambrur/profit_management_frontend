"use client"

import { useState, useEffect } from "react"
import { PurchaseHistoryTable } from "./purchase-history-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react"
import { ProductTable } from "./product-table"

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
  created_at: string
  updated_at: string
}

interface PurchaseHistory {
  id: number
  product_id: number
  quantity: number
  cost_of_price: number
  sell_price: number
  purchase_date: string
  product_name?: string
  sku?: string
}

export function ProductDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - in a real app, this would come from your database
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 1,
        mart: "WALMART_US",
        sku: "0044387030151",
        condition: "New",
        availability: "In_stock",
        wpid: "76666L8CSUZK",
        upc: "044387030151",
        gtin: "00044387030151",
        product_name: "DeLonghi Capsule Compact Ceramic Heater in White",
        product_type: "Space Heaters",
        on_hand: 0,
        available: 0,
        published_status: "PUBLISHED",
        lifecycle_status: "ACTIVE",
        store_id: "10002764712",
        created_at: "2025-06-16T12:00:00Z",
        updated_at: "2025-06-16T12:00:00Z",
      },
      {
        id: 2,
        mart: "WALMART_US",
        sku: "0044387030152",
        condition: "New",
        availability: "In_stock",
        wpid: "76666L8CSUZL",
        upc: "044387030152",
        gtin: "00044387030152",
        product_name: "DeLonghi Tower Ceramic Heater in Black",
        product_type: "Space Heaters",
        on_hand: 5,
        available: 3,
        published_status: "PUBLISHED",
        lifecycle_status: "ACTIVE",
        store_id: "10002764712",
        created_at: "2025-06-16T12:00:00Z",
        updated_at: "2025-06-16T12:00:00Z",
      },
      {
        id: 3,
        mart: "WALMART_US",
        sku: "0044387030153",
        condition: "New",
        availability: "Out_of_stock",
        wpid: "76666L8CSUZM",
        upc: "044387030153",
        gtin: "00044387030153",
        product_name: "DeLonghi Oil-Filled Radiator Heater",
        product_type: "Space Heaters",
        on_hand: 0,
        available: 0,
        published_status: "PUBLISHED",
        lifecycle_status: "ACTIVE",
        store_id: "10002764712",
        created_at: "2025-06-16T12:00:00Z",
        updated_at: "2025-06-16T12:00:00Z",
      },
    ]

    const mockPurchaseHistory: PurchaseHistory[] = [
      {
        id: 1,
        product_id: 1,
        quantity: 0,
        cost_of_price: 0,
        sell_price: 26,
        purchase_date: "2025-06-03T06:52:18.689Z",
        product_name: "DeLonghi Capsule Compact Ceramic Heater in White",
        sku: "0044387030151",
      },
      {
        id: 2,
        product_id: 2,
        quantity: 2,
        cost_of_price: 45,
        sell_price: 89.99,
        purchase_date: "2025-06-02T14:30:00.000Z",
        product_name: "DeLonghi Tower Ceramic Heater in Black",
        sku: "0044387030152",
      },
      {
        id: 3,
        product_id: 3,
        quantity: 1,
        cost_of_price: 75,
        sell_price: 149.99,
        purchase_date: "2025-06-01T09:15:00.000Z",
        product_name: "DeLonghi Oil-Filled Radiator Heater",
        sku: "0044387030153",
      },
    ]

    setProducts(mockProducts)
    setPurchaseHistory(mockPurchaseHistory)
    setLoading(false)
  }, [])

  const totalProducts = products.length
  const inStockProducts = products.filter((p) => p.availability === "In_stock").length
  const totalInventory = products.reduce((sum, p) => sum + p.on_hand, 0)
  const totalRevenue = purchaseHistory.reduce((sum, p) => sum + p.sell_price * p.quantity, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">{inStockProducts} in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventory}</div>
            <p className="text-xs text-muted-foreground">Units on hand</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {purchaseHistory.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.on_hand <= 2).length}</div>
            <p className="text-xs text-muted-foreground">Products need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>Manage your Walmart product catalog and inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTable
                products={products}
                onProductUpdate={(updatedProduct) => {
                  setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>View all purchase transactions and sales data</CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseHistoryTable purchaseHistory={purchaseHistory} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

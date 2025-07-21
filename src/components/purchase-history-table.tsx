import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

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

interface PurchaseHistoryTableProps {
  purchaseHistory: PurchaseHistory[]
}

export function PurchaseHistoryTable({ purchaseHistory }: PurchaseHistoryTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const calculateProfit = (sellPrice: number, costPrice: number, quantity: number) => {
    return (sellPrice - costPrice) * quantity
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Cost Price</TableHead>
            <TableHead className="text-right">Sell Price</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time Ago</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No purchase history found
              </TableCell>
            </TableRow>
          ) : (
            purchaseHistory.map((purchase) => {
              const profit = calculateProfit(purchase.sell_price, purchase.cost_of_price, purchase.quantity)

              return (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={purchase.product_name}>
                      {purchase.product_name || "Unknown Product"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {purchase.sku}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{purchase.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(purchase.cost_of_price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(purchase.sell_price)}</TableCell>
                  <TableCell className="text-right">
                    <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(profit)}</span>
                  </TableCell>
                  <TableCell>{formatDate(purchase.purchase_date)}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{getTimeAgo(purchase.purchase_date)}</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

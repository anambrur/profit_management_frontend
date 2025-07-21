'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import {
  Barcode,
  CalendarDays,
  CreditCard,
  DollarSign,
  Hash,
  MapPin,
  Package,
} from 'lucide-react';
import { useParams } from 'next/navigation';

// Sample data based on the provided JSON structure
export interface Supplier {
  name: string;
  link: string;
  _id: string;
}

export interface HistoryEntry {
  _id: string;
  productId: string;
  storeID: string;
  orderId: string;
  purchaseQuantity: number;
  receiveQuantity: number;
  lostQuantity: number;
  sendToWFS: number;
  status: string;
  upc: string;
  costOfPrice: number;
  sellPrice: number;
  email: string;
  card: string;
  supplier: Supplier;
  totalPrice: string;
  date: string; // ISO date string
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  mart: string;
  sku: string;
  condition: string;
  availability: string;
  wpid: string;
  upc: string;
  gtin: string;
  productName: string;
  productType: string;
  onHand: number;
  available: number;
  publishedStatus: string;
  lifecycleStatus: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
  id: string;
  history: HistoryEntry[];
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { data: product } = useQuery({
    queryKey: ['productsHistoryList', id],
    queryFn: async (): Promise<Product> => {
      const res = await axiosInstance.get(
        `/api/product-history/get-product-history-list/${id}`
      );
      return res.data.data;
    },
  });
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'in_stock':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            In Stock
          </Badge>
        );
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Active
          </Badge>
        );
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      case 'published':
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            Published
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            {product?.productName}
          </h1>
          <p className="text-xl text-slate-600">
            Product Details & Transaction History
          </p>
        </div>

        {/* Product Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Product Type
                  </label>
                  <p className="text-slate-900 font-medium">
                    {product?.productType}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Condition
                  </label>
                  <p className="text-slate-900 font-medium">
                    {product?.condition}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Marketplace
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <p className="text-slate-900 font-medium">
                      {product?.mart}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Codes */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Barcode className="w-5 h-5 text-green-600" />
                Product Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    SKU
                  </label>
                  <p className="text-slate-900 font-mono text-sm">
                    {product?.sku}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    UPC
                  </label>
                  <p className="text-slate-900 font-mono text-sm">
                    {product?.upc}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    GTIN
                  </label>
                  <p className="text-slate-900 font-mono text-sm">
                    {product?.gtin}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    WPID
                  </label>
                  <p className="text-slate-900 font-mono text-sm">
                    {product?.wpid}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Inventory */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hash className="w-5 h-5 text-purple-600" />
                Status & Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Availability
                  </label>
                  <div className="mt-1">
                    {getAvailabilityBadge(product?.availability as string)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Lifecycle Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(product?.lifecycleStatus as string)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Published Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(product?.publishedStatus as string)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      On Hand
                    </label>
                    <p className="text-2xl font-bold text-slate-900">
                      {product?.onHand}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Available
                    </label>
                    <p className="text-2xl font-bold text-slate-900">
                      {product?.available}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product History Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarDays className="w-6 h-6 text-orange-600" />
              Product Transaction History
            </CardTitle>
            <p className="text-slate-600">
              Complete history of all transactions and updates for this product
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Quantity
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Cost Price
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Sell Price
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Card
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Supplier
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Total Price
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product?.history.map((record: any, index: number) => (
                    <TableRow
                      key={record._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">
                            {formatDate(record.date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <div>Purchase: {record.purchaseQuantity}</div>
                          <div>Received: {record.receiveQuantity}</div>
                          <div>Lost: {record.lostQuantity}</div>
                          <div>Sent to WFS: {record.sendToWFS}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            {record.costOfPrice === 0
                              ? 'N/A'
                              : formatCurrency(record.costOfPrice)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            {formatCurrency(record.sellPrice)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 truncate">
                          {record.email || (
                            <span className="text-slate-400 italic">
                              Not specified
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-slate-500" />
                          <span className="font-mono text-sm">
                            {record.supplier?.name ? (
                              <a
                                href={record.supplier.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                {record.supplier.name}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">
                                Not specified
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.supplier || (
                          <span className="text-slate-400 italic">
                            Not specified
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">
                            {record.totalPrice === '0'
                              ? 'N/A'
                              : formatCurrency(parseFloat(record.totalPrice))}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {product?.history.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No transaction history available</p>
                <p className="text-sm">
                  Transaction records will appear here when available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Information */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {formatDate(product?.createdAt || '')}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {formatDate(product?.updatedAt || '')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOrders } from '@/hooks/userOrder';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
export interface OrderedProduct {
  _id: string;
  quantity: number;
  productName: string;
  imageUrl: string;
  productSKU: string;
  PurchasePrice: string;
  sellPrice: string;
  tax: string;
  shipping: string;
}

export interface Order {
  _id: string;
  storeId: string;
  shipNodeType: 'SellerFulfilled' | 'Other';
  customerOrderId: string;
  status: 'Acknowledged' | 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
  customerName: string;
  customerAddress: string;
  products: OrderedProduct[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ApiResponse {
  success: boolean;
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
// Sample orders data (you can replace this with your actual data)
const sampleOrdersData = {
  success: true,
  orders: [
    {
      _id: '1',
      storeId: '10002603130',
      shipNodeType: 'SellerFulfilled' as const,
      customerOrderId: '200013346058713',
      status: 'Acknowledged' as const,
      orderDate: '2025-08-03T14:06:58.622Z',
      customerName: 'John Doe',
      customerAddress: '123 Main St, New York, NY 10001',
      products: [
        {
          _id: 'p1',
          quantity: 2,
          productName: 'Wireless Bluetooth Headphones with Noise Cancellation',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '1594695612',
          PurchasePrice: '45.00',
          sellPrice: '89.99',
          tax: '7.20',
          shipping: '5.99',
        },
      ],
      createdAt: '2025-08-03T14:06:58.622Z',
      updatedAt: '2025-08-03T14:06:58.622Z',
      __v: 0,
    },
    {
      _id: '2',
      storeId: '10002603130',
      shipNodeType: 'SellerFulfilled' as const,
      customerOrderId: '200013344132758',
      status: 'Shipped' as const,
      orderDate: '2025-08-02T10:30:00.000Z',
      customerName: 'Jane Smith',
      customerAddress: '456 Oak Ave, Los Angeles, CA 90210',
      products: [
        {
          _id: 'p2',
          quantity: 1,
          productName: 'Smart Fitness Watch with Heart Rate Monitor',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '630996426920',
          PurchasePrice: '120.00',
          sellPrice: '199.99',
          tax: '16.00',
          shipping: '0.00',
        },
        {
          _id: 'p3',
          quantity: 1,
          productName: 'Wireless Charging Pad',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '0845423021450',
          PurchasePrice: '15.00',
          sellPrice: '29.99',
          tax: '2.40',
          shipping: '0.00',
        },
      ],
      createdAt: '2025-08-02T10:30:00.000Z',
      updatedAt: '2025-08-02T12:45:00.000Z',
      __v: 0,
    },
    {
      _id: '3',
      storeId: '10002603130',
      shipNodeType: 'SellerFulfilled' as const,
      customerOrderId: '200013240251105',
      status: 'Delivered' as const,
      orderDate: '2025-08-01T16:20:00.000Z',
      customerName: 'Mike Johnson',
      customerAddress: '789 Pine St, Chicago, IL 60601',
      products: [
        {
          _id: 'p4',
          quantity: 3,
          productName: 'USB-C Fast Charging Cable 6ft',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '194735270088',
          PurchasePrice: '8.00',
          sellPrice: '15.99',
          tax: '1.28',
          shipping: '3.99',
        },
      ],
      createdAt: '2025-08-01T16:20:00.000Z',
      updatedAt: '2025-08-03T09:15:00.000Z',
      __v: 0,
    },
    {
      _id: '4',
      storeId: '10002603130',
      shipNodeType: 'SellerFulfilled' as const,
      customerOrderId: '200013361351606',
      status: 'Pending' as const,
      orderDate: '2025-08-01T09:15:00.000Z',
      customerName: 'Sarah Wilson',
      customerAddress: '321 Elm St, Miami, FL 33101',
      products: [
        {
          _id: 'p5',
          quantity: 1,
          productName: 'Bluetooth Speaker Waterproof',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '194735120093',
          PurchasePrice: '25.00',
          sellPrice: '49.99',
          tax: '4.00',
          shipping: '4.99',
        },
      ],
      createdAt: '2025-08-01T09:15:00.000Z',
      updatedAt: '2025-08-01T09:15:00.000Z',
      __v: 0,
    },
    {
      _id: '5',
      storeId: '10002603130',
      shipNodeType: 'SellerFulfilled' as const,
      customerOrderId: '200013147004984',
      status: 'Cancelled' as const,
      orderDate: '2025-07-31T18:30:00.000Z',
      customerName: 'David Brown',
      customerAddress: '654 Maple Ave, Seattle, WA 98101',
      products: [
        {
          _id: 'p6',
          quantity: 2,
          productName: 'Gaming Mouse RGB LED',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '745577987742',
          PurchasePrice: '30.00',
          sellPrice: '59.99',
          tax: '4.80',
          shipping: '0.00',
        },
      ],
      createdAt: '2025-07-31T18:30:00.000Z',
      updatedAt: '2025-08-01T10:20:00.000Z',
      __v: 0,
    },
    {
      _id: '6',
      storeId: '10002603130',
      shipNodeType: 'SellerFulfilled' as const,
      customerOrderId: '200013306420334',
      status: 'Delivered' as const,
      orderDate: '2025-07-30T14:45:00.000Z',
      customerName: 'Emily Davis',
      customerAddress: '987 Oak Blvd, Austin, TX 78701',
      products: [
        {
          _id: 'p7',
          quantity: 1,
          productName: 'Smartphone Case Clear Protective',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '0857538000015',
          PurchasePrice: '5.00',
          sellPrice: '12.99',
          tax: '1.04',
          shipping: '2.99',
        },
        {
          _id: 'p8',
          quantity: 1,
          productName: 'Screen Protector Tempered Glass',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '630996255506',
          PurchasePrice: '3.00',
          sellPrice: '9.99',
          tax: '0.80',
          shipping: '0.00',
        },
      ],
      createdAt: '2025-07-30T14:45:00.000Z',
      updatedAt: '2025-08-02T16:30:00.000Z',
      __v: 0,
    },
    {
      _id: '7',
      storeId: '10002603130',
      shipNodeType: 'SellerFulfilled' as const,
      customerOrderId: '200013306420334',
      status: 'Delivered' as const,
      orderDate: '2025-07-30T14:45:00.000Z',
      customerName: 'Emily Davis',
      customerAddress: '987 Oak Blvd, Austin, TX 78701',
      products: [
        {
          _id: 'p8',
          quantity: 1,
          productName: 'Smartphone Case Clear Protective',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '0857538000015',
          PurchasePrice: '5.00',
          sellPrice: '12.99',
          tax: '1.04',
          shipping: '2.99',
        },
        {
          _id: 'p8',
          quantity: 1,
          productName: 'Screen Protector Tempered Glass',
          imageUrl: '/placeholder.svg?height=80&width=80',
          productSKU: '630996255506',
          PurchasePrice: '3.00',
          sellPrice: '9.99',
          tax: '0.80',
          shipping: '0.00',
        },
      ],
      createdAt: '2025-07-30T14:45:00.000Z',
      updatedAt: '2025-08-02T16:30:00.000Z',
      __v: 0,
    },
  ],
  total: 25,
  page: 1,
  limit: 6,
  pages: 5,
};

// Sample stores data
const sampleStores = [
  { _id: '1', storeId: '10002603130', storeName: 'AffordableEssentials Main' },
  { _id: '2', storeId: '10002603131', storeName: 'AffordableEssentials North' },
  { _id: '3', storeId: '10002603132', storeName: 'AffordableEssentials South' },
  { _id: '4', storeId: '10002603133', storeName: 'AffordableEssentials East' },
  { _id: '5', storeId: '10002603134', storeName: 'AffordableEssentials West' },
];

export default function OrdersCards() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [storeId, setStoreId] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const { data, isLoading, error, refetch, isFetching } = useOrders({
    page,
    limit,
    search,
    status,
    storeId,
  });
  // Using sample data - replace with your actual hook

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Acknowledged':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const calculateOrderTotal = (products: any[]) => {
    return products
      .reduce(
        (total, product) =>
          total +
          (Number(product.sellPrice) || 0) * product.quantity +
          (Number(product.tax) || 0),
        0
      )
      .toFixed(2);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setSelectedStores([]);
    setPage(1);
  };

  const hasFilters = search || status || selectedStores.length > 0;

  const MultiStoreSelect = () => {
    const [open, setOpen] = useState(false);

    const handleStoreToggle = (storeId: string) => {
      setSelectedStores((prev) =>
        prev.includes(storeId)
          ? prev.filter((id) => id !== storeId)
          : [...prev, storeId]
      );
    };

    const selectedStoreNames = selectedStores.map(
      (storeId) =>
        sampleStores.find((store) => store.storeId === storeId)?.storeName ||
        storeId
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[200px] justify-between bg-transparent"
          >
            {selectedStores.length === 0
              ? 'Select Stores'
              : selectedStores.length === 1
              ? selectedStoreNames[0]
              : `${selectedStores.length} stores selected`}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <div className="p-4">
            <h4 className="font-medium leading-none mb-3">Select Stores</h4>
            <div className="space-y-2">
              {sampleStores.map((store) => (
                <div key={store._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={store.storeId}
                    checked={selectedStores.includes(store.storeId)}
                    onCheckedChange={() => handleStoreToggle(store.storeId)}
                  />
                  <label
                    htmlFor={store.storeId}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {store.storeName}
                  </label>
                </div>
              ))}
            </div>
            {selectedStores.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStores([])}
                  className="w-full"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
          <p className="text-destructive mb-4">Error loading orders</p>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.orders.length === 0) {
    return (
      <div className="rounded-lg border bg-card shadow-sm p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No orders found.</p>
        {hasFilters && (
          <Button onClick={clearFilters} variant="outline">
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header and Filters */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <Input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <MultiStoreSelect />
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              {search && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 py-1"
                >
                  Search: {search}
                  <button
                    onClick={() => setSearch('')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {status && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 py-1"
                >
                  Status: {status}
                  <button
                    onClick={() => setStatus('')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedStores.length > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 py-1"
                >
                  Stores: {selectedStores.length} selected
                  <button
                    onClick={() => setSelectedStores([])}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Orders Grid - Updated for 6 cards per page */}
        <div className=" h-screen overflow-y-scroll hide-scrollbar grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.orders.map((order: Order) => (
            <Card key={order._id} className=" shadow-none h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-primary">
                      #{order.customerOrderId}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Store: {order.storeId}
                      </Badge>
                      <Badge
                        className={`text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${calculateOrderTotal(order.products)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{order.customerName}</p>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <p className="text-xs text-muted-foreground cursor-pointer hover:text-foreground truncate">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {order.customerAddress}
                        </p>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">
                            Shipping Address
                          </p>
                          <p className="text-sm">{order.customerAddress}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">
                      Products ({order.products.length})
                    </span>
                  </div>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {order.products.map((product) => (
                      <div
                        key={product._id}
                        className="flex gap-3 p-2 bg-background rounded-md border"
                      >
                        <div className="relative h-12 w-12 rounded-md overflow-hidden border flex-shrink-0">
                          <Image
                            src={
                              product.imageUrl ||
                              '/placeholder.svg?height=48&width=48'
                            }
                            alt={product.productName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-medium text-sm line-clamp-2 cursor-pointer truncate">
                                {product.productName}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="w-80 ">
                              <p>{product.productName}</p>
                            </TooltipContent>
                          </Tooltip>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {product.productSKU}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Qty: {product.quantity}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-semibold text-green-600">
                              ${product.sellPrice}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Tax: ${product.tax}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium">Order Date</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-medium">Shipping</span>
                    </div>
                    <div className="pl-6">
                      <Badge variant="outline" className="text-xs">
                        {order.shipNodeType}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${order.products[0]?.shipping || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[6, 12, 18, 24, 30].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {data.page} of {data.pages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
                onClick={() => setPage(1)}
                disabled={data.page === 1 || isFetching}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={data.page === 1 || isFetching}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => setPage(Math.min(data.pages, page + 1))}
                disabled={data.page === data.pages || isFetching}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
                onClick={() => setPage(data.pages)}
                disabled={data.page === data.pages || isFetching}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              {(data.page - 1) * data.limit + 1}-
              {Math.min(data.page * data.limit, data.total)} of {data.total}
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

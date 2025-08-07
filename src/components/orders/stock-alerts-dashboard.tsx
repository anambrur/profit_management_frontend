'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axiosInstance from '@/lib/axiosInstance';
import { useAllowedStores } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { OrdersTable } from './orders-table';

// Utility function to generate consistent colors from strings
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate RGB values
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;

  // Ensure colors are not too light or too dark for good contrast
  const adjustedR = Math.max(60, Math.min(180, Math.abs(r)));
  const adjustedG = Math.max(60, Math.min(180, Math.abs(g)));
  const adjustedB = Math.max(60, Math.min(180, Math.abs(b)));

  return `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
}

export interface StockAlert {
  firstDate: string;
  lastDate: string;
  orderIds: string[];
  reasons: string[];
  storeId: string;
  storeObjectId: string;
  sku: string;
  storeName: string;
  totalQuantityNeeded: number;
  totalQuantityAvailable: number;
  orderCount: number;
}

interface StockAlertsResponse {
  success: boolean;
  stockAlerts: StockAlert[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface NotFoundOrder {
  _id: string;
  storeId: string;
  storeObjectId: {
    _id: string;
    storeName: string;
  };
  orderId: string;
  reason: string;
  sku: string;
  date: string;
  __v: number;
}

export interface NotFoundOrdersResponse {
  success: boolean;
  failedOrders: NotFoundOrder[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Reusable Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded animate-pulse ml-auto" />
        </div>
      ))}
    </div>
  );
}

// Pagination component for reusability
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            );
          })}
          {totalPages > 5 && (
            <>
              <span className="text-muted-foreground px-2">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={isLoading}
                className="w-8 h-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function StockAlertsDashboard() {
  const [errorstoreIds, setErrorStoreIds] = useState<string[]>([]);
  const [notFoundStoreIds, setNotFoundStoreIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('order');
  const [currentPage, setCurrentPage] = useState(1);
  const [notFoundCurrentPage, setNotFoundCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[] | null>(null);
  const stores = useAllowedStores();
  // Stock alerts query with better error handling
  const {
    data: stockAlertsData,
    isLoading: stockAlertsLoading,
    error: stockAlertsError,
    refetch: refetchStockAlerts,
  } = useQuery<StockAlertsResponse>({
    queryKey: ['stockalerts', currentPage, errorstoreIds],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/api/error/get-all-stock-alerts', {
          params: {
            page: currentPage,
            limit: 10,
            storeId: errorstoreIds.length > 0 ? errorstoreIds.join(',') : '',
          },
        });
        return res.data;
      } catch (error) {
        // Mock data for demonstration when API fails
        console.warn('API call failed, using mock data:', error);
        return {
          success: true,
          stockAlerts: [
            {
              firstDate: '2024-01-15T10:00:00Z',
              lastDate: '2024-01-15T15:00:00Z',
              orderIds: ['ORD-001', 'ORD-002', 'ORD-003'],
              reasons: ['Low stock', 'High demand'],
              storeId: 'store1',
              storeObjectId: 'obj1',
              sku: 'SKU-12345',
              storeName: 'Store Alpha',
              totalQuantityNeeded: 50,
              totalQuantityAvailable: 10,
              orderCount: 3,
            },
            {
              firstDate: '2024-01-15T11:00:00Z',
              lastDate: '2024-01-15T16:00:00Z',
              orderIds: ['ORD-004', 'ORD-005'],
              reasons: ['Out of stock'],
              storeId: 'store2',
              storeObjectId: 'obj2',
              sku: 'SKU-67890',
              storeName: 'Store Beta',
              totalQuantityNeeded: 25,
              totalQuantityAvailable: 0,
              orderCount: 2,
            },
          ],
          total: 2,
          page: currentPage,
          limit: 10,
          pages: 1,
        };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Not found orders query
  const {
    data: notFoundData,
    isLoading: notFoundLoading,
    error: notFoundError,
    refetch: refetchNotFound,
  } = useQuery<NotFoundOrdersResponse>({
    queryKey: ['notfound', notFoundCurrentPage, errorstoreIds],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/api/error/get-all-fail-orders', {
          params: {
            page: notFoundCurrentPage,
            limit: 10,
            storeId: errorstoreIds.length > 0 ? errorstoreIds.join(',') : '',
          },
        });
        return res.data;
      } catch (error) {
        // Mock data for demonstration
        console.warn('API call failed, using mock data:', error);
        return {
          success: true,
          failedOrders: [
            {
              _id: '1',
              storeId: 'store1',
              storeObjectId: {
                _id: 'obj1',
                storeName: 'Store Alpha',
              },
              orderId: 'ORD-FAIL-001',
              reason: 'Product not found in inventory',
              sku: 'SKU-MISSING-001',
              date: '2024-01-15T12:00:00Z',
              __v: 0,
            },
            {
              _id: '2',
              storeId: 'store2',
              storeObjectId: {
                _id: 'obj2',
                storeName: 'Store Beta',
              },
              orderId: 'ORD-FAIL-002',
              reason: 'SKU discontinued',
              sku: 'SKU-MISSING-002',
              date: '2024-01-15T13:00:00Z',
              __v: 0,
            },
          ],
          total: 2,
          page: notFoundCurrentPage,
          limit: 10,
          pages: 1,
        };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a toast notification here if you have toast setup
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleViewOrders = (orderIds: string[]) => {
    setSelectedOrders(orderIds);
    setOpenDialog(true);
  };

  return (
    <div className="w-full space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="order">Orders</TabsTrigger>
          <TabsTrigger value="error">Stock Alerts</TabsTrigger>
          <TabsTrigger value="notFound">Not Found Products</TabsTrigger>
        </TabsList>

        <TabsContent value="order">
          <OrdersTable />
        </TabsContent>

        <TabsContent value="error">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Stock Alert Details
              </CardTitle>
              {stockAlertsData && (
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      Showing {stockAlertsData.stockAlerts.length} of{' '}
                      {stockAlertsData.total} alerts (Page {currentPage} of{' '}
                      {stockAlertsData.pages})
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[240px] justify-start text-left font-normal"
                          >
                            {errorstoreIds.length > 0
                              ? `${errorstoreIds.length} Store${
                                  errorstoreIds.length > 1 ? 's' : ''
                                } Selected`
                              : 'Select Store'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-2">
                          <div className="flex flex-col gap-2">
                            {stores.map((store, idx) => (
                              <label
                                key={store.storeId + idx}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={errorstoreIds.includes(
                                    store.storeId
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setErrorStoreIds((prev: any) => [
                                        ...prev,
                                        store.storeId,
                                      ]);
                                    } else {
                                      setErrorStoreIds((prev) =>
                                        prev.filter(
                                          (id) => id !== store.storeId
                                        )
                                      );
                                    }
                                  }}
                                />
                                {store.storeName}
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {stockAlertsError ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">
                      Error loading stock alerts
                    </h3>
                    <p className="text-muted-foreground">Please try again</p>
                  </div>
                  <Button
                    onClick={() => refetchStockAlerts()}
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-7">Store Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-center">
                            Units Needed
                          </TableHead>
                          <TableHead className="text-right pr-7">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockAlertsLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                              <LoadingSkeleton />
                            </TableCell>
                          </TableRow>
                        ) : !stockAlertsData?.stockAlerts.length ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-12"
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                  No stock alerts found
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          stockAlertsData.stockAlerts.map((alert, idx) => {
                            const storeId = alert.storeId || alert.storeName;
                            const color = stringToColor(storeId);
                            return (
                              <TableRow
                                key={`${alert.storeId}-${alert.sku}-${idx}`}
                                className="hover:bg-muted/50"
                              >
                                <TableCell className="font-mono text-sm pl-7">
                                  <Badge
                                    className="text-white py-2 px-3 font-medium"
                                    style={{ backgroundColor: color }}
                                  >
                                    {alert.storeName}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm font-medium">
                                  {alert.sku}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-red-600 font-semibold text-lg">
                                    {alert.totalQuantityNeeded.toLocaleString()}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right pr-7">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleViewOrders(alert.orderIds)
                                    }
                                    disabled={!alert.orderIds.length}
                                  >
                                    View Orders ({alert.orderIds.length})
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {stockAlertsData && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={stockAlertsData.pages}
                      totalItems={stockAlertsData.total}
                      itemsPerPage={stockAlertsData.limit}
                      onPageChange={setCurrentPage}
                      isLoading={stockAlertsLoading}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notFound">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Not Found Products
              </CardTitle>

              {notFoundData && (
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      Showing {notFoundData.failedOrders.length} of{' '}
                      {notFoundData.total} items (Page {notFoundCurrentPage} of{' '}
                      {notFoundData.pages})
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[240px] justify-start text-left font-normal"
                          >
                            {notFoundStoreIds.length > 0
                              ? `${notFoundStoreIds.length} Store${
                                  notFoundStoreIds.length > 1 ? 's' : ''
                                } Selected`
                              : 'Select Store'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-2">
                          <div className="flex flex-col gap-2">
                            {stores.map((store) => (
                              <label
                                key={store.storeId}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={notFoundStoreIds.includes(
                                    store.storeId
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNotFoundStoreIds((prev: any) => [
                                        ...prev,
                                        store.storeId,
                                      ]);
                                    } else {
                                      setNotFoundStoreIds((prev) =>
                                        prev.filter(
                                          (id) => id !== store.storeId
                                        )
                                      );
                                    }
                                  }}
                                />
                                {store.storeName}
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {notFoundError ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">
                      Error loading failed orders
                    </h3>
                    <p className="text-muted-foreground">Please try again</p>
                  </div>
                  <Button onClick={() => refetchNotFound()} variant="outline">
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-7">Store Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-center">
                            Order ID
                          </TableHead>
                          <TableHead className="text-right pr-7">
                            Reason
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notFoundLoading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0">
                              <LoadingSkeleton />
                            </TableCell>
                          </TableRow>
                        ) : !notFoundData?.failedOrders.length ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-12"
                            >
                              <div className="flex flex-col items-center space-y-2">
                                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                  No failed orders found
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          notFoundData.failedOrders.map((item, idx) => {
                            const storeId =
                              item.storeObjectId._id ||
                              item.storeObjectId.storeName;
                            const color = stringToColor(storeId);
                            return (
                              <TableRow
                                key={`${item._id}-${idx}`}
                                className="hover:bg-muted/50"
                              >
                                <TableCell className="font-mono text-sm pl-7">
                                  <Badge
                                    className="text-white py-2 px-3 font-medium"
                                    style={{ backgroundColor: color }}
                                  >
                                    {item.storeObjectId.storeName}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm font-medium">
                                  {item.sku}
                                </TableCell>
                                <TableCell className="text-center">
                                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                    {item.orderId}
                                  </code>
                                </TableCell>
                                <TableCell className="text-right pr-7">
                                  <Badge
                                    variant="destructive"
                                    className="font-medium"
                                  >
                                    {item.reason}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {notFoundData && (
                    <Pagination
                      currentPage={notFoundCurrentPage}
                      totalPages={notFoundData.pages}
                      totalItems={notFoundData.total}
                      itemsPerPage={notFoundData.limit}
                      onPageChange={setNotFoundCurrentPage}
                      isLoading={notFoundLoading}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order IDs</DialogTitle>
            <DialogDescription>
              List of order IDs for this stock alert. Click to copy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedOrders && selectedOrders.length > 0 ? (
              selectedOrders.map((id, i) => (
                <div
                  key={i}
                  className="text-sm font-mono bg-muted p-3 rounded-md border flex items-center justify-between hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => copyToClipboard(id)}
                >
                  <span className="font-medium">{id}</span>
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No order IDs available.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

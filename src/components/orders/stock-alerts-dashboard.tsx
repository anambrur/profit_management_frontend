'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axiosInstance from '@/lib/axiosInstance';
import { stringToColor } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { OrdersTable } from './orders-table';

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
  date: string; // ISO date string format
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

export default function StockAlertsDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [notFoundCurrentPage, setNotFoundCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[] | null>(null);

  const { data: stockAlertsData, isLoading } = useQuery<StockAlertsResponse>({
    queryKey: ['stockalerts', currentPage],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/error/get-all-stock-alerts', {
        params: {
          page: currentPage,
          limit: 10,
        },
      });
      return res.data;
    },
  });

  const { data: notFoundData } = useQuery<NotFoundOrdersResponse>({
    queryKey: ['notfound', notFoundCurrentPage],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/error/get-all-fail-orders', {
        params: {
          page: notFoundCurrentPage,
          limit: 10,
        },
      });
      return res.data;
    },
  });
  if (!stockAlertsData) return <div>No data found</div>;

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="order">
        <TabsList>
          <TabsTrigger value="order">Order</TabsTrigger>
          <TabsTrigger value="error">Stock Alert</TabsTrigger>
          <TabsTrigger value="notFound">Not Found Product</TabsTrigger>
        </TabsList>
        <TabsContent value="order">
          <OrdersTable />
        </TabsContent>
        <TabsContent value="error">
          <Card>
            <CardHeader>
              <CardTitle>Stock Alert Details</CardTitle>
              <CardDescription>
                Showing {stockAlertsData.stockAlerts.length} of{' '}
                {stockAlertsData.total} alerts (Page {currentPage} of{' '}
                {stockAlertsData.pages})
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        View Orders Id
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <Loader className="animate-spin w-9 h-9" />
                    ) : (
                      stockAlertsData.stockAlerts.map((alert, idx) => {
                        const storeId = alert.storeId || alert.storeName;
                        const color = stringToColor(storeId);

                        return (
                          <TableRow
                            key={idx}
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell className="font-mono text-sm pl-7">
                              <Badge
                                className="text-white py-2  px-5"
                                style={{ backgroundColor: color }}
                              >
                                {alert.storeName}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {alert.sku}
                            </TableCell>
                            <TableCell className="text-center text-red-600 font-semibold">
                              {alert.totalQuantityNeeded}
                            </TableCell>
                            <TableCell className="text-right pr-7">
                              <Button
                                size={'sm'}
                                onClick={() => {
                                  setSelectedOrders(alert.orderIds);
                                  setOpenDialog(true);
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * stockAlertsData.limit + 1} to{' '}
                  {Math.min(
                    currentPage * stockAlertsData.limit,
                    stockAlertsData.total
                  )}{' '}
                  of {stockAlertsData.total} alerts
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.max(1, currentPage - 1));
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, stockAlertsData.pages) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            type="button"
                            key={page}
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                    {stockAlertsData.pages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(stockAlertsData.pages);
                          }}
                          className="w-8 h-8 p-0"
                        >
                          {stockAlertsData.pages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(
                        Math.min(stockAlertsData.pages, currentPage + 1)
                      );
                    }}
                    disabled={currentPage === stockAlertsData.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notFound">
          <Card>
            <CardHeader>
              <CardTitle>Not Found Products</CardTitle>
              <CardDescription>
                items (Page {notFoundCurrentPage} of {notFoundData?.pages})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-7">Store Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-center">Order ID</TableHead>
                      <TableHead className="text-right pr-7">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notFoundData?.failedOrders.map((item, idx: number) => {
                      const storeId =
                        item.storeObjectId._id || item.storeObjectId.storeName;
                      const color = stringToColor(storeId);

                      return (
                        <TableRow
                          key={idx}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-mono text-sm pl-7 ">
                            <Badge
                              className="text-white py-2  px-5"
                              style={{ backgroundColor: color }}
                            >
                              {item.storeObjectId.storeName}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {item.sku}
                          </TableCell>
                          <TableCell className="text-center text-red-600 font-semibold">
                            {item.orderId}
                          </TableCell>
                          <TableCell className="text-right pr-7">
                            {item.reason}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing{' '}
                  {(notFoundCurrentPage - 1) * (notFoundData?.limit || 10) + 1}{' '}
                  to{' '}
                  {Math.min(
                    notFoundCurrentPage * (notFoundData?.limit || 10),
                    notFoundData?.total || 0
                  )}{' '}
                  of {notFoundData?.total} items
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNotFoundCurrentPage(
                        Math.max(1, notFoundCurrentPage - 1)
                      )
                    }
                    disabled={notFoundCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, notFoundData?.pages || 1) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={
                              notFoundCurrentPage === page
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => setNotFoundCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                    {(notFoundData?.pages || 0) > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setNotFoundCurrentPage(notFoundData?.pages || 1)
                          }
                          className="w-8 h-8 p-0"
                        >
                          {notFoundData?.pages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNotFoundCurrentPage(
                        Math.min(
                          notFoundData?.pages || 1,
                          notFoundCurrentPage + 1
                        )
                      )
                    }
                    disabled={
                      notFoundCurrentPage === (notFoundData?.pages || 1)
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order IDs</DialogTitle>
            <DialogDescription>
              List of order IDs for this alert
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedOrders?.map((id, i) => (
              <div
                key={i}
                className="text-sm font-mono bg-muted p-2 rounded-md border"
              >
                {id}
              </div>
            ))}
            {selectedOrders?.length === 0 && (
              <p className="text-muted-foreground">No order IDs available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

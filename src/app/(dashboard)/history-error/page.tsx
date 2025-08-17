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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAllowedStores } from '@/hooks/dashboard-store';
import axiosInstance from '@/lib/axiosInstance';
import { stringToColor } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface FailedUploadRowData {
  date: string;
  orderId: string;
  upc: string | null;
  purchase: string;
  '': string;
  lost: string | null;
  sentToWfs: string | null;
  costPerItem: string;
  status: string;
}

export interface FailedUpload {
  _id: string;
  storeId: string;
  storeObjectId: {
    _id: string;
    storeName: string;
  };
  uploadDate: string;
  fileName: string;
  rowData: FailedUploadRowData;
  upc: string;
  orderId: string;
  reason: string;
  errorDetails: string;
  processed: boolean;
}

export interface FailedUploadsResponse {
  success: boolean;
  failedUploadsResults: FailedUpload[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function FailedUploadsComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const stores = useAllowedStores();

  // ✅ Only fetch when stores are selected
  const { data, isLoading, error } = useQuery<FailedUploadsResponse>({
    queryKey: ['errorhistory', currentPage, storeIds],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/api/error/get-all-fail-uploads-results',
        {
          params: {
            page: currentPage,
            storeId: storeIds.join(','),
          },
        }
      );
      return res.data;
    },
    retry: 1,
  });

  if (error) {
    toast.error(error.message);
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Failed Uploads</h1>
          <p className="text-muted-foreground">
            Manage and retry failed upload attempts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Failed Uploads</CardTitle>
          <CardDescription>
            {setStoreIds.length > 0
              ? `Showing ${data?.failedUploadsResults.length ?? 0} of ${
                  data?.total ?? 0
                } results`
              : 'Select store(s) to load failed uploads'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 🔘 Store Selector */}
          <div className="flex items-center gap-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  {storeIds.length > 0
                    ? `${storeIds.length} Store${
                        storeIds.length > 1 ? 's' : ''
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
                        checked={storeIds.includes(store.storeId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStoreIds((prev: any) => [
                              ...prev,
                              store.storeId,
                            ]);
                          } else {
                            setStoreIds((prev) =>
                              prev.filter((id) => id !== store.storeId)
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

          {/* 🔘 Data Display Section */}
          {isLoading ? (
            <div className="p-4">Loading...</div>
          ) : data?.failedUploadsResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No failed uploads found for the selected stores.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-8">Store</TableHead>
                      <TableHead className="px-8">Order ID</TableHead>
                      <TableHead>UPC</TableHead>
                      <TableHead className="text-right px-8">Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!data ? (
                      <div className="p-4">Loading...</div>
                    ) : (
                      data.failedUploadsResults.map((upload) => (
                        <TableRow key={upload._id}>
                          <TableCell className="px-8 py-4">
                            <Badge
                              className="text-white"
                              style={{
                                backgroundColor: stringToColor(upload.storeId),
                              }}
                            >
                              {upload.storeObjectId?.storeName || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium px-8 py-4">
                            {upload.orderId}
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-1 py-0.5 rounded">
                              {upload.upc || 'N/A'}
                            </code>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            {upload.errorDetails}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 🔘 Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  {data && (
                    <div>
                      {' '}
                      Showing {(data.page - 1) * data.limit + 1} to{' '}
                      {Math.min(data.page * data.limit, data.total)} of{' '}
                      {data.total} results
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {data && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(data.page - 1)}
                      disabled={data.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  <span className="text-sm">
                    Page {data && data.page} of {data && data.pages}
                  </span>
                  {data && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(data.page + 1)}
                      disabled={data.page >= data.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

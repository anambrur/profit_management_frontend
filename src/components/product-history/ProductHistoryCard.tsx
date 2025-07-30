import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BadgeX,
  Calendar,
  CheckCircle2,
  CornerDownLeft,
  CreditCard,
  DollarSign,
  Eye,
  Hash,
  HelpCircle,
  Mail,
  Plus,
  RotateCcw,
  StoreIcon,
  Trash,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { JSX, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { HiOutlineBadgeCheck } from 'react-icons/hi2';

// Import your existing components
import { deleteProduct, updateSingleField } from '@/api/products';
import { formatDate } from '@/utils/dateUtils';
import { AddProductHistory } from './AddProductHistory';
import { EditPopover } from './EditPopover';
import { EditPopoverSelect } from './EditPopoverSelect';
import { EditPopoverSupplier } from './EditPopoverSupplier';
import { PaginationControls } from './PaginationControls';

interface ProductsTableProps {
  products: ProductHistory[];
  isLoading: boolean;
  pagination: any;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

interface ProductHistory {
  _id: string;
  product: {
    _id: string;
    productName: string;
    sku: string;
  };
  store: {
    _id: string;
    storeName: string;
  };
  supplier: {
    name: string;
    link: string;
  };
  orderId: string;
  card: string;
  purchaseQuantity: number;
  receiveQuantity: number;
  lostQuantity: number;
  sendToWFS: number;
  costOfPrice: string;
  sellPrice: string;
  email: string;
  status: string;
  date: string;
}

export function ProductHistoryCards({
  products,
  isLoading,
  pagination,
  onPageChange,
  onLimitChange,
}: ProductsTableProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: string;
      value: string;
    }) => {
      await updateSingleField(id, field, value);
      return { id, field, value };
    },
    onSuccess: (data) => {
      console.log('Field updated successfully:', data);
      client.invalidateQueries({ queryKey: ['productsHistory'] });
    },
    onError: (error) => {
      console.error('Error updating field:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteProduct(id);
      return { id };
    },
    onSuccess: (data) => {
      console.log('Product deleted successfully:', data);
      client.invalidateQueries({ queryKey: ['productsHistory'] });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });

  const handleFieldUpdate = (
    productId: string,
    field: string,
    value: string
  ) => {
    mutation.mutate({
      id: productId,
      field,
      value,
    });
  };

  const getStatusInfo = (status: string) => {
    const map: Record<
      string,
      {
        label: string;
        color: string;
        icon: JSX.Element;
      }
    > = {
      'in-transit': {
        label: 'In Transit',
        color: 'bg-primary text-primary-foreground capitalize',
        icon: <Truck className="w-4 h-4" />,
      },
      delivered: {
        label: 'Delivered',
        color: 'bg-secondary text-secondary-foreground',
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      'return-label-done': {
        label: 'Return Label Done',
        color: 'bg-destructive text-destructive-foreground',
        icon: <RotateCcw className="w-4 h-4" />,
      },
      refunded: {
        label: 'Refunded',
        color: 'bg-destructive text-destructive-foreground',
        icon: <CornerDownLeft className="w-4 h-4" />,
      },
      'return-request-sent': {
        label: 'Return Requested Sent',
        color: 'bg-destructive text-destructive-foreground',
        icon: <BadgeX className="w-4 h-4" />,
      },
    };

    return (
      map[status] || {
        label: status,
        color: 'bg-muted text-muted-foreground',
        icon: <HelpCircle className="w-4 h-4" />,
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product: ProductHistory) => {
          const { formattedDate } = formatDate(product.date);
          const isHovered = hoveredCard === product._id;
          const isExpanded = expandedCard === product._id;
          const remaining = product.receiveQuantity - product.sendToWFS;
          const totalCost =
            product.purchaseQuantity * Number(product.costOfPrice);
          const wfsCost = product.sendToWFS * Number(product.costOfPrice);
          const remainingPrice = totalCost - wfsCost;
          const statusInfo = getStatusInfo(product.status || 'no-status');

          return (
            <Card
              key={product._id}
              className={cn(
                'relative transition-all duration-300 hover:shadow-lg border-2',
                isHovered
                  ? 'border-blue-200 shadow-lg scale-[1.02]'
                  : 'border-gray-200 hover:border-blue-100',
                'group cursor-pointer bg-white'
              )}
              onMouseEnter={() => setHoveredCard(product._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Header */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    {/* Store Badge */}
                    {product.store?.storeName && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                      >
                        <StoreIcon className="w-3 h-3 mr-1" />
                        {product.store.storeName}
                      </Badge>
                    )}

                    {/* Product Name */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 cursor-help leading-relaxed">
                            {product.product?.productName || 'Unnamed Product'}
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs bg-slate-800 text-white"
                        >
                          <p className="text-sm">
                            {product.product?.productName || 'Unnamed Product'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setExpandedCard(isExpanded ? null : product._id)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Card Content */}
              <CardContent className="pt-0 space-y-4">
                {/* Quick Info Row */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Hash className="w-3 h-3" />
                      <span className="text-xs">Purchase</span>
                    </div>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">
                      {product.purchaseQuantity}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs">Received</span>
                    </div>
                    <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded text-xs">
                      {Number(product.receiveQuantity) || 0}
                    </span>
                  </div>
                </div>

                {/* Price Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-xs">Cost</span>
                    </div>
                    <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded text-xs">
                      ${Number(product.costOfPrice) || 0}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-xs">Sell</span>
                    </div>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">
                      ${Number(product.sellPrice) || 0}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-3 h-3 text-amber-600" />
                  <span className="text-amber-800 bg-amber-50 px-2 py-1 rounded text-xs">
                    {formattedDate}
                  </span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t pt-4 space-y-4 animate-in slide-in-from-top-2">
                    {/* Order & Supplier Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Order ID
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={product.orderId ? 'outline' : 'secondary'}
                            className="text-xs"
                          >
                            {product.orderId || 'N/A'}
                          </Badge>
                          <EditPopover
                            value={product.orderId}
                            onSave={(value: string) =>
                              handleFieldUpdate(product._id, 'orderId', value)
                            }
                            label="Order ID"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Supplier
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {product.supplier?.name || 'No Supplier'}
                          </Badge>
                          <EditPopoverSupplier
                            supplierName={
                              product.supplier?.name || 'No Supplier'
                            }
                            supplierLink={product.supplier?.link || ''}
                            onSave={(data: any) =>
                              handleFieldUpdate(
                                product._id,
                                'supplier',
                                JSON.stringify(data)
                              )
                            }
                            label="Supplier"
                            icon={<StoreIcon className="w-4 h-4" />}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          SKU
                        </span>
                        <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {product.product?.sku || 'N/A'}
                        </code>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Card
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {product.card || 'No Card'}
                          </Badge>
                          <EditPopover
                            value={product.card}
                            onSave={(value: string) =>
                              handleFieldUpdate(product._id, 'card', value)
                            }
                            label="Card"
                            icon={<CreditCard className="h-4 w-4" />}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quantity Details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-700 border-b pb-1">
                        Quantity Details
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Lost</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'font-semibold px-2 py-1 rounded text-xs',
                                Number(product.lostQuantity) > 0
                                  ? 'text-red-700 bg-red-50'
                                  : 'text-gray-600 bg-gray-50'
                              )}
                            >
                              {Number(product.lostQuantity) || 0}
                            </span>
                            <EditPopover
                              value={product.lostQuantity}
                              onSave={(value: string) =>
                                handleFieldUpdate(
                                  product._id,
                                  'lostQuantity',
                                  value
                                )
                              }
                              type="number"
                              label="Lost Quantity"
                              icon={<Hash className="h-4 w-4" />}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">WFS</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-cyan-700 bg-cyan-50 px-2 py-1 rounded text-xs">
                              {Number(product.sendToWFS) || 0}
                            </span>
                            <EditPopover
                              value={product.sendToWFS}
                              onSave={(value: string) =>
                                handleFieldUpdate(
                                  product._id,
                                  'sendToWFS',
                                  value
                                )
                              }
                              type="number"
                              label="Sent to WFS"
                              icon={<Hash className="h-4 w-4" />}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between col-span-2">
                          <span className="text-xs text-gray-600">
                            Remaining
                          </span>
                          <span
                            className={cn(
                              'font-semibold px-2 py-1 rounded text-xs',
                              remaining > 0
                                ? 'text-emerald-700 bg-emerald-50'
                                : remaining < 0
                                ? 'text-red-700 bg-red-50'
                                : 'text-gray-600 bg-gray-50'
                            )}
                          >
                            {remaining}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-700 border-b pb-1">
                        Price Breakdown
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Cost</span>
                          <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                            ${totalCost.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">WFS Cost</span>
                          <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded">
                            ${wfsCost.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between col-span-2">
                          <span className="text-gray-600">Remaining Price</span>
                          <span
                            className={cn(
                              'font-semibold px-2 py-1 rounded',
                              remainingPrice > 0
                                ? 'text-teal-700 bg-teal-50'
                                : 'text-gray-600 bg-gray-50'
                            )}
                          >
                            ${remainingPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Email & Status */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Email
                        </span>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-slate-600 truncate max-w-[120px] bg-slate-50 px-2 py-1 rounded">
                                  {product.email || 'No Email'}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="bg-slate-800 text-white"
                              >
                                <p className="text-sm">
                                  {product.email || 'No Email'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <EditPopover
                            value={product.email}
                            onSave={(value: string) =>
                              handleFieldUpdate(product._id, 'email', value)
                            }
                            type="email"
                            label="Email"
                            icon={<Mail className="h-4 w-4" />}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Status
                        </span>
                        <div className="flex items-center gap-2">
                          <EditPopoverSelect
                            value={product.status}
                            onSave={(value: string) =>
                              handleFieldUpdate(product._id, 'status', value)
                            }
                            type="text"
                            label="Status"
                            icon={<HiOutlineBadgeCheck className="h-4 w-4" />}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Date
                        </span>
                        <div className="flex items-center gap-2">
                          <EditPopover
                            value={product.date.split('T')[0]}
                            onSave={(value: string) =>
                              handleFieldUpdate(product._id, 'date', value)
                            }
                            type="date"
                            label="Date"
                            icon={<Calendar className="h-4 w-4" />}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <AddProductHistory
                        productId={product.product._id}
                        node={
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        }
                        storeId={product.store._id}
                      />

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 hover:bg-red-50 hover:border-red-200 transition-colors text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Delete Product History</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this product
                              history? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              onClick={() => deleteMutation.mutate(product._id)}
                              disabled={deleteMutation.isPending}
                              variant="destructive"
                            >
                              {deleteMutation.isPending ? (
                                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}

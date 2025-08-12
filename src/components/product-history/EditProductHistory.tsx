'use client';

import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  CreditCard,
  DollarSign,
  LinkIcon,
  Mail,
  Package,
  Send,
  Store,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';

export interface ProductHistoryEdit {
  storeId: string;
  upc: string;
  sku: string;
  supplierName: string;
  supplierLink: string;
  orderId: string;
  status: string;
  card: string;
  purchase: number;
  lost: number;
  sentToWfs: number;
  costOfPrice: number;
  sellPrice: number;
  email: string;
  dateTime: string;
}

interface ProductHistoryDialogProps {
  children: React.ReactNode;
  product: ProductHistoryEdit;
  onSave: (updatedProduct: ProductHistoryEdit) => Promise<void>;
}

export default function EditProductHistoryDialog({
  children,
  product,
  onSave,
}: ProductHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductHistoryEdit>({
    defaultValues: product,
  });

  // Watch fields for live calculations
  const [purchase, lost, sentToWfs, costOfPrice] = watch([
    'purchase',
    'lost',
    'sentToWfs',
    'costOfPrice',
  ]);

  // Calculate derived values
  const remaining = (purchase || 0) - (sentToWfs || 0) - (lost || 0);
  const totalCost = (purchase || 0) * (costOfPrice || 0);
  const wfsCost = (sentToWfs || 0) * (costOfPrice || 0);
  const remainingCost = totalCost - wfsCost;

  const onSubmit: SubmitHandler<ProductHistoryEdit> = async (data) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      setOpen(false);
      toast.success('Product history updated successfully');
    } catch (error) {
      toast.error('Failed to update product history');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-emerald-600" />
            Edit Product History
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Update the product history details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-2">
            {/* Calculated badges */}
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500">Purchase</span>
                  <span className="font-semibold">{purchase}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Sent to WFS</span>
                  <span className="font-semibold">{sentToWfs}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Remaining</span>
                  <span className="font-semibold">{remaining}</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500">Cost Price</span>
                  <span className="font-semibold">
                    ${costOfPrice?.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Total Cost</span>
                  <span className="font-semibold">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500">WFS Cost</span>
                  <span className="font-semibold">${wfsCost.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500">Remaining Cost</span>
                  <span className="font-semibold">
                    ${remainingCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Store className="h-4 w-4 text-purple-600" />
                Supplier Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName" className="text-sm font-medium">
                    Supplier Name *
                  </Label>
                  <Input
                    id="supplierName"
                    {...register('supplierName')}
                    placeholder="Enter supplier name"
                    className="transition-colors focus:border-purple-500"
                  />
                  {errors.supplierName && (
                    <p className="text-red-600 text-xs">
                      {errors.supplierName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierLink" className="text-sm font-medium">
                    Supplier Link *
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="supplierLink"
                      {...register('supplierLink', {
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message: 'Please enter a valid URL',
                        },
                      })}
                      placeholder="https://supplier.com"
                      className="pl-10 transition-colors focus:border-purple-500"
                    />
                  </div>
                  {errors.supplierLink && (
                    <p className="text-red-600 text-xs">
                      {errors.supplierLink.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Separator />
            {/* SKU & UPC Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Store className="h-4 w-4 text-purple-600" />
                SKU & UPC Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName" className="text-sm font-medium">
                    SKU *
                  </Label>
                  <Input
                    id="sku"
                    {...register('sku')}
                    placeholder="Enter Product SKU"
                    className="transition-colors focus:border-purple-500"
                  />
                  {errors.sku && (
                    <p className="text-red-600 text-xs">{errors.sku.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierLink" className="text-sm font-medium">
                    UPC *
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="upc"
                      {...register('upc')}
                      placeholder="Enter Product UPC"
                      className="pl-10 transition-colors focus:border-purple-500"
                    />
                  </div>
                  {errors.upc && (
                    <p className="text-red-600 text-xs">{errors.upc.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Package className="h-4 w-4 text-green-600" />
                Order Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId" className="text-sm font-medium">
                    Order ID *
                  </Label>
                  <Input
                    id="orderId"
                    {...register('orderId', {
                      required: 'Order ID is required',
                    })}
                    placeholder="Enter order ID"
                    className="transition-colors focus:border-emerald-500"
                  />
                  {errors.orderId && (
                    <p className="text-red-600 text-xs">
                      {errors.orderId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status *
                  </Label>
                  <select
                    id="status"
                    {...register('status', {
                      required: 'Status is required',
                    })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select status</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="return-request-sent">
                      Return Requested
                    </option>
                    <option value="return-label-done">Return Label Done</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-600 text-xs">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Quantity Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Package className="h-4 w-4 text-emerald-600" />
                Quantity Details
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="purchase"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    Purchase *
                  </Label>
                  <Input
                    id="purchase"
                    type="number"
                    min="0"
                    {...register('purchase', {
                      required: 'Purchase quantity is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cannot be negative' },
                    })}
                    placeholder="0"
                    className="transition-colors focus:border-emerald-500"
                  />
                  {errors.purchase && (
                    <p className="text-red-600 text-xs">
                      {errors.purchase.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lost"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <TrendingDown className="h-3 w-3 text-rose-600" />
                    Lost
                  </Label>
                  <Input
                    id="lost"
                    type="number"
                    min="0"
                    {...register('lost', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cannot be negative' },
                    })}
                    placeholder="0"
                    className="transition-colors focus:border-rose-500"
                  />
                  {errors.lost && (
                    <p className="text-red-600 text-xs">
                      {errors.lost.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sentToWfs"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <Send className="h-3 w-3 text-cyan-600" />
                    Sent to WFS
                  </Label>
                  <Input
                    id="sentToWfs"
                    type="number"
                    min="0"
                    {...register('sentToWfs', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cannot be negative' },
                    })}
                    placeholder="0"
                    className="transition-colors focus:border-cyan-500"
                  />
                  {errors.sentToWfs && (
                    <p className="text-red-600 text-xs">
                      {errors.sentToWfs.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Pricing Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costOfPrice" className="text-sm font-medium">
                    Cost Price *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="costOfPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('costOfPrice', {
                        required: 'Cost price is required',
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'Cost price cannot be negative',
                        },
                      })}
                      placeholder="0.00"
                      className="pl-10 transition-colors focus:border-emerald-500"
                    />
                  </div>
                  {errors.costOfPrice && (
                    <p className="text-red-600 text-xs">
                      {errors.costOfPrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellPrice" className="text-sm font-medium">
                    Sell Price *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="sellPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('sellPrice', {
                        required: 'Sell price is required',
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: 'Sell price cannot be negative',
                        },
                      })}
                      placeholder="0.00"
                      className="pl-10 transition-colors focus:border-emerald-500"
                    />
                  </div>
                  {errors.sellPrice && (
                    <p className="text-red-600 text-xs">
                      {errors.sellPrice.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail className="h-4 w-4 text-pink-600" />
                Additional Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card" className="text-sm font-medium">
                    Card
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="card"
                      {...register('card')}
                      placeholder="Card information"
                      className="pl-10 transition-colors focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="email@example.com"
                      className="pl-10 transition-colors focus:border-pink-500"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTime" className="text-sm font-medium">
                    Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="dateTime"
                      type="date"
                      {...register('dateTime')}
                      className="pl-10 transition-colors focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

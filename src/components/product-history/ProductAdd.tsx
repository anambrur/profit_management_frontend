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
import axiosInstance from '@/lib/axiosInstance';
import { useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CreditCard,
  DollarSign,
  Link,
  Mail,
  Minus,
  Package,
  Send,
  Store,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AddProductHistoryProps {
  productId: string;
  node: React.ReactNode;
  storeId: string;
}

interface FormInputs {
  supplierName: string;
  supplierLink: string;
  orderId: string;
  status: string;
  card: string;
  purchase: number;
  received: number;
  lost: number;
  sentToWfs: number;
  costOfPrice: number;
  sellPrice: number;
  email: string;
  dateTime: string;
}

const AddProductHistory: React.FC<AddProductHistoryProps> = ({
  productId,
  node,
  storeId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormInputs>({
    defaultValues: {
      purchase: 0,
      received: 0,
      status: '',
      orderId: '',
      lost: 0,
      sentToWfs: 0,
      costOfPrice: 0,
      sellPrice: 0,
      dateTime: '', // Current date-time
    },
  });

  const query = useQueryClient();

  // Watch values for real-time calculations
  const watchedValues = watch([
    'purchase',
    'received',
    'lost',
    'sentToWfs',
    'costOfPrice',
  ]);
  const [purchase, received, lost, sentToWfs, costOfPrice] = watchedValues;

  // Calculate remaining quantity
  const remaining = (received || 0) - (sentToWfs || 0);
  const totalCost = (purchase || 0) * (costOfPrice || 0);
  const wfsCost = (sentToWfs || 0) * (costOfPrice || 0);
  const remainingCost = totalCost - wfsCost;

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsSubmitting(true);

    try {
      const supplierObject = {
        name: data.supplierName,
        link: data.supplierLink,
      };

      await axiosInstance.post(
        `/api/product-history/create-product-history/${productId}`,
        {
          storeID: storeId,
          purchase: Number(data.purchase),
          received: Number(data.received),
          lost: Number(data.lost),
          sentToWfs: Number(data.sentToWfs),
          costOfPrice: Number(data.costOfPrice),
          sellPrice: Number(data.sellPrice),
          date: data.dateTime,
          email: data.email,
          card: data.card,
          supplier: supplierObject,
          orderId: data.orderId,
          status: data.status,
        },
        {
          withCredentials: true,
        }
      );

      query.invalidateQueries({ queryKey: ['productsHistory'] });
      toast.success('Product history added successfully');
      reset();
      setIsOpen(false);
    } catch (err) {
      console.error('Error adding product history:', err);
      toast.error("Product history couldn't be added");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{node}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5 text-blue-600" />
              Add Product History
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Add a new entry to the product history with detailed information
              about quantities, pricing, and supplier details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
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
                    {...register('supplierName', {
                      required: 'Supplier name is required',
                    })}
                    placeholder="Enter supplier name"
                    className="transition-colors focus:border-purple-500"
                    aria-invalid={errors.supplierName ? 'true' : 'false'}
                  />
                  {errors.supplierName && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.supplierName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierLink" className="text-sm font-medium">
                    Supplier Link *
                  </Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="supplierLink"
                      {...register('supplierLink', {
                        required: 'Supplier link is required',
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message:
                            'Please enter a valid URL (starting with http:// or https://)',
                        },
                      })}
                      placeholder="https://supplier-website.com"
                      className="pl-10 transition-colors focus:border-purple-500"
                      aria-invalid={errors.supplierLink ? 'true' : 'false'}
                    />
                  </div>
                  {errors.supplierLink && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.supplierLink.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Package className="h-4 w-4 text-green-600" />
                Order Information
              </div>

              {/* Order ID */}
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
                    className="transition-colors focus:border-green-500"
                    aria-invalid={errors.orderId ? 'true' : 'false'}
                  />
                  {errors.orderId && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.orderId.message}
                    </p>
                  )}
                </div>

                {/* Order Status */}
                <div className="space-y-2">
                  <Label htmlFor="orderStatus" className="text-sm font-medium">
                    Order Status *
                  </Label>
                  <select
                    id="orderStatus"
                    {...register('status', {
                      required: 'Order status is required',
                    })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:border-green-500"
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
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Quantity Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Package className="h-4 w-4 text-blue-600" />
                Quantity Details
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="purchase"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3 text-blue-600" />
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
                    className="transition-colors focus:border-blue-500"
                    aria-invalid={errors.purchase ? 'true' : 'false'}
                  />
                  {errors.purchase && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.purchase.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="received"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    Received
                  </Label>
                  <Input
                    id="received"
                    type="number"
                    min="0"
                    {...register('received', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cannot be negative' },
                    })}
                    placeholder="0"
                    className="transition-colors focus:border-green-500"
                    aria-invalid={errors.received ? 'true' : 'false'}
                  />
                  {errors.received && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.received.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lost"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <TrendingDown className="h-3 w-3 text-red-600" />
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
                    className="transition-colors focus:border-red-500"
                    aria-invalid={errors.lost ? 'true' : 'false'}
                  />
                  {errors.lost && (
                    <p role="alert" className="text-red-600 text-xs">
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
                    aria-invalid={errors.sentToWfs ? 'true' : 'false'}
                  />
                  {errors.sentToWfs && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.sentToWfs.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Calculated Values Display */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Minus className="h-4 w-4" />
                  Calculated Values
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Remaining:</span>
                    <span
                      className={`ml-2 font-semibold ${
                        remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {remaining}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Total Cost:</span>
                    <span className="ml-2 font-semibold text-purple-600">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">WFS Cost:</span>
                    <span className="ml-2 font-semibold text-orange-600">
                      ${wfsCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Remaining Cost:</span>
                    <span className="ml-2 font-semibold text-teal-600">
                      ${remainingCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <DollarSign className="h-4 w-4 text-green-600" />
                Pricing Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costOfPrice" className="text-sm font-medium">
                    Cost Price *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                      className="pl-10 transition-colors focus:border-green-500"
                      aria-invalid={errors.costOfPrice ? 'true' : 'false'}
                    />
                  </div>
                  {errors.costOfPrice && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.costOfPrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellPrice" className="text-sm font-medium">
                    Sell Price *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                      className="pl-10 transition-colors focus:border-blue-500"
                      aria-invalid={errors.sellPrice ? 'true' : 'false'}
                    />
                  </div>
                  {errors.sellPrice && (
                    <p role="alert" className="text-red-600 text-xs">
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
                    Card *
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="card"
                      {...register('card', { required: 'Card is required' })}
                      placeholder="Card information"
                      className="pl-10 transition-colors focus:border-indigo-500"
                      aria-invalid={errors.card ? 'true' : 'false'}
                    />
                  </div>
                  {errors.card && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.card.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="email@example.com"
                      className="pl-10 transition-colors focus:border-pink-500"
                      aria-invalid={errors.email ? 'true' : 'false'}
                    />
                  </div>
                  {errors.email && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTime" className="text-sm font-medium">
                    Date & Time *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="dateTime"
                      type="date"
                      {...register('dateTime', {
                        required: 'Date & Time is required',
                      })}
                      className="pl-10 transition-colors focus:border-amber-500"
                      aria-invalid={errors.dateTime ? 'true' : 'false'}
                    />
                  </div>
                  {errors.dateTime && (
                    <p role="alert" className="text-red-600 text-xs">
                      {errors.dateTime.message}
                    </p>
                  )}
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Adding...' : 'Add Product History'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductHistory;

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
  Eye,
  LinkIcon,
  Mail,
  Package,
  PencilLine,
  Plus,
  Send,
  Store,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

type Mode = 'view' | 'edit' | 'add';

export interface FormInputs {
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

export interface HistoryRecord extends FormInputs {
  id: string;
}

interface ProductHistoryDialogProps {
  productId?: string;
  storeId?: string;
  node?: React.ReactNode;
  // Optional current record to show in "view" mode initially
  initialHistory?: HistoryRecord | null;
  // Optional callbacks so you can wire to your backend
  onAdd?: (payload: FormInputs) => Promise<void> | void;
  onEdit?: (id: string, payload: FormInputs) => Promise<void> | void;
}

export default function ProductHistoryDialog(
  props: ProductHistoryDialogProps = {}
) {
  const {
    productId = 'demo-product',
    storeId = 'demo-store',
    node = (
      <Button variant="default" className="gap-2">
        <Eye className="h-4 w-4" />
        Quick View
      </Button>
    ),
    initialHistory = {
      id: 'hist_001',
      supplierName: 'Acme Supplies',
      supplierLink: 'https://acme.example.com/product/123',
      orderId: 'ORD-2025-0001',
      status: 'delivered',
      card: 'Visa **** 4242',
      purchase: 100,
      received: 95,
      lost: 2,
      sentToWfs: 50,
      costOfPrice: 7.5,
      sellPrice: 15.99,
      email: 'ops@example.com',
      dateTime: '2025-08-01',
    },
    onAdd,
    onEdit,
  } = props;

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('view');
  const [current, setCurrent] = useState<HistoryRecord | null>(initialHistory);

  // react-hook-form for edit/add modes
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues:
      mode === 'edit' && current
        ? {
            supplierName: current.supplierName,
            supplierLink: current.supplierLink,
            orderId: current.orderId,
            status: current.status,
            card: current.card,
            purchase: current.purchase,
            received: current.received,
            lost: current.lost,
            sentToWfs: current.sentToWfs,
            costOfPrice: current.costOfPrice,
            sellPrice: current.sellPrice,
            email: current.email,
            dateTime: current.dateTime,
          }
        : {
            supplierName: '',
            supplierLink: '',
            orderId: '',
            status: '',
            card: '',
            purchase: 0,
            received: 0,
            lost: 0,
            sentToWfs: 0,
            costOfPrice: 0,
            sellPrice: 0,
            email: '',
            dateTime: '',
          },
  });

  // When switching modes, reinitialize defaults accordingly
  React.useEffect(() => {
    if (mode === 'edit' && current) {
      reset({
        supplierName: current.supplierName,
        supplierLink: current.supplierLink,
        orderId: current.orderId,
        status: current.status,
        card: current.card,
        purchase: current.purchase,
        received: current.received,
        lost: current.lost,
        sentToWfs: current.sentToWfs,
        costOfPrice: current.costOfPrice,
        sellPrice: current.sellPrice,
        email: current.email,
        dateTime: current.dateTime,
      });
    } else if (mode === 'add') {
      reset({
        supplierName: '',
        supplierLink: '',
        orderId: '',
        status: '',
        card: '',
        purchase: 0,
        received: 0,
        lost: 0,
        sentToWfs: 0,
        costOfPrice: 0,
        sellPrice: 0,
        email: '',
        dateTime: '',
      });
    }
  }, [mode, current, reset]);

  // Live calculations for the form
  const [purchase, received, lost, sentToWfs, costOfPrice] = watch(
    ['purchase', 'received', 'lost', 'sentToWfs', 'costOfPrice'],
    [0, 0, 0, 0, 0]
  );

  const remaining = useMemo(
    () => (received || 0) - (sentToWfs || 0),
    [received, sentToWfs]
  );
  const totalCost = useMemo(
    () => (purchase || 0) * (costOfPrice || 0),
    [purchase, costOfPrice]
  );
  const wfsCost = useMemo(
    () => (sentToWfs || 0) * (costOfPrice || 0),
    [sentToWfs, costOfPrice]
  );
  const remainingCost = useMemo(
    () => totalCost - wfsCost,
    [totalCost, wfsCost]
  );

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      if (mode === 'add') {
        // Hook up your API here (e.g., axiosInstance.post)
        if (onAdd) await onAdd(data);
        const newRecord: HistoryRecord = { id: `hist_${Date.now()}`, ...data };
        setCurrent(newRecord);
        setMode('view');
        toast({
          title: 'Added',
          description: 'Product history added successfully.',
        });
      } else if (mode === 'edit' && current) {
        // Hook up your API here (e.g., axiosInstance.put/patch)
        if (onEdit) await onEdit(current.id, data);
        setCurrent({ ...current, ...data });
        setMode('view');
        toast({
          title: 'Updated',
          description: 'Product history updated successfully.',
        });
      }
    } catch (e) {
      toast({
        title: 'Action failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  function Header() {
    return (
      <DialogHeader className="pb-4">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Package className="h-5 w-5 text-emerald-600" />
          {mode === 'view'
            ? 'Product History'
            : mode === 'edit'
            ? 'Edit Product History'
            : 'Add Product History'}
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          {mode === 'view'
            ? 'Quickly review the details. You can edit or add a new entry.'
            : 'Provide quantities, pricing, and supplier details.'}
        </DialogDescription>
      </DialogHeader>
    );
  }

  function ViewContent() {
    if (!current) {
      return (
        <div className="py-4">
          <p className="text-sm text-slate-600">No history available yet.</p>
        </div>
      );
    }

    const {
      supplierName,
      supplierLink,
      orderId,
      status,
      card,
      purchase,
      received,
      lost,
      sentToWfs,
      costOfPrice,
      sellPrice,
      email,
      dateTime,
    } = current;

    const _remaining = (received || 0) - (sentToWfs || 0);
    const _totalCost = (purchase || 0) * (costOfPrice || 0);
    const _wfsCost = (sentToWfs || 0) * (costOfPrice || 0);
    const _remainingCost = _totalCost - _wfsCost;

    return (
      <div className="grid gap-6 py-2">
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500">Purchase</span>
              <span className="font-semibold">{purchase}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500">Received</span>
              <span className="font-semibold">{received}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500">Sent to WFS</span>
              <span className="font-semibold">{sentToWfs}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500">Remaining</span>
              <span className="font-semibold">{_remaining}</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500">Cost Price</span>
              <span className="font-semibold">${costOfPrice.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500">Sell Price</span>
              <span className="font-semibold">${sellPrice.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500">Total Cost</span>
              <span className="font-semibold">${_totalCost.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500">Remaining Cost</span>
              <span className="font-semibold">
                ${_remainingCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Store className="h-4 w-4 text-purple-600" />
            Supplier Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-slate-500">Supplier Name</div>
              <div className="font-medium">{supplierName}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">Supplier Link</div>
              <a
                className="inline-flex items-center gap-1 text-emerald-700 underline underline-offset-2"
                href={supplierLink}
                target="_blank"
                rel="noreferrer"
              >
                <LinkIcon className="h-4 w-4" />
                {supplierLink}
              </a>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Package className="h-4 w-4 text-green-600" />
            Order Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-slate-500">Order ID</div>
              <div className="font-medium">{orderId}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">Status</div>
              <div className="font-medium capitalize">{status || '—'}</div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Additional Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-slate-500">Card</div>
              <div className="font-medium">{card}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">Email</div>
              <div className="font-medium">{email}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">Date</div>
              <div className="font-medium">{dateTime}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function EditAddForm() {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 py-2">
          {/* Calculated badges */}
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-500">Remaining</span>
                <span className="font-semibold">{remaining || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Total Cost</span>
                <span className="font-semibold">
                  ${Number.isFinite(totalCost) ? totalCost.toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">WFS Cost</span>
                <span className="font-semibold">
                  ${Number.isFinite(wfsCost) ? wfsCost.toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500">Remaining Cost</span>
                <span className="font-semibold">
                  $
                  {Number.isFinite(remainingCost)
                    ? remainingCost.toFixed(2)
                    : '0.00'}
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
                  {...register('supplierName', {
                    required: 'Supplier name is required',
                  })}
                  placeholder="Enter supplier name"
                  className="transition-colors focus:border-purple-500"
                  aria-invalid={errors.supplierName ? 'true' : 'false'}
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
                  <p className="text-red-600 text-xs">
                    {errors.supplierLink.message}
                  </p>
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
                  {...register('orderId', { required: 'Order ID is required' })}
                  placeholder="Enter order ID"
                  className="transition-colors focus:border-emerald-500"
                  aria-invalid={errors.orderId ? 'true' : 'false'}
                />
                {errors.orderId && (
                  <p className="text-red-600 text-xs">
                    {errors.orderId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderStatus" className="text-sm font-medium">
                  Order Status *
                </Label>
                <select
                  id="orderStatus"
                  {...register('status', {
                    required: 'Order status is required',
                  })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select status</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="return-request-sent">Return Requested</option>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  aria-invalid={errors.purchase ? 'true' : 'false'}
                />
                {errors.purchase && (
                  <p className="text-red-600 text-xs">
                    {errors.purchase.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="received"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
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
                  className="transition-colors focus:border-emerald-500"
                  aria-invalid={errors.received ? 'true' : 'false'}
                />
                {errors.received && (
                  <p className="text-red-600 text-xs">
                    {errors.received.message}
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
                  aria-invalid={errors.lost ? 'true' : 'false'}
                />
                {errors.lost && (
                  <p className="text-red-600 text-xs">{errors.lost.message}</p>
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
                    aria-invalid={errors.costOfPrice ? 'true' : 'false'}
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
                    aria-invalid={errors.sellPrice ? 'true' : 'false'}
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

          {/* Additional */}
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
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="card"
                    {...register('card', { required: 'Card is required' })}
                    placeholder="Card information"
                    className="pl-10 transition-colors focus:border-emerald-500"
                    aria-invalid={errors.card ? 'true' : 'false'}
                  />
                </div>
                {errors.card && (
                  <p className="text-red-600 text-xs">{errors.card.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                  <p className="text-red-600 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTime" className="text-sm font-medium">
                  Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="dateTime"
                    type="date"
                    {...register('dateTime', { required: 'Date is required' })}
                    className="pl-10 transition-colors focus:border-amber-500"
                    aria-invalid={errors.dateTime ? 'true' : 'false'}
                  />
                </div>
                {errors.dateTime && (
                  <p className="text-red-600 text-xs">
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
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting
              ? mode === 'add'
                ? 'Adding...'
                : 'Saving...'
              : mode === 'add'
              ? 'Add'
              : 'Save changes'}
          </Button>
        </DialogFooter>
      </form>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setMode('view');
      }}
    >
      <DialogTrigger asChild>{node}</DialogTrigger>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <Header />

        {mode === 'view' ? (
          <>
            <ViewContent />
            <DialogFooter className="pt-6 border-t flex-col gap-2 sm:flex-row sm:justify-between">
              <div className="text-xs text-slate-500">
                Product: {productId} • Store: {storeId}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => setMode('add')}
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
                <Button
                  type="button"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setMode('edit')}
                  disabled={!current}
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <EditAddForm />
        )}
      </DialogContent>
    </Dialog>
  );
}

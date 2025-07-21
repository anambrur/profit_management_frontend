'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoMdAddCircleOutline } from 'react-icons/io';
interface Product {
  supplier: string;
  card: string;
  quantity: string;
  costOfPrice: string;
  sellPrice: string;
  date: string;
  onHand: string;
  avaliable: string;
}

interface ProductEditModalProps {
  product?: Product;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (product: Product) => void;
}

export function ProductEditModal({ product }: ProductEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      supplier: product?.supplier,
      card: product?.card,
      quantity: product?.quantity,
      costOfPrice: product?.costOfPrice,
      sellPrice: product?.sellPrice,
      date: product?.date,
      onHand: product?.onHand,
      avaliable: product?.avaliable,
    },
  });
  const onSubmit = (data: any) => console.log(data);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <IoMdAddCircleOutline />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              Edit Product
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="border-none shadow-none w-md">
              <CardHeader>
                <CardTitle className="text-sm text-center text-gray-500">
                  Update Yours Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      {...register('supplier', {
                        required: 'Supplier is required',
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card">Card</Label>
                    <Input
                      id="card"
                      {...register('card', {
                        required: 'Card is required',
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register('quantity', {
                        required: 'Quantity is required',
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costOfPrice">Cost Price</Label>
                    <Input
                      id="costOfPrice"
                      type="number"
                      {...register('costOfPrice', {
                        required: 'Cost of Price is required',
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellPrice">Sell Price</Label>
                    <Input
                      id="sellPrice"
                      type="number"
                      {...register('sellPrice', {
                        required: 'Sell Price is required',
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Available Date</Label>
                    <Input
                      id="date"
                      type="date"
                      {...register('date', {
                        required: 'Available Date is required',
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

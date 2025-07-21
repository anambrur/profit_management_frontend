import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Package, Store } from 'lucide-react';

interface Product {
  _id: number;
  mart: string;
  sku: string;
  condition: string;
  availability: string;
  wpid: string;
  upc: string;
  gtin: string;
  product_name: string;
  product_type: string;
  on_hand: number;
  available: number;
  published_status: string;
  lifecycle_status: string;
  created_at: string;
  updated_at: string;
}

interface ProductViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductViewModal({
  product,
  isOpen,
  onClose,
}: ProductViewModalProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'In_stock':
        return 'bg-green-100 text-green-800';
      case 'Out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'Limited_stock':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Product Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.product_name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{product.product_type}</Badge>
                  <Badge className={getAvailabilityColor(product.availability)}>
                    {product.availability.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">{product.condition}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      SKU:
                    </span>
                    <span className="text-sm font-mono">{product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      UPC:
                    </span>
                    <span className="text-sm font-mono">{product.upc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      GTIN:
                    </span>
                    <span className="text-sm font-mono">{product.gtin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      WPID:
                    </span>
                    <span className="text-sm font-mono">{product.wpid}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Mart:
                    </span>
                    <span className="text-sm">{product.mart}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Published Status:
                    </span>
                    <Badge variant="outline">{product.published_status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Lifecycle Status:
                    </span>
                    <Badge variant="outline">{product.lifecycle_status}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Store className="h-4 w-4" />
                <span>Inventory Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {product.on_hand}
                  </div>
                  <div className="text-sm text-gray-600">Units On Hand</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {product.available}
                  </div>
                  <div className="text-sm text-gray-600">Units Available</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Created:
                </span>
                <span className="text-sm">
                  {formatDate(product.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Last Updated:
                </span>
                <span className="text-sm">
                  {formatDate(product.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

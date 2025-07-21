'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Edit, Eye, Package } from 'lucide-react';
import { useState } from 'react';
import { ProductViewModal } from './product-view-modal';

interface Product {
  id: number; // Add this line
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
  store_id: string;
  created_at: string;
  updated_at: string;
}

interface ProductTableProps {
  products: Product[];
  onProductUpdate: (updatedProduct: Product) => void;
}

export function ProductTable({ products, onProductUpdate }: ProductTableProps) {
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isLowStock = (onHand: number) => onHand <= 2 && onHand > 0;

  const handleView = (product: Product) => {
    setViewProduct(product);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
  };

  const handleSave = (updatedProduct: Product) => {
    onProductUpdate(updatedProduct);
    setEditProduct(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">On Hand</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>UPC & Store ID & WPID</TableHead>
              <TableHead>Store ID</TableHead>
              <TableHead>WPID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center py-8 text-gray-500"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-blue-600" />
                      {isLowStock(product.on_hand) && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={product.product_name}>
                      {product.product_name}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {product.sku}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {product.product_type}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={getAvailabilityColor(product.availability)}
                    >
                      {product.availability.replace('_', ' ')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={`font-semibold ${
                        isLowStock(product.on_hand) ? 'text-yellow-600' : ''
                      }`}
                    >
                      {product.on_hand}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    {product.available}
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(product.published_status)}>
                      {product.published_status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-sm text-gray-600">
                      {product.upc}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-sm text-gray-600">
                      {product.store_id}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-sm text-gray-600">
                      {product.wpid}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(product)}
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(product)}
                        title="Edit Product"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Modal */}
      {viewProduct && (
        <ProductViewModal
          product={viewProduct}
          isOpen={!!viewProduct}
          onClose={() => setViewProduct(null)}
        />
      )}

      {/* Edit Modal */}
      {/* {editProduct && (
        <ProductEditModal
          product={editProduct}
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          onSave={handleSave}
        />
      )} */}
    </>
  );
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Product {
  id: string;
  productName: string;
  sku: string;
  productType: string;
  condition: 'New' | 'Used' | 'Refurbished' | string;
  availability: 'In_stock' | 'Out_of_stock' | 'Low_stock' | string;
  available: number;
  onHand: number;
  gtin: string;
  upc: string;
  wpid: string;
  lifecycleStatus: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | string;
  publishedStatus: 'PUBLISHED' | 'UNPUBLISHED' | string;
  mart: string;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format

  // Optional fields (if any)
  image?: string;
}


export interface Customer {
  name: string;
  address: string;
}

export interface Order {
  id: string;
  storeId: string;
  shipNodeType: string;
  customerOrderId: string;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'cancelled'
    | 'Shipped'
    | 'Delivered';
  orderDate: string;
  customer: Customer;
  products: Product[];
  total: number;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  totalProducts: number;
  productsChange: number;
}






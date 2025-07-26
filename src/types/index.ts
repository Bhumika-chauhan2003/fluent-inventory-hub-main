import { Description } from '@radix-ui/react-toast';

export interface Product {
  productid: string;
  productCode: string;
  productName: string;
  specification: string;
  category: string;
  supplierName: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  warehouse: string;
  entryDate: string;
  enteredBy: string;
  remarks?: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  date: string;
  customerName?: string;
  customerContact?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'partially_paid';
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  unit: string;
  description?: string; // Use lowercase for consistency
  unit_Name?: string;
  itemId?: string;
  itemQuantity?: number;
  unitPrice?: number;
  itemDescription?: string;
  itemCode?: string;
}

export interface ReportData {
  type: 'inventoryValue' | 'stockDistribution' | 'supplierComparison' | 'movementRate' | 'warehouseUtilization';
  title: string;
  data: any;
}

export type Language = 'en' | 'hi' | 'bn' | 'es' | 'pt';

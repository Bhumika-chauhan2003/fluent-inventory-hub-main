
import { Product, Supplier, Category, Warehouse, Unit, User, Invoice } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const generateProductCode = (): string => {
  const prefix = 'PROD';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNum}`;
};

export const mockUsers: User[] = [
  {
    id: uuidv4(),
    username: 'admin',
    fullName: 'Admin User',
    role: 'admin',
  },
  {
    id: uuidv4(),
    username: 'manager',
    fullName: 'Manager User',
    role: 'manager',
  },
  {
    id: uuidv4(),
    username: 'staff',
    fullName: 'Staff User',
    role: 'staff',
  },
];

export const mockCategories: Category[] = [
  { id: uuidv4(), name: 'Stationery' },
  { id: uuidv4(), name: 'Electronics' },
  { id: uuidv4(), name: 'Furniture' },
  { id: uuidv4(), name: 'Office Supplies' },
  { id: uuidv4(), name: 'Computer Accessories' },
];

export const mockSuppliers: Supplier[] = [
  { id: uuidv4(), name: 'ABC Suppliers', contact: '+1-123-456-7890', address: '123 Main St, City' },
  { id: uuidv4(), name: 'XYZ Enterprise', contact: '+1-987-654-3210', address: '456 Oak St, Town' },
  { id: uuidv4(), name: 'Global Traders', contact: '+1-555-123-4567', address: '789 Pine St, Village' },
  { id: uuidv4(), name: 'City Distributors', contact: '+1-555-987-6543', address: '101 Elm St, County' },
];

export const mockWarehouses: Warehouse[] = [
  { id: uuidv4(), name: 'WH-1', location: 'North Campus' },
  { id: uuidv4(), name: 'WH-2', location: 'South Campus' },
  { id: uuidv4(), name: 'WH-3', location: 'East Wing' },
];

export const mockUnits: Unit[] = [
  { id: uuidv4(), name: 'Piece', abbreviation: 'pcs' },
  { id: uuidv4(), name: 'Box', abbreviation: 'box' },
  { id: uuidv4(), name: 'Kilogram', abbreviation: 'kg' },
  { id: uuidv4(), name: 'Liter', abbreviation: 'L' },
  { id: uuidv4(), name: 'Meter', abbreviation: 'm' },
  { id: uuidv4(), name: 'Packet', abbreviation: 'pkt' },
];

export const mockProducts: Product[] = [
  {
    id: uuidv4(),
    productCode: 'PROD-10001',
    productName: 'Ballpoint Pen',
    specification: 'Blue ink, medium point',
    category: 'Stationery',
    supplierName: 'ABC Suppliers',
    purchasePrice: 0.75,
    sellingPrice: 1.25,
    quantity: 500,
    unit: 'pcs',
    warehouse: 'WH-1',
    entryDate: '2025-04-01',
    enteredBy: 'admin',
    remarks: 'Bulk purchase for office use',
    isActive: true,
  },
  {
    id: uuidv4(),
    productCode: 'PROD-10002',
    productName: 'A4 Paper',
    specification: 'White, 80gsm, 500 sheets',
    category: 'Stationery',
    supplierName: 'XYZ Enterprise',
    purchasePrice: 3.50,
    sellingPrice: 5.00,
    quantity: 100,
    unit: 'box',
    warehouse: 'WH-1',
    entryDate: '2025-04-05',
    enteredBy: 'admin',
    remarks: 'Standard office paper',
    isActive: true,
  },
  {
    id: uuidv4(),
    productCode: 'PROD-10003',
    productName: 'Wireless Mouse',
    specification: 'Black, 2.4GHz wireless',
    category: 'Electronics',
    supplierName: 'Global Traders',
    purchasePrice: 12.00,
    sellingPrice: 18.50,
    quantity: 50,
    unit: 'pcs',
    warehouse: 'WH-2',
    entryDate: '2025-04-08',
    enteredBy: 'manager',
    remarks: 'For new computer lab',
    isActive: true,
  },
  {
    id: uuidv4(),
    productCode: 'PROD-10004',
    productName: 'Office Chair',
    specification: 'Ergonomic, adjustable height',
    category: 'Furniture',
    supplierName: 'City Distributors',
    purchasePrice: 85.00,
    sellingPrice: 120.00,
    quantity: 20,
    unit: 'pcs',
    warehouse: 'WH-3',
    entryDate: '2025-04-10',
    enteredBy: 'admin',
    remarks: 'For conference room',
    isActive: true,
  },
  {
    id: uuidv4(),
    productCode: 'PROD-10005',
    productName: 'Laptop Stand',
    specification: 'Aluminum, adjustable',
    category: 'Computer Accessories',
    supplierName: 'Global Traders',
    purchasePrice: 25.00,
    sellingPrice: 35.00,
    quantity: 15,
    unit: 'pcs',
    warehouse: 'WH-2',
    entryDate: '2025-04-10',
    enteredBy: 'manager',
    remarks: 'For remote work setup',
    isActive: true,
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: uuidv4(),
    invoiceNumber: 'INV-1001',
    date: '2025-04-08',
    customerName: 'John Doe',
    customerContact: '+1-555-123-4567',
    customerAddress: '123 Customer St, City',
    items: [
      {
        productId: mockProducts[0].id,
        productName: mockProducts[0].productName,
        quantity: 10,
        price: mockProducts[0].sellingPrice,
        total: 10 * mockProducts[0].sellingPrice,
      },
      {
        productId: mockProducts[1].id,
        productName: mockProducts[1].productName,
        quantity: 2,
        price: mockProducts[1].sellingPrice,
        total: 2 * mockProducts[1].sellingPrice,
      },
    ],
    subtotal: 10 * mockProducts[0].sellingPrice + 2 * mockProducts[1].sellingPrice,
    discount: 2,
    tax: 5,
    total: (10 * mockProducts[0].sellingPrice + 2 * mockProducts[1].sellingPrice) * 1.05 - 2,
    createdBy: 'admin',
    status: 'completed',
  },
  {
    id: uuidv4(),
    invoiceNumber: 'INV-1002',
    date: '2025-04-10',
    customerName: 'Jane Smith',
    customerContact: '+1-555-987-6543',
    customerAddress: '456 Customer Ave, Town',
    items: [
      {
        productId: mockProducts[2].id,
        productName: mockProducts[2].productName,
        quantity: 3,
        price: mockProducts[2].sellingPrice,
        total: 3 * mockProducts[2].sellingPrice,
      },
    ],
    subtotal: 3 * mockProducts[2].sellingPrice,
    discount: 0,
    tax: 5,
    total: 3 * mockProducts[2].sellingPrice * 1.05,
    createdBy: 'manager',
    status: 'completed',
  },
];

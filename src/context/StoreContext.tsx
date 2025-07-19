
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Product, 
  Supplier, 
  Category, 
  Warehouse, 
  Unit, 
  Invoice, 
  User 
} from '@/types';
import {
  mockProducts,
  mockSuppliers,
  mockCategories,
  mockWarehouses,
  mockUnits,
  mockInvoices,
  mockUsers,
  generateProductCode
} from '@/store/mockData';
import { useToast } from "@/components/ui/use-toast";

interface StoreContextType {
  products: Product[];
  suppliers: Supplier[];
  categories: Category[];
  warehouses: Warehouse[];
  units: Unit[];
  invoices: Invoice[];
  users: User[];
  currentUser: User | null;
  
  addProduct: (product: Omit<Product, 'id' | 'productCode' | 'isActive' | 'enteredBy'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  deleteWarehouse: (id: string) => void;
  
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (unit: Unit) => void;
  deleteUnit: (id: string) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdBy'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  
  login: (username: string) => boolean;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize state with mock data on first load
  useEffect(() => {
    const loadData = () => {
      // Check if data exists in localStorage
      const storedProducts = localStorage.getItem('products');
      const storedSuppliers = localStorage.getItem('suppliers');
      const storedCategories = localStorage.getItem('categories');
      const storedWarehouses = localStorage.getItem('warehouses');
      const storedUnits = localStorage.getItem('units');
      const storedInvoices = localStorage.getItem('invoices');
      const storedUsers = localStorage.getItem('users');
      const storedCurrentUser = localStorage.getItem('currentUser');

      // Set data from localStorage or use mock data
      setProducts(storedProducts ? JSON.parse(storedProducts) : mockProducts);
      setSuppliers(storedSuppliers ? JSON.parse(storedSuppliers) : mockSuppliers);
      setCategories(storedCategories ? JSON.parse(storedCategories) : mockCategories);
      setWarehouses(storedWarehouses ? JSON.parse(storedWarehouses) : mockWarehouses);
      setUnits(storedUnits ? JSON.parse(storedUnits) : mockUnits);
      setInvoices(storedInvoices ? JSON.parse(storedInvoices) : mockInvoices);
      setUsers(storedUsers ? JSON.parse(storedUsers) : mockUsers);
      
      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      } else {
        // Auto-login with admin for demo purposes
        setCurrentUser(mockUsers[0]);
      }
    };

    loadData();
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    if (products.length > 0) localStorage.setItem('products', JSON.stringify(products));
    if (suppliers.length > 0) localStorage.setItem('suppliers', JSON.stringify(suppliers));
    if (categories.length > 0) localStorage.setItem('categories', JSON.stringify(categories));
    if (warehouses.length > 0) localStorage.setItem('warehouses', JSON.stringify(warehouses));
    if (units.length > 0) localStorage.setItem('units', JSON.stringify(units));
    if (invoices.length > 0) localStorage.setItem('invoices', JSON.stringify(invoices));
    if (users.length > 0) localStorage.setItem('users', JSON.stringify(users));
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [products, suppliers, categories, warehouses, units, invoices, users, currentUser]);

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'productCode' | 'isActive' | 'enteredBy'>) => {
    const newProduct: Product = {
      id: uuidv4(),
      productCode: generateProductCode(),
      ...productData,
      enteredBy: currentUser?.username || 'unknown',
      isActive: true,
    };
    setProducts([...products, newProduct]);
    toast({
      title: "Product Added",
      description: `${newProduct.productName} has been added to inventory.`,
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    toast({
      title: "Product Updated",
      description: `${updatedProduct.productName} has been updated.`,
    });
  };

  const deleteProduct = (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    setProducts(products.filter(product => product.id !== id));
    if (productToDelete) {
      toast({
        title: "Product Deleted",
        description: `${productToDelete.productName} has been deleted from inventory.`,
      });
    }
  };

  // Supplier CRUD
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      id: uuidv4(),
      ...supplierData,
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(suppliers.map(supplier => 
      supplier.id === updatedSupplier.id ? updatedSupplier : supplier
    ));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
  };

  // Category CRUD
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      id: uuidv4(),
      ...categoryData,
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(categories.map(category => 
      category.id === updatedCategory.id ? updatedCategory : category
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  // Warehouse CRUD
  const addWarehouse = (warehouseData: Omit<Warehouse, 'id'>) => {
    const newWarehouse: Warehouse = {
      id: uuidv4(),
      ...warehouseData,
    };
    setWarehouses([...warehouses, newWarehouse]);
  };

  const updateWarehouse = (updatedWarehouse: Warehouse) => {
    setWarehouses(warehouses.map(warehouse => 
      warehouse.id === updatedWarehouse.id ? updatedWarehouse : warehouse
    ));
  };

  const deleteWarehouse = (id: string) => {
    setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
  };

  // Unit CRUD
  const addUnit = (unitData: Omit<Unit, 'id'>) => {
    const newUnit: Unit = {
      id: uuidv4(),
      ...unitData,
    };
    setUnits([...units, newUnit]);
  };

  const updateUnit = (updatedUnit: Unit) => {
    setUnits(units.map(unit => 
      unit.id === updatedUnit.id ? updatedUnit : unit
    ));
  };

  const deleteUnit = (id: string) => {
    setUnits(units.filter(unit => unit.id !== id));
  };

  // Invoice CRUD
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdBy'>) => {
    const newInvoice: Invoice = {
      id: uuidv4(),
      ...invoiceData,
      createdBy: currentUser?.username || 'unknown',
    };
    
    // Update product quantities
    const updatedProducts = [...products];
    newInvoice.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          quantity: updatedProducts[productIndex].quantity - item.quantity
        };
      }
    });
    
    setProducts(updatedProducts);
    setInvoices([...invoices, newInvoice]);
    
    toast({
      title: "Invoice Created",
      description: `Invoice #${newInvoice.invoiceNumber} has been created.`,
    });
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    ));
  };

  const deleteInvoice = (id: string) => {
    const invoiceToDelete = invoices.find(inv => inv.id === id);
    setInvoices(invoices.filter(invoice => invoice.id !== id));
    if (invoiceToDelete) {
      toast({
        title: "Invoice Deleted",
        description: `Invoice #${invoiceToDelete.invoiceNumber} has been deleted.`,
      });
    }
  };

  // Auth
  const login = (username: string): boolean => {
    const user = users.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const storeValue: StoreContextType = {
    products,
    suppliers,
    categories,
    warehouses,
    units,
    invoices,
    users,
    currentUser,
    
    addProduct,
    updateProduct,
    deleteProduct,
    
    addSupplier,
    updateSupplier,
    deleteSupplier,
    
    addCategory,
    updateCategory,
    deleteCategory,
    
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    
    addUnit,
    updateUnit,
    deleteUnit,
    
    addInvoice,
    updateInvoice,
    deleteInvoice,
    
    login,
    logout,
  };

  return (
    <StoreContext.Provider value={storeValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

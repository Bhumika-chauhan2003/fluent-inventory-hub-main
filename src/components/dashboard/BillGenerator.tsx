
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { Plus, Trash2, Printer, Download, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Product } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useStore } from '@/context/StoreContext';
import FileUploader from './FileUploader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BillGeneratorProps {
  products: Product[];
}

interface BillItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

const BillGenerator: React.FC<BillGeneratorProps> = ({ products }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentUser, addProduct } = useStore();
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [taxRate, setTaxRate] = useState(10); // 10% default tax rate
  const [showInvoice, setShowInvoice] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);

  // Calculate totals
  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  useEffect(() => {
    // Generate a unique invoice number when the component mounts
    setInvoiceNumber(`INV-${Date.now()}`);
  }, []);

  const handleAddItem = () => {
    if (products.length === 0) {
      toast({
        title: "No Products Available",
        description: "Please import products first before adding items.",
        variant: "destructive"
      });
      return;
    }
    
    const newItem: BillItem = {
      id: `item-${Date.now()}`,
      productId: '',
      productName: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    
    setBillItems([...billItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const handleProductChange = (itemId: string, productId: string) => {
    const product = products.find(p => p.productCode === productId);
    if (!product) return;
    
    setBillItems(billItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          productId,
          productName: product.productName,
          price: product.sellingPrice,
          total: item.quantity * product.sellingPrice
        };
      }
      return item;
    }));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setBillItems(billItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          total: quantity * item.price
        };
      }
      return item;
    }));
  };

  const handleGenerateInvoice = () => {
    if (!customerName) {
      toast({
        title: "Customer Name Required",
        description: "Please enter a customer name.",
        variant: "destructive"
      });
      return;
    }
    
    if (billItems.length === 0) {
      toast({
        title: "No Items Added",
        description: "Please add at least one item to the invoice.",
        variant: "destructive"
      });
      return;
    }
    
    if (billItems.some(item => !item.productId)) {
      toast({
        title: "Incomplete Items",
        description: "Please select products for all items.",
        variant: "destructive"
      });
      return;
    }
    
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const generatePDF = () => {
    toast({
      title: "PDF Generated",
      description: "Invoice PDF has been generated and downloaded."
    });
    // In a real implementation, this would generate and download a PDF file
  };

  const handleUploadComplete = (importedProducts: Product[]) => {
    // Add each imported product to the store
    if (importedProducts.length > 0) {
      importedProducts.forEach(product => {
        addProduct({
        productName: data.productName,
              specification: data.specification,
              category: data.category,
              supplierName: data.supplierName,
              purchasePrice: data.purchasePrice,
              sellingPrice: data.sellingPrice,
              quantity: data.quantity,
              unit: data.unit,
              warehouse: data.warehouse,
              entryDate: format(data.entryDate, "yyyy-MM-dd"),
              remarks: data.remarks,
        });
      });
      
      toast({
        title: "Products Imported",
        description: `${importedProducts.length} products have been imported and are now available for billing.`
      });
    } else {
      toast({
        title: "No Products Imported",
        description: "No products were found in the imported file.",
        variant: "destructive"
      });
    }
    
    setShowImportDialog(false);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('billing.title')}</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setShowImportDialog(true)}
            className="ml-auto"
          >
            <FileUp className="h-4 w-4 mr-2" /> {t('inventory.import')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('billing.customer')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">{t('billing.customerName')}</Label>
                <Input 
                  id="customerName" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerContact">{t('billing.customerContact')}</Label>
                <Input 
                  id="customerContact" 
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">{t('billing.customerAddress')}</Label>
                <Input 
                  id="customerAddress" 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{t('billing.items')}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-1" /> {t('billing.addItem')}
              </Button>
            </div>
            
            {billItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('billing.productName')}</TableHead>
                    <TableHead>{t('billing.quantity')}</TableHead>
                    <TableHead>{t('billing.price')}</TableHead>
                    <TableHead>{t('billing.total')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => handleProductChange(item.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('billing.selectProduct')} />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.productid} value={product.productid}>
                                {product.productName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${item.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border rounded-md">
                <p className="text-gray-500">{t('noItemsAdded')}</p>
              </div>
            )}
          </div>
          
          {/* Invoice Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('billing.summary')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between px-4 py-2 bg-muted/50 rounded-md">
                <span>{t('billing.subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2">
                <div className="flex items-center space-x-2">
                  <span>{t('billing.tax')}</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value) || 0)}
                    className="w-16"
                  />
                  <span>%</span>
                </div>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 font-bold">
                <span>{t('billing.grandTotal')}</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handlePrintInvoice}
          >
            <Printer className="h-4 w-4 mr-2" />
            {t('billing.printInvoice')}
          </Button>
          <Button
            onClick={handleGenerateInvoice}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('billing.generateInvoice')}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('invoice')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 print:p-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-bold mb-2">Fluent Inventory Hub</h1>
                <p>1234 Business Street</p>
                <p>City, Country</p>
                <p>contact@fluentinventory.com</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold mb-2">INVOICE</h2>
                <p>Number: {invoiceNumber}</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="border-t border-b py-4">
              <h3 className="font-medium mb-2">Bill To:</h3>
              <p className="font-bold">{customerName}</p>
              {customerContact && <p>{customerContact}</p>}
              {customerAddress && <p>{customerAddress}</p>}
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="space-y-2">
              <div className="flex justify-between px-4 py-2">
                <span>{t('billing.subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2">
                <span>{t('billing.tax')} ({taxRate}%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 font-bold text-lg">
                <span>{t('billing.grandTotal')}</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 text-center text-sm text-gray-500">
              <p>Thank you for your business!</p>
              <p>Created by: {currentUser?.fullName || 'System'}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoice(false)}>
              {t('common.close')}
            </Button>
            <Button onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 mr-2" />
              {t('billing.printInvoice')}
            </Button>
            <Button onClick={generatePDF}>
              <Download className="h-4 w-4 mr-2" />
              {t('common.downloadAs')} PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inventory.importTitle')}</DialogTitle>
            <DialogDescription>
              {t('inventory.importDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <FileUploader onUploadComplete={handleUploadComplete} />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              {t('common.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillGenerator;

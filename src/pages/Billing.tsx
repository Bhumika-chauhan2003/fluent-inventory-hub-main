import React, { useState, useEffect } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { useStore } from '@/context/StoreContext';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, PlusCircle } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { FormItem } from '@/components/ui/form';
import ReactSelect from "react-select";

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addInvoice } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedNif, setSelectedNif] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const [items, setItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/macros/s/AKfycbya0dPsiaDiX8qgb19w5NDek4Lp5FdiXMDscQIQ7LtR4bO26wQE-FgcP6-43P9-y0FbzQ/exec?action=product');
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      debugger;
      try {
        const res = await fetch('/api/macros/s/AKfycbya0dPsiaDiX8qgb19w5NDek4Lp5FdiXMDscQIQ7LtR4bO26wQE-FgcP6-43P9-y0FbzQ/exec?action=list&entity=Customer&active=1');
        const data = await res.json();
        console.log('Fetched customers:', data);
        setCustomers(data || []);
        console.log('Fetched customers:', data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = discount;
  const totalTax = (subtotal - totalDiscount) * (tax / 100);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        productName: '',
        quantity: 1,
        price: 0,
        total: 0,
      },
    ]);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.productid === productId);
    if (!product) return;

    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      productId: product.productid,
      productName: product.productName,
      price: product.sellingPrice || 0,
      total: (product.sellingPrice || 0) * updatedItems[index].quantity,
    };

    setItems(updatedItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...items];
    const product = products.find(p => p.productid === updatedItems[index].productId);
    if (product && quantity > product.RemaningProduct) {
      quantity = product.RemaningProduct;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      quantity: quantity,
      total: updatedItems[index].price * quantity,
    };
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleNifSelect = (nif: string) => {
    debugger;
    setSelectedNif(nif);
    const selected = customers.find(c => c.Customer_Nif === nif);
    if (selected) {
      setCustomerName(selected.Customer_Name || '');
      setCustomerContact(selected.Customer_ContectNo || '');
      setCustomerAddress(selected.Customer_Adders || '');
    }
  };

  const handleGenerateInvoice = async () => {
    if (items.length === 0) return;
    const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice = {
  action: "invoice",
  invoiceNumber,
  date: new Date().toISOString().split('T')[0],
  Customer_Nif: selectedNif,
  customerName,
  customerContact,
  customerAddress,
  discount: parseFloat(totalDiscount.toFixed(2)),
  tax: parseFloat(totalTax.toFixed(2)),
  total: parseFloat(grandTotal.toFixed(2)),
  items: items.map(item => ({
    productId: item.productId,
    productName: item.productName,
    quantity: parseInt(item.quantity),              // ✅ Force to number
    price: parseFloat(item.price.toFixed(2)),       // ✅ Ensure price is number
    total: parseFloat(item.total.toFixed(2)),       // ✅ Ensure total is number
  })),
};

console.log('New Invoice:', newInvoice);
    try {

      debugger;
      const response = await fetch('/api/macros/s/AKfycbx9oKJ-Qt719jsifOvBCDbQU9acNog-tm_dBuuEsipWrmrh2Ho8visV0ueCMKVakzxB1Q/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice),
      });
      const result = await response.json();
      if (!result.success) {
        alert(result.message || "Failed to save invoice.");
        return;
      }
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert("Network or server error. Please try again.");
    }
  };

  return (
    <div>
      <PageHeader title={t('billing.title')} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('billing.customer')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* NIF Dropdown */}
           <div className="space-y-2">
  <Label htmlFor="customerNif">{t('Customer Nif')}</Label>
  <ReactSelect
    id="customerNif"
    options={customers.map(c => ({
      value: c.Customer_Nif,
      label: c.Customer_Nif,
    }))}
    value={
      selectedNif
        ? { value: selectedNif, label: selectedNif }
        : null
    }
    onChange={(selectedOption) => {
      const nif = selectedOption?.value || '';
      setSelectedNif(nif);
      const selected = customers.find(c => c.Customer_Nif === nif);
      if (selected) {
        setCustomerName(selected.Customer_Name || '');
        setCustomerContact(selected.Customer_ContectNo || '');
        setCustomerAddress(selected.Customer_Adders || '');
      }
    }}
    isSearchable
    placeholder={t('billing.selectCustomerNif')}
  />
</div>

            <div className="space-y-2">
              <Label>{t('billing.customerName')}</Label>
              <Input value={customerName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t('billing.customerContact')}</Label>
              <Input value={customerContact} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t('billing.customerAddress')}</Label>
              <Input value={customerAddress} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('billing.summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span>{t('billing.subtotal')}</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>{t('billing.discount')}</span>
              <div className="flex items-center gap-2">
                <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-24" />
                <span className="font-medium">-${totalDiscount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>{t('billing.tax')} (%)</span>
              <div className="flex items-center gap-2">
                <Input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="w-24" />
                <span className="font-medium">+${totalTax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>{t('billing.grandTotal')}</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">{t('billing.printInvoice')}</Button>
            <Button onClick={handleGenerateInvoice} disabled={items.length === 0}>
              {t('billing.generateInvoice')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Invoice Items Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('billing.items')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('billing.productName')}</TableHead>
                <TableHead>{t('billing.quantity')}</TableHead>
                <TableHead>{t('billing.price')}</TableHead>
                <TableHead>{t('billing.total')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {loadingProducts ? (
                        <div>Loading products...</div>
                      ) : (
                        <Select value={item.productId} onValueChange={(value) => handleProductChange(index, value)}>
                          <SelectTrigger>
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
                      )}
                    </TableCell>
                    <TableCell>
                      <Input type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(index, Number(e.target.value))} className="w-20" />
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>${item.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('billing.addItem')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Billing;



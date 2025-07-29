import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API_URL = 'https://script.google.com/macros/s/AKfycbzxJUc4GBGc88LF-enlrIyg6vd2P8IMBnDDd4IOhZfTIz33V8BGHKmDJ3vFLnQvRUyDog/exec'; // ✅ Use your Web App URL

const CustomerMaster: React.FC = () => {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState('CustomerForm');
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [nif, setNif] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setCustomerName('');
    setAddress('');
    setContact('');
    setNif('');
    setDescription('');
    setEditMode(false);
    setEditId(null);
  };

  const fetchCustomers = async () => {
    debugger;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?entity=Customer&action=list&active=1`);
      const data = await res.json();
      console.log('Fetched customers:', data);
      setCustomerList(data);
    } catch (err) {
      console.error('Error fetching customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!customerName.trim()) return;

    const payload = editMode
      ? {
          entity: 'Customer',
          action: 'update',
          id: editId,
          Customer_Name: customerName.trim(),
          Customer_Adders: address,
          Customer_ContectNo: contact,
          Customer_Nif: nif,
          Customer_Description: description,
          ModifiedBy: '1',
        }
      : {
          entity: 'Customer',
          action: 'insert',
          Customer_Name: customerName.trim(),
          Customer_Adders: address,
          Customer_ContectNo: contact,
          Customer_Nif: nif,
          Customer_Description: description,
          AddedBy: '1',
        };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await res.json();
      console.log('Save result:', result);

      if (result.success) {
        toast.success(editMode ? t('customerForm.UpdateSuccess') : t('customerForm.AddSuccess'));
        resetForm();
        fetchCustomers();
        setTabValue('CustomerListing');
      } else {
        alert('Save failed. Please check the response.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error while saving customer.');
    }
  };

  const handleEdit = (cust: any) => {
    setCustomerName(cust.Customer_Name);
    setAddress(cust.Customer_Adders);
    setContact(cust.Customer_ContectNo);
    setNif(cust.Customer_Nif);
    setDescription(cust.Customer_Description);
    setEditId(cust.Customer_Id);
    setEditMode(true);
    setTabValue('CustomerForm');
  };

const handleDelete = async (id: string) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this customer?');
  if (!confirmDelete) return;

  const payload = {
    entity: 'Customer',
    action: 'delete',
    id,
    ModifiedBy: '1',
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await res.json();
    if (result.success) {
      toast.success(t('customerForm.deleteSuccess'));
      fetchCustomers(); // Refresh customer list
    } else {
      toast.error('Failed to delete the customer.');
    }
  } catch (err) {
    console.error('Delete error:', err);
    toast.error('Error while deleting customer.');
  }
};


  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      <TabsList className="w-full mb-6">
        <TabsTrigger value="CustomerForm">{t('customerForm.CustomerForm')}</TabsTrigger>
        <TabsTrigger value="CustomerListing">{t('customerForm.CustomerListing')}</TabsTrigger>
      </TabsList>

      <TabsContent value="CustomerForm">
        <Card>
          <CardHeader>
            <CardTitle>{editMode ? t('customerForm.EditCustomer') : t('customerForm.AddCustomer')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">{t('customerForm.CustomerName')}</Label>
              <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t('customerForm.Address')}</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">{t('customerForm.Contact')}</Label>
              <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">{t('customerForm.NIF')}</Label>
              <Input id="nif" value={nif} onChange={(e) => setNif(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('customerForm.Description')}</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleSaveCustomer}>{editMode ?  t('customerForm.Update') : t('customerForm.Add')}</Button>
            {editMode && (
              <Button variant="ghost" onClick={resetForm}>
                 {t('customerForm.Cancel')}
              </Button>
            )}
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="CustomerListing">
        <Card>
          <CardHeader>
            <CardTitle>{t('customerForm.Customers')}</CardTitle>
            <CardDescription>{t('customerForm.AllActiveCustomers')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">{t('customerForm.Loading')}</p>
            ) : customerList.length === 0 ? (
              <p className="text-gray-500">{t('customerForm.NoCustomerFound')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerList.map((cust) => (
                  <div key={cust.Customer_Id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    
                      <div>
                      <p className="font-medium">{cust.Customer_Name}</p>
                      <p className="text-sm text-gray-600">
                        {cust.Customer_Adders || "No contact"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(cust)}>
                       {t('customerForm.Edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cust.Customer_Id)}>
                        {t('customerForm.Delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CustomerMaster;

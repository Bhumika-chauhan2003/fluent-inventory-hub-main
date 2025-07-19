import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import PageHeader from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MoreVertical,
  Eye,
  Printer,
  Trash2,
  FileText,
} from 'lucide-react';
import { Invoice } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import logo from '../assets/images/logo.png';

const mapInvoiceKeys = (invoice: any) => {
  let formattedDate = invoice.Date;
  if (invoice.Date) {
    const d = new Date(invoice.Date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    formattedDate = `${day}/${month}/${year}`;
  }
  return {
    id: invoice.InvoiceNumber,
    invoiceNumber: invoice.InvoiceNumber,
    date: formattedDate,
    customerName: invoice.CustomerName,
    customerContact: invoice.Contact,
    customerAddress: invoice.Address,
    subtotal: invoice.Subtotal,
    discount: invoice.Discount,
    tax: invoice.Tax,
    total: invoice.GrandTotal,
    status: invoice.status,
    items: (invoice.items || []).map((item: any) => ({
      productId: item.ProductID,
      productName: item.ProductName,
      quantity: item.Quantity,
      price: item.Price,
      total: item.Total,
    })),
  };
};

const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const [invoiceData, setInvoiceData] = useState<Invoice[]>([]);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
console.log("Invoice Data:", invoiceToDelete);
const handlePrint = () => {
  if (!printRef.current || !selectedInvoice) return;

  const printContents = printRef.current.innerHTML;
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) return;

  const logoURL = logo; // already imported

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice #${selectedInvoice.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #000;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .invoice-header img {
            height: 60px;
          }
          .invoice-section {
            margin-bottom: 16px;
          }
          .invoice-box {
            background-color: #f9f9f9;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #f0f0f0;
            text-align: left;
          }
          .total-row {
            font-weight: bold;
            border-top: 2px solid #000;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <img src="${logoURL}" alt="Logo" />
          <div>
            <div><strong>Invoice #${selectedInvoice.invoiceNumber}</strong></div>
            <div>${selectedInvoice.date}</div>
          </div>
        </div>

        <div class="invoice-section invoice-box">
          <strong>Customer Information</strong><br/>
          ${selectedInvoice.customerName || 'Walk-in Customer'}<br/>
          ${selectedInvoice.customerContact || ''}<br/>
          ${selectedInvoice.customerAddress || ''}
        </div>

        <div class="invoice-section">
          <strong>Bill Items</strong>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${selectedInvoice.items.map(item => `
                <tr>
                  <td style="text-align: left;">${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="text-align: right;">
            <div>Subtotal: $${selectedInvoice.subtotal.toFixed(2)}</div>
            <div>Discount: -$${selectedInvoice.discount.toFixed(2)}</div>
            <div>Tax: +$${selectedInvoice.tax.toFixed(2)}</div>
            <div class="total-row">Grand Total: $${selectedInvoice.total.toFixed(2)}</div>
          </div>
        </div>

        <div class="footer">
          Thank you for your business!
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};


  const fetchInvoices = useCallback(async () => {
    try {
      const response = await fetch(
        '/api/macros/s/AKfycbya0dPsiaDiX8qgb19w5NDek4Lp5FdiXMDscQIQ7LtR4bO26wQE-FgcP6-43P9-y0FbzQ/exec?action=invoice'
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map(mapInvoiceKeys);
        setInvoiceData(mapped);
      } else {
        console.error('Unexpected API response:', data);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
console.log("Deleting product:", invoiceToDelete);
  try {
    const res = await fetch(`/api/macros/s/AKfycbya0dPsiaDiX8qgb19w5NDek4Lp5FdiXMDscQIQ7LtR4bO26wQE-FgcP6-43P9-y0FbzQ/exec?action=deleteinvoice&InvoiceNumber=${invoiceToDelete}`, {
      method: "GET",
    });

    const result = await res.json();

   if (result.success) {
      setInvoiceData(prev => prev.filter(inv => inv.id !== invoiceToDelete));
      toast.success("Invoice deleted successfully.");
    } else {
      toast.error("Failed to delete invoice.");
    }
  } catch (error) {
    console.error("Delete failed:", error);
    toast.error("Error deleting invoice.");
  } finally {
    setInvoiceToDelete(null);
  }
};

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: t('invoices.number'),
    },
    {
      accessorKey: 'date',
      header: t('invoices.date'),
    },
    {
      accessorKey: 'customerName',
      header: t('invoices.customer'),
      cell: ({ row }) => row.original.customerName || 'Walk-in Customer',
    },
    {
      accessorKey: 'total',
      header: t('invoices.total'),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('total'));
        return <div className="font-medium">${amount.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: t('invoices.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('invoices.print')}
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                {t('invoices.print')}
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => setInvoiceToDelete(invoice.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('invoices.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title={t('invoices.title')}>
        <Button asChild>
          <Link to="/billing">
            <FileText className="mr-2 h-4 w-4" /> {t('billing.title')}
          </Link>
        </Button>
      </PageHeader>

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={invoiceData}
          searchPlaceholder={t('invoices.search')}
          searchColumn="invoiceNumber"
        />
      </Card>

      <Dialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
            <DialogDescription>{t('messages.deleteWarning')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceToDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <img src={logo} alt="Logo" className="h-[82px] w-[18%] ml-[8px]" />
              <span>Invoice # {selectedInvoice?.invoiceNumber}</span>
              <span className="text-sm font-normal">{selectedInvoice?.date}</span>
            </DialogTitle>
          </DialogHeader>

          <div ref={printRef}>
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">{t('billing.customer')}</h3>
                  <p>{selectedInvoice.customerName || 'Walk-in Customer'}</p>
                  {selectedInvoice.customerContact && <p>{selectedInvoice.customerContact}</p>}
                  {selectedInvoice.customerAddress && <p>{selectedInvoice.customerAddress}</p>}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('billing.items')}</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="p-2 border">{t('billing.productName')}</th>
                        <th className="p-2 border text-right">{t('billing.quantity')}</th>
                        <th className="p-2 border text-right">{t('billing.price')}</th>
                        <th className="p-2 border text-right">{t('billing.total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 border">{item.productName}</td>
                          <td className="p-2 border text-right">{item.quantity}</td>
                          <td className="p-2 border text-right">${item.price.toFixed(2)}</td>
                          <td className="p-2 border text-right">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('billing.subtotal')}</span>
                    <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('billing.discount')}</span>
                    <span>-${selectedInvoice.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('billing.tax')}</span>
                    <span>+${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>{t('billing.grandTotal')}</span>
                    <span>${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              {t('invoices.print')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;

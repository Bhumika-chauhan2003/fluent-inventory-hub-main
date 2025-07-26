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
import { Description } from '@radix-ui/react-toast';

const mapInvoiceKeys = (invoice: any) => {
  debugger;
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
  unit: item.unitName || item.Unit_Name || item.unit || "", // always map to 'unit'
  description: item.description || item.Description || "",   // always map to 'description'
})),
  };
};
//console.log("Mapped Invoice Keys:", mapInvoiceKeys);

const Invoices: React.FC = () => {
  debugger;
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
const minRows = 25;
const items = selectedInvoice.items;
const paddedItems = [
  ...items,
  ...Array(Math.max(0, minRows - items.length)).fill({
    productName: '',
    description: '',
    quantity: '',
    unit: '',
    price: '',
    total: '',
   
  }),
];
  printWindow.document.open();
printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Delivery Note</title>
  <style>
    * {
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      width: 210mm;
      height: 297mm;
      margin: 0 auto;
      padding: 20mm;
      background: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    td, th {
      border: 1px solid #000;
      padding: 4px;
      font-size: 12px;
      text-align: left;
    }
        tr, td {
    height: 20px; /* Ensures all rows have the same height */
    min-height: 28px;
    vertical-align: middle;
  }
    .text-right {
      text-align: right;
    }
    .header-box {
      border: 1px solid #000;
      height: 80px;
      margin-bottom: 10px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-top: 5px;
    }
    .half {
      width: 48%;
    }
    .table-header {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    .bordered {
      border: 1px solid #000;
      padding: 4px;
    }
    .observaciones {
      height: 80px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header-box"><h2 style="margin: 10px;">Delivery Note</h2></div>

  <div><strong>${selectedInvoice.customerName || ''}</strong></div>

  <div class="row">
    <div><strong>${selectedInvoice.customerContact || ''}</strong></div>
    <div class="half">
      <table>
        <tr class="table-header">
          <th>DOCUMENT</th>
          <th>NUMBER</th>
          <th>PAGE</th>
          <th>DATE</th>
        </tr>
        <tr>
          <td>Delivery Note</td>
          <td>${selectedInvoice.invoiceNumber}</td>
          <td>1</td>
          <td>${selectedInvoice.date}</td>
        </tr>
      </table>
    </div>
  </div>

  <table>
    <tr class="table-header">
      <th>TAX ID</th>
      <th>AGENT</th>
      <th>PAYMENT METHOD</th>
    </tr>
    <tr>
      <td>${selectedInvoice.tax}</td>
      <td></td>
      <td>Online / Cash</td>
    </tr>
  </table>

  <table>
    <thead>
      <tr class="table-header">
        <th>ITEM</th>
        <th>DESCRIPTION</th>
        <th>QUANTITY</th>
        <th>UNIT</th>
        <th>UNIT PRICE</th>
        <th>DISCOUNT</th>
        <th>TOTAL</th>
      </tr>
    </thead>
    <tbody>
  ${paddedItems.map(item => `
    <tr>
      <td>${item.productName || ''}</td>
      <td>${item.description || ''}</td>
      <td class="text-right">${item.quantity ?? ''}</td>
      <td class="text-right">${item.unit || ''}</td>
      <td class="text-right">${item.price !== '' && item.price != null ? Number(item.price).toFixed(2) : ''}</td>
      <td class="text-right">${
  item.productName
    ? (item.discount !== undefined && item.discount !== '' ? Number(item.discount).toFixed(2) : (selectedInvoice.discount ? Number(selectedInvoice.discount).toFixed(2) : ''))
    : ''
}</td>
      <td class="text-right">${item.total !== '' && item.total != null ? Number(item.total).toFixed(2) : ''}</td>
    </tr>
  `).join('')}
</tbody>
  </table>

  <table>
    <tr class="table-header">
      <th>TYPE</th>
      <th>AMOUNT</th>
      <th>DISCOUNT</th>
      <th>EARLY PAYMENT</th>
      <th>SHIPPING</th>
      <th>FINANCING</th>
      <th>BASE</th>
      <th>VAT</th>
      <th>RE.</th>
    </tr>
    ${selectedInvoice.items.map(item => `
      <tr>
        <td>${item.productName}</td>
        <td>$${item.price != null ? Number(item.price).toFixed(2) : ''}</td>
        <td>${selectedInvoice.discount ? Number(selectedInvoice.discount).toFixed(2) : ''}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    `).join('')}
  </table>

  <div class="row">
    <div class="half">
      <strong>NOTES:</strong>
      <div class="bordered observaciones"></div>
    </div>
    <div class="half text-right">
      <table>
        <tr class="table-header">
          <th>TOTAL:</th>
          <td>$${selectedInvoice.total != null ? Number(selectedInvoice.total).toFixed(2) : ''}</td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>

<script>
  window.onload = function() {
    window.print();
    window.close();
  };
</script>
`);

  printWindow.document.close();
};


  const fetchInvoices = useCallback(async () => {
    debugger;
    console.log("Fetching invoices...");
    try {
      const response = await fetch(
        '/api/macros/s/AKfycbxQyYRWkRcM30UyrjPlNPPChviImGl--OLb2Fn4k8MmU2OUGS5s0R6lmm46bq2uQX-h/exec?action=Invoicetstenew'
      );
      const data = await response.json();
      console.log("Fetched Invoices:", data);
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

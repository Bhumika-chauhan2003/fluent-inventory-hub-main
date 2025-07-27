// src/pages/PrintInvoice.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PrintInvoice: React.FC = () => {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`https://script.google.com/macros/s/AKfycby5kQN_AfHWZjqevDpnjfakKYDSCcLSxk2iPEnf5c3ub99FfzzcZVWoa8wRVjLJpE-FZg/exec?action=Invoicetstenew&InvoiceNumber=${invoiceNumber}`);
        const result = await response.json();
        setInvoice(result.data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
        setTimeout(() => window.print(), 500);
      }
    };
    if (invoiceNumber) fetchInvoice();
  }, [invoiceNumber]);

  if (loading) return <div>Loading...</div>;
  if (!invoice) return <div>No invoice found.</div>;

  return (
    <div className="p-10 print:p-0">
      <h1 className="text-2xl font-bold mb-4">Invoice #{invoice.invoiceNumber}</h1>
      <div className="mb-4">
        <p><strong>Date:</strong> {invoice.date}</p>
        <p><strong>Customer:</strong> {invoice.customerName}</p>
        <p><strong>NIF:</strong> {invoice.Customer_Nif}</p>
        <p><strong>Contact:</strong> {invoice.customerContact}</p>
        <p><strong>Address:</strong> {invoice.customerAddress}</p>
      </div>

      <table className="w-full border-collapse border mb-4 text-sm">
        <thead>
          <tr className="bg-gray-200 border">
            <th className="p-2 border">#</th>
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: any, index: number) => (
            <tr key={index} className="border">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{item.productName}</td>
              <td className="p-2 border">{item.quantity}</td>
              <td className="p-2 border">${item.price.toFixed(2)}</td>
              <td className="p-2 border">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right space-y-1">
        <p><strong>Subtotal:</strong> ${invoice.items.reduce((sum: number, i: any) => sum + i.total, 0).toFixed(2)}</p>
        <p><strong>Discount:</strong> -${invoice.discount.toFixed(2)}</p>
        <p><strong>Tax:</strong> +${invoice.tax.toFixed(2)}</p>
        <p className="text-lg font-bold"><strong>Grand Total:</strong> ${invoice.total.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default PrintInvoice;

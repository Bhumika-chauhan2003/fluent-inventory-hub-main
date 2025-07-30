// src/pages/InvoicePrintPage.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const InvoicePrintPage: React.FC = () => {
  const location = useLocation();
  const selectedInvoice = location.state?.invoice;

  useEffect(() => {
    if (!selectedInvoice) return;

    setTimeout(() => {
      window.print();
    }, 500);
  }, [selectedInvoice]);

  if (!selectedInvoice) {
    return <div>No invoice data provided.</div>;
  }

  const minRows = 25;
  const paddedItems = [...selectedInvoice.items];
  while (paddedItems.length < minRows) {
    paddedItems.push({});
  }

  return (
    <div style={{ padding: '20mm', fontFamily: 'Arial' }}>
      <div className="header-box" style={{ border: '1px solid #000', height: '80px', marginBottom: 10 }}>
        <h2 style={{ margin: 10 }}>Delivery Note</h2>
      </div>

      <div><strong>{selectedInvoice.customerName}</strong></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <div><strong>{selectedInvoice.customerContact}</strong></div>
        <div style={{ width: '48%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }} border={1}>
            <thead>
              <tr>
                <th>DOCUMENT</th>
                <th>NUMBER</th>
                <th>PAGE</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Delivery Note</td>
                <td>{selectedInvoice.invoiceNumber}</td>
                <td>1</td>
                <td>{selectedInvoice.date}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table style={{ width: '100%', marginTop: 10 }} border={1}>
        <thead>
          <tr>
            <th>TAX ID</th>
            <th>AGENT</th>
            <th>PAYMENT METHOD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{selectedInvoice.tax}</td>
            <td></td>
            <td>Online / Cash</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', marginTop: 10 }} border={1}>
        <thead>
          <tr>
            <th>ITEM</th>
            <th>DESCRIPTION</th>
            <th>QUANTITY</th>
            <th>UNIT PRICE</th>
            <th>SUBTOTAL</th>
            <th>DISCOUNT</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {paddedItems.map((item: any, index: number) => (
            <tr key={index}>
              <td>{item.productName || ''}</td>
              <td>{item.description || ''}</td>
              <td>{item.quantity || ''}</td>
              <td>{item.unitPrice !== undefined ? item.unitPrice.toFixed(2) : ''}</td>
              <td>{item.price !== undefined ? item.price.toFixed(2) : ''}</td>
              <td>{item.productName ? selectedInvoice.discount?.toFixed(2) : ''}</td>
              <td>{item.total !== undefined ? item.total.toFixed(2) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table style={{ width: '100%', marginTop: 10 }} border={1}>
        <thead>
          <tr>
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
        </thead>
        <tbody>
          {selectedInvoice.items.map((item: any, index: number) => (
            <tr key={index}>
              <td>{item.productName}</td>
              <td>${item.price?.toFixed(2)}</td>
              <td>{selectedInvoice.discount?.toFixed(2)}</td>
              <td colSpan={6}></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <div style={{ width: '48%' }}>
          <strong>NOTES:</strong>
          <div style={{ border: '1px solid #000', height: 80, marginTop: 5 }}></div>
        </div>
        <div style={{ width: '48%', textAlign: 'right' }}>
          <table style={{ width: '100%' }} border={1}>
            <thead>
              <tr>
                <th>TOTAL:</th>
                <td>${selectedInvoice.total?.toFixed(2)}</td>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPage;

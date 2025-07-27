import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslationWrapper";
import { useStore } from "@/context/StoreContext";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, PlusCircle } from "lucide-react";
import ReactSelect from "react-select";
import logo from "../assets/images/logo.png";
import { toast } from "sonner";

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addInvoice } = useStore();

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [invoiceNumber, setinvoicenumber] = useState("");
  const [selectedNif, setSelectedNif] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = discount;
  const totalTax = (subtotal - totalDiscount) * (tax / 100);
  const grandTotal = subtotal - totalDiscount + totalTax;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzJtgE2o0cDAW5X3u8belaDMvkdRyyMCV7eO0F71NKSK8uYQ-bWmCroCycBwMjSWJ6UHw/exec?action=product"
        );
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbzJtgE2o0cDAW5X3u8belaDMvkdRyyMCV7eO0F71NKSK8uYQ-bWmCroCycBwMjSWJ6UHw/exec?action=list&entity=Customer&active=1"
        );
        const data = await res.json();
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { productId: "", productName: "", quantity: 1, price: 0, total: 0 },
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
    const product = products.find(
      (p) => p.productid === updatedItems[index].productId
    );
if (!product) return;

  // If the product is out of stock
  if (product.RemaningProduct === 0) {
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: 0,
      price: 0,
      total: 0,
    };
  } else {
    // If entered quantity exceeds available stock
    if (quantity > product.RemaningProduct) {
      quantity = product.RemaningProduct;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      total: updatedItems[index].price * quantity,
    };
  }

  setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleGenerateInvoice = async () => {
    if (items.length === 0) return;
  const hasInvalidItem = items.some((item) => item.quantity <= 0);
  if (hasInvalidItem) {
    alert("Cannot generate invoice: One or more products have 0 quantity.");
    return;
  }

  if (subtotal <= 0) {
    alert("Please add valid items to the invoice.");
    return;
  }
    
    const generatedNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceData = {
      action: "invoice",
      invoiceNumber: generatedNumber,
      date: new Date().toISOString().split("T")[0],
      Customer_Nif: selectedNif,
      customerName,
      customerContact,
      customerAddress,
      discount: parseFloat(totalDiscount.toFixed(2)),
      tax: parseFloat(totalTax.toFixed(2)),
      total: parseFloat(grandTotal.toFixed(2)),
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price.toFixed(2)),
        total: parseFloat(item.total.toFixed(2)),
      })),
    };
  
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzJtgE2o0cDAW5X3u8belaDMvkdRyyMCV7eO0F71NKSK8uYQ-bWmCroCycBwMjSWJ6UHw/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoiceData),
        }
      );
      const result = await response.json();

      if (!result.success) {
        alert(result.message || "Failed to save invoice.");
        return;
      }

      setinvoicenumber(generatedNumber);
      toast.success(t("billing.invoicegenerated"));
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Network or server error. Please try again.");
    }
  };

  const handlePrintInvoice = async () => {
    debugger;
    if (!invoiceNumber) {
      alert("Please generate invoice first.");
      return;
    }

    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbzJtgE2o0cDAW5X3u8belaDMvkdRyyMCV7eO0F71NKSK8uYQ-bWmCroCycBwMjSWJ6UHw/exec?action=Invoicetstenew&InvoiceNumber=${invoiceNumber}`
      );
      const result = await response.json();

      if (result.data) {
        setSelectedInvoice(result.data);
        printSavedInvoice(result.data);
      } else {
        alert("Invoice not found. Please try again.");
      }
    } catch (error) {
      console.error("Print fetch failed:", error);
      alert("Failed to fetch invoice for printing.");
    }
  };

const printSavedInvoice = (invoice: any) => {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) return;
 const Delivary = t("PrintInvoive.Delivary");
 const Documnet = t("PrintInvoive.Documnet");
 const InvoiceNumber = t("PrintInvoive.InvoiceNumber");
  console.log("Printing invoice:", invoice);

  const invoiceItems = invoice.items || [];
  const minRows = 25;

  const paddedItems = [
    ...invoiceItems,
    ...Array(Math.max(0, minRows - invoiceItems.length)).fill({
      ProductName: "",
      Description: "",
      Quantity: "",
      Unit_Name: "",
      Price: "",
      Discount: "",
      Total: "",
    }),
  ];
console.log("Padded items for printing:", paddedItems);
  console.log("Invoice data for printing:", invoice);
  printWindow.document.open();
  printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Delivery Note</title>
  <style>
    * { box-sizing: border-box; font-family: Arial, sans-serif; }
    @page { size: A4; margin: 20mm; }
    body { width: 210mm; height: 297mm; margin: 0 auto; padding: 20mm; background: #fff; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    td, th { border: 1px solid #000; padding: 4px; font-size: 12px; text-align: left; }
    tr, td { height: 20px; min-height: 28px; vertical-align: middle; }
    .text-right { text-align: right; }
    .header-box { border: 1px solid #000; height: 80px; margin-bottom: 10px; }
    .row { display: flex; justify-content: space-between; margin-top: 5px; }
    .half { width: 48%; }
    .table-header { background-color: #f0f0f0; font-weight: bold; }
    .bordered { border: 1px solid #000; padding: 4px; }
    .observaciones { height: 80px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header-box"><h2 style="margin: 10px;">${Delivary}</h2></div>

  <div><strong>${invoice.CustomerName || ""}</strong></div>

  <div class="row">
    <div><strong>${invoice.Contact || ""}</strong></div>
    <div class="half">
      <table>
        <tr class="table-header">
          <th>${Documnet}</th>
          <th>${InvoiceNumber}</th>
          <th>PAGE</th>
          <th>DATE</th>
        </tr>
        <tr>
          <td>Delivery Note</td>
          <td>${invoice.InvoiceNumber || ""}</td>
          <td>1</td>
          <td>${invoice.Date ? new Date(invoice.Date).toLocaleDateString() : ""}</td>
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
      <td>${invoice.Customer_NIF || ""}</td>
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
      ${paddedItems
        .map(
          (item) => `
        <tr>
          <td>${item.ProductName || ""}</td>
          <td>${item.Description || ""}</td>
          <td class="text-right">${item.Quantity ?? ""}</td>
          <td class="text-right">${item.Unit_Name || ""}</td>
          <td class="text-right">${
            item.Price !== "" && item.Price != null
              ? Number(item.Price).toFixed(2)
              : ""
          }</td>
          <td class="text-right">${
            item.ProductName && invoice.Discount !== undefined && invoice.Discount !== ""
              ? Number(invoice.Discount).toFixed(2)
              : ""
          }</td>
          <td class="text-right">${
            item.Total !== "" && item.Total != null
              ? Number(item.Total).toFixed(2)
              : ""
          }</td>
        </tr>
      `
        )
        .join("")}
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
    ${invoiceItems
      .map(
        (item) => `
      <tr>
        <td>${item.ProductName || ""}</td>
        <td>${
          item.Price != null ? `$${Number(item.Price).toFixed(2)}` : ""
        }</td>
        <td>${invoice.Discount ? Number(invoice.Discount).toFixed(2) : ""}</td>
       
        <td></td><td></td><td></td><td></td><td></td><td></td>
      </tr>
    `
      )
      .join("")}
  </table>

  <div class="row">
    <div class="half">
      <strong>NOTES:</strong>
      <div class="bordered observaciones"></div>
    </div>
    <div class="half text-right">
      <table>
      
        <tr class="table-header">
          <th>GRAND TOTAL:</th>
          <td>$${Number(invoice.GrandTotal).toFixed(2)}</td>
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

  return (
    <div>
      <PageHeader title={t("billing.title")} />

      {/* Customer Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("billing.customer")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerNif">{t("Customer Nif")}</Label>
              <ReactSelect
                id="customerNif"
                options={customers.map((c) => ({
                  value: c.Customer_Nif,
                  label: c.Customer_Nif,
                }))}
                value={
                  selectedNif
                    ? { value: selectedNif, label: selectedNif }
                    : null
                }
                onChange={(option) => {
                  const nif = option?.value || "";
                  setSelectedNif(nif);
                  const selected = customers.find(
                    (c) => c.Customer_Nif === nif
                  );
                  if (selected) {
                    setCustomerName(selected.Customer_Name || "");
                    setCustomerContact(selected.Customer_ContectNo || "");
                    setCustomerAddress(selected.Customer_Adders || "");
                  }
                }}
                isSearchable
                placeholder={t("billing.selectCustomerNif")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("billing.customerName")}</Label>
              <Input value={customerName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t("billing.customerContact")}</Label>
              <Input value={customerContact} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t("billing.customerAddress")}</Label>
              <Input value={customerAddress} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("billing.summary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span>{t("billing.subtotal")}</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>{t("billing.discount")}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24"
                />
                <span className="font-medium">
                  -${totalDiscount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>{t("billing.tax")} (%)</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-24"
                />
                <span className="font-medium">+${totalTax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>{t("billing.grandTotal")}</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handlePrintInvoice}>
              {t("billing.printInvoice")}
            </Button>
            <Button
              onClick={handleGenerateInvoice}
              disabled={items.length === 0}
            >
              {t("billing.generateInvoice")}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Invoice Items Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("billing.items")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("billing.productName")}</TableHead>
                <TableHead>{t("billing.quantity")}</TableHead>
                <TableHead>{t("billing.price")}</TableHead>
                <TableHead>{t("billing.total")}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    {t("common.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {loadingProducts ? (
                        <div>Loading products...</div>
                      ) : (
                        <Select
                          value={item.productId}
                          onValueChange={(value) =>
                            handleProductChange(index, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("billing.selectProduct")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem
                                key={product.productid}
                                value={product.productid}
                              >
                                {product.productName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, Number(e.target.value))
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>${item.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
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
            {t("billing.addItem")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Billing;
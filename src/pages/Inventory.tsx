import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslationWrapper";
import PageHeader from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  FileUp,
  FileDown,
  MoreVertical,
  Edit,
  Trash2,
  ShieldAlert,
  Eye,
} from "lucide-react";
import { Product } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import ImportDialog from "@/components/inventory/ImportDialog";

const Inventory: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // ✅ Use proxy path to avoid CORS issue
  const API_URL =
    "https://script.google.com/macros/s/AKfycbzxJUc4GBGc88LF-enlrIyg6vd2P8IMBnDDd4IOhZfTIz33V8BGHKmDJ3vFLnQvRUyDog/exec";

  useEffect(() => {
    const fetchProducts = async () => {
      debugger;
      try {
        const res = await fetch(`${API_URL}?action=product`);
        const result = await res.json();
        // If your API returns { success: true, data: [...] }
        if (result.success && Array.isArray(result.data)) {
          setProducts(result.data);
          console.log("Products fetched:", result.data);
        } else {
          setProducts([]);
          console.error("Unexpected API response:", result);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

const handleDeleteConfirm = async () => {
  debugger;
  if (!productToDelete) return;
console.log("Deleting product:", productToDelete);
  try {
    const res = await fetch(`${API_URL}?action=deleteproduct&ProductID=${productToDelete}`, {
      method: "GET",
    });

    const result = await res.json();

    if (result.success) {
      toast.success("Product deleted successfully");
      setProducts((prev) =>
        prev.filter((p) => p.productid !== productToDelete)
      );
    } else {
      toast.error("Delete failed it is a part of a Inventory transaction");
    }
  } catch (err) {
    console.error("Failed to delete product:", err);
    toast.error("Delete failed");
  } finally {
    setProductToDelete(null);
  }
};


  const displayedFields = [
    { key: "productid", label: t("product.code") },
    { key: "productName", label: t("product.name") },
    { key: "Category_Name", label: t("product.category") },
    { key: "quantity", label: t("product.quantity") },
    { key: "Warehouse_Name", label: t("product.warehouse") },
    { key: "sellingPrice", label: t("product.sellingPrice") },
    {key:"RemaningProduct", label: t("product.RemaingQuantity")}, // Assuming this is a field in your Product type
  ];

  const columns: ColumnDef<Product>[] = [
    ...displayedFields.map((field) => ({
      accessorKey: field.key,
      header: field.label,
      cell: ({ row }: any) => {
        const value = row.getValue(field.key);

        if (field.key === "quantity") {
          const quantity = parseFloat(value);
          const unit = row.original.unit;
          return (
            <div className="font-medium">
              {quantity} {unit}
              {quantity < 10 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  {t("inventory.lowStock")}
                </span>
              )}
            </div>
          );
        }

        if (field.key === "sellingPrice") {
          return (
            <div className="font-medium">${parseFloat(value).toFixed(2)}</div>
          );
        }

        return <div>{value}</div>;
      },
    })),
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only"> {t("inventory.openmenue")}</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/edit-product?productid=${product.productid}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log("Edit row:", product);
                                    navigate(`/edit-product?productid=${product.productid}`);

                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setProductToDelete(product.productid)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleExportData = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += displayedFields.map((field) => field.label).join(",") + "\n";

    products.forEach((product) => {
      const row = displayedFields.map((field) => {
        const value = product[field.key as keyof Product];
        return typeof value === "string" ? `"${value}"` : value;
      });
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `inventory-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader title={t("inventory.title")}>
        <Button asChild>
          <Link to="/add-product">
            <Plus className="mr-2 h-4 w-4" /> {t("inventory.add")}
          </Link>
        </Button>
        {/* <Button variant="outline" onClick={() => setShowImportDialog(true)}>
          <FileUp className="mr-2 h-4 w-4" /> {t("import.importData")}
        </Button> */}
        <Button variant="outline" onClick={handleExportData}>
          <FileDown className="mr-2 h-4 w-4" /> {t("inventory.export")}
        </Button>
      </PageHeader>

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={products}
          searchPlaceholder={t("inventory.search")}
          searchColumn="productName"
        />
      </Card>

      <Dialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("messages.confirmDelete")}</DialogTitle>
            <DialogDescription>{t("messages.deleteWarning")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
};

export default Inventory;
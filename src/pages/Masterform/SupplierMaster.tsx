import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslationWrapper";

import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const API_URL =
  "https://script.google.com/macros/s/AKfycby5kQN_AfHWZjqevDpnjfakKYDSCcLSxk2iPEnf5c3ub99FfzzcZVWoa8wRVjLJpE-FZg/exec";

const SupplierMaster: React.FC = () => {
    const { t } = useTranslation();
  

  const [supplierName, setSupplierName] = useState("");
  const [contactSupplier, setContactSupplier] = useState("");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?entity=Supplier&action=list&active=1`);
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupplier = async () => {
    debugger;
    if (!supplierName.trim()) return;

    const payload = editMode
      ? {
          entity: "Supplier",
          action: "update",
          id: editId,
          Supplier_Name: supplierName.trim(),
          Supplier_Contect: contactSupplier,
          modifiedBy: "1",
        }
      : {
          entity: "Supplier",
          action: "insert",
          Supplier_Name: supplierName.trim(),
          Supplier_Contect: contactSupplier,
          addedBy: "1",
        };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      if (result.success) {
        toast.success(editMode ? t("supplier.UpdateSuccess") : t("supplier.AddSuccess"));
        setSupplierName("");
        setContactSupplier("");
        setEditMode(false);
        setEditId(null);
        fetchSuppliers();
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEdit = (supplier: any) => {
    setSupplierName(supplier.Supplier_Name);
    setContactSupplier(supplier.Supplier_Contect || "");
    setEditId(supplier.Supplier_ID);
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    debugger;
    const confirmDelete = window.confirm(t("confirmDelete"));
    if (!confirmDelete) return;

    const payload = {
      entity: "Supplier",
      action: "delete",
      id,
      modifiedBy: "1",
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      if (result.success) {
        toast.success(t("supplier.DeleteSuccess"));
        fetchSuppliers();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ➕ Add/Edit Supplier */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{editMode ? t("supplier.EditSupplier") : t("supplier.AddSupplier")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">{t("supplier.SupplierName")}</Label>
              <Input
                id="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactSupplier">{t("supplier.SupplierContact")}</Label>
              <Input
                id="contactSupplier"
                value={contactSupplier}
                onChange={(e) => setContactSupplier(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleSaveSupplier}>
            {editMode ? t("supplier.Update") : t("supplier.Add")}
          </Button>
          {editMode && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditMode(false);
                setSupplierName("");
                setContactSupplier("");
                setEditId(null);
              }}
            >
              {t("cancel")}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* 📋 Supplier List */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("supplier.Suppliers")}</CardTitle>
          <CardDescription>{t("supplier.AllActiveSuppliers")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">{t("supplier.Loading")}</p>
            ) : suppliers.length === 0 ? (
              <p className="text-gray-500">{t("supplier.NoSuppliers")}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.Supplier_ID}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{supplier.Supplier_Name}</p>
                      <p className="text-sm text-gray-600">
                        {supplier.Supplier_Contect || t("supplier.NoContact")}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                        {t("supplier.Edit")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier.Supplier_ID)}>
                        {t("supplier.Delete")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierMaster;

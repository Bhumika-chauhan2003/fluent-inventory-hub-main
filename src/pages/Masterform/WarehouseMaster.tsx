import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslationWrapper";

const API_URL =
  "/api/macros/s/AKfycbzFou43taQuWEhZUDSUOZhYmDnyE1zIq8eKWpDI5fgzqUOSut-aXhv99QHwt-9Iq3K_/exec";

const WarehouseMaster: React.FC = () => {
  const { t } = useTranslation();
  const [Warehouse_Name, setWarehouse_Name] = useState("");
  const [Warehouse_Location, setWarehouse_Location] = useState("");
  const [Warehouse, setWarehouse] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchWarehouse = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?entity=Warehouse&action=list&active=1`);
      const data = await res.json();
      setWarehouse(data);
    } catch (err) {
      console.error("Error fetching Warehouse:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWarehouse = async () => {
    if (!Warehouse_Name.trim()) return;

    const payload = editMode
      ? {
          entity: "Warehouse",
          action: "update",
          id: editId,
          Warehouse_Name: Warehouse_Name.trim(),
          Warehouse_Location: Warehouse_Location.trim(),
          modifiedBy: "1",
        }
      : {
          entity: "Warehouse",
          action: "insert",
          Warehouse_Name: Warehouse_Name.trim(),
          Warehouse_Location: Warehouse_Location.trim(),
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
        setWarehouse_Name("");
        setWarehouse_Location("");
        setEditMode(false);
        setEditId(null);
        fetchWarehouse();
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEdit = (Warehouse: any) => {
    setWarehouse_Name(Warehouse.Warehouse_Name);
    setWarehouse_Location(Warehouse.Warehouse_Location);
    setEditId(Warehouse.Warehouse_Id);
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(t("warehouse.confirmDelete"));
    if (!confirmDelete) return;

    const payload = {
      entity: "Warehouse",
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
        fetchWarehouse();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ➕ Add or ✏️ Edit */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>
            {editMode ? t("warehouse.editTitle") : t("warehouse.addTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="Warehouse_Name">{t("warehouse.name")}</Label>
              <Input
                id="Warehouse_Name"
                value={Warehouse_Name}
                onChange={(e) => setWarehouse_Name(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Warehouse_Location">{t("warehouse.location")}</Label>
              <Input
                id="Warehouse_Location"
                value={Warehouse_Location}
                onChange={(e) => setWarehouse_Location(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleSaveWarehouse}>
            {editMode ? t("warehouse.update") : t("warehouse.add")}
          </Button>
          {editMode && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditMode(false);
                setWarehouse_Name("");
                setWarehouse_Location("");
                setEditId(null);
              }}
            >
              {t("warehouse.cancel")}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* 📋 List */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("warehouse.title")}</CardTitle>
          <CardDescription>{t("warehouse.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">{t("warehouse.loading")}</p>
            ) : Warehouse.length === 0 ? (
              <p className="text-gray-500">{t("warehouse.noData")}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Warehouse.map((w) => (
                  <div
                    key={w.Warehouse_Id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{w.Warehouse_Name}</p>
                      <p className="text-sm text-gray-600">
                        {w.Warehouse_Location}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(w)}
                      >
                        {t("warehouse.edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(w.Warehouse_Id)}
                      >
                        {t("warehouse.delete")}
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

export default WarehouseMaster;

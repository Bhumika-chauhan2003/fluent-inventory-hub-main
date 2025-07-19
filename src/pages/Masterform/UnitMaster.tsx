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

const UnitMaster: React.FC = () => {
  const { t } = useTranslation();
  const [Unit_Name, setUnit_Name] = useState("");
  const [Unit_Abbrevation, setUnit_Abbrevation] = useState("");
  const [Unit, setUnit] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchUnit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?entity=Unit&action=list&active=1`);
      const data = await res.json();
      setUnit(data);
    } catch (err) {
      console.error("Error fetching Unit:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUnit = async () => {
    if (!Unit_Name.trim()) return;

    const payload = editMode
      ? {
          entity: "Unit",
          action: "update",
          id: editId,
          Unit_Name: Unit_Name.trim(),
          Unit_Abbrevation: Unit_Abbrevation,
          modifiedBy: "1",
        }
      : {
          entity: "Unit",
          action: "insert",
          Unit_Name: Unit_Name.trim(),
          Unit_Abbrevation: Unit_Abbrevation,
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
        setUnit_Name("");
        setUnit_Abbrevation("");
        setEditMode(false);
        setEditId(null);
        fetchUnit();
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleEdit = (Unit: any) => {
    setUnit_Name(Unit.Unit_Name);
    setUnit_Abbrevation(Unit.Unit_Abbrevation || "");
    setEditId(Unit.Unit_Id);
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(t("unit.confirmDelete"));
    if (!confirmDelete) return;

    const payload = {
      entity: "Unit",
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
        fetchUnit();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchUnit();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ➕ Add or ✏️ Edit Unit */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{editMode ? t("unit.editTitle") : t("unit.addTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="Unit_Name">{t("unit.name")}</Label>
              <Input
                id="Unit_Name"
                value={Unit_Name}
                onChange={(e) => setUnit_Name(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Unit_Abbrevation">{t("unit.abbrevation")}</Label>
              <Input
                id="Unit_Abbrevation"
                value={Unit_Abbrevation}
                onChange={(e) => setUnit_Abbrevation(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleSaveUnit}>
            {editMode ? t("unit.update") : t("unit.add")}
          </Button>
          {editMode && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditMode(false);
                setUnit_Name("");
                setUnit_Abbrevation("");
                setEditId(null);
              }}
            >
              {t("unit.cancel")}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* 📋 Unit List */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("unit.title")}</CardTitle>
          <CardDescription>{t("unit.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">{t("unit.loading")}</p>
            ) : Unit.length === 0 ? (
              <p className="text-gray-500">{t("unit.noData")}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Unit.map((unitItem) => (
                  <div
                    key={unitItem.Unit_Id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{unitItem.Unit_Name}</p>
                      <p className="text-sm text-gray-600">
                        {unitItem.Unit_Abbrevation || t("unit.noAbbrevation")}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(unitItem)}
                      >
                        {t("unit.edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(unitItem.Unit_Id)}
                      >
                        {t("unit.delete")}
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

export default UnitMaster;

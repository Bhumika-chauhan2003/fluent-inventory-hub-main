import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ReactSelect from "react-select";
import { useTranslation } from "@/hooks/useTranslationWrapper";

const nonEmptyString = z
  .union([z.string(), z.number()])
  .transform((val) => String(val))
  .refine((val) => val.trim().length > 0, {
    message: "This field is required",
  });

const formSchema = z.object({
  productName: z.string().min(1, "Product Name is required"),
  specification: z.string().min(1, "Specification is required"),
  category: z.coerce.string().min(1, "Category is required"),
  supplier: z.coerce.string().min(1, "Supplier is required"),
  purchasePrice: z.coerce.number().positive("Purchase price must be greater than 0"),
  sellingPrice: z.coerce.number().positive("Selling price must be greater than 0"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  IVA: z.coerce.number().min(0, "IVA is required"),
  Margin: z.coerce.number().min(0, "Margin is required"),
  EANCode: z.string().min(1, "EAN Code is required"),
  ShortCode: z.string().min(1, "Short Code is required"),
  ProductFamilyCode: z.string().min(1, "Product Family Code is required"),
  unit: z.coerce.string().min(1, "Unit is required"),
  warehouse: z.coerce.string().min(1, "Warehouse is required"),
  entryDate: z.date({ required_error: "Entry date is required" }),
  remarks: z.string().min(1, "Remarks are required"),
});

type FormValues = z.infer<typeof formSchema>;

const AddProduct: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productid");
  const isEdit = Boolean(productId);

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      specification: "",
      category: "",
      supplier: "",
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      unit: "",
      warehouse: "",
      IVA: 0,
      EANCode: "",
      ShortCode: "",
      Margin: 0,
      ProductFamilyCode: "",
      entryDate: new Date(),
      remarks: "",
    },
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_API_URL;

        const [catRes, supRes, unitRes, wareRes] = await Promise.all([
          fetch(`${baseUrl}?entity=Category&action=list&active=1`),
          fetch(`${baseUrl}?action=list&entity=Supplier&active=1`),
          fetch(`${baseUrl}?action=list&entity=Unit&active=1`),
          fetch(`${baseUrl}?action=list&entity=Warehouse&active=1`),
        ]);

        const [catData, supData, unitData, wareData] = await Promise.all([
          catRes.json(),
          supRes.json(),
          unitRes.json(),
          wareRes.json(),
        ]);

        setCategories(catData || []);
        setSuppliers(supData || []);
        setUnits(unitData || []);
        setWarehouses(wareData || []);
      } catch (error) {
        toast.error("Failed to load dropdown data");
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(
           import.meta.env.VITE_API_URL+`?action=product&productid=${productId}`
        );
        const json = await res.json();
        const prod = Array.isArray(json.data) ? json.data[0] : json.data;
        console.log("Fetched product:", prod);
        form.reset({
          productName: prod.productName,
          specification: prod.specification,
          category: String(prod.Category_ID),
          supplier: String(prod.Supplier_ID),
          purchasePrice: Number(prod.purchasePrice),
          sellingPrice: Number(prod.sellingPrice),
          quantity: Number(prod.quantity),
          unit: String(prod.Unit_Id),
          warehouse: String(prod.Warehouse_Id),
          IVA: Number(prod["IVA/Tax"]) || 0,
          EANCode: prod.EAN_Code || "",
          ShortCode: prod.Short_Code || "",
          Margin: Number(prod.Margin) || 0,
          ProductFamilyCode: prod.Product_Family_Code || "",
          entryDate: new Date(prod.entryDate),
          remarks: prod.remarks || "",
        });
        console.log("Product data loaded:", prod);
      } catch {
        toast.error("Failed to fetch product");
        navigate("/inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isEdit, productId, form, navigate]);

  const onSubmit = async (data: FormValues) => {
    console.log("Form data:", data);
    const payload = {
      action: "product",
      productid: productId, // if new, blank
      productName: data.productName,
      specification: data.specification,
      Category_ID: data.category,
      Supplier_ID: data.supplier,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      quantity: data.quantity,
      IVA: data.IVA,
      EAN_Code: data.EANCode,
      Short_Code: data.ShortCode,
      Product_Family_Code: data.ProductFamilyCode,
      Unit_Id: data.unit,
      Warehouse_Id: data.warehouse,
      Margin: data.Margin,
      entryDate: format(data.entryDate, "yyyy-MM-dd"),
      remarks: data.remarks,
    };
    console.log("Payload to send:", payload);
    try {
      const res = await fetch(
         import.meta.env.API_URL,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      toast.success(
        isEdit ? "Product updated successfully!" : "Product added successfully!"
      );
      navigate("/inventory");
    } catch {
      toast.error(isEdit ? "Update failed" : "Add failed");
    }
  };

  if (loading) return <div>{t("common.loading") || "Loading..."}</div>;

  return (
    <div>
      <PageHeader title={isEdit ? "Edit Product" : "Add New Product"} />
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error("VALIDATION ERRORS:", errors); // See what failed
              })}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="productName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.productName")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="specification"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.specification")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t("addproduct.category")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <ReactSelect
                        options={categories.map((c) => ({
                          value: String(c.Category_ID),
                          label: c.Category_Name || c.categoryName,
                        }))}
                        value={categories
                          .map((c) => ({
                            value: String(c.Category_ID),
                            label: c.Category_Name || c.categoryName,
                          }))
                          .find((opt) => opt.value === String(field.value))}
                        onChange={(opt) => field.onChange(opt?.value)}
                        isSearchable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  name="supplier"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t("addproduct.supplier")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <ReactSelect
                        options={suppliers.map((s) => ({
                          value: String(s.Supplier_ID),
                          label: s.Supplier_Name,
                        }))}
                        value={suppliers
                          .map((s) => ({
                            value: String(s.Supplier_ID),
                            label: s.Supplier_Name,
                          }))
                          .find((opt) => opt.value === String(field.value))}
                        onChange={(opt) => field.onChange(opt?.value)}
                        isSearchable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="purchasePrice"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.purchasePrice")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="IVA"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.IVA")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Margin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.margin")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="EANCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.eanCode")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="ShortCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                   <FormLabel>{t("addproduct.shortCode")} <span style={{ color: "red" }}>*</span></FormLabel>
                      
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="ProductFamilyCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel>{t("addproduct.productFamilyCode")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="sellingPrice"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.sellingPrice")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="quantity"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                                         <FormLabel>{t("addproduct.quantity")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  name="unit"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.unit")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <ReactSelect
                        options={units.map((u) => ({
                          value: String(u.Unit_Id),
                          label: `${u.Unit_Name} (${u.Unit_Abbrevation || ""})`,
                        }))}
                        value={units
                          .map((u) => ({
                            value: String(u.Unit_Id),
                            label: `${u.Unit_Name} (${
                              u.Unit_Abbrevation || ""
                            })`,
                          }))
                          .find((opt) => opt.value === String(field.value))}
                        onChange={(opt) => field.onChange(opt?.value)}
                        isSearchable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  name="warehouse"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addproduct.warehouse")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <ReactSelect
                        options={warehouses.map((w) => ({
                          value: String(w.Warehouse_Id),
                          label: `${w.Warehouse_Name}${
                            w.Warehouse_Location
                              ? ` (${w.Warehouse_Location})`
                              : ""
                          }`,
                        }))}
                        value={warehouses
                          .map((w) => ({
                            value: String(w.Warehouse_Id),
                            label: `${w.Warehouse_Name}${
                              w.Warehouse_Location
                                ? ` (${w.Warehouse_Location})`
                                : ""
                            }`,
                          }))
                          .find((opt) => opt.value === String(field.value))}
                        onChange={(opt) => field.onChange(opt?.value)}
                        isSearchable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="entryDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("addproduct.entryDate")} <span style={{ color: "red" }}>*</span></FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(new Date(field.value), "dd/MM/yyyy")
                                : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="remarks"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>{t("addproduct.remarks")} <span style={{ color: "red" }}>*</span></FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/inventory")}
                >
                  {t("addproduct.cancel")}
                </Button>
               <Button type="submit">{t("addproduct.save")}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduct;
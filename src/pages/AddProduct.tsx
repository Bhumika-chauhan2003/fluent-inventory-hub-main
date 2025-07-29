import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslationWrapper";
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
 
const formSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  specification: z.string().min(2, "Specification must be at least 2 characters"),
  category: z.coerce.string().min(1, "Category is required"),
  supplier: z.coerce.string().min(1, "Supplier is required"),
  purchasePrice: z.coerce.number().positive("Must be positive"),
  sellingPrice: z.coerce.number().positive("Must be positive"),
  quantity: z.coerce.number().int().positive("Must be a positive integer"),
  IVA: z.coerce.number().optional(),
  Margin: z.coerce.number().optional(),
  EANCode: z.string().optional(),
  ShortCode: z.string().optional(),
  ProductFamilyCode: z.string().optional(),
  unit: z.coerce.string().min(1, "Unit is required"),
  warehouse: z.coerce.string().min(1, "Warehouse is required"),
  entryDate: z.date(),
  remarks: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [categories, setCategories] = React.useState([]);
  const [suppliers, setSuppliers] = React.useState([]);
  const [units, setUnits] = React.useState([]);
  const [warehouses, setWarehouses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      specification: "",
      category: "",
      supplier: "",
      purchasePrice: 1,
      sellingPrice: 1,
      quantity: 1,
      unit: "",
      warehouse: "",
      entryDate: new Date(),
      IVA: 0,
      Margin: 0,
      EANCode: "",
      ShortCode: "",
      ProductFamilyCode: "",
      remarks: "",
    },
    
  });

  const watchPurchasePrice = form.watch("purchasePrice");
  const watchIVA = form.watch("IVA");
  const watchMargin = form.watch("Margin");

  // Auto-calculate Selling Price
  React.useEffect(() => {
    const base = Number(watchPurchasePrice) || 0;
    const tax = base * ((Number(watchIVA) || 0) / 100);
    const marginn = base * ((Number(watchMargin) || 0) / 100);
    const finalPrice = base + tax + marginn;
    if (finalPrice > 0) {
      form.setValue("sellingPrice", parseFloat(finalPrice.toFixed(2)));
    }
  }, [watchPurchasePrice, watchIVA, watchMargin]);


console.log("Form default values:", form.getValues());
  React.useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const baseUrl =  import.meta.env.API_URL;
        const [catRes, supRes, unitRes, wareRes] = await Promise.all([
          fetch(`${baseUrl}?entity=Category&action=list&active=1`),
          fetch(`${baseUrl}?action=list&entity=Supplier`),
          fetch(`${baseUrl}?action=list&entity=Unit`),
          fetch(`${baseUrl}?action=list&entity=Warehouse`),
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

  const onSubmit = async (data: FormValues) => {
    setLoading(true); // Show loader
    debugger;
     console.log("Submitting data:", data);
    const payload = {
      action: "product",
      "productName": data.productName,
      "specification": data.specification,
      "Category_ID": data.category,
      "Supplier_ID": data.supplier,
      "purchasePrice": data.purchasePrice,
      "sellingPrice": data.sellingPrice,
      "quantity": data.quantity,
      "IVA": data.IVA,
      "EAN_Code": data.EANCode,
      "Short_Code": data.ShortCode,
      "Product_Family_Code": data.ProductFamilyCode,
      "Unit_Id": data.unit,
      "Warehouse_Id": data.warehouse,
      "Margin": data.Margin , 
      "entryDate": format(data.entryDate, "yyyy-MM-dd"),
      "remarks": data.remarks,
    };
console.log("Payload to be sent:", payload);

    try {
      debugger;
      await fetch(
        "API_URL?action=product",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      toast.success("Product added successfully");
      console.log("Product added successfully");
      console.log(payload);
      navigate("/inventory");
    } catch (err) {
      toast.error("Error adding product");
    }
  };

  return (
    <div>
      <PageHeader title={t("addproduct.AddProduct")} />
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <FormField control={form.control} name="productName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.productName")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Specification */}
                <FormField control={form.control} name="specification" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.specification")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Category */}
                <Controller name="category" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.category")}</FormLabel>
                    <ReactSelect
                      options={categories.map(c => ({ value: c.Category_ID, label: c.categoryName }))}
                      value={categories.find(c => c.Category_ID === field.value) && { value: field.value, label: categories.find(c => c.Category_ID === field.value)?.categoryName }}
                      onChange={opt => field.onChange(opt?.value)}
                      isSearchable
                    />
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Supplier */}
                <Controller name="supplier" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.supplier")}</FormLabel>
                    <ReactSelect
                      options={suppliers.map(s => ({ value: s.Supplier_ID, label: s.Supplier_Name }))}
                      value={suppliers.find(s => s.Supplier_ID === field.value) && { value: field.value, label: suppliers.find(s => s.Supplier_ID === field.value)?.Supplier_Name }}
                      onChange={opt => field.onChange(opt?.value)}
                      isSearchable
                    />
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Purchase Price */}
                <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.purchasePrice")}</FormLabel>
                    <FormControl><Input type="number" step="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* IVA */}
                <FormField control={form.control} name="IVA" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.IVA")}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Margin */}
                <FormField control={form.control} name="Margin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.margin")}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {/* EAN Code */}
                <FormField control={form.control} name="EANCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.eanCode")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Short Code */}
                <FormField control={form.control} name="ShortCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.shortCode")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Product Family Code */}
                <FormField control={form.control} name="ProductFamilyCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.productFamilyCode")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Selling Price */}
                <FormField name="sellingPrice" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>{t("addproduct.sellingPrice")}</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>
                )} />

                {/* Quantity */}
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.quantity")}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Unit */}
                <Controller name="unit" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.unit")}</FormLabel>
                    <ReactSelect
                      options={units.map(u => ({ value: u.Unit_Id, label: `${u.Unit_Name} (${u.Unit_Abbrevation})` }))}
                      value={units.find(u => u.Unit_Id === field.value) && { value: field.value, label: `${units.find(u => u.Unit_Id === field.value)?.Unit_Name} (${units.find(u => u.Unit_Id === field.value)?.Unit_Abbrevation})` }}
                      onChange={opt => field.onChange(opt?.value)}
                      isSearchable
                    />
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Warehouse */}
                <Controller name="warehouse" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addproduct.warehouse")}</FormLabel>
                    <ReactSelect
                      options={warehouses.map(w => ({ value: w.Warehouse_Id, label: `${w.Warehouse_Name}${w.Warehouse_Location ? ` (${w.Warehouse_Location})` : ""}` }))}
                      value={warehouses.find(w => w.Warehouse_Id === field.value) && { value: field.value, label: `${warehouses.find(w => w.Warehouse_Id === field.value)?.Warehouse_Name}${warehouses.find(w => w.Warehouse_Id === field.value)?.Warehouse_Location ? ` (${warehouses.find(w => w.Warehouse_Id === field.value)?.Warehouse_Location})` : ""}` }}
                      onChange={opt => field.onChange(opt?.value)}
                      isSearchable
                    />
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Entry Date */}
                <FormField control={form.control} name="entryDate" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("addproduct.entryDate")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                )} />
              </div>

              {/* Remarks */}
              <FormField control={form.control} name="remarks" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("addproduct.remarks")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Remarks (optional)" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => navigate("/inventory")}>{t("addproduct.cancel")}</Button>
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
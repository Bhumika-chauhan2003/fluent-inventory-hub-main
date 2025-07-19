import React, { useState, useRef } from 'react';
import { FileUp, AlertTriangle, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useStore } from '@/context/StoreContext';
import Papa from 'papaparse';
import { Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { Badge } from '@/components/ui/badge';
import { generateProductCode } from '@/store/mockData';

interface SmartFileUploaderProps {
  onUploadComplete: (products: Product[]) => void;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

const SmartFileUploader: React.FC<SmartFileUploaderProps> = ({ 
  onUploadComplete,
  allowedFileTypes = ['.csv', '.xlsx', '.xls'],
  maxFileSizeMB = 5
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { categories, warehouses, units, suppliers } = useStore();

  const resetState = () => {
    setFileName(null);
    setFileSize(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      return t('import.invalidFileType', { 
        allowedTypes: allowedFileTypes.join(', ')
      });
    }

    if (file.size > maxFileSizeMB * 1024 * 1024) {
      return t('import.fileTooLarge', { maxSize: maxFileSizeMB });
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setIsUploading(true);
    setProgress(10);
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsUploading(false);
      toast({
        title: t('import.error'),
        description: validationError,
        variant: "destructive"
      });
      return;
    }
    
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    
    console.log("Processing file:", file.name, "Type:", file.type, "Size:", formatBytes(file.size));
    
    if (file.name.endsWith('.csv')) {
      parseCSV(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      parseExcel(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileSelect(event.target.files[0]);
    }
  };

  const parseCSV = (file: File) => {
    console.log("Parsing CSV file");
    setProgress(20);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',', // Explicitly setting comma as delimiter
      transformHeader: (header) => {
        return header.trim().toLowerCase().replace(/\s+/g, '');
      },
      complete: (results) => {
        try {
          console.log("CSV Parse results:", results.data.length, "rows");
          console.log("CSV Headers:", results.meta.fields);
          setProgress(50);
          
          if (results.data.length === 0) {
            throw new Error(t('import.noDataFound'));
          }
          
          if (results.data.length === 1 && file.size > 500) {
            throw new Error(t('import.invalidCSVFormat'));
          }
          
          if (results.errors && results.errors.length > 0) {
            console.warn("CSV parsing errors:", results.errors);
            toast({
              title: t('import.parsingWarning'),
              description: t('import.parsingWarningDescription', { count: results.errors.length }),
              variant: "destructive"
            });
          }
          
          const parsedProducts = processData(results.data);
          setProgress(80);
          
          if (parsedProducts.length > 0) {
            console.log("Processed products:", parsedProducts.length);
            onUploadComplete(parsedProducts);
          } else {
            throw new Error(t('import.noValidProducts'));
          }
          
          setProgress(100);
        } catch (error) {
          console.error("Error processing CSV:", error);
          setError(error instanceof Error ? error.message : String(error));
          toast({
            title: t('import.error'),
            description: error instanceof Error ? error.message : t('import.unknownError'),
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        console.error("Papa parse error:", error);
        setError(error.message);
        toast({
          title: t('import.error'),
          description: t('import.csvParsingError'),
          variant: "destructive"
        });
        setIsUploading(false);
      }
    });
  };

  const parseExcel = (file: File) => {
    console.log("Parsing Excel file");
    setProgress(20);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        setProgress(40);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          blankrows: false,
          defval: ''
        });
        
        if (jsonData.length <= 1) {
          throw new Error(t('import.noDataFound'));
        }
        
        const headers = (jsonData[0] as string[]).map(header => 
          header.toString().trim().toLowerCase().replace(/\s+/g, '')
        );
        
        console.log("Excel headers:", headers);
        
        const processedData = (jsonData.slice(1) as any[]).map(row => {
          const item: Record<string, any> = {};
          headers.forEach((header, index) => {
            if (header) {
              item[header] = row[index] !== undefined ? row[index] : '';
            }
          });
          return item;
        });
        
        console.log("Processed Excel data:", processedData.length, "rows");
        
        setProgress(60);
        const parsedProducts = processData(processedData);
        setProgress(80);
        
        if (parsedProducts.length > 0) {
          onUploadComplete(parsedProducts);
        } else {
          throw new Error(t('import.noValidProducts'));
        }
        
        setProgress(100);
      } catch (error) {
        console.error("Error processing Excel:", error);
        setError(error instanceof Error ? error.message : String(error));
        toast({
          title: t('import.error'),
          description: error instanceof Error ? error.message : t('import.unknownError'),
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      console.error("FileReader error");
      setError(t('import.fileReadError'));
      toast({
        title: t('import.error'),
        description: t('import.fileReadError'),
        variant: "destructive"
      });
      setIsUploading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const processData = (data: any[]): Product[] => {
    if (!data || !data.length) {
      throw new Error(t('import.fileContainsNoData'));
    }

    console.log("Processing data, first row sample:", data[0]);
    console.log("Total rows to process:", data.length);

    const fieldNameMappings = {
      productName: ['productname', 'product_name', 'product', 'name', 'item', 'title', 'productname', 'itemname'],
      quantity: ['quantity', 'qty', 'amount', 'count', 'stock', 'units', 'stockquantity'],
      purchasePrice: ['purchaseprice', 'purchase_price', 'cost', 'buying_price', 'costprice', 'buyprice', 'buy_price', 'unitcost', 'unit_cost'],
      sellingPrice: ['sellingprice', 'selling_price', 'price', 'retail_price', 'sale_price', 'retail', 'sellprice', 'sell_price', 'unitprice', 'unit_price'],
      category: ['category', 'type', 'group', 'department', 'producttype', 'product_type', 'productcategory', 'product_category'],
      warehouse: ['warehouse', 'location', 'store', 'storage', 'inventory_location', 'inventorylocation'],
      unit: ['unit', 'uom', 'measure', 'measurement', 'unitofmeasure', 'unit_of_measure'],
      productCode: ['productcode', 'product_code', 'code', 'sku', 'item_code', 'itemcode', 'id', 'productid', 'product_id'],
      supplierName: ['suppliername', 'supplier_name', 'supplier', 'vendor', 'manufacturer', 'brand', 'vendorname', 'vendor_name'],
      specification: ['specification', 'specs', 'details', 'description', 'desc', 'info', 'productdescription'],
      remarks: ['remarks', 'notes', 'comment', 'additional', 'extra', 'comments'],
      entryDate: ['entrydate', 'entry_date', 'date', 'dateadded', 'date_added', 'createdate', 'created_date', 'created_at']
    };
    
    const fieldMapping: Record<string, string> = {};
    
    const firstRowKeys = Object.keys(data[0]);
    console.log("Available fields in CSV:", firstRowKeys);
    
    for (const [requiredField, possibleNames] of Object.entries(fieldNameMappings)) {
      const matchedField = firstRowKeys.find(field => 
        possibleNames.includes(field.toLowerCase().trim().replace(/\s+/g, ''))
      );
      
      if (matchedField) {
        fieldMapping[requiredField] = matchedField;
      }
    }
    
    console.log("Field mapping found:", fieldMapping);
    
    const requiredFields = ['productName', 'quantity'];
    const missingFields = requiredFields.filter(field => !fieldMapping[field]);
    
    if (missingFields.length > 0) {
      throw new Error(t('import.requiredFieldsMissing', { fields: missingFields.join(', ') }));
    }
    
    const products = data.map((row, index) => {
      try {
        const getValue = (field: string, fallback: any = '') => {
          if (fieldMapping[field] && row[fieldMapping[field]] !== undefined && row[fieldMapping[field]] !== null) {
            return row[fieldMapping[field]];
          }
          return fallback;
        };
        
        const categoryName = getValue('category', 'General');
        const warehouseName = getValue('warehouse', 'Main Warehouse');
        const unitName = getValue('unit', 'pcs');
        const supplierName = getValue('supplierName', 'Unknown Supplier');
        
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toString().toLowerCase())?.name || categoryName.toString() || 'General';
        const warehouse = warehouses.find(w => w.name.toLowerCase() === warehouseName.toString().toLowerCase())?.name || warehouseName.toString() || 'Main Warehouse';
        const unit = units.find(u => u.name.toLowerCase() === unitName.toString().toLowerCase())?.name || unitName.toString() || 'pcs';
        const supplier = suppliers.find(s => s.name.toLowerCase() === supplierName.toString().toLowerCase())?.name || supplierName.toString();
        
        const quantityStr = getValue('quantity', '0').toString().replace(/,/g, '');
        const purchasePriceStr = getValue('purchasePrice', '0').toString().replace(/,/g, '').replace(/^\$/, '');
        const sellingPriceStr = getValue('sellingPrice', '0').toString().replace(/,/g, '').replace(/^\$/, '');
        
        const quantity = parseFloat(quantityStr) || 0;
        const purchasePrice = parseFloat(purchasePriceStr) || 0;
        const sellingPrice = parseFloat(sellingPriceStr) || 0;
        
        const productCode = getValue('productCode', generateProductCode());
        
        let entryDate: string;
        try {
          const rawDate = getValue('entryDate', new Date().toISOString());
          entryDate = new Date(rawDate).toISOString();
        } catch (e) {
          entryDate = new Date().toISOString();
        }
        
        if (!getValue('productName')) {
          console.warn(`Skipping row ${index + 1}: Missing product name`);
          return null;
        }
        
        const product: Product = {
          productid: uuidv4(),
          productCode,
          productName: getValue('productName', ''),
          specification: getValue('specification', ''),
          category,
          supplierName: supplier,
          purchasePrice,
          sellingPrice,
          quantity,
          unit,
          warehouse,
          entryDate,
          enteredBy: 'Import',
          remarks: getValue('remarks', t('import.importedProduct')),
          isActive: true
        };
        
        return product;
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error, row);
        return null;
      }
    }).filter(Boolean) as Product[];
    
    console.log(`Successfully processed ${products.length} products from ${data.length} rows`);
    return products;
  };

  const handleRemoveFile = () => {
    resetState();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        id="fileUpload"
        accept={allowedFileTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {!fileName ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <FileUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">{t('import.dragAndDrop')}</p>
              <p className="text-xs text-gray-500 mb-3">
                {t('import.supportedFormats', { formats: allowedFileTypes.join(', ') })}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {t('import.browseFiles')}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <File className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium">{fileName}</p>
                {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
              </div>
            </div>
            {!isUploading && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-gray-500">
                {t('import.processing')}
              </p>
            </div>
          ) : error ? (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                {t('import.readyToImport')}
              </Badge>
              <Button 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {t('import.chooseAnother')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartFileUploader;

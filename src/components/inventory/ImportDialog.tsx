
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TableHeader, TableRow, TableHead, Table, TableBody, TableCell } from '@/components/ui/table';
import { FileUp, AlertTriangle, CheckCircle } from 'lucide-react';
import FileUploader from '@/components/dashboard/FileUploader';

type DuplicateHandling = 'skip' | 'replace' | 'keep';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const { products, addProduct } = useStore();
  const { toast } = useToast();
  
  const [importedProducts, setImportedProducts] = useState<Product[]>([]);
  const [previewData, setPreviewData] = useState<Product[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'configure' | 'result'>('upload');
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>('skip');
  const [duplicatesFound, setDuplicatesFound] = useState(false);
  const [importStats, setImportStats] = useState({
    total: 0,
    added: 0,
    duplicates: 0,
    errors: 0
  });

  // Reset import step when dialog opens
  useEffect(() => {
    if (open) {
      resetImport();
    }
  }, [open]);

  const handleUploadComplete = (uploadedProducts: Product[]) => {
    console.log("Upload complete with products:", uploadedProducts.length);
    
    if (uploadedProducts.length === 0) {
      toast({
        title: t('import.noData'),
        description: t('import.noDataDescription'),
        variant: "destructive",
      });
      return;
    }
    
    // Check for existing product codes to detect duplicates
    const existingProductCodes = new Set(products.map(p => p.productCode));
    const hasDuplicates = uploadedProducts.some(p => existingProductCodes.has(p.productCode));
    
    setImportedProducts(uploadedProducts);
    setPreviewData(uploadedProducts.slice(0, Math.min(5, uploadedProducts.length))); // Show first 5 rows
    setDuplicatesFound(hasDuplicates);
    setImportStep('preview');
  };

  const handleImport = () => {
    if (importStep === 'preview') {
      if (duplicatesFound) {
        setImportStep('configure');
      } else {
        processImport();
      }
    } else if (importStep === 'configure') {
      processImport();
    }
  };

  const processImport = () => {
    const existingProductCodes = new Map(products.map(p => [p.productCode, p]));
    let addedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    
    console.log(`Processing ${importedProducts.length} products for import`);
    
    // Create an array to collect successfully processed products
    const successfullyProcessed: Product[] = [];
    
    importedProducts.forEach(product => {
      try {
        const isDuplicate = existingProductCodes.has(product.productCode);
        
        if (isDuplicate) {
          duplicateCount++;
          
          if (duplicateHandling === 'skip') {
            return; // Skip this product
          }
          
          if (duplicateHandling === 'keep') {
            // Modify product code to avoid collision
            product.productCode = `${product.productCode}_copy`;
          }
          // For 'replace', we just proceed with adding
        }
        
        // Collect product for batch processing
        successfullyProcessed.push({
          ...product,
          remarks: product.remarks || t('import.importedProduct')
        });
        
        addedCount++;
      } catch (error) {
        console.error("Error processing product for import:", error, product);
        errorCount++;
      }
    });
    
    // Now add all products in batch
    console.log(`Adding ${successfullyProcessed.length} products to inventory`);
    successfullyProcessed.forEach(product => {
      addProduct({
        productName: product.productName,
        specification: product.specification,
        category: product.category,
        supplierName: product.supplierName,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
        unit: product.unit,
        warehouse: product.warehouse,
        entryDate: product.entryDate,
        remarks: product.remarks
      });
    });
    
    setImportStats({
      total: importedProducts.length,
      added: addedCount,
      duplicates: duplicateCount,
      errors: errorCount
    });
    
    setImportStep('result');
    
    toast({
      title: t('import.success'),
      description: t('import.successCount', { count: addedCount }),
    });
  };

  const resetImport = () => {
    setImportedProducts([]);
    setPreviewData([]);
    setImportStep('upload');
    setDuplicateHandling('skip');
    setDuplicatesFound(false);
    setImportStats({
      total: 0,
      added: 0,
      duplicates: 0,
      errors: 0
    });
  };

  const handleClose = () => {
    resetImport();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('import.title')}</DialogTitle>
          <DialogDescription>
            {importStep === 'upload' && t('import.description')}
            {importStep === 'preview' && t('import.previewDescription')}
            {importStep === 'configure' && t('import.configureDescription')}
            {importStep === 'result' && t('import.resultDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {importStep === 'upload' && (
            <FileUploader onUploadComplete={handleUploadComplete} />
          )}
          
          {importStep === 'preview' && (
            <>
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">{t('import.previewWarning')}</p>
                  <p className="text-sm text-amber-700">{t('import.previewWarningDescription')}</p>
                </div>
              </div>
              
              {duplicatesFound && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">{t('import.duplicatesFound')}</p>
                    <p className="text-sm text-yellow-700">{t('import.duplicatesFoundDescription')}</p>
                  </div>
                </div>
              )}
              
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('product.code')}</TableHead>
                      <TableHead>{t('product.name')}</TableHead>
                      <TableHead>{t('product.category')}</TableHead>
                      <TableHead>{t('product.quantity')}</TableHead>
                      <TableHead>{t('product.purchasePrice')}</TableHead>
                      <TableHead>{t('product.sellingPrice')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.productCode}</TableCell>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.quantity} {product.unit}</TableCell>
                        <TableCell>${product.purchasePrice?.toFixed(2)}</TableCell>
                        <TableCell>${product.sellingPrice?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <p className="mt-2 text-sm text-gray-500">
                {t('import.totalRows', { count: importedProducts.length })}
              </p>
            </>
          )}
          
          {importStep === 'configure' && (
            <div className="space-y-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800">{t('import.duplicateHandling')}</p>
                <p className="text-sm text-blue-700 mb-4">{t('import.duplicateHandlingDescription')}</p>
                
                <RadioGroup 
                  value={duplicateHandling} 
                  onValueChange={(value) => setDuplicateHandling(value as DuplicateHandling)}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="skip" id="skip" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="skip" className="font-medium">{t('import.skipDuplicates')}</Label>
                      <p className="text-sm text-gray-500">{t('import.skipDuplicatesDescription')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="replace" id="replace" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="replace" className="font-medium">{t('import.replaceDuplicates')}</Label>
                      <p className="text-sm text-gray-500">{t('import.replaceDuplicatesDescription')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="keep" id="keep" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="keep" className="font-medium">{t('import.keepBoth')}</Label>
                      <p className="text-sm text-gray-500">{t('import.keepBothDescription')}</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
          
          {importStep === 'result' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {t('import.importComplete')}
                  </p>
                  <p className="text-sm text-green-700">
                    {t('import.importStats', { 
                      total: importStats.total,
                      added: importStats.added,
                      duplicates: importStats.duplicates,
                      errors: importStats.errors
                    })}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 border rounded-md text-center">
                  <p className="text-sm text-gray-500">{t('import.totalProcessed')}</p>
                  <p className="text-2xl font-bold">{importStats.total}</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-100 rounded-md text-center">
                  <p className="text-sm text-green-600">{t('import.productsAdded')}</p>
                  <p className="text-2xl font-bold text-green-700">{importStats.added}</p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md text-center">
                  <p className="text-sm text-yellow-600">{t('import.duplicatesFound')}</p>
                  <p className="text-2xl font-bold text-yellow-700">{importStats.duplicates}</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-100 rounded-md text-center">
                  <p className="text-sm text-red-600">{t('import.errors')}</p>
                  <p className="text-2xl font-bold text-red-700">{importStats.errors}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {importStep === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
          )}
          
          {(importStep === 'preview' || importStep === 'configure') && (
            <>
              <Button variant="outline" onClick={() => setImportStep('upload')}>
                {t('common.back')}
              </Button>
              <Button onClick={handleImport}>
                {t('import.proceed')}
              </Button>
            </>
          )}
          
          {importStep === 'result' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t('common.close')}
              </Button>
              <Button onClick={resetImport}>
                {t('import.importMore')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;

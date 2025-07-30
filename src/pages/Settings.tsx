
import React from 'react';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { useLanguage } from '@/context/LanguageContext';
import { useStore } from '@/context/StoreContext';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Language } from '@/types';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { 
    categories, addCategory, 
    suppliers, addSupplier,
    warehouses, addWarehouse,
    units, addUnit 
  } = useStore();
  
  // State for new items
  const [newCategory, setNewCategory] = React.useState('');
  const [newSupplier, setNewSupplier] = React.useState('');
  const [newSupplierContact, setNewSupplierContact] = React.useState('');
  const [newWarehouse, setNewWarehouse] = React.useState('');
  const [newWarehouseLocation, setNewWarehouseLocation] = React.useState('');
  const [newUnit, setNewUnit] = React.useState('');
  const [newUnitAbbreviation, setNewUnitAbbreviation] = React.useState('');

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory({ name: newCategory.trim() });
      setNewCategory('');
    }
  };

  const handleAddSupplier = () => {
    if (newSupplier.trim()) {
      addSupplier({ 
        name: newSupplier.trim(),
        contact: newSupplierContact.trim() || undefined
      });
      setNewSupplier('');
      setNewSupplierContact('');
    }
  };

  const handleAddWarehouse = () => {
    if (newWarehouse.trim()) {
      addWarehouse({ 
        name: newWarehouse.trim(),
        location: newWarehouseLocation.trim() || undefined
      });
      setNewWarehouse('');
      setNewWarehouseLocation('');
    }
  };

  const handleAddUnit = () => {
    if (newUnit.trim() && newUnitAbbreviation.trim()) {
      addUnit({ 
        name: newUnit.trim(),
        abbreviation: newUnitAbbreviation.trim()
      });
      setNewUnit('');
      setNewUnitAbbreviation('');
    }
  };

  return (
    <div>
      <PageHeader title={t('settings.title')} />

      <Tabs defaultValue="general">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.general')}</CardTitle>
              <CardDescription>
                {t('settings.generalDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <Select 
                  value={language} 
                  onValueChange={(value) => setLanguage(value as Language)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder={t('settings.selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('languages.en')}</SelectItem>
                    {/* <SelectItem value="hi">{t('languages.hi')}</SelectItem>
                    <SelectItem value="bn">{t('languages.bn')}</SelectItem> */}
                    <SelectItem value="es">{t('languages.es')}</SelectItem>
                    {/* <SelectItem value="pt">{t('languages.pt')}</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>{t('settings.save')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default Settings;

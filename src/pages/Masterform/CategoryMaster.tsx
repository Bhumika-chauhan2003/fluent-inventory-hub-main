import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslationWrapper';
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

const API_URL = '/api/macros/s/AKfycbwMCliG3Dm1QAucYCpSQOm7jMXz33eNeGSCG0FnnKHud86T3F-nzpDc8cwlV71SFFKIBw/exec';

const CategoryMaster: React.FC = () => {
  const { t } = useTranslation();

  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?entity=Category&action=list&active=1`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategory.trim()) return;

    const payload = editMode
      ? {
          entity: 'Category',
          action: 'update',
          id: editId,
          categoryName: newCategory.trim(),
          modifiedBy: '1',
        }
      : {
          entity: 'Category',
          action: 'insert',
          categoryName: newCategory.trim(),
          addedBy: '1',
        };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await res.json();
      if (result.success) {
        setNewCategory('');
        setEditMode(false);
        setEditId(null);
        fetchCategories();
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleEdit = (category: any) => {
    setNewCategory(category.categoryName);
    setEditId(category.Category_ID);
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(t('CategoryForm.confirmDelete'));
    if (!confirmDelete) return;

    const payload = {
      entity: 'Category',
      action: 'delete',
      id,
      modifiedBy: '1',
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await res.json();
      if (result.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{editMode ? t('CategoryForm.EditCategory') : t('CategoryForm.AddCategory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">{t('CategoryForm.CategoryName')}</Label>
              <Input
                id="categoryName"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleSaveCategory}>
            {editMode ? t('CategoryForm.Update') : t('CategoryForm.Add')}
          </Button>
          {editMode && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditMode(false);
                setNewCategory('');
                setEditId(null);
              }}
            >
              {t('CategoryForm.Cancel')}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t('CategoryForm.Category')}</CardTitle>
          <CardDescription>{t('CategoryForm.AllActiveCategories')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500">{t('CategoryForm.Loading')}</p>
            ) : categories.length === 0 ? (
              <p className="text-gray-500">{t('CategoryForm.NoCategoryFound')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.Category_ID}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <span>{category.categoryName}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        {t('CategoryForm.Edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.Category_ID)}
                      >
                        {t('CategoryForm.Delete')}
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

export default CategoryMaster;


import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { useStore } from '@/context/StoreContext';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Brain, FileDown, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ReportData } from '@/types';

const COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#a855f7', '#14b8a6', '#f97316', '#8b5cf6'];

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { products, categories } = useStore();
  const [activeTab, setActiveTab] = useState('inventoryValue');
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Prepare data for charts
  const inventoryValueData = [
    { name: 'Jan', value: 12000 },
    { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 18000 },
    { name: 'Apr', value: 16000 },
    { name: 'May', value: 21000 },
    { name: 'Jun', value: 19000 },
  ];

  // Prepare stock distribution data
  const stockDistributionData = categories.map(category => {
    const categoryProducts = products.filter(p => p.category === category.name);
    const totalQuantity = categoryProducts.reduce((sum, product) => sum + product.quantity, 0);
    
    return {
      name: category.name,
      value: totalQuantity
    };
  });

  // Prepare supplier comparison data
  const supplierData = Array.from(new Set(products.map(p => p.supplierName))).map(supplier => {
    const supplierProducts = products.filter(p => p.supplierName === supplier);
    const totalValue = supplierProducts.reduce(
      (sum, product) => sum + (product.purchasePrice * product.quantity),
      0
    );
    
    return {
      name: supplier,
      value: parseFloat(totalValue.toFixed(2))
    };
  });

  // Prepare warehouse utilization data
  const warehouseData = Array.from(new Set(products.map(p => p.warehouse))).map(warehouse => {
    const warehouseProducts = products.filter(p => p.warehouse === warehouse);
    const totalItems = warehouseProducts.reduce((sum, product) => sum + product.quantity, 0);
    const totalValue = warehouseProducts.reduce(
      (sum, product) => sum + (product.purchasePrice * product.quantity),
      0
    );
    
    return {
      name: warehouse,
      items: totalItems,
      value: parseFloat(totalValue.toFixed(2))
    };
  });

  // Simulated AI query handling
  const handleAiQuery = () => {
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    setAiResponse(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      let response = '';
      
      if (aiQuery.toLowerCase().includes('fastest selling')) {
        response = "Based on recent sales data, 'Wireless Mouse' is your fastest selling item with an average of 5 units per day.";
      } else if (aiQuery.toLowerCase().includes('low stock')) {
        response = "There are 3 items with critically low stock: 'Laptop Stand' (3 left), 'Office Chair' (2 left), and 'Wireless Mouse' (5 left). Consider restocking these items soon.";
      } else if (aiQuery.toLowerCase().includes('highest value')) {
        response = "Your highest value inventory item is 'Office Chair' with a total value of $1,700 (20 units).";
      } else {
        response = "I've analyzed your inventory data. Your total inventory value is $12,345 across 5 product categories and 3 warehouses. The 'Stationery' category has the most items (625 units), and 'WH-1' is your most utilized warehouse (60% of total inventory).";
      }
      
      setAiResponse(response);
      setAiLoading(false);
    }, 1500);
  };

  return (
    <div>
      <PageHeader title={t('reports.title')}>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> {t('reports.export')}
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Tabs defaultValue="inventoryValue" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="inventoryValue">{t('reports.inventoryValue')}</TabsTrigger>
              <TabsTrigger value="stockDistribution">{t('reports.stockDistribution')}</TabsTrigger>
              <TabsTrigger value="supplierComparison">{t('reports.supplierComparison')}</TabsTrigger>
              <TabsTrigger value="movementRate">{t('reports.movementRate')}</TabsTrigger>
              <TabsTrigger value="warehouseUtilization">{t('reports.warehouseUtilization')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventoryValue">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.inventoryValue')}</CardTitle>
                  <CardDescription>
                    {t('reports.inventoryValueDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={inventoryValueData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stockDistribution">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.stockDistribution')}</CardTitle>
                  <CardDescription>
                    {t('reports.stockDistributionDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stockDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="supplierComparison">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.supplierComparison')}</CardTitle>
                  <CardDescription>
                    {t('reports.supplierComparisonDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplierData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#6366f1" name="Value ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="movementRate">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.movementRate')}</CardTitle>
                  <CardDescription>
                    {t('reports.movementRateDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'Week 1', 'Ballpoint Pen': 45, 'A4 Paper': 20, 'Wireless Mouse': 15 },
                      { name: 'Week 2', 'Ballpoint Pen': 30, 'A4 Paper': 25, 'Wireless Mouse': 12 },
                      { name: 'Week 3', 'Ballpoint Pen': 55, 'A4 Paper': 15, 'Wireless Mouse': 20 },
                      { name: 'Week 4', 'Ballpoint Pen': 40, 'A4 Paper': 30, 'Wireless Mouse': 18 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Ballpoint Pen" stroke="#6366f1" />
                      <Line type="monotone" dataKey="A4 Paper" stroke="#06b6d4" />
                      <Line type="monotone" dataKey="Wireless Mouse" stroke="#ec4899" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="warehouseUtilization">
              <Card>
                <CardHeader>
                  <CardTitle>{t('reports.warehouseUtilization')}</CardTitle>
                  <CardDescription>
                    {t('reports.warehouseUtilizationDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={warehouseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="items" fill="#6366f1" name="Items" />
                      <Bar dataKey="value" fill="#06b6d4" name="Value ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t('reports.askAI')}
              </CardTitle>
              <CardDescription>
                {t('reports.askAIDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-col h-full">
                <div className="space-y-2">
                  <Label htmlFor="aiQuery">{t('reports.question')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="aiQuery"
                      placeholder={t('reports.aiPlaceholder')}
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                    />
                    <Button size="icon" onClick={handleAiQuery} disabled={aiLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 flex-grow">
                  {aiLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">{t('reports.loading')}</p>
                    </div>
                  ) : aiResponse ? (
                    <div className="bg-inventory-light p-3 rounded-lg">
                      <p>{aiResponse}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-center">
                      <p>{t('reports.aiPrompt')}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-gray-500">
                {t('reports.aiFooter')}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;

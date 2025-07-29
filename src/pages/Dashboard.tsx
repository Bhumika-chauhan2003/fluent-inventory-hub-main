import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import {
  LayoutDashboard,
  Package,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Plus,
  FileText,
  FileUp,
  FileDown,
  Printer,
  Brain,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AiInsights from '@/components/dashboard/AiInsights';
import BillGenerator from '@/components/dashboard/BillGenerator';
import ImportDialog from '@/components/inventory/ImportDialog';
import { checkSessionAndDevice } from "@/lib/utils";
const Dashboard: React.FC = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

 // const { products, invoices } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showImportDialog, setShowImportDialog] = useState(false);
const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalInventoryValue: "0.00",
    totalSales: "0.00",
    recentActivity: [],
  });
  const [products, setProducts] = useState([]); // For low stock and other UI
  const [loading, setLoading] = useState(true);
  // Calculate dashboard statistics using real data
  // const totalProducts = products.length;
  // const lowStockItems = products.filter(p => p.quantity < 10).length;
  // const totalInventoryValue = products.reduce((sum, product) => sum + (product.purchasePrice * product.quantity), 0).toFixed(2);
  // const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(2);

  // // Recent activity from actual invoices
  // const recentActivity = invoices
  //   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  //   .slice(0, 4)
  //   .map(invoice => ({
  //     action: 'Invoice generated',
  //     item: invoice.invoiceNumber,
  //     user: invoice.createdBy,
  //     time: new Date(invoice.date).toLocaleDateString(),
  //   }));

useEffect(() => {
  debugger;
    const fetchDashboardData = async () => {
      try {
        // Replace with your actual API endpoints 
        // Fetching dashboard stats cors error check  
        const statsRes = await fetch
        ("https://script.google.com/macros/s/AKfycbzxJUc4GBGc88LF-enlrIyg6vd2P8IMBnDDd4IOhZfTIz33V8BGHKmDJ3vFLnQvRUyDog/exec?action=summary");
        const statsData = await statsRes.json();
        setDashboardStats({
          totalProducts: statsData.data.totalProducts,
          lowStockItems: statsData.data.lowStockItems,
          totalInventoryValue: statsData.data.totalInventoryValue,
          totalSales: statsData.data.totalSales,
          recentActivity: statsData.data.recentActivity, // Should be an array
        });
        console.log('Dashboard Stats:', statsData);
        //    const productsRes = await fetch('/api/products');
        //   const productsData = await productsRes.json();
        // setProducts(productsData);
        //   setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const { totalProducts, lowStockItems, totalInventoryValue, totalSales, recentActivity } = dashboardStats;

  // ...rest of your component, use these variables in your StatCards and recent activity section...
  // Action cards
  const quickActions = [
    { title: t('dashboard.addProduct'), icon: Plus, path: '/add-product', color: 'bg-blue-500' },
    { title: t('dashboard.createInvoice'), icon: FileText, path: '/billing', color: 'bg-green-500' },
    { title: t('dashboard.inventoryReport'), icon: BarChart3, path: '/reports', color: 'bg-purple-500' },
  ];

  // Utility functions
  // const handleExport = () => {
  //   // Create CSV data
  //   const headers = ['Product Code', 'Product Name', 'Category', 'Quantity', 'Purchase Price', 'Selling Price'];
  //   const rows = products.map(p => [
  //     p.productCode,
  //     p.productName,
  //     p.category,
  //     p.quantity,
  //     p.purchasePrice,
  //     p.sellingPrice
  //   ]);
    
  //   const csvContent = [
  //     headers.join(','),
  //     ...rows.map(row => row.join(','))
  //   ].join('\n');
    
  //   // Create and download file
  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const link = document.createElement('a');
  //   const url = URL.createObjectURL(blob);
  //   link.setAttribute('href', url);
  //   link.setAttribute('download', 'inventory_export.csv');
  //   link.style.visibility = 'hidden';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
    
  //   toast({
  //     title: "Export Complete",
  //     description: "Inventory data has been exported to CSV",
  //   });
  // };
  const handleExport = async () => {
  try {
    // Step 1: Fetch product data from the API
    const response = await fetch(`https://script.google.com/macros/s/AKfycbzxJUc4GBGc88LF-enlrIyg6vd2P8IMBnDDd4IOhZfTIz33V8BGHKmDJ3vFLnQvRUyDog/exec?action=product`);
    const result = await response.json();
console.log("Fetched products:", result);
    if (!result?.success || !Array.isArray(result?.data)) {
      throw new Error("Failed to fetch data from API.");
    }

    const products = result.data;
console.log("Fetched products:", products);
    // Step 2: Define the fields you want to export
    const displayedFields = [
      { key: "productid", label: t("product.code") },
      { key: "productName", label: t("product.name") },
      { key: "Category_Name", label: t("product.category") },
      { key: "quantity", label: t("product.quantity") },
      { key: "Warehouse_Name", label: t("product.warehouse") },
      { key: "sellingPrice", label: t("product.sellingPrice") },
      { key: "RemaningProduct", label: t("product.RemaingQuantity") },

      
    ];
console.log("Exporting products:", displayedFields);


    // Step 3: Convert data to CSV
    const headers = displayedFields.map(field => field.label);
    const rows = products.map(product =>
      displayedFields.map(field => product[field.key] ?? "")
    );

console.log("Exporting displayedFields:", displayedFields);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Step 4: Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "✅ Export Complete",
      description: "Inventory data has been exported to CSV",
    });
  } catch (error) {
    console.error("Export failed:", error);
    toast({
      title: "❌ Export Failed",
      description: "Unable to export inventory data. Please try again.",
    });
  }
};

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Initiated",
      description: "Printing dashboard report",
    });
  };

  return (
    <div>
      <PageHeader title={t('dashboard.title')}>
        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <FileUp className="mr-2 h-4 w-4" /> {t('import.importData')}
          </Button> */}
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" /> {t('common.export')}
          </Button>
          {/* <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> {t('reports.print')}
          </Button> */}
        </div>
      </PageHeader>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t('dashboard.title')}
          </TabsTrigger>
          {/* <TabsTrigger value="insights">
            <Brain className="mr-2 h-4 w-4" />
            {t('reports.askAI')}
          </TabsTrigger> */}
          {/* <TabsTrigger value="bill">
            <FileText className="mr-2 h-4 w-4" />
            {t('billing.title')}
          </TabsTrigger> */}
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={t('dashboard.totalProducts')}
              value={totalProducts}
              icon={Package}
            />
            <StatCard
              title={t('dashboard.lowStock')}
              value={lowStockItems}
              icon={AlertTriangle}
              className="text-amber-500"
            />
            <StatCard
              title={t('dashboard.totalValue')}
              value={`$${totalInventoryValue}`}
              icon={DollarSign}
            />
            <StatCard
              title={t('dashboard.totalSales')}
              value={`$${totalSales}`}
              icon={BarChart3}
              trend={{ value: 8.2, isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {quickActions.map((action, index) => (
              <Link to={action.path} key={index}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className={`${action.color} text-white rounded-t-lg py-4`}>
                    <CardTitle className="flex justify-between items-center">
                      {action.title}
                      <action.icon className="h-5 w-5" />
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-4 pb-3">
                    <Button variant="ghost" className="w-full justify-start p-0 hover:bg-transparent hover:underline">
                      {t('common.viewDetails')} →
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                        <div className="w-8 h-8 rounded-full bg-inventory-light text-inventory-primary flex items-center justify-center mr-3">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}: <span className="text-inventory-primary">{activity.item}</span></p>
                          <p className="text-sm text-gray-500">By {activity.user} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activity</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.lowStock')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.filter(p => p.quantity < 10).slice(0, 5).map((product) => (
                    <div key={product.productid} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-sm text-gray-500">
                          {product.quantity} {product.unit} {t('common.inStock')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.quantity === 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {product.quantity === 0 ? t('inventory.outOfStock') : t('inventory.lowStock')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/inventory">{t('common.viewAll')}</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <AiInsights products={products} />
        </TabsContent>
        
        <TabsContent value="bill">
          <BillGenerator products={products} />
        </TabsContent>
      </Tabs>

      <ImportDialog open={showImportDialog} onOpenChange={setShowImportDialog} />
    </div>
  );
};

export default Dashboard;
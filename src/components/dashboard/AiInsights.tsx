
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslationWrapper';
import { Brain, BarChart2, PieChart, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';

// Import chart components
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

interface AiInsightsProps {
  products: Product[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ products }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('charts');
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Colors for charts
  const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#403E43'];

  // Prepare data for charts
  const getLowStockData = () => {
    return products
      .filter(product => product.quantity < 10)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 10)
      .map(product => ({
        name: product.productName.length > 15 
          ? product.productName.substring(0, 15) + '...' 
          : product.productName,
        value: product.quantity
      }));
  };

  const getHighestPricedData = () => {
    return products
      .sort((a, b) => b.sellingPrice - a.sellingPrice)
      .slice(0, 10)
      .map(product => ({
        name: product.productName.length > 15 
          ? product.productName.substring(0, 15) + '...' 
          : product.productName,
        value: product.sellingPrice
      }));
  };

  const getStockByCategoryData = () => {
    const categoryMap = new Map<string, number>();
    
    products.forEach(product => {
      const currentValue = categoryMap.get(product.category) || 0;
      categoryMap.set(product.category, currentValue + product.quantity);
    });
    
    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Process the query
    setTimeout(() => {
      try {
        // Simple query processing logic
        if (userQuery.toLowerCase().includes('top') && userQuery.toLowerCase().includes('quantity')) {
          // Handle "Show me top 5 products by quantity"
          const match = userQuery.match(/top\s+(\d+)/i);
          const count = match ? parseInt(match[1]) : 5;
          
          const result = products
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, count)
            .map(product => ({
              name: product.productName,
              quantity: product.quantity,
              unit: product.unit
            }));
            
          setQueryResult({
            type: 'table',
            title: `Top ${count} Products by Quantity`,
            data: result
          });
        } else if (userQuery.toLowerCase().includes('low stock')) {
          // Handle "Show me low stock products"
          const result = products
            .filter(product => product.quantity < 10)
            .sort((a, b) => a.quantity - b.quantity)
            .map(product => ({
              name: product.productName,
              quantity: product.quantity,
              unit: product.unit
            }));
            
          setQueryResult({
            type: 'table',
            title: 'Low Stock Products',
            data: result
          });
        } else if (userQuery.toLowerCase().includes('highest price') || userQuery.toLowerCase().includes('most expensive')) {
          // Handle "Show me highest priced products"
          const match = userQuery.match(/top\s+(\d+)/i);
          const count = match ? parseInt(match[1]) : 5;
          
          const result = products
            .sort((a, b) => b.sellingPrice - a.sellingPrice)
            .slice(0, count)
            .map(product => ({
              name: product.productName,
              price: `$${product.sellingPrice.toFixed(2)}`
            }));
            
          setQueryResult({
            type: 'table',
            title: `Top ${count} Highest Priced Products`,
            data: result
          });
        } else if (userQuery.toLowerCase().includes('category')) {
          // Handle "Show me stock by category"
          setQueryResult({
            type: 'chart',
            chartType: 'pie',
            title: 'Stock by Category',
            data: getStockByCategoryData()
          });
        } else {
          setQueryResult({
            type: 'message',
            title: 'AI Response',
            message: "I'm sorry, I couldn't understand that query. Try asking about top products by quantity, low stock items, highest priced products, or stock by category."
          });
        }
      } catch (error) {
        setQueryResult({
          type: 'message',
          title: 'Error',
          message: "There was an error processing your query. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Simulate processing time
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5" />
          {t('reports.askAI')}
        </CardTitle>
        <CardDescription>
          {t('reports.analyzeInventory')}
        </CardDescription>
        
        <Tabs 
          defaultValue="charts" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="charts">
              <BarChart2 className="mr-2 h-4 w-4" />
              {t('charts')}
            </TabsTrigger>
            <TabsTrigger value="query">
              <Brain className="mr-2 h-4 w-4" />
              {t('askAI')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Low stock chart */}
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('inventory.lowStock')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getLowStockData()}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Highest priced products chart */}
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('highestPriced')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getHighestPricedData()}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#D946EF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Stock by category chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('stockByCategory')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-72 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={getStockByCategoryData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getStockByCategoryData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="query" className="space-y-4 mt-4">
            <form onSubmit={handleQuerySubmit} className="flex space-x-2">
              <Input
                placeholder={t('reports.aiPlaceholder')}
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : t('common.search')}
              </Button>
            </form>
            
            {queryResult && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>{queryResult.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {queryResult.type === 'table' && (
                    <div className="rounded-md border">
                      <div className="w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b">
                              {Object.keys(queryResult.data[0] || {}).map((key) => (
                                <th key={key} className="p-3 text-left font-medium">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.data.map((item: any, index: number) => (
                              <tr key={index} className="border-b">
                                {Object.values(item).map((value: any, i: number) => (
                                  <td key={i} className="p-3">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {queryResult.type === 'chart' && queryResult.chartType === 'pie' && (
                    <div className="h-72 flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={queryResult.data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {queryResult.data.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  {queryResult.type === 'message' && (
                    <p>{queryResult.message}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default AiInsights;

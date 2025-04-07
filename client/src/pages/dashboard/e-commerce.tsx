import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ShoppingBag, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  XCircle,
  Link,
  BarChart,
  ArrowUpRight,
  Clock,
  Settings,
  Store
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useState } from 'react';
import { StatsCard } from '@/components/ui/stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types for our data
interface ECommercePlatform {
  id: number;
  userId: number;
  name: string;
  status: string;
  orders: number;
  revenue: string;
  products: number;
  lastSync: string;
}

interface Product {
  id: number;
  userId: number;
  name: string;
  price: string;
  inventory: string;
  category: string;
  platforms: string[];
  sales: number;
}

// Example data representing e-commerce platforms
const ECOMMERCE_PLATFORMS = [
  { 
    id: 1, 
    name: 'Shopify', 
    status: 'active', 
    orders: 324,
    revenue: '$12,458',
    products: 42,
    lastSync: '10 min ago'
  },
  { 
    id: 2, 
    name: 'WooCommerce', 
    status: 'active', 
    orders: 156,
    revenue: '$8,210',
    products: 36,
    lastSync: '25 min ago'
  },
  { 
    id: 3, 
    name: 'BigCommerce', 
    status: 'inactive', 
    orders: 0,
    revenue: '$0',
    products: 0,
    lastSync: 'Never'
  },
  { 
    id: 4, 
    name: 'Amazon Marketplace', 
    status: 'active', 
    orders: 287,
    revenue: '$15,678',
    products: 28,
    lastSync: '5 min ago'
  }
];

// Example products data
const PRODUCTS = [
  {
    id: 1,
    name: 'Signature Burger',
    price: '$12.99',
    inventory: 'Unlimited',
    category: 'Main Dishes',
    platforms: ['Shopify', 'Amazon'],
    sales: 87
  },
  {
    id: 2,
    name: 'Gourmet Pasta Pack',
    price: '$15.99',
    inventory: '28 packs',
    category: 'Meal Kits',
    platforms: ['Shopify', 'WooCommerce'],
    sales: 64
  },
  {
    id: 3,
    name: 'Specialty Hot Sauce',
    price: '$8.99',
    inventory: '42 bottles',
    category: 'Condiments',
    platforms: ['Shopify', 'Amazon', 'WooCommerce'],
    sales: 112
  },
  {
    id: 4,
    name: 'Fresh Salad Kit',
    price: '$9.99',
    inventory: '15 kits',
    category: 'Meal Kits',
    platforms: ['WooCommerce'],
    sales: 36
  }
];

export default function ECommerce() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('platforms');
  
  // Query to fetch e-commerce platforms
  const { data: ecommercePlatforms = [], isLoading: platformsLoading } = useQuery<ECommercePlatform[]>({
    queryKey: ['/api/ecommerce/platforms'],
  });
  
  // Query to fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/ecommerce/products'],
  });
  
  // Filter platforms based on search term
  const filteredPlatforms = ecommercePlatforms.filter(platform => 
    platform.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate statistics
  const activePlatforms = ecommercePlatforms.filter(p => p.status === 'active').length;
  const totalOrders = ecommercePlatforms.reduce((sum, p) => sum + p.orders, 0);
  const totalRevenue = ecommercePlatforms.reduce((sum, p) => {
    const revenue = parseFloat(p.revenue.replace('$', '').replace(',', ''));
    return sum + revenue;
  }, 0);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">E-Commerce</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
            <Input
              type="search"
              placeholder={`Search ${activeTab === 'platforms' ? 'platforms' : 'products'}...`}
              className="w-full pl-9 bg-bg-card border-border-color sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {activeTab === 'platforms' ? 'Add Platform' : 'Add Product'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active Platforms"
          value={activePlatforms.toString()}
          icon={<Store className="h-4 w-4 text-accent-green" />}
          change={25}
          progress={80}
          progressColor="bg-accent-green"
        />
        
        <StatsCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<ShoppingBag className="h-4 w-4 text-accent-blue" />}
          change={18.5}
          progress={65}
          progressColor="bg-accent-blue"
        />
        
        <StatsCard
          title="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<BarChart className="h-4 w-4 text-accent-purple" />}
          change={32.7}
          progress={75}
          progressColor="bg-accent-purple"
        />
      </div>
      
      <Tabs defaultValue="platforms" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="platforms">
          <DashboardCard title="E-Commerce Platforms">
            <div className="overflow-hidden rounded-lg border border-border-color">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg-chart">
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlatforms.length > 0 ? (
                    filteredPlatforms.map((platform) => (
                      <TableRow key={platform.id} className="bg-bg-card border-t border-border-color">
                        <TableCell className="font-medium">{platform.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              platform.status === 'active' 
                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }
                          >
                            {platform.status === 'active' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {platform.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{platform.orders}</TableCell>
                        <TableCell>{platform.revenue}</TableCell>
                        <TableCell>{platform.products}</TableCell>
                        <TableCell>{platform.lastSync}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-text-secondary">
                        No e-commerce platforms found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DashboardCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <DashboardCard title="Platform Integrations">
              <div className="grid gap-4">
                {['Shopify', 'WooCommerce', 'BigCommerce', 'Amazon Marketplace'].map((integration, index) => (
                  <Card key={index} className="bg-bg-card border-border-color">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md">{integration}</CardTitle>
                        <Badge className={index !== 2 ? 'bg-accent-green' : 'bg-accent-blue'}>
                          {index !== 2 ? 'Connected' : 'Available'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {index !== 2 
                          ? 'Integration is active and working properly.' 
                          : 'Click to set up this integration for your store.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-end">
                      <Button variant="outline" size="sm" className="gap-2">
                        {index !== 2 ? (
                          <>
                            <Settings className="h-4 w-4" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Link className="h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DashboardCard>
            
            <DashboardCard title="Sync Settings">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Auto-Sync Schedule</h3>
                  <Card className="bg-bg-card border-border-color p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-accent-purple" />
                      <div>
                        <p className="font-medium">Every 15 minutes</p>
                        <p className="text-sm text-text-secondary">Orders, inventory & products</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Manual Sync</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">Sync Products</Button>
                    <Button variant="outline" className="w-full">Sync Orders</Button>
                  </div>
                  <Button className="w-full">Sync All Data Now</Button>
                </div>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <DashboardCard title="Products">
            <div className="overflow-hidden rounded-lg border border-border-color">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg-chart">
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Platforms</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="bg-bg-card border-t border-border-color">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.inventory}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {product.platforms.map((platform, i) => (
                              <Badge key={i} variant="outline" className="bg-bg-chart text-text-secondary">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-text-secondary">
                        No products found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DashboardCard>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="bg-bg-card border-border-color">
              <CardHeader>
                <CardTitle className="text-lg">Top Sellers</CardTitle>
                <CardDescription>Best-performing products across platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.sort((a, b) => b.sales - a.sales).slice(0, 3).map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        i === 0 ? 'bg-accent-yellow/20 text-accent-yellow' :
                        i === 1 ? 'bg-accent-purple/20 text-accent-purple' :
                        'bg-accent-blue/20 text-accent-blue'
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-text-secondary">{product.sales} sold</p>
                      </div>
                    </div>
                    <ArrowUpRight className={`h-4 w-4 ${
                      i === 0 ? 'text-accent-yellow' :
                      i === 1 ? 'text-accent-purple' :
                      'text-accent-blue'
                    }`} />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Analytics</Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-bg-card border-border-color">
              <CardHeader>
                <CardTitle className="text-lg">Low Stock Alert</CardTitle>
                <CardDescription>Products that need replenishment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-destructive/20 text-destructive">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Fresh Salad Kit</p>
                      <p className="text-sm text-text-secondary">15 kits remaining</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Order</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500/20 text-amber-500">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Specialty Tea</p>
                      <p className="text-sm text-text-secondary">20 boxes remaining</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Order</Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Inventory</Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-bg-card border-border-color">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common e-commerce tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add New Product
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  View Recent Orders
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Update Pricing
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BarChart className="h-4 w-4" />
                  Sales Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart, ShoppingCart, ShoppingBag, Tag, Package, Settings2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import TestEcommerce from "@/components/dashboard/TestEcommerce";

export default function Ecommerce() {
  const { user } = useAuth();
  
  // This would be replaced with actual data from the backend
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => Promise.resolve([]),
  });

  // This would be replaced with actual data from the backend
  const { data: orders } = useQuery({
    queryKey: ['/api/ecommerce/orders'],
    queryFn: () => Promise.resolve([]),
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">E-commerce</h1>
          <p className="text-text-secondary">
            Manage your online store, products, and orders.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="test">Test Integration</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,231.89</div>
                  <p className="text-xs text-text-secondary">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Products
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">76</div>
                  <p className="text-xs text-text-secondary">
                    4 products added this month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Orders
                  </CardTitle>
                  <Package className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">152</div>
                  <p className="text-xs text-text-secondary">
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                  <Tag className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2%</div>
                  <p className="text-xs text-text-secondary">
                    +0.5% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    You have received 12 orders this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Order #{i}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {i === 1 ? 'Today' : i === 2 ? 'Yesterday' : '3 days ago'}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          ${(Math.random() * 100).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Platform Integrations</CardTitle>
                  <CardDescription>
                    Connect your online store with other platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium">Available Platforms</div>
                    <Separator />
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-blue-100 p-2">
                            <ShoppingCart className="h-4 w-4 text-blue-700" />
                          </div>
                          <span>Shopify</span>
                        </div>
                        <Link href="/dashboard/ecommerce/shopify">
                          <Button variant="outline" size="sm">Connect</Button>
                        </Link>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-purple-100 p-2">
                            <ShoppingCart className="h-4 w-4 text-purple-700" />
                          </div>
                          <span>WooCommerce</span>
                        </div>
                        <Link href="/dashboard/ecommerce/woocommerce">
                          <Button variant="outline" size="sm">Connect</Button>
                        </Link>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-orange-100 p-2">
                            <ShoppingCart className="h-4 w-4 text-orange-700" />
                          </div>
                          <span>Magento</span>
                        </div>
                        <Link href="/dashboard/ecommerce/magento">
                          <Button variant="outline" size="sm">Connect</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Manage your products and inventory
                  </CardDescription>
                </div>
                <Button>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                {products && products.length > 0 ? (
                  <div>Product list would go here</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-text-secondary mb-4" />
                    <h3 className="text-lg font-medium">No products yet</h3>
                    <p className="text-text-secondary mt-2 mb-6 max-w-md">
                      Start by adding your first product to your online store.
                    </p>
                    <Button>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  View and manage customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div>Orders list would go here</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-text-secondary mb-4" />
                    <h3 className="text-lg font-medium">No orders yet</h3>
                    <p className="text-text-secondary mt-2 mb-6 max-w-md">
                      Orders will appear here once customers start purchasing from your store.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="test" className="space-y-4">
            <TestEcommerce />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>E-commerce Settings</CardTitle>
                <CardDescription>
                  Configure your online store settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Store Information</h3>
                  <p className="text-text-secondary text-sm">
                    Basic information about your online store
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Edit Store Info
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Payment Settings</h3>
                  <p className="text-text-secondary text-sm">
                    Configure payment methods and options
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Configure Payments
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Shipping & Delivery</h3>
                  <p className="text-text-secondary text-sm">
                    Set up shipping methods and delivery options
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Settings2 className="mr-2 h-4 w-4" />
                      Configure Shipping
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
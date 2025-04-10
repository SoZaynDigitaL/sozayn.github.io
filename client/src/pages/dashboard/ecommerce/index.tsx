import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart, ShoppingCart, ShoppingBag, Tag, Package, Settings2, Webhook as WebhookIcon, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import TestEcommerce from "@/components/dashboard/TestEcommerce";
import TestEcommerceDelivery from "@/components/dashboard/TestEcommerceDelivery";
import EcommerceIntegrationManager from "@/components/dashboard/ecommerce/EcommerceIntegrationManager";
import WebhookManager from "@/components/dashboard/ecommerce/WebhookManager";
import { apiRequest } from "@/lib/queryClient";

export default function Ecommerce() {
  const { user } = useAuth();
  
  // Fetch actual data from backend
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/ecommerce/orders'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/ecommerce/orders');
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    },
  });

  // Fetch integrations to check which platforms are connected
  const { data: integrations } = useQuery({
    queryKey: ['/api/integrations?type=ecommerce'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/integrations?type=ecommerce');
        if (!res.ok) return [];
        return await res.json();
      } catch (error) {
        console.error("Error fetching integrations:", error);
        return [];
      }
    },
  });

  // Helper to check if platform is connected
  const isPlatformConnected = (platform: string) => {
    if (!integrations) return false;
    return integrations.some((i: any) => i.provider === platform.toLowerCase());
  };

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
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
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
                  <div className="text-2xl font-bold">{products?.length || 0}</div>
                  <p className="text-xs text-text-secondary">
                    {isLoadingProducts ? "Loading..." : "Products in your catalog"}
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
                  <div className="text-2xl font-bold">{orders?.length || 0}</div>
                  <p className="text-xs text-text-secondary">
                    {isLoadingOrders ? "Loading..." : "Orders processed"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Integrations
                  </CardTitle>
                  <LinkIcon className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integrations?.length || 0}</div>
                  <p className="text-xs text-text-secondary">
                    Connected platforms
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    {isLoadingOrders ? "Loading recent orders..." : (orders?.length ? `${orders.length} orders have been processed` : "No orders received yet")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : !orders || orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Package className="h-12 w-12 text-text-secondary mb-4" />
                      <h3 className="text-lg font-medium">No orders yet</h3>
                      <p className="text-text-secondary mt-2 max-w-md">
                        Orders will appear here once customers start purchasing from your store.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between border-b pb-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Order #{order.orderNumber || order.id}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="font-medium">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-blue-100 p-2">
                            <ShoppingCart className="h-4 w-4 text-blue-700" />
                          </div>
                          <span>Shopify</span>
                        </div>
                        <Link href="/dashboard/ecommerce/integrations#shopify">
                          <Button 
                            variant={isPlatformConnected('shopify') ? "default" : "outline"} 
                            size="sm"
                          >
                            {isPlatformConnected('shopify') ? 'Connected' : 'Connect'}
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-purple-100 p-2">
                            <ShoppingCart className="h-4 w-4 text-purple-700" />
                          </div>
                          <span>WooCommerce</span>
                        </div>
                        <Link href="/dashboard/ecommerce/integrations#woocommerce">
                          <Button 
                            variant={isPlatformConnected('woocommerce') ? "default" : "outline"} 
                            size="sm"
                          >
                            {isPlatformConnected('woocommerce') ? 'Connected' : 'Connect'}
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-orange-100 p-2">
                            <ShoppingCart className="h-4 w-4 text-orange-700" />
                          </div>
                          <span>Squarespace</span>
                        </div>
                        <Link href="/dashboard/ecommerce/integrations#squarespace">
                          <Button 
                            variant={isPlatformConnected('squarespace') ? "default" : "outline"} 
                            size="sm"
                          >
                            {isPlatformConnected('squarespace') ? 'Connected' : 'Connect'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-center">
                    <Link href="/dashboard/ecommerce/integrations">
                      <Button variant="link" className="text-sm">
                        Manage All Integrations
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-4">
            <EcommerceIntegrationManager />
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-4">
            <WebhookManager />
          </TabsContent>
          
          <TabsContent value="test" className="space-y-4">
            <Tabs defaultValue="integration">
              <TabsList className="mb-4">
                <TabsTrigger value="integration">E-commerce Integration</TabsTrigger>
                <TabsTrigger value="delivery">E-commerce to Delivery</TabsTrigger>
              </TabsList>
              
              <TabsContent value="integration" className="space-y-4">
                <TestEcommerce />
              </TabsContent>
              
              <TabsContent value="delivery" className="space-y-4">
                <TestEcommerceDelivery />
              </TabsContent>
            </Tabs>
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
                  <h3 className="text-lg font-medium">Platform Connections</h3>
                  <p className="text-text-secondary text-sm">
                    Manage your connections to e-commerce platforms
                  </p>
                  <div className="flex justify-end">
                    <Link href="/dashboard/ecommerce/integrations">
                      <Button variant="outline">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Manage Integrations
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Webhook Configuration</h3>
                  <p className="text-text-secondary text-sm">
                    Set up webhooks to receive real-time updates from your e-commerce platform
                  </p>
                  <div className="flex justify-end">
                    <Link href="/dashboard/ecommerce/webhooks">
                      <Button variant="outline">
                        <WebhookIcon className="mr-2 h-4 w-4" />
                        Manage Webhooks
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Delivery Integration</h3>
                  <p className="text-text-secondary text-sm">
                    Configure how orders are sent to delivery partners
                  </p>
                  <div className="flex justify-end">
                    <Link href="/dashboard/delivery-partners">
                      <Button variant="outline">
                        <Package className="mr-2 h-4 w-4" />
                        Manage Delivery Partners
                      </Button>
                    </Link>
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
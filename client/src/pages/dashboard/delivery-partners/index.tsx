import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Truck, Package, BarChart, Webhook as WebhookIcon, Settings, TestTube2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TestDelivery from "@/components/dashboard/TestDelivery";
import TestEcommerceDelivery from "@/components/dashboard/TestEcommerceDelivery";
import DeliveryPartnerIntegrations from "@/components/dashboard/delivery-partners/DeliveryPartnerIntegrations";
import { WebhookManager } from "@/components/dashboard/delivery-partners/WebhookManager";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function DeliveryPartnersPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [location] = useLocation();
  
  // State for nested test tab
  const [testSubTab, setTestSubTab] = useState("direct");
  
  // Check for tab query parameter on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      
      // Handle main tabs
      if (tabParam && ["overview", "integrations", "webhooks", "test", "settings"].includes(tabParam)) {
        setActiveTab(tabParam);
        
        // If there's a test subtab parameter
        const subtabParam = params.get("subtab");
        if (tabParam === "test" && subtabParam && ["direct", "ecommerce"].includes(subtabParam)) {
          setTestSubTab(subtabParam);
        }
      }
      
      // Handle old 'test-order' redirect
      if (tabParam === "test-order") {
        setActiveTab("test");
        setTestSubTab("direct");
      }
    }
  }, [location]);
  
  // Fetch delivery stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/delivery/stats'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/delivery/stats');
        if (!response.ok) return {
          total: 0,
          completed: 0,
          inProgress: 0,
          cancelled: 0,
          avgDeliveryTime: 0
        };
        return await response.json();
      } catch (error) {
        console.error("Error fetching delivery stats:", error);
        return {
          total: 0,
          completed: 0,
          inProgress: 0,
          cancelled: 0,
          avgDeliveryTime: 0
        };
      }
    },
  });
  
  // Fetch active integrations count
  const { data: integrations } = useQuery({
    queryKey: ['/api/integrations?type=delivery'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/integrations?type=delivery');
        if (!res.ok) return [];
        return await res.json();
      } catch (error) {
        console.error("Error fetching integrations:", error);
        return [];
      }
    },
  });

  // Calculate active integrations
  const activeIntegrations = integrations?.filter((i: any) => i.status === 'active')?.length || 0;
  
  // Format delivery time
  const formatAvgTime = (minutes: number) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Delivery Partners</h1>
          <p className="text-text-secondary">
            Manage your delivery partner integrations and track deliveries
          </p>
        </div>

        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="test">Test Delivery</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Partners
                  </CardTitle>
                  <Truck className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeIntegrations}</div>
                  <p className="text-xs text-text-secondary">
                    Delivery partners connected
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Deliveries
                  </CardTitle>
                  <Package className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoadingStats ? "..." : stats?.total || 0}</div>
                  <p className="text-xs text-text-secondary">
                    Deliveries processed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Rate
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? "..." : stats?.total ? 
                      Math.round((stats?.completed / stats?.total) * 100) + '%' : 
                      'N/A'
                    }
                  </div>
                  <p className="text-xs text-text-secondary">
                    {isLoadingStats ? "Loading..." : `${stats?.completed || 0} completed deliveries`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Delivery Time
                  </CardTitle>
                  <Settings className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? "..." : formatAvgTime(stats?.avgDeliveryTime || 0)}
                  </div>
                  <p className="text-xs text-text-secondary">
                    From order to completion
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Delivery Partner Status</CardTitle>
                  <CardDescription>
                    Active delivery partner integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingStats ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : integrations?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Truck className="h-12 w-12 text-text-secondary mb-4" />
                        <h3 className="text-lg font-medium">No delivery partners</h3>
                        <p className="text-text-secondary mt-2 max-w-md">
                          Connect a delivery partner to enable automatic deliveries for your orders.
                        </p>
                        <Button 
                          className="mt-4"
                          onClick={() => setActiveTab("integrations")}
                        >
                          Add Delivery Partner
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {integrations.map((integration: any) => (
                          <div key={integration.id} className="flex items-center justify-between border-b pb-2">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Truck className="h-4 w-4 mr-2 text-text-secondary" />
                                <p className="text-sm font-medium">
                                  {integration.name}
                                </p>
                              </div>
                              <p className="text-xs text-text-secondary">
                                {integration.provider}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${integration.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs">
                                {integration.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common delivery partner management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab("integrations")}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Manage Delivery Partners
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab("webhooks")}
                    >
                      <WebhookIcon className="h-4 w-4 mr-2" />
                      Configure Webhooks
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => {
                        setActiveTab("test");
                        setTestSubTab("direct");
                      }}
                    >
                      <TestTube2 className="h-4 w-4 mr-2" />
                      Test Delivery
                    </Button>
                    
                    <Separator className="my-2" />
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-medium mb-2">Need Help?</h3>
                      <p className="text-sm text-text-secondary mb-3">
                        Get assistance with setting up and troubleshooting your delivery partner integrations.
                      </p>
                      <Button variant="link" className="h-auto p-0 text-sm">
                        View Documentation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Partner Integrations</CardTitle>
                <CardDescription>
                  Configure your delivery partner integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeliveryPartnerIntegrations />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Webhooks</CardTitle>
                <CardDescription>
                  Configure webhooks for real-time delivery updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookManager type="delivery" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="test" className="space-y-6">
            <div className="flex flex-col gap-6">
              <Tabs 
                value={testSubTab} 
                onValueChange={setTestSubTab} 
                className="w-full"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="direct">Direct Delivery Test</TabsTrigger>
                  <TabsTrigger value="ecommerce">E-commerce Integration</TabsTrigger>
                </TabsList>
                
                <TabsContent value="direct">
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Direct Delivery</CardTitle>
                      <CardDescription>
                        Test your delivery partner integrations with a sample order
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TestDelivery />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="ecommerce">
                  <Card>
                    <CardHeader>
                      <CardTitle>Test E-commerce to Delivery Integration</CardTitle>
                      <CardDescription>
                        Test the webhook integration between your e-commerce platform and delivery partners
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TestEcommerceDelivery />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>
                  Configure global settings for deliveries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Default Delivery Partner</h3>
                  <p className="text-text-secondary text-sm">
                    Select the default delivery partner to use when multiple options are available
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Default Partner
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Automatic Fulfillment</h3>
                  <p className="text-text-secondary text-sm">
                    Configure how orders are automatically sent to delivery partners
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Fulfillment
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Delivery Zones</h3>
                  <p className="text-text-secondary text-sm">
                    Set up delivery zones and rules for different areas
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Delivery Zones
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
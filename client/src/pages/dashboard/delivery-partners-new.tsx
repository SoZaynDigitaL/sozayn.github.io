import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

// Import our delivery partner components
import DeliveryPartnerIntegrations from "@/components/dashboard/delivery-partners/DeliveryPartnerIntegrations";
import TestDelivery from "@/components/dashboard/TestDelivery";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function DeliveryPartners() {
  const { hasRequiredPlan } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [defaultTab, setDefaultTab] = useState("integrations");
  
  // Set default tab based on URL parameters (for redirects from old test-order page)
  useEffect(() => {
    // Check if we were redirected from the test-order page
    if (location.includes('test-order') || new URLSearchParams(window.location.search).get('tab') === 'test-order') {
      setDefaultTab("test-order");
    }
  }, [location]);
  
  // Check if user has required plan
  const canAddIntegration = hasRequiredPlan(['Growth', 'Pro']);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Partners</h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage your delivery partner integrations
          </p>
        </div>
      </div>

      {/* Plan restriction warning */}
      {!canAddIntegration && (
        <Alert variant="destructive">
          <AlertTitle>Upgrade your plan</AlertTitle>
          <AlertDescription>
            Delivery integrations are available on the Growth and Pro plans. 
            <Button variant="link" className="p-0 ml-2 text-primary" onClick={() => window.location.href = '/manage-subscription'}>
              Upgrade now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="test-order">Test Order Flow</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="mt-6">
          <DeliveryPartnerIntegrations />
        </TabsContent>
        
        <TabsContent value="test-order" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Order Flow</CardTitle>
              <CardDescription>
                Create test deliveries to verify your delivery integrations are working correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestDelivery />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentation and Resources</CardTitle>
                <CardDescription>
                  Learn how to get the most out of your delivery partner integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">Getting Started</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Follow these steps to set up your delivery partner integrations:
                    </p>
                    <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
                      <li>Sign up for a developer account with your preferred delivery partner</li>
                      <li>Create an application in their developer portal</li>
                      <li>Obtain your API credentials</li>
                      <li>Configure the integration in SoZayn</li>
                      <li>Test the integration before going live</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">API Endpoints</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The following endpoints are available for your delivery partner integrations:
                    </p>
                    <ul className="mt-2 text-sm space-y-1">
                      <li><code>POST /api/delivery/quote</code> - Get a delivery quote</li>
                      <li><code>POST /api/delivery/create</code> - Create a delivery</li>
                      <li><code>GET /api/delivery/:id</code> - Check delivery status</li>
                      <li><code>DELETE /api/delivery/:id</code> - Cancel a delivery</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Available Integrations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="border p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 text-blue-700 font-bold h-8 w-8 rounded flex items-center justify-center mr-2">
                            UE
                          </div>
                          <h4 className="font-semibold">UberDirect</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">On-demand delivery service by Uber</p>
                        <a 
                          href="https://developer.uber.com/docs/deliveries" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs flex items-center text-primary mt-2"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" /> Documentation
                        </a>
                      </div>
                      
                      <div className="border p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-purple-100 text-purple-700 font-bold h-8 w-8 rounded flex items-center justify-center mr-2">
                            JG
                          </div>
                          <h4 className="font-semibold">Jet GO</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Fast, reliable local delivery service</p>
                        <a 
                          href="https://jetgo-delivery.com/docs" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs flex items-center text-primary mt-2"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" /> Documentation
                        </a>
                      </div>
                      

                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="webhooks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Webhooks</CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time delivery status updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
                  <ExternalLink className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're working on adding delivery webhooks integration.
                  This feature will be available in an upcoming release.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
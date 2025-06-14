import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DELIVERY_PARTNERS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Default webhook payload template
const DEFAULT_WEBHOOK_PAYLOAD = {
  id: `order_${Date.now()}`,
  customer: {
    name: "Jane Doe",
    email: "jane@example.com",
    address: "123 Main St, San Francisco, CA 94105",
    phone: "555-987-6543"
  },
  restaurant: {
    name: "Turkish Kebab Grill",
    address: "456 Restaurant Ave, San Francisco, CA 94105",
    phone: "555-123-4567"
  },
  items: [
    {
      name: "Lamb Kebab",
      quantity: 2,
      price: 1599
    },
    {
      name: "Falafel Wrap",
      quantity: 1,
      price: 999
    }
  ],
  totalAmount: 4197,
  currency: "USD",
  notes: "Please add extra sauce"
};

export default function TestEcommerceDelivery() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [ecommerceIntegrationId, setEcommerceIntegrationId] = useState("1");
  const [deliveryIntegrationId, setDeliveryIntegrationId] = useState("3");
  const [deliveryProvider, setDeliveryProvider] = useState("uberdirect");
  const [webhookPayload, setWebhookPayload] = useState(
    JSON.stringify(DEFAULT_WEBHOOK_PAYLOAD, null, 2)
  );
  
  const testWebhook = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      console.log("Starting webhook test with delivery provider:", deliveryProvider);
      
      // Parse the webhook payload
      let payload;
      try {
        payload = JSON.parse(webhookPayload);
        console.log("Successfully parsed webhook payload");
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid JSON in webhook payload");
      }
      
      // Add the integration IDs and delivery provider
      const webhookData = {
        ecommerceIntegrationId: parseInt(ecommerceIntegrationId),
        deliveryIntegrationId: parseInt(deliveryIntegrationId),
        deliveryProvider: deliveryProvider,
        ...payload
      };
      
      console.log("Sending webhook data:", {
        ecommerceIntegrationId: webhookData.ecommerceIntegrationId,
        deliveryIntegrationId: webhookData.deliveryIntegrationId,
        deliveryProvider: webhookData.deliveryProvider,
        hasCustomer: !!webhookData.customer,
        hasItems: Array.isArray(webhookData.items) ? webhookData.items.length : 'no items array'
      });
      
      // Call the TEST webhook endpoint
      console.log("Calling the TEST webhook endpoint");
      const response = await apiRequest(
        "POST", 
        "/api/webhook/test-ecommerce-to-delivery", 
        webhookData,
        { 
          headers: {
            'X-Requested-By': 'TestEcommerceDelivery', // Add custom header for debugging
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Webhook response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to process webhook";
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("Webhook error response:", errorData);
        } catch (e) {
          console.error("Non-JSON error response:", errorText);
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("Webhook success result:", result);
      setResult(result);
      
      toast({
        title: "Webhook Test Successful",
        description: `Delivery created with ID: ${result.delivery.id}`,
        variant: "default",
      });
    } catch (error) {
      console.error("TestEcommerceDelivery error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Webhook Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>E-commerce to Delivery Webhook</CardTitle>
        <CardDescription>
          Test the integration between e-commerce and delivery systems using webhooks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This simulates an e-commerce platform sending an order to a delivery service via webhook
          </p>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ecommerceIntegrationId" className="text-right">
                E-commerce Integration
              </Label>
              <div className="col-span-3">
                <Select 
                  value={ecommerceIntegrationId} 
                  onValueChange={setEcommerceIntegrationId}
                >
                  <SelectTrigger id="ecommerceIntegrationId">
                    <SelectValue placeholder="Select an integration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Shopify Store</SelectItem>
                    <SelectItem value="2">WooCommerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryIntegrationId" className="text-right">
                Delivery Integration
              </Label>
              <div className="col-span-3">
                <Select 
                  value={deliveryIntegrationId} 
                  onValueChange={(value) => {
                    setDeliveryIntegrationId(value);
                    // Also update the provider based on the selection
                    // Hardcoding the mapping for now because we only support two specific providers
                    if (value === '3') {
                      setDeliveryProvider('uberdirect');
                    } else if (value === '4') {
                      setDeliveryProvider('jetgo');
                    }
                  }}
                >
                  <SelectTrigger id="deliveryIntegrationId">
                    <SelectValue placeholder="Select a delivery partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">UberDirect</SelectItem>
                    <SelectItem value="4">JetGo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="webhook-payload" className="text-right">
                Webhook Payload
              </Label>
              <div className="col-span-3">
                <Textarea 
                  id="webhook-payload" 
                  placeholder="Webhook payload in JSON format" 
                  className="font-mono text-xs"
                  rows={12}
                  value={webhookPayload}
                  onChange={(e) => setWebhookPayload(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <Alert className="my-4">
              <div className="flex items-start space-x-2">
                <div className="bg-green-100 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                  >
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                </div>
                <div>
                  <AlertTitle className="text-green-700">Delivery Created Successfully</AlertTitle>
                  <AlertDescription className="text-green-600">
                    <div className="mt-2">
                      <p><strong>Delivery ID:</strong> {result.delivery.id}</p>
                      <p><strong>Status:</strong> {result.delivery.status}</p>
                      <p className="flex items-center">
                        <strong className="mr-1">Tracking:</strong>
                        <a 
                          href={result.delivery.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          <span>View Tracking</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </p>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={testWebhook}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : "Test Webhook"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
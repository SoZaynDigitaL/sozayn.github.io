import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Loader2, ShoppingCart, Globe, Settings, Webhook as WebhookIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// E-commerce platforms supported
const ECOMMERCE_PLATFORMS = [
  { value: "shopify", label: "Shopify", icon: ShoppingCart },
  { value: "woocommerce", label: "WooCommerce", icon: Globe },
  { value: "squarespace", label: "Squarespace", icon: Globe },
];

// Form schema for e-commerce integration
const integrationSchema = z.object({
  // Basic information
  provider: z.string().min(1, "Platform is required"),
  name: z.string().min(1, "Integration name is required"),
  
  // Platform-specific credentials
  storeUrl: z.string().url("Please enter a valid URL"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
  adminAccessToken: z.string().optional(),
  
  // Webhook configuration
  enableWebhook: z.boolean().default(true),
  webhookUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  webhookSecret: z.string().optional(),
  
  // Additional settings
  enableAutoFulfillment: z.boolean().default(false),
  defaultDeliveryPartnerId: z.string().optional(),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

interface EcommerceIntegration {
  id: number;
  userId: number;
  type: string;
  provider: string;
  name: string;
  credentials: {
    storeUrl: string;
    apiKey: string;
    apiSecret: string;
    adminAccessToken?: string;
    webhookId?: string;
    webhookSecret?: string;
  };
  settings: {
    enableAutoFulfillment: boolean;
    defaultDeliveryPartnerId?: number;
    webhookUrl?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function EcommerceIntegrationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIntegrationId, setCurrentIntegrationId] = useState<number | null>(null);
  
  // Fetch existing e-commerce integrations
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ['/api/integrations?type=ecommerce'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/integrations?type=ecommerce');
      if (!res.ok) throw new Error('Failed to fetch integrations');
      return res.json();
    },
  });
  
  // Fetch delivery partners for auto-fulfillment
  const { data: deliveryPartners, isLoading: isLoadingDeliveryPartners } = useQuery({
    queryKey: ['/api/integrations?type=delivery'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/integrations?type=delivery');
      if (!res.ok) throw new Error('Failed to fetch delivery partners');
      return res.json();
    },
  });
  
  // Initialize form
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      provider: "",
      name: "",
      storeUrl: "",
      apiKey: "",
      apiSecret: "",
      adminAccessToken: "",
      enableWebhook: true,
      webhookUrl: "",
      webhookSecret: "",
      enableAutoFulfillment: false,
      defaultDeliveryPartnerId: "",
    },
  });
  
  // Load existing integration data into form if editing
  const loadIntegration = (integration: EcommerceIntegration) => {
    setCurrentIntegrationId(integration.id);
    
    form.reset({
      provider: integration.provider,
      name: integration.name,
      storeUrl: integration.credentials.storeUrl,
      apiKey: integration.credentials.apiKey,
      apiSecret: integration.credentials.apiSecret,
      adminAccessToken: integration.credentials.adminAccessToken || "",
      enableWebhook: !!integration.credentials.webhookId,
      webhookUrl: integration.settings.webhookUrl || "",
      webhookSecret: integration.credentials.webhookSecret || "",
      enableAutoFulfillment: integration.settings.enableAutoFulfillment,
      defaultDeliveryPartnerId: integration.settings.defaultDeliveryPartnerId ? 
        integration.settings.defaultDeliveryPartnerId.toString() : "",
    });
  };
  
  // Reset form for new integration
  const resetForm = () => {
    setCurrentIntegrationId(null);
    form.reset({
      provider: "",
      name: "",
      storeUrl: "",
      apiKey: "",
      apiSecret: "",
      adminAccessToken: "",
      enableWebhook: true,
      webhookUrl: "",
      webhookSecret: "",
      enableAutoFulfillment: false,
      defaultDeliveryPartnerId: "",
    });
  };
  
  // Create or update integration
  const integrationMutation = useMutation({
    mutationFn: async (data: IntegrationFormValues) => {
      // Prepare the data for API
      const integrationData = {
        type: "ecommerce",
        provider: data.provider,
        name: data.name,
        credentials: {
          storeUrl: data.storeUrl,
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
          adminAccessToken: data.adminAccessToken,
        },
        settings: {
          enableAutoFulfillment: data.enableAutoFulfillment,
          defaultDeliveryPartnerId: data.defaultDeliveryPartnerId ? 
            parseInt(data.defaultDeliveryPartnerId) : undefined,
        }
      };
      
      let response;
      if (currentIntegrationId) {
        // Update existing integration
        response = await apiRequest(
          'PATCH', 
          `/api/integrations/${currentIntegrationId}`, 
          integrationData
        );
      } else {
        // Create new integration
        response = await apiRequest(
          'POST', 
          '/api/integrations', 
          integrationData
        );
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save integration');
      }
      
      const savedIntegration = await response.json();
      
      // If webhook is enabled, create or update webhook
      if (data.enableWebhook) {
        const webhookData = {
          integrationType: "ecommerce",
          integrationId: savedIntegration.id,
          url: data.webhookUrl || `${window.location.origin}/api/webhook/ecommerce-to-delivery`,
          secret: data.webhookSecret || generateWebhookSecret(),
          events: ["order.created"],
        };
        
        // Check if webhook already exists
        if (savedIntegration.credentials.webhookId) {
          await apiRequest(
            'PATCH',
            `/api/webhooks/${savedIntegration.credentials.webhookId}`,
            webhookData
          );
        } else {
          const webhookResponse = await apiRequest(
            'POST',
            '/api/webhooks',
            webhookData
          );
          
          if (webhookResponse.ok) {
            const webhook = await webhookResponse.json();
            
            // Update integration with webhook information
            await apiRequest(
              'PATCH',
              `/api/integrations/${savedIntegration.id}`,
              {
                credentials: {
                  ...savedIntegration.credentials,
                  webhookId: webhook.id,
                  webhookSecret: webhook.secret,
                },
                settings: {
                  ...savedIntegration.settings,
                  webhookUrl: webhook.url,
                }
              }
            );
          }
        }
      }
      
      return savedIntegration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations?type=ecommerce'] });
      toast({
        title: currentIntegrationId ? "Integration Updated" : "Integration Created",
        description: "Your e-commerce integration has been saved successfully",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save Integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to test integration
  const testIntegrationMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      const response = await apiRequest(
        'POST',
        `/api/integrations/${integrationId}/test`,
        {}
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Integration test failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration Test Successful",
        description: "Your e-commerce integration is working correctly",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Integration Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation to delete integration
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      const response = await apiRequest(
        'DELETE',
        `/api/integrations/${integrationId}`,
        {}
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete integration');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations?type=ecommerce'] });
      toast({
        title: "Integration Deleted",
        description: "Your e-commerce integration has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Integration",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Helper to generate webhook secret
  const generateWebhookSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  // Form submission handler
  const onSubmit = (data: IntegrationFormValues) => {
    integrationMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="integrations">My Integrations</TabsTrigger>
          <TabsTrigger value="add">{currentIntegrationId ? "Edit Integration" : "Add Integration"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">E-commerce Integrations</h2>
            <Button onClick={resetForm}>
              Add New Integration
            </Button>
          </div>
          
          {isLoadingIntegrations ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !integrations || integrations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No integrations found</AlertTitle>
              <AlertDescription>
                You haven't connected any e-commerce platforms yet. Add your first integration to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {integrations.map((integration: EcommerceIntegration) => (
                <Card key={integration.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.provider}</CardDescription>
                      </div>
                      <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                        {integration.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium block">Store URL:</span>
                        <span className="text-text-secondary truncate block">
                          {integration.credentials.storeUrl}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium block">Connected:</span>
                        <span className="text-text-secondary">
                          {new Date(integration.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium block">Webhook:</span>
                        <span className="text-text-secondary">
                          {integration.credentials.webhookId ? 'Configured' : 'Not set up'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium block">Auto-Fulfillment:</span>
                        <span className="text-text-secondary">
                          {integration.settings.enableAutoFulfillment ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testIntegrationMutation.mutate(integration.id)}
                      disabled={testIntegrationMutation.isPending}
                    >
                      {testIntegrationMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : 'Test Connection'}
                    </Button>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => loadIntegration(integration)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this integration?')) {
                            deleteIntegrationMutation.mutate(integration.id);
                          }
                        }}
                        disabled={deleteIntegrationMutation.isPending}
                      >
                        {deleteIntegrationMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : 'Delete'}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{currentIntegrationId ? 'Edit Integration' : 'Add New Integration'}</CardTitle>
              <CardDescription>
                Connect your e-commerce platform to enable order management and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ECOMMERCE_PLATFORMS.map(platform => (
                                  <SelectItem key={platform.value} value={platform.value}>
                                    <div className="flex items-center">
                                      <platform.icon className="h-4 w-4 mr-2" />
                                      {platform.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Shopify Store" {...field} />
                            </FormControl>
                            <FormDescription>
                              A friendly name to identify this integration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Credentials</h3>
                    <p className="text-sm text-text-secondary">
                      Enter your platform API credentials. These are securely stored and encrypted.
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="storeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-store.myshopify.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Your API Key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="apiSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Secret</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Your API Secret" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="adminAccessToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Access Token (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Admin Access Token for extended permissions" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Required for some platforms to access advanced features
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Webhook Configuration</h3>
                      <FormField
                        control={form.control}
                        name="enableWebhook"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormLabel>Enable Webhook</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <p className="text-sm text-text-secondary">
                      Webhooks allow your e-commerce platform to send real-time order updates to SoZayn
                    </p>
                    
                    {form.watch("enableWebhook") && (
                      <>
                        <FormField
                          control={form.control}
                          name="webhookUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook URL (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={`${window.location.origin}/api/webhook/ecommerce-to-delivery`}
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Leave blank to use the default endpoint
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="webhookSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook Secret (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password"
                                  placeholder="Optional webhook secret for signature verification" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                A random secret will be generated if left blank
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Alert>
                          <WebhookIcon className="h-4 w-4" />
                          <AlertTitle>Webhook Setup Instructions</AlertTitle>
                          <AlertDescription>
                            After saving, you'll need to add this webhook URL to your e-commerce platform.
                            The webhook secret will be used to validate incoming webhooks.
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Advanced Settings</h3>
                      <FormField
                        control={form.control}
                        name="enableAutoFulfillment"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormLabel>Enable Auto-Fulfillment</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("enableAutoFulfillment") && (
                      <FormField
                        control={form.control}
                        name="defaultDeliveryPartnerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Delivery Partner</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a delivery partner" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingDeliveryPartners ? (
                                  <div className="flex justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : !deliveryPartners || deliveryPartners.length === 0 ? (
                                  <div className="p-2 text-sm text-text-secondary">
                                    No delivery partners found
                                  </div>
                                ) : (
                                  deliveryPartners.map((partner: any) => (
                                    <SelectItem key={partner.id} value={partner.id.toString()}>
                                      {partner.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Orders will be automatically sent to this delivery partner
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={integrationMutation.isPending}
                    >
                      {integrationMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : currentIntegrationId ? 'Update Integration' : 'Save Integration'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
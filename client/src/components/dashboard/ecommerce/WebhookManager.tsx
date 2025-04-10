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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Webhook as WebhookIcon, Loader2, Link as LinkIcon, TestTube2, Copy, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Event types for webhooks
const WEBHOOK_EVENTS = [
  { id: "order.created", label: "Order Created" },
  { id: "order.updated", label: "Order Updated" },
  { id: "order.cancelled", label: "Order Cancelled" },
  { id: "order.fulfilled", label: "Order Fulfilled" },
  { id: "order.delivered", label: "Order Delivered" },
];

// Form schema for webhook management
const webhookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  integrationType: z.string().min(1, "Integration type is required"),
  integrationId: z.string().min(1, "Integration is required"),
  url: z.string().url("Must be a valid URL"),
  secret: z.string().min(6, "Secret must be at least 6 characters"),
  events: z.array(z.string()).min(1, "At least one event must be selected"),
  isActive: z.boolean().default(true),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

interface Webhook {
  id: number;
  userId: number;
  name: string;
  integrationType: string;
  integrationId: number;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WebhookManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentWebhookId, setCurrentWebhookId] = useState<number | null>(null);
  const [webhookSecretVisible, setWebhookSecretVisible] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Fetch existing webhooks
  const { data: webhooks, isLoading: isLoadingWebhooks } = useQuery({
    queryKey: ['/api/webhooks'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/webhooks');
      if (!res.ok) throw new Error('Failed to fetch webhooks');
      return res.json();
    },
  });
  
  // Fetch integrations to link webhooks to
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/integrations');
      if (!res.ok) throw new Error('Failed to fetch integrations');
      return res.json();
    },
  });
  
  // Initialize form
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      integrationType: "ecommerce",
      integrationId: "",
      url: "",
      secret: generateSecret(),
      events: ["order.created"],
      isActive: true,
    },
  });
  
  // Helper to generate a random webhook secret
  function generateSecret(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Load existing webhook data into form if editing
  const loadWebhook = (webhook: Webhook) => {
    setCurrentWebhookId(webhook.id);
    
    form.reset({
      name: webhook.name,
      integrationType: webhook.integrationType,
      integrationId: webhook.integrationId.toString(),
      url: webhook.url,
      secret: webhook.secret,
      events: webhook.events,
      isActive: webhook.isActive,
    });
  };
  
  // Reset form for new webhook
  const resetForm = () => {
    setCurrentWebhookId(null);
    setWebhookSecretVisible(false);
    
    form.reset({
      name: "",
      integrationType: "ecommerce",
      integrationId: "",
      url: "",
      secret: generateSecret(),
      events: ["order.created"],
      isActive: true,
    });
  };
  
  // Create or update webhook
  const webhookMutation = useMutation({
    mutationFn: async (data: WebhookFormValues) => {
      const webhookData = {
        name: data.name,
        integrationType: data.integrationType,
        integrationId: parseInt(data.integrationId),
        url: data.url,
        secret: data.secret,
        events: data.events,
        isActive: data.isActive,
      };
      
      let response;
      if (currentWebhookId) {
        // Update existing webhook
        response = await apiRequest(
          'PATCH', 
          `/api/webhooks/${currentWebhookId}`, 
          webhookData
        );
      } else {
        // Create new webhook
        response = await apiRequest(
          'POST', 
          '/api/webhooks', 
          webhookData
        );
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save webhook');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({
        title: currentWebhookId ? "Webhook Updated" : "Webhook Created",
        description: "Your webhook has been saved successfully",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save Webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to test webhook
  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: number) => {
      const response = await apiRequest(
        'POST',
        `/api/webhooks/${webhookId}/test`,
        {}
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Webhook test failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Webhook Test Successful",
        description: "The test payload was delivered successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Webhook Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation to delete webhook
  const deleteWebhookMutation = useMutation({
    mutationFn: async (webhookId: number) => {
      const response = await apiRequest(
        'DELETE',
        `/api/webhooks/${webhookId}`,
        {}
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete webhook');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({
        title: "Webhook Deleted",
        description: "Your webhook has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Webhook",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (data: WebhookFormValues) => {
    webhookMutation.mutate(data);
  };
  
  // Helper to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard`,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    });
  };
  
  // Helper function to filter integrations by type
  const getIntegrationsByType = (type: string) => {
    if (!integrations) return [];
    return integrations.filter((integration: any) => integration.type === type);
  };
  
  // Helper to get integration name by ID
  const getIntegrationName = (id: number) => {
    if (!integrations) return "";
    const integration = integrations.find((i: any) => i.id === id);
    return integration ? integration.name : "";
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="webhooks">My Webhooks</TabsTrigger>
          <TabsTrigger value="add">{currentWebhookId ? "Edit Webhook" : "Add Webhook"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Webhooks</h2>
            <Button onClick={resetForm}>
              Add New Webhook
            </Button>
          </div>
          
          {isLoadingWebhooks ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !webhooks || webhooks.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No webhooks found</AlertTitle>
              <AlertDescription>
                You haven't created any webhooks yet. Add your first webhook to receive real-time updates.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook: Webhook) => (
                <Card key={webhook.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{webhook.name}</CardTitle>
                        <CardDescription>
                          {webhook.integrationType}: {getIntegrationName(webhook.integrationId)}
                        </CardDescription>
                      </div>
                      <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="h-4 w-4 text-text-secondary" />
                          <span className="font-medium">Endpoint URL:</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-text-secondary mr-2 max-w-[240px] truncate">
                            {webhook.url}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(webhook.url, "URL")}
                          >
                            {copiedText === "URL" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium block">Events:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {webhook.events.map(event => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testWebhookMutation.mutate(webhook.id)}
                      disabled={testWebhookMutation.isPending}
                    >
                      {testWebhookMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube2 className="h-4 w-4 mr-2" />
                          Test Webhook
                        </>
                      )}
                    </Button>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => loadWebhook(webhook)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this webhook?')) {
                            deleteWebhookMutation.mutate(webhook.id);
                          }
                        }}
                        disabled={deleteWebhookMutation.isPending}
                      >
                        {deleteWebhookMutation.isPending ? (
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
              <CardTitle>{currentWebhookId ? 'Edit Webhook' : 'Create Webhook'}</CardTitle>
              <CardDescription>
                Set up webhooks to receive real-time notifications for events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Order Notifications" {...field} />
                          </FormControl>
                          <FormDescription>
                            A friendly name to identify this webhook
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="integrationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Type</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Reset the integration ID when type changes
                                form.setValue("integrationId", "");
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select integration type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ecommerce">E-commerce</SelectItem>
                                <SelectItem value="delivery">Delivery</SelectItem>
                                <SelectItem value="pos">POS</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="integrationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select integration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingIntegrations ? (
                                  <div className="flex justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : !integrations || getIntegrationsByType(form.watch("integrationType")).length === 0 ? (
                                  <div className="p-2 text-sm text-text-secondary">
                                    No integrations found for this type
                                  </div>
                                ) : (
                                  getIntegrationsByType(form.watch("integrationType")).map((integration: any) => (
                                    <SelectItem key={integration.id} value={integration.id.toString()}>
                                      {integration.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Endpoint Configuration</h3>
                    
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/webhook" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The URL where webhook events will be sent
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Secret</FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <div className="relative w-full">
                                <Input 
                                  type={webhookSecretVisible ? "text" : "password"}
                                  placeholder="Webhook Secret" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setWebhookSecretVisible(!webhookSecretVisible)}
                                >
                                  {webhookSecretVisible ? "Hide" : "Show"}
                                </Button>
                              </div>
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newSecret = generateSecret();
                                form.setValue("secret", newSecret);
                              }}
                            >
                              Regenerate
                            </Button>
                          </div>
                          <FormDescription>
                            Used to verify the authenticity of webhook requests
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Events</h3>
                    <FormField
                      control={form.control}
                      name="events"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Webhook Events</FormLabel>
                            <FormDescription>
                              Select which events will trigger this webhook
                            </FormDescription>
                          </div>
                          {WEBHOOK_EVENTS.map((event) => (
                            <FormField
                              key={event.id}
                              control={form.control}
                              name="events"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={event.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 mb-1"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(event.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, event.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== event.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {event.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Active
                            </FormLabel>
                            <FormDescription>
                              Inactive webhooks will not receive any events
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
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
                      disabled={webhookMutation.isPending}
                    >
                      {webhookMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : currentWebhookId ? 'Update Webhook' : 'Create Webhook'}
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
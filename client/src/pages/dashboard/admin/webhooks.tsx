import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Loader2, Plus, ArrowRight, Trash2, Copy, Eye, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WebhookLogs from "@/components/dashboard/WebhookLogs";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

// Schema for the form
const webhookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  endpointUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
  description: z.string().optional(),
  sourceType: z.enum(["ecommerce", "delivery", "pos", "internal"]),
  sourceProvider: z.string().min(1, "Source provider is required"),
  destinationType: z.enum(["ecommerce", "delivery", "pos", "internal"]),
  destinationProvider: z.string().min(1, "Destination provider is required"),
  eventTypes: z.array(z.string()).min(1, "Select at least one event type"),
  isActive: z.boolean().default(true),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

// Providers and event types
const PROVIDERS = {
  ecommerce: ["Shopify", "WooCommerce", "Magento", "BigCommerce", "Squarespace", "Wix"],
  delivery: ["UberDirect", "DoorDash", "GrubHub", "JetGO"],
  pos: ["Toast", "Square", "Clover", "Lightspeed"],
  internal: ["SoZayn", "API Clients"]
};

const EVENT_TYPES = [
  // Ecommerce events
  { value: "order.created", label: "Order Created", type: "ecommerce" },
  { value: "order.updated", label: "Order Updated", type: "ecommerce" },
  { value: "order.cancelled", label: "Order Cancelled", type: "ecommerce" },
  { value: "product.created", label: "Product Created", type: "ecommerce" },
  { value: "product.updated", label: "Product Updated", type: "ecommerce" },
  { value: "product.deleted", label: "Product Deleted", type: "ecommerce" },
  // Delivery events
  { value: "delivery.assigned", label: "Delivery Assigned", type: "delivery" },
  { value: "delivery.pickup", label: "Delivery Pickup", type: "delivery" },
  { value: "delivery.completed", label: "Delivery Completed", type: "delivery" },
  { value: "delivery.cancelled", label: "Delivery Cancelled", type: "delivery" },
  { value: "delivery.status", label: "Delivery Status Update", type: "delivery" },
  { value: "courier.update", label: "Courier Location Update", type: "delivery" },
  // Payment events
  { value: "payment.succeeded", label: "Payment Succeeded", type: "pos" },
  { value: "payment.failed", label: "Payment Failed", type: "pos" },
  { value: "payment.refunded", label: "Payment Refunded", type: "pos" },
  // Internal events
  { value: "subscription.created", label: "Subscription Created", type: "internal" },
  { value: "subscription.updated", label: "Subscription Updated", type: "internal" },
  { value: "subscription.cancelled", label: "Subscription Cancelled", type: "internal" },
];

export default function AdminWebhooksPage() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not admin
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      endpointUrl: "",
      description: "",
      sourceType: "ecommerce",
      sourceProvider: "",
      destinationType: "delivery",
      destinationProvider: "",
      eventTypes: [],
      isActive: true,
    },
  });
  
  // Query to fetch all webhooks (from all users)
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["/api/admin/webhooks"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/webhooks");
      if (!res.ok) {
        throw new Error("Failed to fetch webhooks");
      }
      return res.json();
    },
  });
  
  // Mutation to create a new webhook
  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormValues) => {
      const res = await apiRequest("POST", "/api/admin/webhooks", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create webhook");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Webhook created",
        description: "The webhook has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update a webhook
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<WebhookFormValues> }) => {
      const res = await apiRequest("PATCH", `/api/admin/webhooks/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update webhook");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      toast({
        title: "Webhook updated",
        description: "The webhook has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to delete a webhook
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/webhooks/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete webhook");
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      setIsDetailsOpen(false);
      setSelectedWebhook(null);
      toast({
        title: "Webhook deleted",
        description: "The webhook has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: WebhookFormValues) => {
    createWebhookMutation.mutate(data);
  };
  
  // Toggle webhook active state
  const toggleWebhookActive = (webhook: any) => {
    updateWebhookMutation.mutate({
      id: webhook.id,
      data: { isActive: !webhook.isActive },
    });
  };
  
  // View webhook details
  const viewWebhookDetails = (webhook: any) => {
    setSelectedWebhook(webhook);
    setIsDetailsOpen(true);
    setShowLogs(false);
  };
  
  // Delete webhook
  const deleteWebhook = () => {
    if (!selectedWebhook) return;
    setIsDeleting(true);
    deleteWebhookMutation.mutate(selectedWebhook.id);
  };
  
  // Copy webhook URL
  const copyWebhookUrl = (secretKey: string) => {
    const url = `${window.location.origin}/api/webhook/${secretKey}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard",
      description: "The webhook URL has been copied to your clipboard.",
    });
  };
  
  // Filter events based on type
  const getEventTypes = (type: string) => {
    return EVENT_TYPES.filter(event => 
      event.type === type || 
      event.type === 'internal' // Always include internal events
    );
  };
  
  // Reset form when changing types
  const handleSourceTypeChange = (value: string) => {
    form.setValue('sourceType', value as any);
    form.setValue('sourceProvider', '');
    form.setValue('eventTypes', []);
  };
  
  const handleDestinationTypeChange = (value: string) => {
    form.setValue('destinationType', value as any);
    form.setValue('destinationProvider', '');
  };
  
  // Create a special webhook for UberDirect
  const createUberDirectWebhook = async () => {
    try {
      const result = await apiRequest("POST", "/api/webhooks/setup/uberdirect");
      if (!result.ok) {
        const error = await result.json();
        throw new Error(error.message || "Failed to create UberDirect webhook");
      }
      
      const data = await result.json();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      
      toast({
        title: "UberDirect Webhook Created",
        description: "The webhook for UberDirect has been configured successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create UberDirect webhook",
        variant: "destructive",
      });
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Webhook Management</h1>
            <p className="text-gray-500">Manage webhooks across the entire platform</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-500"
              onClick={createUberDirectWebhook}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Setup UberDirect
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Webhook</DialogTitle>
                  <DialogDescription>
                    Create a new webhook to connect services with event integrations.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. UberDirect Order Updates" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="What this webhook does..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-4">
                      <FormField
                        control={form.control}
                        name="sourceType"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Source Type*</FormLabel>
                            <Select 
                              onValueChange={handleSourceTypeChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ecommerce">E-commerce</SelectItem>
                                <SelectItem value="delivery">Delivery</SelectItem>
                                <SelectItem value="pos">POS System</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sourceProvider"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Source Provider*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROVIDERS[form.watch("sourceType") as keyof typeof PROVIDERS]?.map((provider) => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center justify-center my-2">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>
                    
                    <div className="flex gap-4">
                      <FormField
                        control={form.control}
                        name="destinationType"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Destination Type*</FormLabel>
                            <Select 
                              onValueChange={handleDestinationTypeChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select destination type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ecommerce">E-commerce</SelectItem>
                                <SelectItem value="delivery">Delivery</SelectItem>
                                <SelectItem value="pos">POS System</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="destinationProvider"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Destination Provider*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROVIDERS[form.watch("destinationType") as keyof typeof PROVIDERS]?.map((provider) => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="endpointUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endpoint URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/webhook" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave empty for system-generated endpoint
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="eventTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Types*</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {getEventTypes(form.watch("sourceType")).map((eventType) => (
                              <div className="flex items-center space-x-2" key={eventType.value}>
                                <input
                                  type="checkbox"
                                  id={`event-${eventType.value}`}
                                  value={eventType.value}
                                  checked={field.value.includes(eventType.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, eventType.value]);
                                    } else {
                                      field.onChange(
                                        field.value.filter((value) => value !== eventType.value)
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor={`event-${eventType.value}`} className="text-sm">
                                  {eventType.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Enable or disable this webhook
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {createWebhookMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Create Webhook"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : webhooks.length === 0 ? (
          <DashboardCard>
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-500 mb-4">No webhooks created yet.</p>
              <Button 
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Webhook
              </Button>
            </div>
          </DashboardCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {webhooks.map((webhook: any) => (
              <DashboardCard key={webhook.id} className="cursor-pointer hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between" onClick={() => viewWebhookDetails(webhook)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{webhook.name}</h3>
                      <Badge variant="outline" className="text-xs">User ID: {webhook.userId}</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>{webhook.sourceProvider}</span>
                      <ArrowRight className="h-3 w-3 mx-1" />
                      <span>{webhook.destinationProvider}</span>
                    </div>
                    {webhook.description && (
                      <p className="text-gray-500 text-sm mt-2">{webhook.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={webhook.isActive ? "default" : "outline"}>
                      {webhook.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyWebhookUrl(webhook.secretKey);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewWebhookDetails(webhook);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        )}
        
        {selectedWebhook && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{selectedWebhook.name}</DialogTitle>
                <DialogDescription>
                  Webhook details and logs
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {!showLogs ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">Source</h3>
                        <p className="text-sm mt-1">{selectedWebhook.sourceProvider} ({selectedWebhook.sourceType})</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Destination</h3>
                        <p className="text-sm mt-1">{selectedWebhook.destinationProvider} ({selectedWebhook.destinationType})</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Endpoint URL</h3>
                        <p className="text-sm mt-1 break-all">{selectedWebhook.endpointUrl || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Secret Key</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm break-all truncate">{selectedWebhook.secretKey}</p>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyWebhookUrl(selectedWebhook.secretKey)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Created</h3>
                        <p className="text-sm mt-1">
                          {new Date(selectedWebhook.createdAt).toLocaleDateString()} 
                          {" "}
                          {new Date(selectedWebhook.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Last Updated</h3>
                        <p className="text-sm mt-1">
                          {new Date(selectedWebhook.updatedAt).toLocaleDateString()} 
                          {" "}
                          {new Date(selectedWebhook.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">Event Types</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedWebhook.eventTypes.map((eventType: string) => (
                          <Badge key={eventType} variant="outline" className="text-xs">
                            {eventType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {selectedWebhook.description && (
                      <div>
                        <h3 className="text-sm font-medium">Description</h3>
                        <p className="text-sm mt-1">{selectedWebhook.description}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <WebhookLogs webhookId={selectedWebhook.id} />
                )}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={!showLogs ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setShowLogs(false)}
                    >
                      Details
                    </Button>
                    <Button 
                      variant={showLogs ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setShowLogs(true)}
                    >
                      View Logs
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Active</span>
                      <Switch
                        checked={selectedWebhook.isActive}
                        onCheckedChange={() => toggleWebhookActive(selectedWebhook)}
                      />
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={deleteWebhook}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
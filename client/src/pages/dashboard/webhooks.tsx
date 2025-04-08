import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, Plus, ArrowRight, Trash2, Copy, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WebhookLogs from "@/components/dashboard/WebhookLogs";

// Schema for the form
const webhookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  endpointUrl: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
  sourceType: z.enum(["ecommerce", "delivery"]),
  sourceProvider: z.string().min(1, "Source provider is required"),
  destinationType: z.enum(["ecommerce", "delivery"]),
  destinationProvider: z.string().min(1, "Destination provider is required"),
  eventTypes: z.array(z.string()).min(1, "Select at least one event type"),
  isActive: z.boolean().default(true),
});

type WebhookFormValues = z.infer<typeof webhookSchema>;

// Mock data for providers and event types
const PROVIDERS = {
  ecommerce: ["Shopify", "WooCommerce", "Magento", "BigCommerce"],
  delivery: ["DoorDash", "UberEats", "GrubHub", "JetGO"]
};

const EVENT_TYPES = [
  { value: "order.created", label: "Order Created" },
  { value: "order.updated", label: "Order Updated" },
  { value: "order.cancelled", label: "Order Cancelled" },
  { value: "delivery.assigned", label: "Delivery Assigned" },
  { value: "delivery.pickup", label: "Delivery Pickup" },
  { value: "delivery.completed", label: "Delivery Completed" },
  { value: "payment.succeeded", label: "Payment Succeeded" },
  { value: "payment.failed", label: "Payment Failed" },
];

export default function WebhooksPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
  
  // Query to fetch all webhooks
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["/api/webhooks"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/webhooks");
      if (!res.ok) {
        throw new Error("Failed to fetch webhooks");
      }
      return res.json();
    },
  });
  
  // Mutation to create a new webhook
  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormValues) => {
      const res = await apiRequest("POST", "/api/webhooks", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create webhook");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Webhook created",
        description: "Your webhook has been created successfully.",
      });
    },
    onError: (error) => {
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
      const res = await apiRequest("PATCH", `/api/webhooks/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update webhook");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({
        title: "Webhook updated",
        description: "Your webhook has been updated successfully.",
      });
    },
    onError: (error) => {
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
      const res = await apiRequest("DELETE", `/api/webhooks/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete webhook");
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsDetailsOpen(false);
      setSelectedWebhook(null);
      toast({
        title: "Webhook deleted",
        description: "Your webhook has been deleted successfully.",
      });
    },
    onError: (error) => {
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
  
  // Get providers based on type
  const getProviders = (type: "ecommerce" | "delivery") => {
    return PROVIDERS[type];
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Webhooks</h1>
            <p className="text-gray-500">Manage your webhook integrations</p>
          </div>
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
                  Create a new webhook to connect your e-commerce platform with delivery services.
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
                          <Input placeholder="e.g. Shopify to DoorDash Orders" {...field} />
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
                            onValueChange={(value: "ecommerce" | "delivery") => {
                              field.onChange(value);
                              // Reset provider when type changes
                              form.setValue("sourceProvider", "");
                            }}
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
                              {getProviders(form.watch("sourceType")).map((provider) => (
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
                            onValueChange={(value: "ecommerce" | "delivery") => {
                              field.onChange(value);
                              // Reset provider when type changes
                              form.setValue("destinationProvider", "");
                            }}
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
                              {getProviders(form.watch("destinationType")).map((provider) => (
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
                    name="eventTypes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Types*</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {EVENT_TYPES.map((eventType) => (
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
                                className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <label
                                htmlFor={`event-${eventType.value}`}
                                className="text-sm font-medium cursor-pointer"
                              >
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
                    name="endpointUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endpoint URL*</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-endpoint.com/webhook" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the URL that will receive webhook events
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Enable webhook</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateOpen(false);
                        form.reset();
                      }}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createWebhookMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createWebhookMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Webhook'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                    <h3 className="font-semibold text-lg">{webhook.name}</h3>
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Webhook Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div>
                  <h3 className="text-sm font-medium">Name</h3>
                  <p>{selectedWebhook.name}</p>
                </div>
                
                {selectedWebhook.description && (
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p>{selectedWebhook.description}</p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">Source</h3>
                    <p>{selectedWebhook.sourceProvider} ({selectedWebhook.sourceType})</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">Destination</h3>
                    <p>{selectedWebhook.destinationProvider} ({selectedWebhook.destinationType})</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Endpoint URL</h3>
                  <p className="truncate">{selectedWebhook.endpointUrl}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Webhook URL</h3>
                  <div className="flex mt-1">
                    <Input 
                      value={`${window.location.origin}/api/webhook/${selectedWebhook.secretKey}`}
                      readOnly
                      className="pr-10"
                    />
                    <Button 
                      type="button"
                      variant="ghost"
                      className="ml-2"
                      onClick={() => copyWebhookUrl(selectedWebhook.secretKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use this URL to receive webhook events
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Event Types</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(selectedWebhook.eventTypes || []).map((eventType: string) => {
                      const eventLabel = EVENT_TYPES.find(e => e.value === eventType)?.label || eventType;
                      return (
                        <Badge key={eventType} variant="secondary">
                          {eventLabel}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
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
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
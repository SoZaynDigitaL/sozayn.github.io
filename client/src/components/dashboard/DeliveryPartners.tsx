import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { IntegrationCard } from '@/components/ui/integration-card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  X,
  Copy,
  HelpCircle,
} from 'lucide-react';
import { TopSellingItems } from '@/components/dashboard/TopSellingItems';
import { OrderSources } from '@/components/dashboard/OrderSources';
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from '@/hooks/use-toast';
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Form schema for simplified add partner dialog
const addPartnerSchema = z.object({
  provider: z.string().min(1, "Provider name is required"),
  apiKey: z.string().min(1, "API key is required"),
});

type AddPartnerFormValues = z.infer<typeof addPartnerSchema>;

// Form schema for detailed configuration dialog
const configurationSchema = z.object({
  id: z.number(),
  provider: z.string(),
  environment: z.enum(["sandbox", "live"]),
  developerId: z.string().min(1, "Developer ID is required"),
  keyId: z.string().min(1, "Key ID is required"),
  signingSecret: z.string().min(1, "Signing Secret is required"),
  webhookUrl: z.string().optional(),
  sendOrderStatus: z.boolean().default(true),
});

type ConfigurationFormValues = z.infer<typeof configurationSchema>;

export default function DeliveryPartners() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any | null>(null);
  const { toast } = useToast();
  
  // For demo purposes, we'll use hardcoded integrations 
  const [integrations, setIntegrations] = useState<any[]>([
    {
      id: 1,
      provider: "DoorDash",
      type: "delivery",
      apiKey: "demo_api_key",
      isActive: true,
      environment: "sandbox",
      developerId: "demo_developer_id",
      keyId: "demo_key_id",
      signingSecret: "demo_signing_secret",
      webhookUrl: "https://delivery.apps.hyperzod.com/api/v1/4404/webhook/order/doordash",
      sendOrderStatus: true,
      settings: {}
    },
    {
      id: 2,
      provider: "UberEats",
      type: "delivery",
      apiKey: "demo_api_key",
      isActive: false,
      environment: "sandbox",
      developerId: "demo_developer_id",
      keyId: "demo_key_id",
      signingSecret: "demo_signing_secret",
      webhookUrl: "https://delivery.apps.hyperzod.com/api/v1/4404/webhook/order/ubereats",
      sendOrderStatus: true,
      settings: {}
    },
    {
      id: 3,
      provider: "Grubhub",
      type: "delivery",
      apiKey: "demo_api_key",
      isActive: true,
      environment: "sandbox",
      developerId: "demo_developer_id",
      keyId: "demo_key_id",
      signingSecret: "demo_signing_secret",
      webhookUrl: "https://delivery.apps.hyperzod.com/api/v1/4404/webhook/order/grubhub",
      sendOrderStatus: true,
      settings: {}
    },
    {
      id: 4,
      provider: "Jet GO",
      type: "delivery",
      apiKey: "demo_api_key",
      isActive: false,
      environment: "sandbox",
      developerId: "demo_developer_id",
      keyId: "demo_key_id",
      signingSecret: "demo_signing_secret",
      webhookUrl: "https://delivery.apps.hyperzod.com/api/v1/4404/webhook/order/jetgo",
      sendOrderStatus: true,
      settings: {}
    }
  ]);
  const isLoading = false;
  
  // Filter to only show delivery type integrations (not needed with hardcoded data)
  const deliveryIntegrations = integrations;
  
  // Define the add partner form
  const addForm = useForm<AddPartnerFormValues>({
    resolver: zodResolver(addPartnerSchema),
    defaultValues: {
      provider: "",
      apiKey: "",
    },
  });
  
  // Define the configuration form
  const configForm = useForm<ConfigurationFormValues>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      id: 0,
      provider: "",
      environment: "sandbox",
      developerId: "",
      keyId: "",
      signingSecret: "",
      webhookUrl: "",
      sendOrderStatus: true,
    },
  });
  
  // Open configuration dialog for a specific integration
  const openConfigDialog = (integration: any) => {
    setSelectedIntegration(integration);
    
    // Set form values based on the selected integration but don't preload fields
    configForm.reset({
      id: integration.id,
      provider: integration.provider,
      environment: integration.environment || "sandbox",
      developerId: "", // Keep empty for user input
      keyId: "", // Keep empty for user input
      signingSecret: "", // Keep empty for user input
      webhookUrl: "", // Keep empty for user to paste or edit
      sendOrderStatus: integration.sendOrderStatus !== undefined ? integration.sendOrderStatus : true,
    });
    
    setIsConfigDialogOpen(true);
  };
  
  // Create mutation to add a new integration (using local state)
  const addIntegrationMutation = useMutation({
    mutationFn: (data: AddPartnerFormValues) => {
      // Create a dummy promise to simulate API call
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          const newIntegration = {
            id: integrations.length + 1,
            provider: data.provider,
            apiKey: data.apiKey,
            type: 'delivery',
            isActive: true,
            environment: "sandbox",
            developerId: "",
            keyId: "",
            signingSecret: "",
            webhookUrl: `https://delivery.apps.hyperzod.com/api/v1/4404/webhook/order/${data.provider.toLowerCase()}`,
            sendOrderStatus: true,
            settings: {}
          };
          resolve(newIntegration);
        }, 500);
      });
    },
    onSuccess: (newIntegration: any) => {
      // Update local state
      setIntegrations(prev => [...prev, newIntegration]);
      
      toast({
        title: "Integration added",
        description: "The delivery partner has been integrated successfully.",
      });
      
      addForm.reset();
      setIsAddDialogOpen(false);
      
      // Open the detailed configuration dialog for the newly added integration
      setTimeout(() => {
        openConfigDialog(newIntegration);
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add integration. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update mutation for detailed configuration (using local state)
  const updateIntegrationMutation = useMutation({
    mutationFn: (data: ConfigurationFormValues) => {
      // Create a dummy promise to simulate API call
      return new Promise<any>((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 500);
      });
    },
    onSuccess: (data: ConfigurationFormValues) => {
      // Update local state
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === data.id 
            ? { 
                ...integration, 
                environment: data.environment,
                developerId: data.developerId,
                keyId: data.keyId,
                signingSecret: data.signingSecret,
                webhookUrl: data.webhookUrl,
                sendOrderStatus: data.sendOrderStatus
              }
            : integration
        )
      );
      
      toast({
        title: "Integration updated",
        description: "The delivery partner configuration has been updated successfully.",
      });
      setIsConfigDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update integration. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to toggle integration status with local state update
  const toggleIntegrationStatus = async (id: number, isActive: boolean) => {
    try {
      // Update local state instead of making API call
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id 
            ? { ...integration, isActive }
            : integration
        )
      );
      
      toast({
        title: isActive ? "Integration activated" : "Integration deactivated",
        description: `The integration has been ${isActive ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update integration status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Submit handler for the add form
  function onAddSubmit(data: AddPartnerFormValues) {
    addIntegrationMutation.mutate(data);
  }
  
  // Submit handler for the configuration form
  function onConfigSubmit(data: ConfigurationFormValues) {
    updateIntegrationMutation.mutate(data);
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }
  
  // Get color for each provider
  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      'DoorDash': 'text-accent-orange',
      'UberEats': 'text-accent-blue',
      'Grubhub': 'text-accent-green',
      'Postmates': 'text-text-primary',
      'SkipDishes': 'text-accent-yellow',
      'Jet GO': 'text-accent-purple',
    };
    
    return colors[provider] || 'text-accent-purple';
  };
  
  // Get icon letters for each provider
  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      'DoorDash': 'DD',
      'UberEats': 'UE',
      'Grubhub': 'GH',
      'Postmates': 'PM',
      'SkipDishes': 'SD',
      'Jet GO': 'JG',
    };
    
    return icons[provider] || provider.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Delivery Partners</h1>
        
        {/* Add Partner Dialog - Matching HyperZod Style */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md bg-[#18191F] border-none rounded-lg p-0 overflow-hidden">
            <DialogTitle className="sr-only">Add Delivery Partner</DialogTitle>
            <DialogDescription className="sr-only">Connect with a new delivery partner to expand your reach.</DialogDescription>
            <button className="absolute right-3 top-3 text-gray-400 hover:text-white p-1 bg-[#292B35] rounded"
              onClick={() => setIsAddDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-white">Add Delivery Partner</h2>
              <p className="text-gray-400 mt-1 text-sm">Connect with a new delivery partner to expand your reach.</p>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-5 mt-6">
                  <FormField
                    control={addForm.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Provider Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., DoorDash, UberEats" 
                            {...field}
                            className="mt-1 w-full bg-[#1F2128] border-[#2E323A] text-gray-200 rounded h-10" 
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 mt-1">
                          Enter the name of the delivery provider.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">API Key</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter API key" 
                            type="password"
                            {...field} 
                            className="mt-1 w-full bg-[#1F2128] border-[#2E323A] text-gray-200 rounded h-10" 
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500 mt-1">
                          The API key provided by the delivery service.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between gap-2 mt-8 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-[#2E323A] text-gray-200 hover:text-white hover:bg-transparent"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5"
                      disabled={addIntegrationMutation.isPending}
                    >
                      {addIntegrationMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Partner'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Configuration Dialog - Styled to match HyperZod */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-md bg-white rounded-xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Configuration</DialogTitle>
            <DialogDescription className="sr-only">Update your delivery partner configuration and credentials.</DialogDescription>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-100">Configuration</h2>
              
              <Form {...configForm}>
                <form onSubmit={configForm.handleSubmit(onConfigSubmit)}>
                  <div className="mt-4">
                    <h3 className="text-base font-medium text-gray-500">Select Environments</h3>
                    
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <FormField
                        control={configForm.control}
                        name="environment"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="config-sandbox"
                                    value="sandbox"
                                    checked={field.value === "sandbox"}
                                    onChange={() => field.onChange("sandbox")}
                                    className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label htmlFor="config-sandbox" className="text-sm cursor-pointer">Sandbox</label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    id="config-live"
                                    value="live"
                                    checked={field.value === "live"}
                                    onChange={() => field.onChange("live")}
                                    className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label htmlFor="config-live" className="text-sm cursor-pointer">live</label>
                                </div>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 space-y-4">
                    <FormField
                      control={configForm.control}
                      name="developerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Customer ID*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Customer ID" 
                              {...field} 
                              className="mt-1 w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={configForm.control}
                      name="keyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Client ID*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Client ID" 
                              {...field} 
                              className="mt-1 w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={configForm.control}
                      name="signingSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold text-gray-700">Client secret*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Client secret" 
                              type="password"
                              {...field} 
                              className="mt-1 w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500 mt-1">
                            Please fill out this field.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={configForm.control}
                      name="sendOrderStatus"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-bold text-gray-700 cursor-pointer m-0">Send on order status</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Webhook Endpoints</h3>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{selectedIntegration?.provider}</p>
                      <FormField
                        control={configForm.control}
                        name="webhookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <div className="relative">
                              <Input 
                                placeholder={`Paste webhook URL for ${selectedIntegration?.provider || ''} here`}
                                {...field}
                                className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-10" 
                              />
                              <button 
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                onClick={() => {
                                  if (!field.value) {
                                    toast({
                                      title: "No URL to copy",
                                      description: "Please enter a webhook URL first.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  navigator.clipboard.writeText(field.value);
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "The webhook URL has been copied to your clipboard.",
                                  });
                                }}
                              >
                                <Copy className="h-4 w-4 text-gray-400" />
                              </button>
                              <div className="text-xs italic text-gray-500 text-right mt-1">
                                We need webhook creation system.
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="h-10 px-5 py-0 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsConfigDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="h-10 px-5 py-0 bg-blue-600 rounded-md text-white hover:bg-blue-700"
                      disabled={updateIntegrationMutation.isPending}
                    >
                      {updateIntegrationMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliveryIntegrations.length > 0 ? (
          deliveryIntegrations.map((integration: any) => (
            <IntegrationCard
              key={integration.id}
              provider={integration.provider}
              icon={getProviderIcon(integration.provider)}
              isActive={integration.isActive}
              onToggle={(value) => toggleIntegrationStatus(integration.id, value)}
              description={integration.isActive ? 'Connected and active' : 'Integration inactive'}
              className="cursor-pointer"
              onClick={() => openConfigDialog(integration)}
            />
          ))
        ) : (
          <div className="col-span-2 p-6 bg-white border border-gray-100 rounded-lg text-center">
            <p className="text-gray-500 mb-4">No delivery partners connected yet.</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Your First Partner
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopSellingItems />
        <OrderSources />
      </div>
    </div>
  );
}
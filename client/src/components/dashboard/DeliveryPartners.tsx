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
  ArrowUpRight
} from 'lucide-react';
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

// Form schema for adding a new delivery partner integration
const integrationSchema = z.object({
  provider: z.string().min(1, "Provider name is required"),
  environment: z.enum(["sandbox", "live"]).default("sandbox"),
  developerId: z.string().min(1, "Developer ID is required"),
  keyId: z.string().min(1, "Key ID is required"),
  signingSecret: z.string().min(1, "Signing Secret is required"),
  webhookUrl: z.string().url("Please enter a valid URL").optional(),
  sendOrderStatus: z.boolean().default(true),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

export default function DeliveryPartners() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch existing integrations
  const { data: integrations = [], isLoading } = useQuery<any[]>({ 
    queryKey: ['/api/integrations'],
  });
  
  // Filter to only show delivery type integrations
  const deliveryIntegrations = integrations.filter((integration: any) => 
    integration.type === 'delivery'
  );
  
  // Define the form
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      provider: "",
      environment: "sandbox",
      developerId: "",
      keyId: "",
      signingSecret: "",
      webhookUrl: "",
      sendOrderStatus: true,
    },
  });
  
  // Create mutation to add a new integration
  const addIntegrationMutation = useMutation({
    mutationFn: (data: IntegrationFormValues) => {
      return apiRequest('POST', '/api/integrations', {
        ...data,
        type: 'delivery',
        isActive: true,
        settings: {}
      });
    },
    onSuccess: () => {
      toast({
        title: "Integration added",
        description: "The delivery partner has been integrated successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add integration. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to toggle integration status
  const toggleIntegrationStatus = async (id: number, isActive: boolean) => {
    try {
      await apiRequest('PATCH', `/api/integrations/${id}`, { isActive });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
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
  
  // Submit handler for the form
  function onSubmit(data: IntegrationFormValues) {
    addIntegrationMutation.mutate(data);
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
    };
    
    return icons[provider] || provider.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Delivery Partners</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent-blue hover:bg-accent-blue/90">
              <PlusCircle className="h-4 w-4" />
              Add New Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-bg-card border-border-color">
            <DialogHeader>
              <DialogTitle>Add Delivery Partner</DialogTitle>
              <DialogDescription className="text-text-secondary">
                Connect with a new delivery partner to expand your reach.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold">Configuration</h3>
                  
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., DoorDash, UberEats" 
                            {...field}
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          Enter the name of the delivery provider.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-bg-chart/50 rounded-lg p-4 border border-border-color">
                    <h4 className="text-sm font-medium mb-3">Select Environment</h4>
                    <FormField
                      control={form.control}
                      name="environment"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="sandbox"
                                  value="sandbox"
                                  checked={field.value === "sandbox"}
                                  onChange={() => field.onChange("sandbox")}
                                  className="rounded-full h-4 w-4 text-accent-blue"
                                />
                                <label htmlFor="sandbox" className="text-sm cursor-pointer">Sandbox</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="live"
                                  value="live"
                                  checked={field.value === "live"}
                                  onChange={() => field.onChange("live")}
                                  className="rounded-full h-4 w-4 text-accent-blue"
                                />
                                <label htmlFor="live" className="text-sm cursor-pointer">Live</label>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">API Credentials</h3>
                  
                  <FormField
                    control={form.control}
                    name="developerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Developer ID*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter Developer ID" 
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          Your Developer ID from the delivery service dashboard.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="keyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key ID*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter Key ID" 
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          Your API Key ID from the delivery service.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="signingSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signing Secret*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter Signing Secret" 
                            type="password"
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          Your API Signing Secret from the delivery service.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Webhook Endpoints</h3>
                  
                  <FormField
                    control={form.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Webhook URL (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input 
                              placeholder="Enter webhook URL" 
                              {...field} 
                              className="bg-bg-chart border-border-color flex-1 rounded-r-none" 
                            />
                            <button 
                              type="button"
                              className="bg-bg-chart border border-l-0 border-border-color px-2 rounded-r-md"
                              onClick={() => {
                                const url = field.value || '';
                                navigator.clipboard.writeText(url);
                                toast({
                                  title: "Copied to clipboard",
                                  description: "The webhook URL has been copied to your clipboard.",
                                });
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          URL where order notifications will be sent.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sendOrderStatus"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4 p-4 rounded-md bg-bg-chart/50 border border-border-color">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border-color mt-1"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Send on order status updates</FormLabel>
                          <FormDescription className="text-text-secondary">
                            Receive real-time notifications when order statuses change.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-accent-blue hover:bg-accent-blue/90"
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
                </DialogFooter>
              </form>
            </Form>
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
              color={getProviderColor(integration.provider)}
              isActive={integration.isActive}
              onToggle={(value) => toggleIntegrationStatus(integration.id, value)}
              description={integration.isActive ? 'Connected and active' : 'Integration inactive'}
            />
          ))
        ) : (
          <div className="col-span-2 p-6 bg-bg-card border border-border-color rounded-xl text-center">
            <p className="text-text-secondary mb-4">No delivery partners connected yet.</p>
            <Button onClick={() => setIsDialogOpen(true)}>Add Your First Partner</Button>
          </div>
        )}
      </div>
      
      <DashboardCard title="Available Integrations">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'DoorDash', color: 'text-accent-orange', icon: 'DD' },
            { name: 'UberEats', color: 'text-accent-blue', icon: 'UE' },
            { name: 'Grubhub', color: 'text-accent-green', icon: 'GH' },
            { name: 'Postmates', color: 'text-text-primary', icon: 'PM' },
            { name: 'SkipDishes', color: 'text-accent-yellow', icon: 'SD' },
            { name: 'Seamless', color: 'text-accent-purple', icon: 'SM' }
          ].map((partner) => (
            <div 
              key={partner.name}
              className="bg-bg-chart/50 border border-border-color rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <span className={`${partner.color} font-bold text-sm`}>{partner.icon}</span>
                </div>
                <span className="font-medium">{partner.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button variant="link" className="text-accent-blue flex items-center gap-1 p-0">
            View all available delivery partners
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </DashboardCard>
      
      <DashboardCard title="Integration Benefits">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-bg-chart rounded-lg border border-border-color">
            <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center mb-3">
              <ArrowUpRight className="h-5 w-5 text-accent-blue" />
            </div>
            <h3 className="text-lg font-medium mb-2">Expanded Reach</h3>
            <p className="text-text-secondary text-sm">
              Access a wider customer base by integrating with popular delivery platforms.
            </p>
          </div>
          
          <div className="p-4 bg-bg-chart rounded-lg border border-border-color">
            <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center mb-3">
              <Loader2 className="h-5 w-5 text-accent-green" />
            </div>
            <h3 className="text-lg font-medium mb-2">Automated Orders</h3>
            <p className="text-text-secondary text-sm">
              All orders from delivery partners automatically sync with your system.
            </p>
          </div>
          
          <div className="p-4 bg-bg-chart rounded-lg border border-border-color">
            <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center mb-3">
              <ChevronRight className="h-5 w-5 text-accent-purple" />
            </div>
            <h3 className="text-lg font-medium mb-2">Simplified Management</h3>
            <p className="text-text-secondary text-sm">
              Manage all your delivery partners from a single dashboard.
            </p>
          </div>
          
          <div className="p-4 bg-bg-chart rounded-lg border border-border-color">
            <div className="w-10 h-10 bg-accent-orange/20 rounded-lg flex items-center justify-center mb-3">
              <PlusCircle className="h-5 w-5 text-accent-orange" />
            </div>
            <h3 className="text-lg font-medium mb-2">Increased Revenue</h3>
            <p className="text-text-secondary text-sm">
              Drive more sales by making your menu available on multiple platforms.
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}

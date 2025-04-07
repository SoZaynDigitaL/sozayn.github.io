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
  apiKey: z.string().min(1, "API key is required"),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

export default function DeliveryPartners() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch existing integrations
  const { data: integrations = [], isLoading } = useQuery({ 
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
      apiKey: "",
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
                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter API key" 
                          {...field} 
                          className="bg-bg-chart border-border-color" 
                        />
                      </FormControl>
                      <FormDescription className="text-text-secondary">
                        The API key provided by the delivery service.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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

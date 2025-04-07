import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ClientDashboardLayout from '@/components/layout/ClientDashboardLayout';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { IntegrationCard } from '@/components/ui/integration-card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle,
  Loader2,
  ExternalLink,
  ArrowUpRight,
  Layers,
  Globe,
  ShoppingBag,
  BarChart
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema for adding a new e-commerce integration
const ecommerceSchema = z.object({
  provider: z.string().min(1, "Provider name is required"),
  apiKey: z.string().min(1, "API key is required"),
  storeUrl: z.string().url("Please enter a valid URL"),
  platform: z.string().min(1, "Platform is required"),
});

type EcommerceFormValues = z.infer<typeof ecommerceSchema>;

export default function ECommerce() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch existing integrations
  const { data: integrations = [], isLoading } = useQuery<any[]>({ 
    queryKey: ['/api/integrations'],
  });
  
  // Filter to only show e-commerce type integrations
  const ecommerceIntegrations = integrations.filter((integration: any) => 
    integration.type === 'ecommerce'
  );
  
  // Define the form
  const form = useForm<EcommerceFormValues>({
    resolver: zodResolver(ecommerceSchema),
    defaultValues: {
      provider: "",
      apiKey: "",
      storeUrl: "",
      platform: "",
    },
  });
  
  // Create mutation to add a new integration
  const addIntegrationMutation = useMutation({
    mutationFn: (data: EcommerceFormValues) => {
      return apiRequest('POST', '/api/integrations', {
        ...data,
        type: 'ecommerce',
        isActive: true,
        settings: { storeUrl: data.storeUrl, platform: data.platform }
      });
    },
    onSuccess: () => {
      toast({
        title: "E-commerce platform integrated",
        description: "Your e-commerce store has been successfully connected.",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to connect e-commerce platform. Please try again.",
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
        title: isActive ? "Store connected" : "Store disconnected",
        description: `Your e-commerce store is now ${isActive ? "connected" : "disconnected"}.`,
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
  function onSubmit(data: EcommerceFormValues) {
    addIntegrationMutation.mutate(data);
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }
  
  // Get color and icon for each e-commerce provider
  const getProviderData = (provider: string) => {
    const data: Record<string, { color: string, icon: string }> = {
      'Shopify': { color: 'text-accent-green', icon: 'SH' },
      'BigCommerce': { color: 'text-accent-blue', icon: 'BC' },
      'WooCommerce': { color: 'text-accent-purple', icon: 'WC' },
      'Magento': { color: 'text-accent-orange', icon: 'MG' },
      'Amazon': { color: 'text-accent-orange', icon: 'AZ' },
      'Wix': { color: 'text-text-primary', icon: 'WX' },
      'Squarespace': { color: 'text-text-primary', icon: 'SQ' },
    };
    
    return data[provider] || { color: 'text-accent-blue', icon: provider.substring(0, 2).toUpperCase() };
  };
  
  const { user } = useAuth();
  
  const Layout = user?.role === 'admin' ? AdminDashboardLayout : ClientDashboardLayout;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">E-Commerce Integration</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-accent-blue hover:bg-accent-blue/90">
                <PlusCircle className="h-4 w-4" />
                Connect Store
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-bg-card border-border-color">
              <DialogHeader>
                <DialogTitle>Connect E-Commerce Store</DialogTitle>
                <DialogDescription className="text-text-secondary">
                  Integrate your e-commerce platform to synchronize products, inventory, and orders.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., My Shopify Store" 
                            {...field}
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          Enter the name of your e-commerce store.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-bg-chart border-border-color">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-bg-card border-border-color">
                            <SelectItem value="shopify">Shopify</SelectItem>
                            <SelectItem value="bigcommerce">BigCommerce</SelectItem>
                            <SelectItem value="woocommerce">WooCommerce</SelectItem>
                            <SelectItem value="magento">Magento</SelectItem>
                            <SelectItem value="amazon">Amazon</SelectItem>
                            <SelectItem value="wix">Wix</SelectItem>
                            <SelectItem value="squarespace">Squarespace</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-text-secondary">
                          Select your e-commerce platform.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="storeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://your-store.myshopify.com" 
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          The URL of your e-commerce store.
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
                            placeholder="Enter API key or access token" 
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          The API key or access token for your store.
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
                          Connecting...
                        </>
                      ) : (
                        'Connect Store'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ecommerceIntegrations.length > 0 ? (
            ecommerceIntegrations.map((integration: any) => {
              const { color, icon } = getProviderData(integration.provider);
              return (
                <IntegrationCard
                  key={integration.id}
                  provider={integration.provider}
                  icon={icon}
                  color={color}
                  isActive={integration.isActive}
                  onToggle={(value) => toggleIntegrationStatus(integration.id, value)}
                  description={`Store URL: ${integration.settings?.storeUrl || 'N/A'}`}
                  secondaryInfo={`Platform: ${integration.settings?.platform || 'N/A'}`}
                />
              );
            })
          ) : (
            <div className="col-span-2 p-6 bg-bg-card border border-border-color rounded-xl text-center">
              <p className="text-text-secondary mb-4">No e-commerce stores connected yet.</p>
              <Button onClick={() => setIsDialogOpen(true)}>Connect Your First Store</Button>
            </div>
          )}
        </div>
        
        <DashboardCard title="Available E-Commerce Platforms">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Shopify', color: 'text-accent-green', icon: 'SH', description: 'Most popular e-commerce platform' },
              { name: 'BigCommerce', color: 'text-accent-blue', icon: 'BC', description: 'Enterprise-grade solution' },
              { name: 'WooCommerce', color: 'text-accent-purple', icon: 'WC', description: 'WordPress e-commerce plugin' },
              { name: 'Magento', color: 'text-accent-orange', icon: 'MG', description: 'Adobe Commerce solution' },
              { name: 'Amazon', color: 'text-accent-orange', icon: 'AZ', description: 'Marketplace integration' },
              { name: 'Wix', color: 'text-text-primary', icon: 'WX', description: 'Website builder with store' }
            ].map((platform) => (
              <div 
                key={platform.name}
                className="bg-bg-chart/50 border border-border-color rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <span className={`${platform.color} font-bold text-sm`}>{platform.icon}</span>
                  </div>
                  <div>
                    <span className="font-medium">{platform.name}</span>
                    <p className="text-xs text-text-secondary">{platform.description}</p>
                  </div>
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
              View all supported platforms
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Integration Benefits">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-bg-chart rounded-lg border border-border-color">
              <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center mb-3">
                <Globe className="h-5 w-5 text-accent-blue" />
              </div>
              <h3 className="text-lg font-medium mb-2">Centralized Inventory</h3>
              <p className="text-text-secondary text-sm">
                Manage inventory across all your sales channels from a single dashboard.
              </p>
            </div>
            
            <div className="p-4 bg-bg-chart rounded-lg border border-border-color">
              <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center mb-3">
                <ShoppingBag className="h-5 w-5 text-accent-green" />
              </div>
              <h3 className="text-lg font-medium mb-2">Order Synchronization</h3>
              <p className="text-text-secondary text-sm">
                Automatically sync orders from your e-commerce platform to SoZayn.
              </p>
            </div>
            
            <div className="p-4 bg-bg-chart rounded-lg border border-border-color">
              <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center mb-3">
                <Layers className="h-5 w-5 text-accent-purple" />
              </div>
              <h3 className="text-lg font-medium mb-2">Delivery Integration</h3>
              <p className="text-text-secondary text-sm">
                Connect your e-commerce orders with delivery partners seamlessly.
              </p>
            </div>
            
            <div className="p-4 bg-bg-chart rounded-lg border border-border-color">
              <div className="w-10 h-10 bg-accent-orange/20 rounded-lg flex items-center justify-center mb-3">
                <BarChart className="h-5 w-5 text-accent-orange" />
              </div>
              <h3 className="text-lg font-medium mb-2">Unified Analytics</h3>
              <p className="text-text-secondary text-sm">
                Get comprehensive reports across all your sales channels.
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </Layout>
  );
}
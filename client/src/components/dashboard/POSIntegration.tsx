import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { IntegrationCard } from '@/components/ui/integration-card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle,
  Loader2,
  CheckCircle,
  ArrowRight,
  Database,
  Layers,
  Link2,
  Settings
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// Form schema for adding a new POS integration
const posIntegrationSchema = z.object({
  provider: z.string().min(1, "Provider name is required"),
  apiKey: z.string().min(1, "API key is required"),
  storeId: z.string().min(1, "Store ID is required"),
});

type POSIntegrationFormValues = z.infer<typeof posIntegrationSchema>;

export default function POSIntegration() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const { toast } = useToast();
  
  // Fetch existing integrations
  const { data: integrations = [], isLoading } = useQuery({ 
    queryKey: ['/api/integrations'],
  });
  
  // Filter to only show POS type integrations
  const posIntegrations = integrations.filter((integration: any) => 
    integration.type === 'pos'
  );
  
  // Define the form
  const form = useForm<POSIntegrationFormValues>({
    resolver: zodResolver(posIntegrationSchema),
    defaultValues: {
      provider: "",
      apiKey: "",
      storeId: "",
    },
  });
  
  // Create mutation to add a new integration
  const addPOSIntegrationMutation = useMutation({
    mutationFn: (data: POSIntegrationFormValues) => {
      return apiRequest('POST', '/api/integrations', {
        ...data,
        type: 'pos',
        isActive: true,
        settings: {
          storeId: data.storeId
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "POS Integration added",
        description: "Your point of sale system has been integrated successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add POS integration. Please try again.",
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
        description: `The POS integration has been ${isActive ? "activated" : "deactivated"} successfully.`,
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
  function onSubmit(data: POSIntegrationFormValues) {
    addPOSIntegrationMutation.mutate(data);
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
      'Toast': 'text-accent-blue',
      'Square': 'text-accent-green',
      'Clover': 'text-accent-orange',
      'Lightspeed': 'text-text-primary',
      'TouchBistro': 'text-accent-purple',
    };
    
    return colors[provider] || 'text-accent-yellow';
  };
  
  // Get icon letters for each provider
  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      'Toast': 'TS',
      'Square': 'SQ',
      'Clover': 'CL',
      'Lightspeed': 'LS',
      'TouchBistro': 'TB',
    };
    
    return icons[provider] || provider.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">POS Integration</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent-blue hover:bg-accent-blue/90">
              <PlusCircle className="h-4 w-4" />
              Add POS System
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-bg-card border-border-color">
            <DialogHeader>
              <DialogTitle>Connect POS System</DialogTitle>
              <DialogDescription className="text-text-secondary">
                Connect your point of sale system to automatically sync orders.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>POS Provider</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-bg-chart border-border-color">
                            <SelectValue placeholder="Select POS provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-bg-card border-border-color">
                          <SelectItem value="Toast">Toast</SelectItem>
                          <SelectItem value="Square">Square</SelectItem>
                          <SelectItem value="Clover">Clover</SelectItem>
                          <SelectItem value="Lightspeed">Lightspeed</SelectItem>
                          <SelectItem value="TouchBistro">TouchBistro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-text-secondary">
                        Select your point of sale system provider.
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
                        The API key from your POS system settings.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter Store ID" 
                          {...field} 
                          className="bg-bg-chart border-border-color" 
                        />
                      </FormControl>
                      <FormDescription className="text-text-secondary">
                        Your unique store identifier from your POS account.
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
                    disabled={addPOSIntegrationMutation.isPending}
                  >
                    {addPOSIntegrationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect POS'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <DashboardCard className="h-full">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto bg-accent-blue/20 rounded-full flex items-center justify-center mb-4">
                <Layers className="h-8 w-8 text-accent-blue" />
              </div>
              <h2 className="text-xl font-bold mb-2">POS Order Injection</h2>
              <p className="text-text-secondary mb-6">
                Connect your POS system to automatically receive and process online orders without manual entry.
              </p>
              
              <div className="flex flex-col space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">System connected</span>
                  {posIntegrations.length > 0 ? (
                    <CheckCircle className="h-5 w-5 text-accent-green" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-accent-blue" />
                  )}
                </div>
                <Progress value={posIntegrations.length > 0 ? 100 : 0} className="h-1.5 bg-bg-chart" />
              </div>
              
              {posIntegrations.length === 0 && (
                <Button 
                  className="w-full bg-accent-blue hover:bg-accent-blue/90"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Connect Your POS
                </Button>
              )}
            </div>
          </DashboardCard>
        </div>
        
        <div className="w-full md:w-2/3">
          <DashboardCard title="Your POS Systems">
            <div className="grid grid-cols-1 gap-4">
              {posIntegrations.length > 0 ? (
                posIntegrations.map((integration: any) => (
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
                <div className="p-6 bg-bg-chart/50 border border-border-color rounded-xl text-center">
                  <p className="text-text-secondary mb-4">No POS systems connected yet.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>Add Your First POS System</Button>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
      
      <DashboardCard title="How POS Integration Works">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-accent-blue/20 rounded-full flex items-center justify-center mb-4">
              <Link2 className="h-8 w-8 text-accent-blue" />
            </div>
            <h3 className="font-medium mb-2">1. Connect</h3>
            <p className="text-text-secondary text-sm">
              Link your existing POS system using API credentials.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-accent-green/20 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-8 w-8 text-accent-green" />
            </div>
            <h3 className="font-medium mb-2">2. Configure</h3>
            <p className="text-text-secondary text-sm">
              Set up menu mapping between online orders and POS items.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-accent-purple/20 rounded-full flex items-center justify-center mb-4">
              <Database className="h-8 w-8 text-accent-purple" />
            </div>
            <h3 className="font-medium mb-2">3. Synchronize</h3>
            <p className="text-text-secondary text-sm">
              We automatically sync your menu, inventory, and prices.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-accent-orange/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-accent-orange" />
            </div>
            <h3 className="font-medium mb-2">4. Process</h3>
            <p className="text-text-secondary text-sm">
              Online orders are automatically sent to your POS system.
            </p>
          </div>
        </div>
      </DashboardCard>
      
      <DashboardCard title="Available POS Systems">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Toast', color: 'text-accent-blue', icon: 'TS' },
            { name: 'Square', color: 'text-accent-green', icon: 'SQ' },
            { name: 'Clover', color: 'text-accent-orange', icon: 'CL' },
            { name: 'Lightspeed', color: 'text-text-primary', icon: 'LS' },
            { name: 'TouchBistro', color: 'text-accent-purple', icon: 'TB' },
            { name: 'Revel', color: 'text-accent-yellow', icon: 'RV' }
          ].map((pos) => (
            <div 
              key={pos.name}
              className="bg-bg-chart/50 border border-border-color rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <span className={`${pos.color} font-bold text-sm`}>{pos.icon}</span>
                </div>
                <span className="font-medium">{pos.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  form.setValue('provider', pos.name);
                  setIsDialogOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}

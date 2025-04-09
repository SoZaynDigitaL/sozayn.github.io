import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ArrowUpRight,
  CheckCircle2,
  Clipboard,
  HelpCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form schema for UberDirect configuration
const uberDirectSchema = z.object({
  environment: z.enum(["sandbox", "live"]),
  customerId: z.string().min(1, "Customer ID is required"),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  isActive: z.boolean().default(false),
  description: z.string().optional(),
});

type UberDirectFormValues = z.infer<typeof uberDirectSchema>;

interface UberDirectProps {
  integration?: any;
  isSubmitting?: boolean;
  onUpdate?: (id: number, data: any) => void;
  onToggleActive?: (id: number, isActive: boolean) => void;
  onTest?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function UberDirect({
  integration,
  isSubmitting = false,
  onUpdate,
  onToggleActive,
  onTest,
  onDelete,
}: UberDirectProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const hasIntegration = integration && Object.keys(integration).length > 0;
  
  // Initialize form
  const form = useForm<UberDirectFormValues>({
    resolver: zodResolver(uberDirectSchema),
    defaultValues: {
      environment: (integration?.environment as "sandbox" | "live") || "sandbox",
      customerId: integration?.customerId || "",
      clientId: integration?.clientId || "",
      clientSecret: integration?.clientSecret || "",
      isActive: integration?.isActive || false,
      description: integration?.description || "",
    },
  });
  
  // Create UberDirect integration
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: UberDirectFormValues) => {
      const response = await apiRequest('POST', '/api/integrations', {
        provider: 'UberDirect',
        type: 'delivery',
        environment: data.environment,
        customerId: data.customerId,
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        isActive: data.isActive,
        description: data.description || 'UberDirect delivery integration',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create UberDirect integration');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration created",
        description: "UberDirect integration has been created successfully.",
      });
      
      // Invalidate the query cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create UberDirect integration",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(data: UberDirectFormValues) {
    if (hasIntegration && onUpdate) {
      onUpdate(integration.id, data);
    } else {
      createIntegrationMutation.mutate(data);
    }
  }
  
  // Helper to copy text to clipboard
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: message,
    });
  };
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-700 font-bold h-10 w-10 rounded flex items-center justify-center">
                UE
              </div>
              <div>
                <CardTitle>UberDirect</CardTitle>
                <CardDescription>On-demand delivery service by Uber</CardDescription>
              </div>
            </div>
            
            {hasIntegration && (
              <Badge variant={integration.isActive ? "default" : "outline"}>
                {integration.isActive ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasIntegration ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Environment</p>
                  <p className="text-sm font-semibold">
                    {integration.environment === 'live' ? 'Live' : 'Sandbox'} 
                    {integration.environment === 'sandbox' && (
                      <span className="ml-1 text-xs text-yellow-600">(Testing)</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={integration.isActive}
                      onCheckedChange={(checked) => {
                        if (onToggleActive) onToggleActive(integration.id, checked);
                      }}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm font-semibold">{integration.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">API Credentials</p>
                <div className="bg-muted rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Customer ID</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-mono bg-background px-2 py-1 rounded">
                        {integration.customerId ? '••••••••••' : 'Not set'}
                      </span>
                      {integration.customerId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(integration.customerId, "Customer ID copied to clipboard")}
                        >
                          <Clipboard className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Client ID</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-mono bg-background px-2 py-1 rounded">
                        {integration.clientId ? '••••••••••' : 'Not set'}
                      </span>
                      {integration.clientId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(integration.clientId, "Client ID copied to clipboard")}
                        >
                          <Clipboard className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Client Secret</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-mono bg-background px-2 py-1 rounded">
                        {integration.clientSecret ? '••••••••••••••' : 'Not set'}
                      </span>
                      {integration.clientSecret && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(integration.clientSecret, "Client Secret copied to clipboard")}
                        >
                          <Clipboard className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <div className="rounded-full bg-blue-200 p-3">
                  <div className="text-blue-700 font-bold h-10 w-10 rounded-full flex items-center justify-center">
                    UE
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold">Set up UberDirect</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs">
                Connect with UberDirect to offer on-demand delivery through Uber's delivery network.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4 px-6">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <a 
              href="https://developer.uber.com/docs/deliveries" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:text-foreground"
            >
              Documentation <ArrowUpRight className="h-3 w-3 ml-1" />
            </a>
          </div>
          
          <div className="flex space-x-2">
            {hasIntegration ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onTest && onTest(integration.id)}
                  disabled={isSubmitting}
                >
                  Test
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsDialogOpen(true)}
              >
                Configure
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* UberDirect Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{hasIntegration ? "Edit UberDirect Integration" : "Configure UberDirect"}</DialogTitle>
            <DialogDescription>
              {hasIntegration 
                ? "Update your UberDirect delivery integration settings."
                : "Connect to UberDirect to offer on-demand delivery services."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                          <SelectItem value="live">Live (Production)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Use Sandbox for testing before going live.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Customer ID
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Developer ID provided by UberDirect</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer ID" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Client ID
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">API key provided by UberDirect</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client ID" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Client Secret
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Secret key for authentication</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter client secret" 
                          type="password"
                          {...field} 
                          disabled={isSubmitting} 
                        />
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Optional description for this integration" 
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {hasIntegration && (
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Activate Integration</FormLabel>
                          <FormDescription>
                            Enable this integration to start processing deliveries.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <Alert>
                <AlertTitle className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Get Your API Keys
                </AlertTitle>
                <AlertDescription>
                  <p className="text-sm">
                    To get your UberDirect API keys, you need to register as a developer at{" "}
                    <a 
                      href="https://developer.uber.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      developer.uber.com
                    </a>
                  </p>
                </AlertDescription>
              </Alert>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {hasIntegration ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    hasIntegration ? 'Update Integration' : 'Create Integration'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
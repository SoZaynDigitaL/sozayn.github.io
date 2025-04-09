import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ArrowUpRight,
  Clipboard,
  HelpCircle,
  Loader2,
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

// Form schema for JetGo configuration
const jetGoSchema = z.object({
  environment: z.enum(["sandbox", "live"]),
  apiKey: z.string().min(1, "API Key is required"),
  merchantId: z.string().min(1, "Merchant ID is required"),
  webhookSecret: z.string().min(1, "Webhook Secret is required"),
  isActive: z.boolean().default(false),
  description: z.string().optional(),
});

type JetGoFormValues = z.infer<typeof jetGoSchema>;

interface JetGoProps {
  integration?: any;
  isSubmitting?: boolean;
  onUpdate?: (id: number, data: any) => void;
  onToggleActive?: (id: number, isActive: boolean) => void;
  onTest?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function JetGo({
  integration,
  isSubmitting = false,
  onUpdate,
  onToggleActive,
  onTest,
  onDelete,
}: JetGoProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const hasIntegration = integration && Object.keys(integration).length > 0;
  
  // Initialize form
  const form = useForm<JetGoFormValues>({
    resolver: zodResolver(jetGoSchema),
    defaultValues: {
      environment: (integration?.environment as "sandbox" | "live") || "sandbox",
      apiKey: integration?.apiKey || "",
      merchantId: integration?.merchantId || "",
      webhookSecret: integration?.webhookSecret || "",
      isActive: integration?.isActive || false,
      description: integration?.description || "",
    },
  });
  
  // Create JetGo integration
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: JetGoFormValues) => {
      const response = await apiRequest('POST', '/api/integrations', {
        provider: 'JetGo',
        type: 'delivery',
        environment: data.environment,
        apiKey: data.apiKey,
        merchantId: data.merchantId,
        webhookSecret: data.webhookSecret,
        isActive: data.isActive,
        description: data.description || 'JetGo delivery integration',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create JetGo integration');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration created",
        description: "JetGo integration has been created successfully.",
      });
      
      // Invalidate the query cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create JetGo integration",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(data: JetGoFormValues) {
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
              <div className="bg-purple-100 text-purple-700 font-bold h-10 w-10 rounded flex items-center justify-center">
                JG
              </div>
              <div>
                <CardTitle>Jet GO</CardTitle>
                <CardDescription>Fast, reliable local delivery service</CardDescription>
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
                    <span className="text-xs text-muted-foreground">API Key</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-mono bg-background px-2 py-1 rounded">
                        {integration.apiKey ? '••••••••••' : 'Not set'}
                      </span>
                      {integration.apiKey && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(integration.apiKey, "API Key copied to clipboard")}
                        >
                          <Clipboard className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Merchant ID</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-mono bg-background px-2 py-1 rounded">
                        {integration.merchantId ? '••••••••••' : 'Not set'}
                      </span>
                      {integration.merchantId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(integration.merchantId, "Merchant ID copied to clipboard")}
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
              <div className="rounded-full bg-purple-100 p-3 mb-4">
                <div className="rounded-full bg-purple-200 p-3">
                  <div className="text-purple-700 font-bold h-10 w-10 rounded-full flex items-center justify-center">
                    JG
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold">Set up Jet GO</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs">
                Connect with Jet GO to offer fast, reliable local delivery to your customers.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4 px-6">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <a 
              href="https://jetgo-delivery.com/docs" 
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
      
      {/* JetGo Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{hasIntegration ? "Edit Jet GO Integration" : "Configure Jet GO"}</DialogTitle>
            <DialogDescription>
              {hasIntegration 
                ? "Update your Jet GO delivery integration settings."
                : "Connect to Jet GO to offer local delivery services."}
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
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        API Key
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">API key provided by Jet GO</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter API key" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="merchantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Merchant ID
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Your unique merchant identifier</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter merchant ID" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="webhookSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Webhook Secret
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Secret key for webhook authentication</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter webhook secret" 
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
                    To get your Jet GO API keys, contact their support team at{" "}
                    <a 
                      href="mailto:api@jetgo-delivery.com" 
                      className="text-blue-500 hover:underline"
                    >
                      api@jetgo-delivery.com
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
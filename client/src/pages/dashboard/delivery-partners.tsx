import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form validation schema
const integrationFormSchema = z.object({
  provider: z.string(),
  type: z.string(),
  environment: z.string(),
  customerId: z.string().min(1, "Customer ID is required"),
  clientId: z.string().min(1, "Client ID is required"),  
  clientSecret: z.string().min(1, "Client Secret is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(false),
});

type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

export default function DeliveryPartners() {
  const { toast } = useToast();
  const { user, hasRequiredPlan } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<any | null>(null);

  // Fetch delivery integrations
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/integrations');
        const data = await response.json();
        // Filter to only show delivery integrations
        return data.filter((integration: any) => integration.type === 'delivery');
      } catch (error) {
        console.error('Error fetching integrations:', error);
        return [];
      }
    }
  });

  // Form definition
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      provider: 'UberDirect',
      type: 'delivery',
      environment: 'sandbox',
      customerId: '',
      clientId: '',
      clientSecret: '',
      description: '',
      isActive: false,
    },
  });

  // Create mutation for adding a new integration
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: IntegrationFormValues) => {
      const response = await apiRequest('POST', '/api/integrations', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create integration');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration created",
        description: "Your delivery partner integration has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation for editing an integration
  const updateIntegrationMutation = useMutation({
    mutationFn: async (data: IntegrationFormValues & { id: number }) => {
      const { id, ...integrationData } = data;
      const response = await apiRequest('PUT', `/api/integrations/${id}`, integrationData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update integration');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration updated",
        description: "Your delivery partner integration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setDialogOpen(false);
      setEditingIntegration(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation for removing an integration
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/integrations/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete integration');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration deleted",
        description: "The delivery partner integration has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/integrations/${id}/toggle-active`, { isActive });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update integration status');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The integration status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/integrations/${id}/test`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test integration');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Integration tested",
        description: data.message || "The integration test was successful.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(data: IntegrationFormValues) {
    if (editingIntegration) {
      updateIntegrationMutation.mutate({ ...data, id: editingIntegration.id });
    } else {
      createIntegrationMutation.mutate(data);
    }
  }

  // Open dialog for editing an integration
  function handleEditIntegration(integration: any) {
    setEditingIntegration(integration);
    form.reset({
      provider: integration.provider,
      type: integration.type,
      environment: integration.environment,
      customerId: integration.customerId,
      clientId: integration.clientId,
      clientSecret: integration.clientSecret,
      description: integration.description || '',
      isActive: integration.isActive,
    });
    setDialogOpen(true);
  }

  // Open dialog for adding a new integration
  function handleAddIntegration() {
    setEditingIntegration(null);
    form.reset({
      provider: 'UberDirect',
      type: 'delivery',
      environment: 'sandbox',
      customerId: '',
      clientId: '',
      clientSecret: '',
      description: '',
      isActive: false,
    });
    setDialogOpen(true);
  }

  // Check if user has required plan
  const canAddIntegration = hasRequiredPlan(['Growth', 'Pro']);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Partners</h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage your delivery partner integrations
          </p>
        </div>
        {!isLoading && canAddIntegration && (
          <Button onClick={handleAddIntegration}>
            <Plus className="mr-2 h-4 w-4" /> Add Integration
          </Button>
        )}
      </div>

      {/* Plan restriction warning */}
      {!canAddIntegration && (
        <Alert variant="destructive">
          <AlertTitle>Upgrade your plan</AlertTitle>
          <AlertDescription>
            Delivery integrations are available on the Growth and Pro plans. 
            <Button variant="link" className="p-0 ml-2 text-blue-500" onClick={() => window.location.href = '/manage-subscription'}>
              Upgrade now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="uberdirect">UberDirect</TabsTrigger>
          <TabsTrigger value="doordash" disabled>DoorDash Drive</TabsTrigger>
          <TabsTrigger value="grubhub" disabled>Grubhub</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : integrations && integrations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Partner Integrations</CardTitle>
                <CardDescription>
                  Manage your configured delivery service connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration: any) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">{integration.provider}</TableCell>
                        <TableCell>
                          <Badge variant={integration.environment === 'live' ? 'default' : 'outline'}>
                            {integration.environment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={integration.isActive}
                              onCheckedChange={(checked) => 
                                toggleActiveMutation.mutate({ id: integration.id, isActive: checked })
                              }
                              disabled={toggleActiveMutation.isPending}
                            />
                            <span>{integration.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{integration.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditIntegration(integration)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => testIntegrationMutation.mutate(integration.id)}
                              disabled={testIntegrationMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" /> Test
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                              disabled={deleteIntegrationMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Integrations Found</CardTitle>
                <CardDescription>
                  You don't have any delivery partner integrations set up yet
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                {canAddIntegration ? (
                  <div>
                    <p className="mb-4 text-muted-foreground">
                      Add your first delivery partner integration to start offering delivery services
                    </p>
                    <Button onClick={handleAddIntegration}>
                      <Plus className="mr-2 h-4 w-4" /> Add Integration
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-4 text-muted-foreground">
                      Upgrade your plan to access delivery partner integrations
                    </p>
                    <Button onClick={() => window.location.href = '/manage-subscription'}>
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="uberdirect" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>UberDirect Integration</CardTitle>
                  <CardDescription>
                    Connect with UberDirect's on-demand delivery network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {integrations?.filter((i: any) => i.provider === 'UberDirect').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Environment</TableHead>
                          <TableHead>Customer ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {integrations
                          .filter((i: any) => i.provider === 'UberDirect')
                          .map((integration: any) => (
                            <TableRow key={integration.id}>
                              <TableCell>
                                <Badge variant={integration.environment === 'live' ? 'default' : 'outline'}>
                                  {integration.environment}
                                </Badge>
                              </TableCell>
                              <TableCell>{integration.customerId}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={integration.isActive}
                                    onCheckedChange={(checked) => 
                                      toggleActiveMutation.mutate({ id: integration.id, isActive: checked })
                                    }
                                    disabled={toggleActiveMutation.isPending}
                                  />
                                  <span>{integration.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEditIntegration(integration)}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.location.href = '/dashboard/test-order'}
                                  >
                                    Test Order
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                                    disabled={deleteIntegrationMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6">
                      <p className="mb-4 text-muted-foreground">No UberDirect integrations found</p>
                      {canAddIntegration && (
                        <Button onClick={handleAddIntegration}>
                          <Plus className="mr-2 h-4 w-4" /> Add UberDirect
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50 flex flex-col items-start">
                  <h3 className="text-sm font-semibold mb-2">About UberDirect</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    UberDirect offers same-day delivery services for your business through their extensive driver network.
                  </p>
                  <Button variant="link" className="p-0 text-blue-500" asChild>
                    <a href="https://www.uber.com/business/direct" target="_blank" rel="noopener noreferrer">
                      Learn more <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              {/* UberDirect Documentation Card */}
              <Card>
                <CardHeader>
                  <CardTitle>UberDirect Integration Guide</CardTitle>
                  <CardDescription>
                    How to set up your UberDirect integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>An active UberDirect account</li>
                        <li>Developer credentials from the UberDirect Developer Portal</li>
                        <li>Customer ID (Developer ID in the UberDirect portal)</li>
                        <li>Client ID (Key ID in the UberDirect portal)</li>
                        <li>Client Secret (Signing Secret in the UberDirect portal)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Setup Instructions</h3>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Sign up for an UberDirect account at <a href="https://www.uber.com/business/direct" className="text-blue-500" target="_blank" rel="noopener noreferrer">uber.com/business/direct</a></li>
                        <li>Access the UberDirect Developer Portal and create an application</li>
                        <li>Copy your Developer ID, Key ID, and Signing Secret</li>
                        <li>Add a new UberDirect integration using these credentials</li>
                        <li>Test your integration using the "Test" button or create a test order</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="doordash" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>DoorDash Drive Coming Soon</CardTitle>
              <CardDescription>
                DoorDash Drive integration will be available in a future update
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                We're working on integrating DoorDash Drive's delivery services. Stay tuned!
              </p>
              <Button variant="outline" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grubhub" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Grubhub Coming Soon</CardTitle>
              <CardDescription>
                Grubhub integration will be available in a future update
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                We're working on integrating Grubhub's delivery services. Stay tuned!
              </p>
              <Button variant="outline" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingIntegration ? 'Edit Integration' : 'Add Integration'}</DialogTitle>
            <DialogDescription>
              {editingIntegration
                ? 'Update your delivery partner integration settings'
                : 'Connect to a delivery service to offer delivery to your customers'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select
                        disabled={true}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UberDirect">UberDirect</SelectItem>
                          <SelectItem value="DoorDashDrive" disabled>DoorDash Drive</SelectItem>
                          <SelectItem value="Grubhub" disabled>Grubhub</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                        Use Sandbox for testing, Live for actual deliveries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer ID (Developer ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your UberDirect Developer ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your Developer ID from the UberDirect portal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID (Key ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your UberDirect Key ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your Key ID from the UberDirect portal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret (Signing Secret)</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your UberDirect Signing Secret"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is your Signing Secret from the UberDirect portal
                      </FormDescription>
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
                        <Input placeholder="Enter a description for this integration" {...field} />
                      </FormControl>
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
                        <FormLabel className="text-base">
                          Active
                        </FormLabel>
                        <FormDescription>
                          Activate this integration for use with your orders
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
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createIntegrationMutation.isPending || updateIntegrationMutation.isPending}
                >
                  {(createIntegrationMutation.isPending || updateIntegrationMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingIntegration ? 'Update' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, RefreshCw } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Define schemas for the delivery form
const deliveryFormSchema = z.object({
  integrationId: z.string(),
  pickupName: z.string().min(2, { message: "Name must have at least 2 characters" }),
  pickupAddress: z.string().min(5, { message: "Address must have at least 5 characters" }),
  pickupPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  pickupInstructions: z.string().optional(),
  dropoffName: z.string().min(2, { message: "Name must have at least 2 characters" }),
  dropoffAddress: z.string().min(5, { message: "Address must have at least 5 characters" }),
  dropoffPhone: z.string().min(10, { message: "Please enter a valid phone number" }),
  dropoffInstructions: z.string().optional(),
  orderValue: z.string().transform(val => Number(val)),
  itemName: z.string().min(2, { message: "Item name must have at least 2 characters" }),
  itemQuantity: z.string().transform(val => Number(val)),
  itemPrice: z.string().transform(val => Number(val)),
});

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>;

export default function TestDelivery() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("form");
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [quote, setQuote] = useState<any | null>(null);
  const [delivery, setDelivery] = useState<any | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<any | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<number | null>(null);

  // Fetch integrations
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/integrations');
        const data = await response.json();
        // Filter to only show active delivery integrations
        return data.filter((integration: any) => 
          integration.type === 'delivery' && 
          integration.isActive && 
          integration.provider === 'UberDirect'
        );
      } catch (error) {
        console.error('Error fetching integrations:', error);
        return [];
      }
    }
  });

  // Define the form
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      integrationId: '',
      pickupName: 'SoZayn Test Restaurant',
      pickupAddress: '123 Main St, New York, NY 10001',
      pickupPhone: '1234567890',
      pickupInstructions: 'Please ring the bell',
      dropoffName: 'John Doe',
      dropoffAddress: '456 Elm St, New York, NY 10002',
      dropoffPhone: '0987654321',
      dropoffInstructions: 'Leave at door',
      orderValue: '25.99',
      itemName: 'Pizza',
      itemQuantity: '1',
      itemPrice: '19.99',
    },
  });

  // Create mutation for getting a delivery quote
  const quoteDeliveryMutation = useMutation({
    mutationFn: async (data: DeliveryFormValues) => {
      const response = await apiRequest('POST', '/api/delivery/quote', {
        integrationId: Number(data.integrationId),
        pickup: {
          name: data.pickupName,
          address: data.pickupAddress,
          phoneNumber: data.pickupPhone,
          instructions: data.pickupInstructions,
          latitude: 40.7128, // Hardcoded for demo
          longitude: -74.0060, // Hardcoded for demo
        },
        dropoff: {
          name: data.dropoffName,
          address: data.dropoffAddress,
          phoneNumber: data.dropoffPhone,
          instructions: data.dropoffInstructions,
          latitude: 40.7138, // Hardcoded for demo
          longitude: -74.0070, // Hardcoded for demo
        },
        items: [
          {
            name: data.itemName,
            quantity: Number(data.itemQuantity), 
            price: Number(data.itemPrice),
          }
        ],
        orderValue: Number(data.orderValue),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get delivery quote');
      }

      return await response.json();
    },
    onSuccess: (data: any) => {
      setQuote(data);
      setQuoteId(data.id);
      toast({
        title: "Quote obtained",
        description: `Delivery quote: $${data.fee.toFixed(2)} - ETA: ${data.eta} minutes`,
      });
      setActiveTab("quote");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get delivery quote",
        variant: "destructive",
      });
    }
  });

  // Create mutation for creating a delivery
  const createDeliveryMutation = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();
      const response = await apiRequest('POST', '/api/delivery/create', {
        integrationId: Number(formData.integrationId),
        quoteId: quoteId,
        pickup: {
          name: formData.pickupName,
          address: formData.pickupAddress,
          phoneNumber: formData.pickupPhone,
          instructions: formData.pickupInstructions,
          latitude: 40.7128, // Hardcoded for demo
          longitude: -74.0060, // Hardcoded for demo
        },
        dropoff: {
          name: formData.dropoffName,
          address: formData.dropoffAddress,
          phoneNumber: formData.dropoffPhone,
          instructions: formData.dropoffInstructions,
          latitude: 40.7138, // Hardcoded for demo
          longitude: -74.0070, // Hardcoded for demo
        },
        items: [
          {
            name: formData.itemName,
            quantity: Number(formData.itemQuantity),
            price: Number(formData.itemPrice),
          }
        ],
        orderValue: Number(formData.orderValue),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create delivery');
      }

      return await response.json();
    },
    onSuccess: (data: any) => {
      setDelivery(data);
      setDeliveryId(data.id);
      toast({
        title: "Delivery created",
        description: `Delivery #${data.id} has been created successfully`,
      });
      setActiveTab("delivery");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery",
        variant: "destructive",
      });
    }
  });

  // Create mutation for checking delivery status
  const checkDeliveryStatusMutation = useMutation({
    mutationFn: async () => {
      if (!deliveryId || !selectedIntegration) {
        throw new Error("Delivery ID or integration ID is missing");
      }
      
      const response = await apiRequest('GET', `/api/delivery/${deliveryId}/status?integrationId=${selectedIntegration}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check delivery status');
      }

      return await response.json();
    },
    onSuccess: (data: any) => {
      setDeliveryStatus(data);
      toast({
        title: "Status updated",
        description: `Delivery status: ${data.status}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check delivery status",
        variant: "destructive",
      });
    }
  });

  // Create mutation for canceling a delivery
  const cancelDeliveryMutation = useMutation({
    mutationFn: async () => {
      if (!deliveryId || !selectedIntegration) {
        throw new Error("Delivery ID or integration ID is missing");
      }
      
      const response = await apiRequest('POST', `/api/delivery/${deliveryId}/cancel`, {
        integrationId: selectedIntegration
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel delivery');
      }

      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Delivery canceled",
        description: "The delivery has been canceled successfully",
      });
      // Update the delivery status after cancellation
      checkDeliveryStatusMutation.mutate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel delivery",
        variant: "destructive",
      });
    }
  });

  // Submit handler for the quote form
  function onSubmit(data: DeliveryFormValues) {
    setSelectedIntegration(Number(data.integrationId));
    quoteDeliveryMutation.mutate(data);
  }

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Render the status badge based on the status string
  const renderStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'processing': 'bg-blue-500',
      'picking_up': 'bg-yellow-500',
      'picked_up': 'bg-purple-500',
      'delivering': 'bg-orange-500',
      'delivered': 'bg-green-500',
      'canceled': 'bg-red-500',
    };

    const color = statusColors[status] || 'bg-gray-500';

    return (
      <Badge className={`${color} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoadingIntegrations) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  if (!integrations || integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Delivery</CardTitle>
          <CardDescription>
            Test your delivery partner integrations by creating a real delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No active UberDirect integration found</h3>
            <p className="text-muted-foreground mb-4">
              Please configure and activate a UberDirect integration first.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/delivery-partners'}>
              Go to Delivery Partners
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Test Delivery</CardTitle>
        <CardDescription>
          Test your UberDirect integration by creating a real delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="form">Delivery Form</TabsTrigger>
            <TabsTrigger value="quote" disabled={!quote}>
              Quote {quote && <span className="ml-1 text-xs">({formatCurrency(quote.fee)})</span>}
            </TabsTrigger>
            <TabsTrigger value="delivery" disabled={!delivery}>
              Delivery {deliveryStatus && <span className="ml-1 text-xs">({deliveryStatus.status})</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="integrationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Partner</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a delivery partner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {integrations.map((integration: any) => (
                              <SelectItem key={integration.id} value={integration.id.toString()}>
                                {integration.provider} ({integration.environment})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select an active UberDirect integration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Pickup Details</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="pickupName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Restaurant name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickupAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Full address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickupPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickupInstructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Special instructions" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Dropoff Details</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="dropoffName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Customer name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dropoffAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Full address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dropoffPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dropoffInstructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Special instructions" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="itemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Item name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="itemQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input placeholder="Quantity" {...field} type="number" min="1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="itemPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input placeholder="Price" {...field} type="number" step="0.01" min="0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="orderValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Order Value</FormLabel>
                            <FormControl>
                              <Input placeholder="Order value" {...field} type="number" step="0.01" min="0" />
                            </FormControl>
                            <FormDescription>
                              Total value of the order including tax, but excluding delivery fee
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    type="submit"
                    disabled={quoteDeliveryMutation.isPending}
                  >
                    {quoteDeliveryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting Quote...
                      </>
                    ) : (
                      'Get Delivery Quote'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="quote">
            {quote && (
              <div className="space-y-6">
                <div className="bg-accent/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Delivery Quote</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Quote ID</dt>
                      <dd className="mt-1 text-sm">{quote.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Delivery Fee</dt>
                      <dd className="mt-1 text-xl font-bold">{formatCurrency(quote.fee)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Estimated Time</dt>
                      <dd className="mt-1 text-sm">{quote.eta} minutes</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Quote Expires</dt>
                      <dd className="mt-1 text-sm">{formatDate(quote.expires_at)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("form")}>
                    Back to Form
                  </Button>
                  <Button 
                    onClick={() => createDeliveryMutation.mutate()}
                    disabled={createDeliveryMutation.isPending}
                  >
                    {createDeliveryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Delivery...
                      </>
                    ) : (
                      'Create Delivery'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivery">
            {delivery && (
              <div className="space-y-6">
                <div className="bg-accent/20 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Delivery Details</h3>
                    {deliveryStatus && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        {renderStatusBadge(deliveryStatus.status)}
                      </div>
                    )}
                  </div>
                  
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Delivery ID</dt>
                      <dd className="mt-1 text-sm">{delivery.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                      <dd className="mt-1 text-sm">{formatDate(delivery.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Delivery Fee</dt>
                      <dd className="mt-1 text-xl font-bold">{formatCurrency(delivery.fee)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Currency</dt>
                      <dd className="mt-1 text-sm">{delivery.currency}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Pickup ETA</dt>
                      <dd className="mt-1 text-sm">{formatDate(delivery.pickup_eta)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Dropoff ETA</dt>
                      <dd className="mt-1 text-sm">{formatDate(delivery.dropoff_eta)}</dd>
                    </div>
                    {deliveryStatus && (
                      <div className="col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground">Tracking URL</dt>
                        <dd className="mt-1 text-sm">
                          <a 
                            href={deliveryStatus.tracking_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {deliveryStatus.tracking_url}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => checkDeliveryStatusMutation.mutate()}
                      disabled={checkDeliveryStatusMutation.isPending}
                    >
                      {checkDeliveryStatusMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Status
                        </>
                      )}
                    </Button>
                    {deliveryStatus && deliveryStatus.status !== 'canceled' && (
                      <Button
                        variant="destructive"
                        onClick={() => cancelDeliveryMutation.mutate()}
                        disabled={cancelDeliveryMutation.isPending}
                      >
                        {cancelDeliveryMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          'Cancel Delivery'
                        )}
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab("form")}>
                    Create Another Delivery
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
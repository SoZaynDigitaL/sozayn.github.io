import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
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
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  Check, 
  Clock, 
  ExternalLink, 
  Loader2, 
  MapPin, 
  Package, 
  TruckIcon, 
  X 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DELIVERY_PARTNERS } from "@/lib/constants";

// Form schema for test delivery
const testDeliverySchema = z.object({
  deliveryPartner: z.string().min(1, "Please select a delivery partner"),
  
  // Pickup location
  pickupName: z.string().min(1, "Name is required"),
  pickupAddress: z.string().min(5, "Full address is required"),
  pickupCity: z.string().min(1, "City is required"),
  pickupState: z.string().min(1, "State is required"),
  pickupZip: z.string().min(4, "ZIP code is required"),
  pickupPhone: z.string().min(10, "Valid phone number is required"),
  pickupInstructions: z.string().optional(),
  
  // Dropoff location
  dropoffName: z.string().min(1, "Name is required"),
  dropoffAddress: z.string().min(5, "Full address is required"),
  dropoffCity: z.string().min(1, "City is required"),
  dropoffState: z.string().min(1, "State is required"),
  dropoffZip: z.string().min(4, "ZIP code is required"),
  dropoffPhone: z.string().min(10, "Valid phone number is required"),
  dropoffInstructions: z.string().optional(),
  
  // Order details
  orderValue: z.string().min(1, "Order value is required"),
  orderItems: z.string().min(1, "At least one item is required"),
  orderNotes: z.string().optional(),
});

type TestDeliveryValues = z.infer<typeof testDeliverySchema>;

type DeliveryStatus = {
  status: 'idle' | 'fetching_quote' | 'quoting' | 'quoted' | 'creating' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  quote?: {
    id: string;
    fee: number;
    eta: number;
    currency: string;
    expiresAt: string;
  };
  delivery?: {
    id: string;
    status: string;
    trackingUrl: string;
    fee: number;
    currency: string;
    createdAt: string;
    pickupEta: string;
    dropoffEta: string;
  }
};

export default function TestDelivery() {
  const { toast } = useToast();
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>({ 
    status: 'idle' 
  });
  
  // Initialize form
  const form = useForm<TestDeliveryValues>({
    resolver: zodResolver(testDeliverySchema),
    defaultValues: {
      deliveryPartner: "",
      pickupName: "",
      pickupAddress: "",
      pickupCity: "",
      pickupState: "",
      pickupZip: "",
      pickupPhone: "",
      pickupInstructions: "",
      dropoffName: "",
      dropoffAddress: "",
      dropoffCity: "",
      dropoffState: "",
      dropoffZip: "",
      dropoffPhone: "",
      dropoffInstructions: "",
      orderValue: "",
      orderItems: "",
      orderNotes: "",
    },
  });
  
  // Form submission handler
  async function onSubmit(data: TestDeliveryValues) {
    try {
      // First, get a delivery quote
      setDeliveryStatus({ status: 'fetching_quote' });
      
      // Convert form data to API format
      const quoteRequest = {
        partner: data.deliveryPartner,
        pickup: {
          name: data.pickupName,
          address: `${data.pickupAddress}, ${data.pickupCity}, ${data.pickupState} ${data.pickupZip}`,
          phoneNumber: data.pickupPhone,
          instructions: data.pickupInstructions,
        },
        dropoff: {
          name: data.dropoffName,
          address: `${data.dropoffAddress}, ${data.dropoffCity}, ${data.dropoffState} ${data.dropoffZip}`,
          phoneNumber: data.dropoffPhone,
          instructions: data.dropoffInstructions,
        },
        orderValue: parseFloat(data.orderValue),
        orderItems: data.orderItems.split(',').map(item => {
          const itemDetail = item.trim();
          return { 
            name: itemDetail,
            quantity: 1,
            price: parseFloat(data.orderValue) / data.orderItems.split(',').length
          };
        }),
        notes: data.orderNotes
      };
      
      // Get delivery quote
      const quoteResponse = await apiRequest('POST', '/api/delivery/quote', quoteRequest);
      
      if (!quoteResponse.ok) {
        throw new Error('Failed to get delivery quote');
      }
      
      const quoteData = await quoteResponse.json();
      setDeliveryStatus({ 
        status: 'quoted',
        quote: {
          id: quoteData.id,
          fee: quoteData.fee,
          eta: quoteData.eta,
          currency: quoteData.currency,
          expiresAt: quoteData.expires_at || quoteData.expiresAt
        }
      });
      
      toast({
        title: "Delivery Quote Received",
        description: `Estimated delivery fee: $${quoteData.fee}`,
      });
      
    } catch (error) {
      console.error("Error getting delivery quote:", error);
      setDeliveryStatus({ 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Failed to Get Delivery Quote",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  }
  
  // Create the actual delivery after getting a quote
  async function createDelivery() {
    if (!deliveryStatus.quote) {
      toast({
        title: "No Quote Available",
        description: "Please get a delivery quote first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setDeliveryStatus({ 
        ...deliveryStatus, 
        status: 'creating' 
      });
      
      const formData = form.getValues();
      
      // Convert form data to API format
      const deliveryRequest = {
        partner: formData.deliveryPartner,
        quoteId: deliveryStatus.quote.id,
        pickup: {
          name: formData.pickupName,
          address: `${formData.pickupAddress}, ${formData.pickupCity}, ${formData.pickupState} ${formData.pickupZip}`,
          phoneNumber: formData.pickupPhone,
          instructions: formData.pickupInstructions,
        },
        dropoff: {
          name: formData.dropoffName,
          address: `${formData.dropoffAddress}, ${formData.dropoffCity}, ${formData.dropoffState} ${formData.dropoffZip}`,
          phoneNumber: formData.dropoffPhone,
          instructions: formData.dropoffInstructions,
        },
        orderValue: parseFloat(formData.orderValue),
        orderItems: formData.orderItems.split(',').map(item => {
          const itemDetail = item.trim();
          return { 
            name: itemDetail,
            quantity: 1,
            price: parseFloat(formData.orderValue) / formData.orderItems.split(',').length
          };
        }),
        notes: formData.orderNotes
      };
      
      // Create delivery
      const deliveryResponse = await apiRequest('POST', '/api/delivery/create', deliveryRequest);
      
      if (!deliveryResponse.ok) {
        throw new Error('Failed to create delivery');
      }
      
      const deliveryData = await deliveryResponse.json();
      setDeliveryStatus({ 
        status: 'in_progress',
        quote: deliveryStatus.quote,
        delivery: {
          id: deliveryData.id,
          status: deliveryData.status,
          trackingUrl: deliveryData.tracking_url || deliveryData.trackingUrl,
          fee: deliveryData.fee,
          currency: deliveryData.currency,
          createdAt: deliveryData.created_at || deliveryData.createdAt,
          pickupEta: deliveryData.pickup_eta || deliveryData.pickupEta,
          dropoffEta: deliveryData.dropoff_eta || deliveryData.dropoffEta
        }
      });
      
      toast({
        title: "Test Delivery Created",
        description: `Delivery ID: ${deliveryData.id}`,
      });
      
    } catch (error) {
      console.error("Error creating delivery:", error);
      setDeliveryStatus({ 
        ...deliveryStatus,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Failed to Create Delivery",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  }
  
  // Helper to format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Test Delivery</CardTitle>
            <CardDescription>
              Fill out this form to test your delivery integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="deliveryPartner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Partner</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a delivery partner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DELIVERY_PARTNERS.map(partner => (
                            <SelectItem key={partner.value} value={partner.value}>
                              {partner.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <h3 className="font-medium text-lg mb-4">Pickup Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pickupName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Restaurant or Business Name" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 555-5555" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickupAddress"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickupCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pickupState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} 
                              disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pickupZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} 
                              disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="pickupInstructions"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional pickup instructions" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-4">Dropoff Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="dropoffName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Customer Name" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 555-5555" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dropoffAddress"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="456 Elm St" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dropoffCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dropoffState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} 
                              disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dropoffZip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} 
                              disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="dropoffInstructions"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Delivery instructions, gate codes, etc." {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-4">Order Details</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="orderValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Value</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="45.99" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="orderItems"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Items</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Item 1, Item 2, Item 3" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="orderNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional order notes" {...field} 
                            disabled={deliveryStatus.status !== 'idle' && deliveryStatus.status !== 'failed'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      form.reset();
                      setDeliveryStatus({ status: 'idle' });
                    }}
                    disabled={deliveryStatus.status === 'fetching_quote' || deliveryStatus.status === 'creating'}
                  >
                    Reset
                  </Button>
                  
                  {deliveryStatus.status === 'quoted' ? (
                    <Button 
                      type="button" 
                      onClick={createDelivery}
                      disabled={deliveryStatus.status === 'creating'}
                    >
                      {deliveryStatus.status === 'creating' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Delivery...
                        </>
                      ) : (
                        <>
                          <TruckIcon className="mr-2 h-4 w-4" />
                          Create Delivery
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={
                        deliveryStatus.status === 'fetching_quote' || 
                        deliveryStatus.status === 'creating' || 
                        deliveryStatus.status === 'in_progress'
                      }
                    >
                      {deliveryStatus.status === 'fetching_quote' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Quote...
                        </>
                      ) : (
                        <>
                          <TruckIcon className="mr-2 h-4 w-4" />
                          Get Delivery Quote
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
            <CardDescription>
              Track your test delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveryStatus.status === 'idle' && (
              <div className="p-6 text-center text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <h3 className="font-medium">No Active Test</h3>
                <p className="text-sm mt-2">
                  Fill out the form to start a test delivery
                </p>
              </div>
            )}
            
            {deliveryStatus.status === 'fetching_quote' && (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <h3 className="font-medium">Getting Delivery Quote</h3>
                <p className="text-sm mt-2 text-muted-foreground">
                  Please wait while we contact the delivery service...
                </p>
              </div>
            )}
            
            {deliveryStatus.status === 'quoted' && deliveryStatus.quote && (
              <div className="space-y-6">
                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Quote Received</h3>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee:</span>
                      <span className="font-medium">
                        {formatCurrency(deliveryStatus.quote.fee, deliveryStatus.quote.currency)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Time:</span>
                      <span className="font-medium">
                        {Math.round(deliveryStatus.quote.eta / 60)} minutes
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quote Expires:</span>
                      <span className="font-medium">
                        {new Date(deliveryStatus.quote.expiresAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm mt-4 text-muted-foreground">
                    Click "Create Delivery" to proceed with this quote.
                  </p>
                </div>
              </div>
            )}
            
            {deliveryStatus.status === 'creating' && (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <h3 className="font-medium">Creating Delivery</h3>
                <p className="text-sm mt-2 text-muted-foreground">
                  Please wait while we set up your delivery...
                </p>
              </div>
            )}
            
            {deliveryStatus.status === 'in_progress' && deliveryStatus.delivery && (
              <div className="space-y-6">
                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex items-center gap-3">
                    <TruckIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Delivery #{deliveryStatus.delivery.id}</h3>
                      <p className="text-xs capitalize text-muted-foreground">
                        Status: {deliveryStatus.delivery.status}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <p className="text-sm">
                          {new Date(deliveryStatus.delivery.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Pickup ETA:</span>
                        <p className="text-sm">
                          {new Date(deliveryStatus.delivery.pickupEta).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Dropoff ETA:</span>
                        <p className="text-sm">
                          {new Date(deliveryStatus.delivery.dropoffEta).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href={deliveryStatus.delivery.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Track Delivery
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {deliveryStatus.status === 'failed' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {deliveryStatus.error || "An unknown error occurred"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {/* Delivery Stats Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Use Real Addresses</h4>
                <p className="text-muted-foreground">
                  For accurate testing, use real addresses within the delivery radius.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Phone Numbers</h4>
                <p className="text-muted-foreground">
                  Provide valid phone numbers for test deliveries.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Testing in Sandbox</h4>
                <p className="text-muted-foreground">
                  All test deliveries are created in sandbox mode and won't dispatch actual couriers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
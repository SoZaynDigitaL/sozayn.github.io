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
  Package, 
  ShoppingBag,
  ShoppingCart,
  Tag,
  X 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Available e-commerce platforms
const ECOMMERCE_PLATFORMS = [
  { value: "shopify", label: "Shopify" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "magento", label: "Magento" },
  { value: "bigcommerce", label: "BigCommerce" },
  { value: "wix", label: "Wix" },
  { value: "squarespace", label: "Squarespace" },
];

// Form schema for test e-commerce operations
const testEcommerceSchema = z.object({
  platform: z.string().min(1, "Please select an e-commerce platform"),
  
  // Store information
  storeName: z.string().min(1, "Store name is required"),
  storeUrl: z.string().url("Must be a valid URL"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
  
  // Product information (for create product test)
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(1, "Product description is required"),
  productPrice: z.string().min(1, "Product price is required"),
  productSku: z.string().optional(),
  
  // Customer information (for create order test)
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Must be a valid email"),
  customerAddress: z.string().min(5, "Full address is required"),
  customerCity: z.string().min(1, "City is required"),
  customerState: z.string().min(1, "State is required"),
  customerZip: z.string().min(4, "ZIP code is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  
  // Order information
  orderItems: z.string().min(1, "At least one item is required"),
  orderNotes: z.string().optional(),
});

type TestEcommerceValues = z.infer<typeof testEcommerceSchema>;

type EcommerceStatus = {
  status: 'idle' | 'creating_product' | 'product_created' | 'creating_order' | 'order_created' | 'failed';
  error?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    currency: string;
    description: string;
    images: string[];
    status: string;
    created_at: string;
  };
  order?: {
    id: string;
    order_number: string;
    status: string;
    customer: {
      name: string;
      email: string;
      address: string;
    };
    items: Array<{
      product_id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    total_amount: number;
    currency: string;
    created_at: string;
  }
};

export default function TestEcommerce() {
  const { toast } = useToast();
  const [ecommerceStatus, setEcommerceStatus] = useState<EcommerceStatus>({ 
    status: 'idle' 
  });
  
  // Initialize form
  const form = useForm<TestEcommerceValues>({
    resolver: zodResolver(testEcommerceSchema),
    defaultValues: {
      platform: "",
      storeName: "",
      storeUrl: "",
      apiKey: "",
      apiSecret: "",
      productName: "",
      productDescription: "",
      productPrice: "",
      productSku: "",
      customerName: "",
      customerEmail: "",
      customerAddress: "",
      customerCity: "",
      customerState: "",
      customerZip: "",
      customerPhone: "",
      orderItems: "",
      orderNotes: "",
    },
  });
  
  // Test product creation
  async function testCreateProduct(data: TestEcommerceValues) {
    try {
      setEcommerceStatus({ status: 'creating_product' });
      
      // For the selected platform, we need to get the integration ID if it exists
      let integrationId: number | undefined;
      
      try {
        // Fetch the integrations to get the ID
        const integrationsResponse = await apiRequest('GET', '/api/integrations');
        if (integrationsResponse.ok) {
          const integrations = await integrationsResponse.json();
          
          // Find an integration for the selected platform
          const platformIntegration = integrations.find((i: any) => 
            i.type === 'ecommerce' && i.provider.toLowerCase() === data.platform.toLowerCase()
          );
          
          if (platformIntegration) {
            integrationId = platformIntegration.id;
          }
        }
      } catch (error) {
        console.error("Failed to fetch integrations:", error);
      }
      
      // Prepare the product data
      const productRequest = {
        platform: data.platform,
        integrationId,
        name: data.productName,
        description: data.productDescription,
        price: parseFloat(data.productPrice),
        sku: data.productSku,
        currency: "USD",
        storeUrl: data.storeUrl,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret
      };
      
      // Log the product creation request for debugging
      console.log("Sending product creation request:", JSON.stringify(productRequest, null, 2));
      
      // Use the test endpoint
      const productResponse = await apiRequest('POST', '/api/ecommerce/test-product', productRequest);
      
      if (!productResponse.ok) {
        throw new Error('Failed to create test product');
      }
      
      const productData = await productResponse.json();
      setEcommerceStatus({ 
        status: 'product_created',
        product: {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          currency: productData.currency,
          description: productData.description,
          images: productData.images,
          status: productData.status,
          created_at: productData.created_at
        }
      });
      
      toast({
        title: "Test Product Created",
        description: `Product ID: ${productData.id}`,
      });
      
    } catch (error) {
      console.error("Error creating test product:", error);
      setEcommerceStatus({ 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Failed to Create Test Product",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  }
  
  // Test order creation
  async function testCreateOrder(data: TestEcommerceValues) {
    try {
      setEcommerceStatus({ status: 'creating_order' });
      
      // For the selected platform, we need to get the integration ID if it exists
      let integrationId: number | undefined;
      
      try {
        // Fetch the integrations to get the ID
        const integrationsResponse = await apiRequest('GET', '/api/integrations');
        if (integrationsResponse.ok) {
          const integrations = await integrationsResponse.json();
          
          // Find an integration for the selected platform
          const platformIntegration = integrations.find((i: any) => 
            i.type === 'ecommerce' && i.provider.toLowerCase() === data.platform.toLowerCase()
          );
          
          if (platformIntegration) {
            integrationId = platformIntegration.id;
          }
        }
      } catch (error) {
        console.error("Failed to fetch integrations:", error);
      }
      
      // Parse the order items
      const orderItemsArray = data.orderItems.split(',').map(item => {
        const itemDetail = item.trim();
        // For simplicity, we'll set a default price per item
        const price = parseFloat(data.productPrice) || 19.99;
        return { 
          name: itemDetail,
          quantity: 1,
          price: price
        };
      });
      
      // Calculate the total order value
      const totalAmount = orderItemsArray.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create the full customer address
      const customerAddress = `${data.customerAddress}, ${data.customerCity}, ${data.customerState} ${data.customerZip}`;
      
      // Prepare the order data
      const orderRequest = {
        platform: data.platform,
        integrationId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerAddress: customerAddress,
        customerPhone: data.customerPhone,
        orderItems: orderItemsArray,
        items: orderItemsArray, // Send both formats to ensure compatibility
        totalAmount: totalAmount,
        currency: "USD",
        notes: data.orderNotes,
        storeUrl: data.storeUrl,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret
      };
      
      // Log the order creation request for debugging
      console.log("Sending order creation request:", JSON.stringify(orderRequest, null, 2));
      
      // Use the test endpoint
      const orderResponse = await apiRequest('POST', '/api/ecommerce/test-order', orderRequest);
      
      if (!orderResponse.ok) {
        throw new Error('Failed to create test order');
      }
      
      const orderData = await orderResponse.json();
      setEcommerceStatus({ 
        status: 'order_created',
        order: {
          id: orderData.id,
          order_number: orderData.order_number,
          status: orderData.status,
          customer: orderData.customer,
          items: orderData.items,
          total_amount: orderData.total_amount,
          currency: orderData.currency,
          created_at: orderData.created_at
        }
      });
      
      toast({
        title: "Test Order Created",
        description: `Order Number: ${orderData.order_number}`,
      });
      
    } catch (error) {
      console.error("Error creating test order:", error);
      setEcommerceStatus({ 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Failed to Create Test Order",
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
            <CardTitle>Test E-commerce Integration</CardTitle>
            <CardDescription>
              Fill out this form to test your e-commerce platform integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="product" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="product">Create Product</TabsTrigger>
                <TabsTrigger value="order">Create Order</TabsTrigger>
              </TabsList>
              
              <TabsContent value="product">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(testCreateProduct)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-commerce Platform</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={ecommerceStatus.status === 'creating_product'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ECOMMERCE_PLATFORMS.map(platform => (
                                <SelectItem key={platform.value} value={platform.value}>
                                  {platform.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-4">Store Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="storeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your Store Name" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_product'}
                                />
                              </FormControl>
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
                                  placeholder="https://your-store.com" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_product'}
                                />
                              </FormControl>
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
                                  placeholder="Your API Key" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_product'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="apiSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Secret</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your API Secret" 
                                  type="password"
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_product'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-4">Product Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="productName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Product Name" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_product'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="productPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Price (e.g., 19.99)" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_product'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="productSku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Product SKU" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_product'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="productDescription"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Product Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your product" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_product'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        disabled={ecommerceStatus.status === 'creating_product'}
                      >
                        {ecommerceStatus.status === 'creating_product' && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Test Product
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="order">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(testCreateOrder)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-commerce Platform</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={ecommerceStatus.status === 'creating_order'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ECOMMERCE_PLATFORMS.map(platform => (
                                <SelectItem key={platform.value} value={platform.value}>
                                  {platform.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-4">Store Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="storeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your Store Name" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
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
                                  placeholder="https://your-store.com" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
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
                                  placeholder="Your API Key" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="apiSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Secret</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your API Secret" 
                                  type="password"
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-4">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Customer Name" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="customer@example.com" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Phone Number" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customerAddress"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Street Address" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customerCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="City" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="customerState"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="State" 
                                    {...field} 
                                    disabled={ecommerceStatus.status === 'creating_order'}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="customerZip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ZIP Code" 
                                    {...field} 
                                    disabled={ecommerceStatus.status === 'creating_order'}
                                  />
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
                      <h3 className="font-medium text-lg mb-4">Order Information</h3>
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="orderItems"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Order Items</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter order items, separated by commas (e.g., 'Product 1, Product 2')" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="productPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price Per Item</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Price (e.g., 19.99)" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
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
                              <FormLabel>Order Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any additional notes about the order" 
                                  {...field} 
                                  disabled={ecommerceStatus.status === 'creating_order'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        disabled={ecommerceStatus.status === 'creating_order'}
                      >
                        {ecommerceStatus.status === 'creating_order' && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Test Order
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              View the results of your e-commerce integration tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ecommerceStatus.status === 'idle' && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingBag className="h-16 w-16 text-text-secondary mb-4" />
                <h3 className="text-lg font-medium">No Tests Run Yet</h3>
                <p className="text-text-secondary mt-2">
                  Fill out the form and run a test to see results here
                </p>
              </div>
            )}
            
            {(ecommerceStatus.status === 'creating_product' || ecommerceStatus.status === 'creating_order') && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-16 w-16 text-text-secondary animate-spin mb-4" />
                <h3 className="text-lg font-medium">
                  {ecommerceStatus.status === 'creating_product' ? 'Creating Product...' : 'Creating Order...'}
                </h3>
                <p className="text-text-secondary mt-2">
                  Please wait while we process your request
                </p>
              </div>
            )}
            
            {ecommerceStatus.status === 'product_created' && ecommerceStatus.product && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Product Created Successfully</span>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-text-secondary">Product ID:</span>
                    <p className="font-medium">{ecommerceStatus.product.id}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Name:</span>
                    <p className="font-medium">{ecommerceStatus.product.name}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Price:</span>
                    <p className="font-medium">
                      {formatCurrency(ecommerceStatus.product.price, ecommerceStatus.product.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Status:</span>
                    <p className="font-medium">{ecommerceStatus.product.status}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Created:</span>
                    <p className="font-medium">
                      {new Date(ecommerceStatus.product.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full" onClick={() => setEcommerceStatus({ status: 'idle' })}>
                  Start New Test
                </Button>
              </div>
            )}
            
            {ecommerceStatus.status === 'order_created' && ecommerceStatus.order && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Order Created Successfully</span>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-text-secondary">Order ID:</span>
                    <p className="font-medium">{ecommerceStatus.order.id}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Order Number:</span>
                    <p className="font-medium">{ecommerceStatus.order.order_number}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Status:</span>
                    <p className="font-medium">{ecommerceStatus.order.status}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Customer:</span>
                    <p className="font-medium">{ecommerceStatus.order.customer.name}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Total Amount:</span>
                    <p className="font-medium">
                      {formatCurrency(ecommerceStatus.order.total_amount, ecommerceStatus.order.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Created:</span>
                    <p className="font-medium">
                      {new Date(ecommerceStatus.order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full" onClick={() => setEcommerceStatus({ status: 'idle' })}>
                  Start New Test
                </Button>
              </div>
            )}
            
            {ecommerceStatus.status === 'failed' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {ecommerceStatus.error || "An unknown error occurred"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
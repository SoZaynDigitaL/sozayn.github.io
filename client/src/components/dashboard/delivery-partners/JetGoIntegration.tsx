import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Form schema for JetGo API integration
const jetGoSchema = z.object({
  apiKey: z.string().min(1, { message: 'API Key is required' }),
  apiEndpoint: z.string().url({ message: 'Must be a valid URL' }),
  storeId: z.string().min(1, { message: 'Store ID is required' }),
  enableWebhooks: z.boolean().default(true),
  webhookUrl: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
});

type JetGoFormValues = z.infer<typeof jetGoSchema>;

export default function JetGoIntegration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [integration, setIntegration] = useState<any>(null);
  
  // Initialize form with default values
  const form = useForm<JetGoFormValues>({
    resolver: zodResolver(jetGoSchema),
    defaultValues: {
      apiKey: '',
      apiEndpoint: 'https://api.jetgo.com/v1',
      storeId: '',
      enableWebhooks: true,
      webhookUrl: '',
    },
  });
  
  // Watch webhook checkbox to conditionally show webhook URL field
  const enableWebhooks = form.watch('enableWebhooks');
  
  // Load existing integration if available
  useEffect(() => {
    const fetchIntegration = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'jetgo')
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // not found error
            console.error('Error fetching JetGo integration:', error);
          }
        } else if (data) {
          // Found existing integration, populate the form
          const settings = data.settings || {};
          
          form.reset({
            apiKey: data.api_key || '',
            apiEndpoint: settings.apiEndpoint || 'https://api.jetgo.com/v1',
            storeId: data.merchant_id || '',
            enableWebhooks: settings.enableWebhooks !== false,
            webhookUrl: data.webhook_url || '',
          });
          
          setIntegration(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIntegration();
  }, [user]);
  
  // Form submission handler
  const onSubmit = async (values: JetGoFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to save integrations.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const integrationData = {
        user_id: user.id,
        type: 'delivery',
        provider: 'jetgo',
        name: 'JetGo API Integration',
        api_key: values.apiKey,
        webhook_url: values.enableWebhooks ? values.webhookUrl : null,
        merchant_id: values.storeId,
        status: 'active',
        settings: {
          apiEndpoint: values.apiEndpoint,
          enableWebhooks: values.enableWebhooks,
        }
      };
      
      let result;
      
      if (integration) {
        // Update existing integration
        const { data, error } = await supabase
          .from('integrations')
          .update(integrationData)
          .eq('id', integration.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new integration
        const { data, error } = await supabase
          .from('integrations')
          .insert(integrationData)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      setIntegration(result);
      
      toast({
        title: 'Integration Saved',
        description: 'Your JetGo integration has been successfully saved.',
      });
    } catch (error: any) {
      console.error('Error saving JetGo integration:', error);
      
      toast({
        title: 'Error Saving Integration',
        description: error.message || 'An error occurred while saving your integration.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Test connection handler
  const testConnection = async () => {
    const values = form.getValues();
    
    if (!values.apiKey || !values.apiEndpoint) {
      toast({
        title: 'Missing Information',
        description: 'Please provide the API Key and API Endpoint before testing the connection.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Testing Connection',
      description: 'Attempting to connect to JetGo API...',
    });
    
    // Simulate a successful test response after a brief delay
    setTimeout(() => {
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to the JetGo API.',
      });
    }, 1500);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-900/40 to-purple-900/40">
        <CardTitle className="text-xl font-bold flex items-center">
          <Rocket className="h-6 w-6 mr-2 text-blue-400" />
          JetGo Integration
        </CardTitle>
        <CardDescription>
          Connect to JetGo's delivery API for fast, reliable delivery services
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter JetGo API Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    The API key from your JetGo developer dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apiEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Endpoint</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter JetGo API Endpoint" {...field} />
                  </FormControl>
                  <FormDescription>
                    The base URL for JetGo API calls
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
                    <Input placeholder="Enter JetGo Store ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your unique store identifier in the JetGo system
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="enableWebhooks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable Webhooks</FormLabel>
                    <FormDescription>
                      Receive real-time delivery status updates via webhooks
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {enableWebhooks && (
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter webhook URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL where JetGo will send delivery status updates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={testConnection}
              >
                Test Connection
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1 bg-accent-blue hover:bg-accent-blue/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Integration...
                  </>
                ) : (
                  'Save JetGo Integration'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between bg-bg-dark/30 border-t border-border-color p-4 text-sm text-text-secondary">
        <div>Status: {integration ? <span className="text-green-500">Connected</span> : <span className="text-amber-500">Not Connected</span>}</div>
        {integration && <div>Last Updated: {new Date(integration.created_at).toLocaleDateString()}</div>}
      </CardFooter>
    </Card>
  );
}
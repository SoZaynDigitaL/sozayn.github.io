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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Form schema for UberDirect API integration
const uberDirectSchema = z.object({
  clientId: z.string().min(1, { message: 'Client ID is required' }),
  clientSecret: z.string().min(1, { message: 'Client Secret is required' }),
  merchantId: z.string().min(1, { message: 'Merchant ID is required' }),
});

type UberDirectFormValues = z.infer<typeof uberDirectSchema>;

export default function UberDirectIntegration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [integration, setIntegration] = useState<any>(null);
  
  // Initialize form with default values
  const form = useForm<UberDirectFormValues>({
    resolver: zodResolver(uberDirectSchema),
    defaultValues: {
      clientId: '',
      clientSecret: '',
      merchantId: '',
    },
  });
  
  // Load existing integration if available
  useEffect(() => {
    const fetchIntegration = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'uberdirect')
          .single();
        
        if (error) {
          console.error('Error fetching UberDirect integration:', error);
        } else if (data) {
          // Found existing integration, populate the form
          const settings = data.settings || {};
          
          form.reset({
            clientId: data.api_key || '',
            clientSecret: data.api_secret || '',
            merchantId: data.merchant_id || '',
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
  const onSubmit = async (values: UberDirectFormValues) => {
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
        provider: 'uberdirect',
        name: 'UberDirect API Integration',
        api_key: values.clientId,
        api_secret: values.clientSecret,
        merchant_id: values.merchantId,
        status: 'active',
        settings: {}
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
        description: 'Your UberDirect integration has been successfully saved.',
      });
    } catch (error: any) {
      console.error('Error saving UberDirect integration:', error);
      
      toast({
        title: 'Error Saving Integration',
        description: error.message || 'An error occurred while saving your integration.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <img 
            src="https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/illustrations/direct_logo.svg" 
            alt="UberDirect Logo" 
            className="h-8 mr-3" 
          />
          UberDirect Integration
        </CardTitle>
        <CardDescription>
          Connect to UberDirect's API for real-time delivery services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter UberDirect Client ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    The client ID from your UberDirect developer account
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
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter UberDirect Client Secret" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The client secret from your UberDirect developer account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="merchantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter UberDirect Merchant ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your UberDirect merchant or store identifier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-accent-blue hover:bg-accent-blue/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Integration...
                </>
              ) : (
                'Save UberDirect Integration'
              )}
            </Button>
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
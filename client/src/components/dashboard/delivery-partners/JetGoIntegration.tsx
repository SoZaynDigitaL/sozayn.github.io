import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Rocket,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Form schema for JetGo integration
const jetGoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  api_key: z.string().min(1, 'API Key is required'),
  merchant_id: z.string().min(1, 'Merchant ID is required'),
  webhook_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  apiEndpoint: z.string().url('Please enter a valid URL').default('https://api.jetgo.io/v1'),
  enableWebhooks: z.boolean().default(false),
});

type JetGoFormValues = z.infer<typeof jetGoSchema>;

// JetGo integration component
export default function JetGoIntegration() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch existing JetGo integration
  const {
    data: integration,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/integrations', 'jetgo'],
    queryFn: async () => {
      const res = await apiRequest(
        'GET',
        '/api/integrations?type=jetgo'
      );
      const data = await res.json();
      return data.length > 0 ? data[0] : null;
    },
  });

  // Parse config if it exists
  const config = integration?.config ? 
    (typeof integration.config === 'string' ? 
      JSON.parse(integration.config) : 
      integration.config) : 
    {};

  // Initialize form
  const form = useForm<JetGoFormValues>({
    resolver: zodResolver(jetGoSchema),
    defaultValues: {
      name: 'JetGo',
      api_key: '',
      merchant_id: '',
      webhook_url: '',
      apiEndpoint: 'https://api.jetgo.io/v1',
      enableWebhooks: false,
    },
  });

  // Update form when data loads
  React.useEffect(() => {
    if (integration) {
      form.reset({
        name: integration.name,
        api_key: integration.api_key || '',
        merchant_id: config.merchant_id || '',
        webhook_url: integration.url || '',
        apiEndpoint: config.apiEndpoint || 'https://api.jetgo.io/v1',
        enableWebhooks: config.enableWebhooks || false,
      });
    }
  }, [integration, form, config]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: JetGoFormValues) => {
      const { apiEndpoint, enableWebhooks, webhook_url, merchant_id, ...restValues } = values;
      
      const response = await apiRequest('POST', '/api/integrations', {
        ...restValues,
        type: 'jetgo',
        provider: 'jetgo',
        url: webhook_url,
        config: {
          merchant_id,
          apiEndpoint,
          enableWebhooks,
        },
        status: 'active',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Integration Saved',
        description: 'JetGo integration has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create integration',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: JetGoFormValues) => {
      const { apiEndpoint, enableWebhooks, webhook_url, merchant_id, ...restValues } = values;
      
      const response = await apiRequest('PATCH', `/api/integrations/${integration?.id}`, {
        ...restValues,
        url: webhook_url,
        config: {
          merchant_id,
          apiEndpoint,
          enableWebhooks,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Integration Updated',
        description: 'JetGo integration has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update integration',
        variant: 'destructive',
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      setIsTestingConnection(true);
      const response = await apiRequest(
        'POST',
        `/api/integrations/${integration?.id}/test`,
        {}
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Connection Successful',
        description: data.message || 'Connection to JetGo API was successful',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to JetGo API',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsTestingConnection(false);
    },
  });

  // Form submission handler
  function onSubmit(values: JetGoFormValues) {
    if (integration) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full shadow-md border-border/50">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-500" />
            <CardTitle>JetGo Integration</CardTitle>
          </div>
          {integration?.status && (
            <Badge variant={integration.status === 'active' ? 'default' : 'outline'}>
              {integration.status}
            </Badge>
          )}
        </div>
        <CardDescription>
          Configure your JetGo delivery service integration
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Error loading integration: {(error as Error).message}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Integration Name</FormLabel>
                    <FormControl>
                      <Input placeholder="JetGo" {...field} />
                    </FormControl>
                    <FormDescription>
                      A friendly name for this integration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Your JetGo API Key" {...field} />
                    </FormControl>
                    <FormDescription>
                      API key from your JetGo dashboard
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="merchant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Your JetGo Merchant ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Merchant ID from your JetGo account
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
                      <Input placeholder="https://api.jetgo.io/v1" {...field} />
                    </FormControl>
                    <FormDescription>
                      JetGo API endpoint (only change if using a different environment)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableWebhooks"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Webhooks</FormLabel>
                      <FormDescription>
                        Receive real-time delivery updates via webhooks
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

              {form.watch('enableWebhooks') && (
                <FormField
                  control={form.control}
                  name="webhook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/webhook/jetgo" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL where JetGo will send delivery status updates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-2 pt-4">
                {integration && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => testConnectionMutation.mutate()}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : integration ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Update
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 text-xs text-muted-foreground">
        <p>Last updated: {integration?.updated_at ? new Date(integration.updated_at).toLocaleString() : 'Never'}</p>
      </CardFooter>
    </Card>
  );
}
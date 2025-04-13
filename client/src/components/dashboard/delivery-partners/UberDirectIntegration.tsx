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
  Truck,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Form schema for UberDirect integration
const uberDirectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  api_key: z.string().min(1, 'API Key is required'),
  api_secret: z.string().min(1, 'API Secret is required'),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type UberDirectFormValues = z.infer<typeof uberDirectSchema>;

// UberDirect integration component
export default function UberDirectIntegration() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch existing UberDirect integration
  const {
    data: integration,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/integrations', 'uberdirect'],
    queryFn: async () => {
      const res = await apiRequest(
        'GET',
        '/api/integrations?type=uberdirect'
      );
      const data = await res.json();
      return data.length > 0 ? data[0] : null;
    },
  });

  // Initialize form
  const form = useForm<UberDirectFormValues>({
    resolver: zodResolver(uberDirectSchema),
    defaultValues: {
      name: 'UberDirect',
      api_key: '',
      api_secret: '',
      url: '',
    },
  });

  // Update form when data loads
  React.useEffect(() => {
    if (integration) {
      form.reset({
        name: integration.name,
        api_key: integration.api_key || '',
        api_secret: integration.api_secret || '',
        url: integration.url || '',
      });
    }
  }, [integration, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: UberDirectFormValues) => {
      const response = await apiRequest('POST', '/api/integrations', {
        ...values,
        type: 'uberdirect',
        status: 'active',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Integration Saved',
        description: 'UberDirect integration has been created successfully.',
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
    mutationFn: async (values: UberDirectFormValues) => {
      const response = await apiRequest('PATCH', `/api/integrations/${integration?.id}`, {
        ...values,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Integration Updated',
        description: 'UberDirect integration has been updated successfully.',
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
        description: data.message || 'Connection to UberDirect API was successful',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to UberDirect API',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsTestingConnection(false);
    },
  });

  // Form submission handler
  function onSubmit(values: UberDirectFormValues) {
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
            <Truck className="h-5 w-5 text-blue-500" />
            <CardTitle>UberDirect Integration</CardTitle>
          </div>
          {integration?.status && (
            <Badge variant={integration.status === 'active' ? 'default' : 'outline'}>
              {integration.status}
            </Badge>
          )}
        </div>
        <CardDescription>
          Configure your UberDirect delivery service integration
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
                      <Input placeholder="UberDirect" {...field} />
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
                      <Input placeholder="Your UberDirect API Key" {...field} />
                    </FormControl>
                    <FormDescription>
                      Obtain from your UberDirect developer dashboard
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Secret</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Your UberDirect API Secret"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Keep this value secure, it will be encrypted in our database
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL for webhook notifications (if applicable)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
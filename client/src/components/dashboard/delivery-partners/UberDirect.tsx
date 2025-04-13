import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, TestTube2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import UberDirectIntegration from './UberDirectIntegration';

const schema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  environment: z.enum(["sandbox", "production"]).default("sandbox"),
  merchantId: z.string().min(1, "Merchant ID is required"),
  isActive: z.boolean().default(true),
});

type UberDirectProps = {
  integration: any;
  isSubmitting: boolean;
  onUpdate: (id: number, data: any) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  onTest: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function UberDirect({ 
  integration,
  isSubmitting,
  onUpdate,
  onToggleActive,
  onTest,
  onDelete
}: UberDirectProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // If we're using Supabase directly now, we can skip this component and use UberDirectIntegration
  return <UberDirectIntegration />;

  // Initialize form
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: integration?.credentials?.clientId || "",
      clientSecret: integration?.credentials?.clientSecret || "",
      environment: integration?.settings?.environment || "sandbox",
      merchantId: integration?.credentials?.merchantId || "",
      isActive: integration?.isActive ?? true,
    },
  });
  
  // Form submission handler
  const onSubmit = (values: z.infer<typeof schema>) => {
    if (!integration) return;
    
    const data = {
      credentials: {
        clientId: values.clientId,
        clientSecret: values.clientSecret,
        merchantId: values.merchantId,
      },
      settings: {
        environment: values.environment,
      },
      isActive: values.isActive,
    };
    
    onUpdate(integration.id, data);
    setIsEditing(false);
  };
  
  // Function to test connection
  const testConnection = () => {
    if (!integration) return;
    onTest(integration.id);
  };
  
  // Function to delete integration
  const deleteIntegration = () => {
    if (!integration) return;
    onDelete(integration.id);
  };
  
  // Function to toggle active status
  const toggleActive = () => {
    if (!integration) return;
    const newStatus = !integration.isActive;
    onToggleActive(integration.id, newStatus);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center">
            <img 
              src="https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/illustrations/direct_logo.svg" 
              alt="UberDirect Logo" 
              className="h-8 mr-3" 
            />
            UberDirect
          </CardTitle>
          <CardDescription>Direct integration with Uber delivery API</CardDescription>
        </div>
        {integration && (
          <Badge variant={integration.isActive ? "default" : "outline"}>
            {integration.isActive ? "Active" : "Inactive"}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {integration && !isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Status</h4>
                <p className="font-medium">
                  {integration.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Environment</h4>
                <p className="font-medium uppercase">
                  {integration.settings?.environment || "Sandbox"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Merchant ID</h4>
                <p className="font-medium">
                  {integration.credentials?.merchantId || "Not configured"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-secondary">Last Updated</h4>
                <p className="font-medium">
                  {new Date(integration.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
              >
                Edit Configuration
              </Button>
              
              <Button
                size="sm"
                variant={integration.isActive ? "destructive" : "default"}
                onClick={toggleActive}
                disabled={isSubmitting}
              >
                {integration.isActive ? "Deactivate" : "Activate"}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={testConnection}
                disabled={isSubmitting}
              >
                <TestTube2 className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the UberDirect integration and all associated settings.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteIntegration}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : integration && isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment</FormLabel>
                    <div className="rounded-md border p-2 bg-accent/20">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={field.value === "sandbox" ? "default" : "outline"}
                          onClick={() => field.onChange("sandbox")}
                          className="w-full"
                        >
                          Sandbox
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "production" ? "default" : "outline"}
                          onClick={() => field.onChange("production")}
                          className="w-full"
                        >
                          Production
                        </Button>
                      </div>
                    </div>
                    <FormDescription>
                      Choose the environment for this integration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Activate Integration</FormLabel>
                      <FormDescription>
                        Enable or disable this integration
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
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-text-secondary mb-4">
              No UberDirect integration configured yet.
            </p>
            <Button onClick={() => setIsEditing(true)}>
              Set Up UberDirect Integration
            </Button>
          </div>
        )}
      </CardContent>
      {integration && (
        <CardFooter className="bg-background/50 border-t px-6 py-3">
          <p className="text-xs text-text-secondary">
            Connected on {new Date(integration.createdAt).toLocaleDateString()}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
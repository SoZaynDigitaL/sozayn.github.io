import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import partner components
import UberDirect from "./UberDirect";
import JetGo from "./JetGo";

export default function DeliveryPartnerIntegrations() {
  const { toast } = useToast();
  const { hasRequiredPlan } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch integrations from API
  const { data: allIntegrations, isLoading, error } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/integrations');
        const data = await response.json();
        // Filter to only get delivery type integrations
        return data.filter((i: any) => i.type === 'delivery');
      } catch (error) {
        console.error('Error fetching integrations:', error);
        return [];
      }
    }
  });

  // Group integrations by provider - only UberDirect and JetGo for pilot
  const integrations = {
    uberDirect: allIntegrations?.find((i: any) => i.provider === 'UberDirect') || null,
    jetgo: allIntegrations?.find((i: any) => i.provider === 'JetGo') || null
  };

  // Update integration mutation
  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      setIsSubmitting(true);
      const response = await apiRequest('PATCH', `/api/integrations/${id}`, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update integration');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration updated",
        description: "Your delivery partner integration has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update",
        description: error.message || "An error occurred while updating the integration.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Toggle active status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      setIsSubmitting(true);
      const response = await apiRequest('PATCH', `/api/integrations/${id}`, { isActive });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
      
      return await response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isActive ? "Integration activated" : "Integration deactivated",
        description: `The integration has been ${variables.isActive ? "activated" : "deactivated"} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message || "An error occurred while updating the integration status.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsSubmitting(true);
      const response = await apiRequest('POST', `/api/integrations/${id}/test`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test integration');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test successful",
        description: "The integration test completed successfully.",
      });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Test failed",
        description: error.message || "An error occurred while testing the integration.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsSubmitting(true);
      const response = await apiRequest('DELETE', `/api/integrations/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete integration');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration deleted",
        description: "The integration has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete",
        description: error.message || "An error occurred while deleting the integration.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Handler functions
  const handleUpdate = (id: number, data: any) => {
    updateIntegrationMutation.mutate({ id, data });
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    toggleStatusMutation.mutate({ id, isActive });
  };

  const handleTest = (id: number) => {
    testIntegrationMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    deleteIntegrationMutation.mutate(id);
  };

  // Check if user has required plan
  const canAddIntegration = hasRequiredPlan(['Growth', 'Pro']);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!canAddIntegration && (
        <Alert variant="destructive">
          <AlertTitle>Upgrade Required</AlertTitle>
          <AlertDescription>
            Delivery partner integrations are available on the Growth and Pro plans.
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => window.location.href = '/manage-subscription'}>
              Upgrade now
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UberDirect 
          integration={integrations.uberDirect} 
          isSubmitting={isSubmitting}
          onUpdate={handleUpdate}
          onToggleActive={handleToggleActive}
          onTest={handleTest}
          onDelete={handleDelete}
        />
        
        <JetGo 
          integration={integrations.jetgo} 
          isSubmitting={isSubmitting}
          onUpdate={handleUpdate}
          onToggleActive={handleToggleActive}
          onTest={handleTest}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Import partner components
import UberDirect from "./UberDirect";
import JetGo from "./JetGo";

export default function DeliveryPartnerIntegrations() {
  const { hasRequiredPlan } = useAuth();

  // Check if user has required plan
  const canAddIntegration = hasRequiredPlan(['Growth', 'Pro']);

  return (
    <div className="space-y-6">
      {!canAddIntegration && (
        <Alert>
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
        {/* Using updated components that use Supabase directly */}
        <UberDirect 
          integration={null} 
          isSubmitting={false}
          onUpdate={() => {}}
          onToggleActive={() => {}}
          onTest={() => {}}
          onDelete={() => {}}
        />
        
        <JetGo 
          integration={null} 
          isSubmitting={false}
          onUpdate={() => {}}
          onToggleActive={() => {}}
          onTest={() => {}}
          onDelete={() => {}}
        />
      </div>
    </div>
  );
}
import { useEffect } from "react";
import TestDelivery from "@/components/dashboard/TestDelivery";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function TestOrderPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Check if user has the required subscription plan
  useEffect(() => {
    if (!isLoading && user) {
      const requiredPlans = ["growth", "pro", "enterprise"];
      if (!requiredPlans.includes(user.subscriptionPlan)) {
        toast({
          title: "Subscription Required",
          description: "This feature requires a Growth or Pro plan subscription.",
          variant: "destructive",
        });
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, setLocation, toast]);

  // If loading, show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If user doesn't have access, redirect (handled by useEffect)
  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test Order Flow</h1>
          <p className="text-muted-foreground">
            Create test deliveries to verify your delivery integrations are working correctly.
          </p>
        </div>

        <TestDelivery />
      </div>
    </DashboardLayout>
  );
}
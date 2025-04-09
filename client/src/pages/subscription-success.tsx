import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const planNames = {
  starter: "Starter",
  growth: "Growth",
  professional: "Professional"
};

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const { user, updateSubscription } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState("professional");
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Get plan and upgrade status from URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const planParam = searchParams.get('plan');
    const upgradedParam = searchParams.get('upgraded');
    
    if (planParam && Object.keys(planNames).includes(planParam)) {
      setPlan(planParam);
    }
    
    if (upgradedParam === 'true') {
      setIsUpgrade(true);
    }
    
    // Update user subscription data
    const updateUserSubscription = async () => {
      try {
        setIsProcessing(true);
        if (planParam) {
          await updateSubscription(planParam);
          toast({
            title: isUpgrade ? "Subscription Upgraded" : "Subscription Activated",
            description: `Your ${planNames[planParam as keyof typeof planNames]} plan is now active.`
          });
        }
      } catch (error) {
        console.error("Failed to update subscription data:", error);
        toast({
          title: "Subscription Update Failed",
          description: "We couldn't update your subscription information. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    if (user) {
      updateUserSubscription();
    }
  }, [user, toast, updateSubscription]);

  if (isProcessing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">
            {isUpgrade ? "Subscription Upgraded!" : "Subscription Activated!"}
          </CardTitle>
          <CardDescription>
            {isUpgrade
              ? `Thank you for upgrading to SoZayn ${planNames[plan as keyof typeof planNames]}. Your new plan has been successfully activated.`
              : `Thank you for subscribing to SoZayn ${planNames[plan as keyof typeof planNames]}. Your subscription has been successfully activated.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>
            You now have access to all SoZayn {planNames[plan as keyof typeof planNames]} features including the Digital Command Center, POS integration, loyalty system, and more.
          </p>
          <p className="font-medium">
            Your subscription will be renewed automatically every month.
          </p>
          <p className="text-sm text-muted-foreground">
            We have sent a confirmation email with all the details to your registered email address.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={() => setLocation("/dashboard")}
            className="w-full"
          >
            Go to Digital Command Center
          </Button>
          <Button
            onClick={() => setLocation("/manage-subscription")}
            variant="outline"
            className="w-full"
          >
            Manage Your Subscription
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

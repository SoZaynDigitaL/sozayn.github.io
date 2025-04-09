import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Shield, Star, Zap } from 'lucide-react';

const planDetails = {
  starter: {
    name: "Starter",
    price: "$19.99/month",
    description: "Basic features for small restaurants",
    features: [
      "Online ordering system",
      "Basic dashboard",
      "Basic analytics",
      "One delivery integration",
      "Customer management"
    ],
    badge: "BASIC"
  },
  growth: {
    name: "Growth",
    price: "$49.99/month",
    description: "Advanced features for growing businesses",
    features: [
      "All Starter features",
      "Advanced reporting",
      "Email marketing",
      "Multiple delivery integrations",
      "Loyalty program"
    ],
    badge: "POPULAR"
  },
  professional: {
    name: "Professional",
    price: "$99.99/month",
    description: "Premium features for established restaurants",
    features: [
      "All Growth features",
      "API access",
      "Priority support",
      "White-label ordering",
      "Advanced marketing tools",
      "Custom integrations"
    ],
    badge: "ENTERPRISE"
  }
};

const icons = {
  starter: <Shield className="h-12 w-12 text-blue-400" />,
  growth: <Zap className="h-12 w-12 text-indigo-500" />,
  professional: <Star className="h-12 w-12 text-purple-500" />
};

export default function ManageSubscription() {
  const { user, isLoading, updateSubscription } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your subscription.",
      });
    }

    if (user) {
      setCurrentPlan(user.subscriptionPlan || "starter");
    }
  }, [user, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const handleUpgrade = async (plan: string) => {
    if (plan === currentPlan) {
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${planDetails[plan as keyof typeof planDetails].name} plan.`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      // For downgrades, we process them immediately through the backend
      if (
        (currentPlan === 'professional' && (plan === 'growth' || plan === 'starter')) ||
        (currentPlan === 'growth' && plan === 'starter')
      ) {
        const response = await apiRequest('POST', '/api/subscription/downgrade', { plan });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            await updateSubscription(plan);
            toast({
              title: "Downgrade Successful",
              description: `Your subscription has been downgraded to ${planDetails[plan as keyof typeof planDetails].name}.`,
            });
          }
        } else {
          throw new Error('Failed to downgrade subscription');
        }
      } else {
        // For upgrades, we redirect to the subscribe page with the plan parameter
        navigate(`/subscribe?plan=${plan}&upgrade=true`);
      }
    } catch (error) {
      console.error('Error changing subscription:', error);
      toast({
        title: "Subscription Change Failed",
        description: "There was a problem changing your subscription. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      const response = await apiRequest('POST', '/api/subscription/cancel');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: "Subscription Cancelled",
            description: "Your subscription has been cancelled. You'll still have access until the end of your billing period.",
          });
          // Update local user state
          await updateSubscription('cancelled');
        } else {
          throw new Error(data.message || 'Failed to cancel subscription');
        }
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Cancellation Failed",
        description: "There was a problem cancelling your subscription. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Manage Your Subscription</h1>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {icons[currentPlan as keyof typeof icons] || <CreditCard className="h-12 w-12 text-gray-400" />}
              <div>
                <h3 className="text-xl font-bold">
                  {planDetails[currentPlan as keyof typeof planDetails]?.name || "No active subscription"}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {planDetails[currentPlan as keyof typeof planDetails]?.price || ""}
                </p>
              </div>
            </div>
            
            {user.subscriptionExpiresAt && (
              <p className="mt-4 text-sm text-muted-foreground">
                {user.subscriptionStatus === 'cancelled' 
                  ? `Your subscription has been cancelled and will expire on ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}.`
                  : `Your current billing period ends on ${new Date(user.subscriptionExpiresAt).toLocaleDateString()}.`
                }
              </p>
            )}
          </CardContent>
          <CardFooter>
            {user.subscriptionStatus !== 'cancelled' && (
              <Button 
                variant="outline" 
                onClick={handleCancelSubscription}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Cancel Subscription"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {(Object.keys(planDetails) as Array<keyof typeof planDetails>).map((plan) => (
          <Card key={plan} className={`relative ${currentPlan === plan ? 'border-primary' : ''}`}>
            {currentPlan === plan && (
              <div className="absolute top-0 right-0 -mt-2 -mr-2">
                <Badge variant="default" className="bg-primary">Current Plan</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{planDetails[plan].name}</CardTitle>
                  <CardDescription>{planDetails[plan].description}</CardDescription>
                </div>
                {icons[plan]}
              </div>
              <p className="mt-2 text-2xl font-bold">{planDetails[plan].price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {planDetails[plan].features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={currentPlan === plan ? "outline" : "default"}
                disabled={currentPlan === plan || isProcessing}
                onClick={() => handleUpgrade(plan)}
              >
                {isProcessing 
                  ? "Processing..." 
                  : currentPlan === plan 
                    ? "Current Plan" 
                    : currentPlan === 'professional' || (currentPlan === 'growth' && plan === 'starter')
                      ? "Downgrade" 
                      : "Upgrade"
                }
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6" />
            <div>
              {user.stripeCustomerId ? (
                <p>
                  Managed through Stripe. View or update your payment details in your account settings.
                </p>
              ) : (
                <p>No payment method on file.</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
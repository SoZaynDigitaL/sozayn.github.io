import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// We'll use a placeholder key until the actual key is provided
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Subscription Error",
        description: "Stripe has not been properly initialized.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Get the plan from the URL
    const searchParams = new URLSearchParams(window.location.search);
    const plan = searchParams.get('plan') || 'professional';
    const isUpgrade = searchParams.get('upgrade') === 'true';
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription-success?plan=${plan}&upgraded=${isUpgrade}`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Subscription Failed",
        description: error.message || "An error occurred during subscription processing.",
        variant: "destructive",
      });
    }
    // Payment confirmation is handled by return_url redirect
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Start Subscription"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("professional"); // Default to professional plan
  const [isUpgrade, setIsUpgrade] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation('/login');
      toast({
        title: "Authentication Required",
        description: "Please log in to access the subscription page.",
        variant: "destructive",
      });
      return;
    }

    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      setIsLoading(false);
      return;
    }

    // Parse query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const planParam = queryParams.get('plan');
    const upgradeParam = queryParams.get('upgrade');
    
    if (planParam && ['starter', 'growth', 'professional'].includes(planParam)) {
      setSelectedPlan(planParam);
    }
    
    if (upgradeParam === 'true') {
      setIsUpgrade(true);
    }

    // Create subscription as soon as the page loads
    const createSubscription = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest(
          "POST", 
          "/api/get-or-create-subscription",
          {
            plan: selectedPlan,
            isUpgrade: isUpgrade
          }
        );
        
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            title: "Subscription Setup Failed",
            description: data.error || "Could not initialize subscription system.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error setting up subscription:", error);
        toast({
          title: "Subscription Setup Error",
          description: "Failed to initialize the subscription system. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      createSubscription();
    }
  }, [user, isAuthLoading, setLocation, toast, selectedPlan, isUpgrade]);

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Configuration Required</CardTitle>
            <CardDescription>
              Stripe payment is not properly configured. Please set up your Stripe API keys to enable subscriptions.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Initialization Failed</CardTitle>
            <CardDescription>
              Unable to initialize the subscription process. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>SoZayn Pro</CardTitle>
              <CardDescription>
                <div className="text-xl font-bold mt-2">$20/month</div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Digital Command Center</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Online ordering system</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>POS integration</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Loyalty & rewards system</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Third-party delivery integration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                Subscribe to SoZayn Pro Digital Restaurant Platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              ) : (
                <div className="text-center p-4">
                  <p className="text-red-500">Stripe API key is not configured.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

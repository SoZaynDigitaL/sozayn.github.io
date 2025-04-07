import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export default function PayPalCheckout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation('/login');
      toast({
        title: "Authentication Required",
        description: "Please log in to access the checkout page.",
        variant: "destructive",
      });
      return;
    }

    // Create PayPal order as soon as the page loads
    const createPayPalOrder = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest(
          "POST", 
          "/api/paypal/create-order", 
          { amount: 49.99 } // Example amount for the SoZayn service
        );
        
        const data = await response.json();
        
        if (data.approvalUrl) {
          setApprovalUrl(data.approvalUrl);
        } else {
          toast({
            title: "Payment Setup Failed",
            description: data.error || "Could not initialize PayPal payment system.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error setting up PayPal payment:", error);
        toast({
          title: "Payment Setup Error",
          description: "Failed to initialize the PayPal payment system. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      createPayPalOrder();
    }
  }, [user, isAuthLoading, setLocation, toast]);

  const handlePayPalCheckout = () => {
    if (approvalUrl) {
      setIsSubmitting(true);
      window.location.href = approvalUrl;
    }
  };

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

  if (!approvalUrl) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Payment Initialization Failed</CardTitle>
            <CardDescription>
              Unable to initialize the PayPal payment process. Please try again later.
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

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment with PayPal</CardTitle>
          <CardDescription>
            Secure payment for SoZayn Digital Restaurant Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-md text-center">
            <p className="text-blue-800 font-medium">Total: $49.99</p>
            <p className="text-sm text-blue-600">SoZayn Digital Restaurant Platform - Monthly Subscription</p>
          </div>
          <Button 
            onClick={handlePayPalCheckout}
            className="w-full bg-[#0070ba] hover:bg-[#003087]" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Redirecting to PayPal..." : "Pay with PayPal"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation('/checkout')}>
            Pay with Card Instead
          </Button>
          <Button variant="ghost" onClick={() => setLocation('/dashboard')}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
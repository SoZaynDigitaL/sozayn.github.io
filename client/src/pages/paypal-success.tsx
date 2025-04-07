import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function PayPalSuccess() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function capturePayment() {
      try {
        // Get the PayerID and orderID from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const payerId = urlParams.get('PayerID');
        const token = urlParams.get('token');
        
        // The token is the order ID in PayPal's redirect URL
        const orderId = token;

        if (!orderId || !payerId) {
          setIsSuccess(false);
          setErrorMessage('Missing payment information in URL');
          setIsLoading(false);
          return;
        }

        // Call API to capture the payment
        const response = await apiRequest(
          'POST',
          '/api/paypal/capture-order',
          { orderId, payerId }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setIsSuccess(true);
          toast({
            title: 'Payment Successful',
            description: 'Your PayPal payment has been processed successfully.',
          });
        } else {
          setIsSuccess(false);
          setErrorMessage(data.error || 'Failed to process payment');
          toast({
            title: 'Payment Error',
            description: data.error || 'Failed to process payment',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error capturing PayPal payment:', error);
        setIsSuccess(false);
        setErrorMessage('Failed to process payment');
        toast({
          title: 'Payment Processing Error',
          description: 'An error occurred while processing your payment.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    capturePayment();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          {isSuccess ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-center">Payment Successful!</CardTitle>
              <CardDescription className="text-center">
                Your payment has been processed successfully.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-center">Payment Failed</CardTitle>
              <CardDescription className="text-center">
                {errorMessage || 'An error occurred during payment processing.'}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {isSuccess && (
            <div className="bg-green-50 p-4 rounded-md text-center mb-4">
              <p className="text-green-800">
                Your SoZayn subscription is now active. You can start using all features immediately.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => setLocation('/dashboard')}
            className="px-8"
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
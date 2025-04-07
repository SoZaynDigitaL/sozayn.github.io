import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';
import { Separator } from '@/components/ui/separator';

// Schema for registration validation
const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  businessName: z.string().min(2, { message: 'Business name is required' }),
  businessType: z.string().min(1, { message: 'Business type is required' }),
});

export default function Register() {
  const [location, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const { firebaseUser, signInWithGooglePopup, firebaseLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Define form
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      businessName: '',
      businessType: '',
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/auth/register', values);
      toast({
        title: 'Registration successful',
        description: 'Your account has been created. You can now log in.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'This username or email may already be in use. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await signInWithGooglePopup();
      // Note: In a real implementation, we would auto-create an account with Firebase data
      // or redirect to a form to complete business information
      toast({
        title: 'Google Sign-In successful',
        description: 'We need a few more details to complete your registration.',
      });
      
      // Pre-fill the form with Firebase user data if available
      if (firebaseUser) {
        form.setValue('email', firebaseUser.email || '');
        // Generate a username suggestion from email
        const username = firebaseUser.email ? firebaseUser.email.split('@')[0] : '';
        form.setValue('username', username);
      }
    } catch (error) {
      toast({
        title: 'Google Sign-In failed',
        description: (error as Error).message || 'Failed to sign in with Google.',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };
  
  if (isLoading || firebaseLoading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary font-inter antialiased relative">
      <div className="bg-grid"></div>
      <div className="glow-blue"></div>
      <div className="glow-purple"></div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md bg-bg-card border-border-color shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription className="text-text-secondary">
              Register to access your custom API gateway for restaurant operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign-In Button */}
            <div>
              <Button 
                type="button" 
                variant="outline"
                className="w-full relative border-border-color hover:bg-bg-chart/50"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting}
              >
                {isGoogleSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in with Google...
                  </>
                ) : (
                  <>
                    <svg 
                      className="h-5 w-5 mr-2" 
                      viewBox="0 0 24 24"
                      style={{ marginRight: '8px' }}
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>
            
            <div className="relative flex items-center justify-center">
              <Separator className="absolute w-full bg-border-color" />
              <span className="relative px-2 text-xs text-text-secondary bg-bg-card">OR</span>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Choose a username" 
                          className="bg-bg-chart border-border-color" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          className="bg-bg-chart border-border-color" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Create a password" 
                          className="bg-bg-chart border-border-color" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Must be at least 8 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your business name" 
                          className="bg-bg-chart border-border-color" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-bg-chart border-border-color">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-bg-card border-border-color">
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="grocery">Grocery Store</SelectItem>
                          <SelectItem value="cafe">Café</SelectItem>
                          <SelectItem value="bakery">Bakery</SelectItem>
                          <SelectItem value="foodtruck">Food Truck</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent-blue hover:bg-accent-blue/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="text-accent-blue hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}

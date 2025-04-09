import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2, Shield } from 'lucide-react';

// Schema for login validation
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export default function Login() {
  const [location, navigate] = useLocation();
  const { login, user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetupAdmin, setIsSetupAdmin] = useState(false);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Define form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await login(values.username, values.password);
      toast({
        title: 'Login successful',
        description: 'Welcome back! Redirecting to dashboard...',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid username or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Admin account setup function
  const setupAdminAccount = async () => {
    setIsSetupAdmin(true);
    
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Admin Setup Successful',
          description: 'The admin account has been set up. You can now login using username: admin and password: admin123',
          variant: 'default',
        });
        
        // Set form values to admin credentials
        form.setValue('username', 'admin');
        form.setValue('password', 'admin123');
      } else {
        toast({
          title: 'Setup Failed',
          description: data.error || 'Failed to set up admin account',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      toast({
        title: 'Setup Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSetupAdmin(false);
    }
  };
  
  if (isLoading) {
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
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription className="text-text-secondary">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          placeholder="Enter your username" 
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
                          placeholder="Enter your password" 
                          className="bg-bg-chart border-border-color" 
                          {...field} 
                        />
                      </FormControl>
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
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-text-secondary">
              Don't have an account?{' '}
              <Link href="/register" className="text-accent-blue hover:underline">
                Register
              </Link>
            </div>
            
            {/* Demo credentials and admin setup button */}
            <div className="text-xs text-center text-text-secondary border-t border-border-color pt-4 w-full space-y-4">
              <div>
                <p className="mb-2">Demo credentials:</p>
                <p>Username: <span className="font-mono bg-bg-chart p-1 rounded">demo</span></p>
                <p>Password: <span className="font-mono bg-bg-chart p-1 rounded">password123</span></p>
              </div>
              
              <div className="flex flex-col items-center">
                <p className="mb-2">Having trouble logging in?</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setupAdminAccount}
                  disabled={isSetupAdmin}
                  className="text-yellow-500 border-yellow-500 hover:text-yellow-600 hover:border-yellow-600"
                >
                  {isSetupAdmin ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Setting up admin...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-3 w-3" />
                      Reset Admin Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}

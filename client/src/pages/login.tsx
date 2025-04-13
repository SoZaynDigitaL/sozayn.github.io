import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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
import { Loader2, MailCheck, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Schema for login validation
const loginSchema = z.object({
  email: z.string().email({ message: 'Valid email address is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login() {
  const [location, navigate] = useLocation();
  const { login, user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetupAdmin, setIsSetupAdmin] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
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
      email: '',
      password: '',
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast({
        title: 'Login successful',
        description: 'Welcome back! Redirecting to dashboard...',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password reset handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for a password reset link',
      });
      
      setShowResetForm(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password Reset Failed',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };
  
  // Admin account setup function for Supabase (initial user)
  const setupAdminAccount = async () => {
    setIsSetupAdmin(true);
    
    try {
      // In a real implementation, this would call a secure serverless function
      // Here, we'll just simulate the admin setup for demo purposes
      
      // Create the admin user with Supabase auth
      const adminEmail = 'admin@sozayn.com';
      const adminPassword = 'admin123';
      
      // Check if admin exists
      const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
      
      if (fetchError) throw fetchError;
      
      const adminExists = users.some(u => u.email === adminEmail);
      
      if (!adminExists) {
        // Create the admin user using auth admin API
        // Note: In a real implementation, this would be done through a secure admin API
        toast({
          title: 'Admin Setup Required',
          description: 'Please contact the system administrator to set up the admin account.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Admin Setup Successful',
          description: 'The admin account has been set up. You can now login using the admin credentials.',
          variant: 'default',
        });
        
        // Set form values to admin credentials
        form.setValue('email', adminEmail);
        form.setValue('password', adminPassword);
      }
    } catch (error: any) {
      console.error('Admin setup error:', error);
      toast({
        title: 'Setup Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
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
            {showResetForm ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-bg-chart border-border-color"
                    required
                  />
                  <p className="text-xs text-text-secondary">
                    We'll send a password reset link to this email
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowResetForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-accent-blue hover:bg-accent-blue/90"
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MailCheck className="mr-2 h-4 w-4" />
                        Send Link
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
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
                  
                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs text-text-secondary p-0 h-auto"
                      onClick={() => setShowResetForm(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  
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
            )}
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
                <p>Email: <span className="font-mono bg-bg-chart p-1 rounded">demo@sozayn.com</span></p>
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

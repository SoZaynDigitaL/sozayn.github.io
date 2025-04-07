import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import AuthGuidanceDialog from '@/components/auth/AuthGuidanceDialog';
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
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username or email must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(2, 'Please select a business type'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const navigate = useCallback((path: string) => setLocation(path), [setLocation]);
  const { user, login, isLoading } = useAuth();
  const { 
    firebaseUser, 
    signInWithGooglePopup, 
    firebaseLoading,
    showAuthGuidance,
    setShowAuthGuidance,
    currentDomain
  } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Parse tab from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'login' || tab === 'register') {
      setActiveTab(tab);
    }
  }, []);

  // Redirect if already logged in - with fix for maximum update depth
  useEffect(() => {
    // Only run once on component mount to avoid recursive updates
    const checkLogin = () => {
      if (user || firebaseUser) {
        window.location.href = '/dashboard';
      }
    };
    
    checkLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      businessName: '',
      businessType: '',
    },
  });

  const businessTypes = [
    "Restaurant - Independent",
    "Restaurant - Chain",
    "Quick Service",
    "Cafe/Bakery",
    "Food Truck",
    "Ghost Kitchen",
    "Grocery Store",
    "Specialty Food",
    "Catering",
    "Other"
  ];

  // Handle login form submission
  const onLoginSubmit = useCallback(async (data: LoginFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await login(data.username, data.password);
      toast({
        title: "Login successful",
        description: "Welcome back to SoZayn!",
      });
      setIsRedirecting(true);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, login, toast, navigate]);

  // Handle registration form submission
  const onRegisterSubmit = useCallback(async (data: RegisterFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      // Call register mutation here when available
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      toast({
        title: "Registration successful",
        description: "Welcome to SoZayn!",
      });
      
      // Login the user with the credentials
      await login(data.username, data.password);
      setIsRedirecting(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "There was a problem creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, login, toast, navigate]);

  // Handle Google sign-in
  const handleGoogleSignIn = useCallback(async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log("Attempting Google sign-in from auth-page");
      await signInWithGooglePopup();
      // Note: Success toast will be handled in the useFirebaseAuth hook
      // The hook will also handle navigation to dashboard if successful
    } catch (error) {
      console.error("Google sign-in handling error in auth-page:", error);
      // Error toasts will be handled in the useFirebaseAuth hook
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, signInWithGooglePopup]);

  // If user is already logged in or loading auth state, show loading
  if (isLoading || firebaseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-dark">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
          {/* Form Column */}
          <div className="order-2 md:order-1">
            <Card className="bg-bg-card border-border-color shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Welcome to SoZayn</CardTitle>
                <CardDescription>Your Digital Command Center for Restaurant & Grocery Operations</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="login">Log In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Form */}
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username or Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username or email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your password" 
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
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Log In
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6 relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-bg-card px-2 text-text-secondary">Or continue with</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                    >
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>
                  
                  {/* Register Form */}
                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Create a password" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your restaurant or store name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Type</FormLabel>
                              <FormControl>
                                <select 
                                  className="flex h-10 w-full rounded-md border border-border-color bg-bg-dark px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  {...field}
                                >
                                  <option value="">Select business type</option>
                                  {businessTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
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
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Create Account
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6 relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-bg-card px-2 text-text-secondary">Or register with</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                    >
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex justify-center text-text-secondary text-sm">
                By continuing, you agree to SoZayn's Terms of Service and Privacy Policy
              </CardFooter>
            </Card>
          </div>
          
          {/* Hero Column */}
          <div className="order-1 md:order-2 text-center md:text-left">
            <div className="mb-8">
              <div className="inline-block bg-accent-blue/10 text-accent-blue font-medium rounded-full px-3 py-1 text-sm mb-4">
                Welcome to SoZayn
              </div>
              <h1 className="text-4xl font-bold mb-4">Your Digital Command Center</h1>
              <p className="text-text-secondary text-lg mb-6">
                Join thousands of restaurants and grocery businesses that use SoZayn to streamline operations, 
                grow their online presence, and increase profits.
              </p>
              <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-12">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">No commission fees</h3>
                    <p className="text-text-secondary text-sm">Keep all your profits</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent-green/20 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Free trial</h3>
                    <p className="text-text-secondary text-sm">No credit card required</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-bg-card border border-border-color rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-accent-blue"></div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center text-xs text-white">
                    ✓
                  </div>
                </div>
                <div className="ml-4">
                  <p className="font-medium">Jane's Pizza</p>
                  <p className="text-text-secondary text-sm">New York</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-accent-green/10 text-accent-green rounded-full px-2 py-1 text-xs font-medium">
                    35% Growth
                  </div>
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-4">
                "SoZayn helped us eliminate our tablet farm and consolidate all our delivery orders 
                into one system. We've increased our efficiency and profits."
              </p>
              <div className="flex items-center text-accent-yellow">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Firebase Auth Guidance Dialog */}
      <AuthGuidanceDialog 
        open={showAuthGuidance} 
        onOpenChange={setShowAuthGuidance}
        domain={currentDomain}
      />
    </div>
  );
}
import { Route, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  component: React.ComponentType;
  adminOnly?: boolean;
  path: string;
  exact?: boolean;
}

/**
 * Simpler ProtectedRoute component with minimal complexity
 * 
 * This component wraps a Route and adds authentication/authorization checks
 */
export function ProtectedRoute({ 
  component: Component, 
  adminOnly = false, 
  path, 
  exact = true 
}: ProtectedRouteProps) {
  // Get auth context
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // The actual route component
  const ProtectedComponent = (props: any) => {
    // If still loading, show a spinner
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        </div>
      );
    }
    
    // If not authenticated, redirect to auth page
    if (!user) {
      console.log("ProtectedRoute - Not authenticated, redirecting to /auth");
      
      // Use one-time effect for redirection
      useEffect(() => {
        // Use wouter's setLocation for more reliable navigation within React context
        setLocation('/auth');
      }, []);
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
          <span className="ml-2">Redirecting to login page...</span>
        </div>
      );
    }
    
    // If admin-only and user is not admin, redirect to dashboard
    if (adminOnly && user.role !== 'admin') {
      console.log("ProtectedRoute - Not admin, redirecting to /dashboard");
      
      // Use one-time effect for redirection
      useEffect(() => {
        setLocation('/dashboard');
      }, []);
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
          <span className="ml-2">Access denied. Redirecting...</span>
        </div>
      );
    }
    
    // All checks passed, render the actual component
    console.log("ProtectedRoute - Authentication passed, rendering component for", path);
    return <Component {...props} />;
  };
  
  // Use wouter's Route component with the path and our protected component
  return <Route path={path} component={ProtectedComponent} />;
}
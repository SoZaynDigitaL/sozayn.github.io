import { Route, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

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
  
  // The actual route component
  const ProtectedComponent = (props: any) => {
    const [, setLocation] = useLocation();
    
    useEffect(() => {
      // If not authenticated, redirect to auth page
      if (!isLoading && !user) {
        setLocation('/auth');
      }
      
      // If admin-only and user is not admin, redirect to dashboard
      if (!isLoading && user && adminOnly && user.role !== 'admin') {
        setLocation('/dashboard');
      }
    }, [user, isLoading, setLocation]);
    
    // If still loading, show a spinner
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        </div>
      );
    }
    
    // If not authenticated, show spinner while redirecting
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        </div>
      );
    }
    
    // If admin-only and user is not admin, show spinner while redirecting
    if (adminOnly && user.role !== 'admin') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        </div>
      );
    }
    
    // All checks passed, render the actual component
    return <Component {...props} />;
  };
  
  // Use wouter's Route component with the path and our protected component
  return <Route path={path} component={ProtectedComponent} />;
}
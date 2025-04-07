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
    
    // If not authenticated, redirect directly to auth page
    if (!user) {
      console.log("ProtectedRoute - Not authenticated, redirecting to /auth");
      return <Redirect to="/auth" />;
    }
    
    // If admin-only and user is not admin, redirect directly to dashboard
    if (adminOnly && user.role !== 'admin') {
      console.log("ProtectedRoute - Not admin, redirecting to /dashboard");
      return <Redirect to="/dashboard" />;
    }
    
    // All checks passed, render the actual component
    console.log("ProtectedRoute - Authentication passed, rendering component");
    return <Component {...props} />;
  };
  
  // Use wouter's Route component with the path and our protected component
  return <Route path={path} component={ProtectedComponent} />;
}
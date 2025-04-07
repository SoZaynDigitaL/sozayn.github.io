import { Route } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

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
    
    // If not authenticated, redirect to auth page
    if (!user) {
      // Use direct window location change to force a complete page refresh
      // This is more reliable than wouter's navigate which can sometimes fail
      window.location.href = '/auth';
      return null;
    }
    
    // If admin-only and user is not admin, redirect to dashboard
    if (adminOnly && user.role !== 'admin') {
      // Use direct window location change for admin-restricted pages
      window.location.href = '/dashboard';
      return null;
    }
    
    // All checks passed, render the actual component
    return <Component {...props} />;
  };
  
  // Use wouter's Route component with the path and our protected component
  return <Route path={path} component={ProtectedComponent} />;
}
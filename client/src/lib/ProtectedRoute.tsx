import { ReactNode, useEffect } from 'react';
import { useLocation, Route } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType;
  adminOnly?: boolean;
  path: string;
  exact?: boolean;
}

export function ProtectedRoute({ 
  component: Component, 
  adminOnly = false, 
  path, 
  exact = true 
}: ProtectedRouteProps) {
  // Setup auth
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Direct function to handle rendering after auth checks
  const renderComponent = () => {
    // Check auth
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        </div>
      );
    }
    
    if (!user) {
      // Redirect to auth page if not authenticated
      navigate('/auth');
      return null;
    }
    
    if (adminOnly && user.role !== 'admin') {
      // Redirect to dashboard if not admin
      navigate('/dashboard');
      return null;
    }
    
    // If all checks pass, render the component
    return <Component />;
  };

  // For exact paths (most routes)
  if (exact) {
    return (
      <Route path={path}>
        {() => renderComponent()}
      </Route>
    );
  }
  
  // For paths that should match prefixes (nested routes)
  return (
    <Route path={path}>
      {(params) => {
        // If we're exactly on this path or it's a nested path
        if (location === path || location.startsWith(`${path}/`)) {
          return renderComponent();
        }
        return null;
      }}
    </Route>
  );
}
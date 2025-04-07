import { useEffect, useState } from 'react';
import { useLocation, Route, Router } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType;
  adminOnly?: boolean;
  path: string;
  exact?: boolean;
}

/**
 * ProtectedRoute component that handles authentication, authorization,
 * and route matching.
 * 
 * @param component The component to render when all checks pass
 * @param adminOnly Whether this route should only be accessible to admins
 * @param path The path pattern to match
 * @param exact Whether to match the path exactly or as a prefix
 */
export function ProtectedRoute({ 
  component: Component, 
  adminOnly = false, 
  path, 
  exact = true 
}: ProtectedRouteProps) {
  // Auth state
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Check if the current location matches this route
  const isMatch = exact 
    ? location === path 
    : location === path || location.startsWith(`${path}/`);
  
  // For routes that should match exactly, use Route's built-in matching
  if (exact) {
    return (
      <Route path={path}>
        {(params) => {
          if (isLoading) {
            return (
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
              </div>
            );
          }
          
          if (!user) {
            navigate('/auth');
            return null;
          }
          
          if (adminOnly && user.role !== 'admin') {
            navigate('/dashboard');
            return null;
          }
          
          return <Component />;
        }}
      </Route>
    );
  }
  
  // For prefixed routes, only render if we're on a matching path
  // This is important for nested routes
  return (
    <Route path={`${path}/:rest*`}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
            </div>
          );
        }
        
        if (!user) {
          navigate('/auth');
          return null;
        }
        
        if (adminOnly && user.role !== 'admin') {
          navigate('/dashboard');
          return null;
        }
        
        return <Component />;
      }}
    </Route>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export default function NotFound() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Skip rendering 404 for auth and dashboard pages - direct approach
  if (location.startsWith('/login') || 
      location.startsWith('/register') || 
      location.startsWith('/dashboard') || 
      location.startsWith('/auth')) {
    return null;
  }

  // Also using the existing logic for other routes
  const validRoutes = [
    "/",
    "/plans",
    "/about",
    "/support",
    "/privacy",
    "/terms",
    "/cookies",
    "/test-firebase",
    "/test-firebase-updated",
  ];

  // Check if current location is a valid route
  const isValid = validRoutes.some(route => location === route);
  
  // If we're on a valid route, don't render anything
  if (isValid) {
    return null;
  }

  // Determine where "Back" should take the user
  const backTo = user ? "/dashboard" : "/";
  const backLabel = user ? "Back to Dashboard" : "Back to Home";

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-border-color bg-bg-card">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-blue/10 mb-6">
                <AlertCircle className="h-10 w-10 text-accent-blue" />
              </div>

              <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>

              <p className="text-text-secondary mb-8">
                The page you're looking for doesn't exist or is currently under
                construction.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Link href={backTo}>
                    <ArrowLeft className="h-4 w-4" />
                    {backLabel}
                  </Link>
                </Button>

                <Button
                  asChild
                  className="bg-accent-blue hover:bg-accent-blue/90"
                >
                  <Link href="/support">Contact Support</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

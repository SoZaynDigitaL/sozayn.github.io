import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/useAuth";
import { FirebaseAuthProvider } from "./hooks/useFirebaseAuth";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Orders from "@/pages/dashboard/orders";
import Clients from "@/pages/dashboard/clients";
import Integrations from "@/pages/dashboard/integrations";
import Loyalty from "@/pages/dashboard/loyalty";
import Marketing from "@/pages/dashboard/marketing";
import POS from "@/pages/dashboard/pos";
import ECommerce from "@/pages/dashboard/e-commerce";
import Settings from "@/pages/dashboard/settings";
import ManagementPage from "@/pages/dashboard/management";
import DeliveryPartners from "@/pages/dashboard/delivery-partners";
import POSIntegration from "@/pages/dashboard/pos-integration";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import PaymentSuccess from "@/pages/payment-success";
import SubscriptionSuccess from "@/pages/subscription-success";
import PayPalCheckout from "@/pages/paypal-checkout";
import PayPalSuccess from "@/pages/paypal-success";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Dashboard routes - available to all authenticated users */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard/orders" component={Orders} />
      
      {/* Admin-only routes */}
      <ProtectedRoute path="/dashboard/clients" component={Clients} adminOnly />
      <ProtectedRoute path="/dashboard/integrations" component={Integrations} adminOnly />
      <ProtectedRoute path="/dashboard/e-commerce" component={ECommerce} />
      <ProtectedRoute path="/dashboard/loyalty" component={Loyalty} adminOnly />
      <ProtectedRoute path="/dashboard/marketing" component={Marketing} adminOnly />
      <ProtectedRoute path="/dashboard/management" component={ManagementPage} adminOnly />
      <ProtectedRoute path="/dashboard/pos" component={POS} adminOnly />
      <ProtectedRoute path="/dashboard/pos-integration" component={POSIntegration} />
      <ProtectedRoute path="/dashboard/delivery-partners" component={DeliveryPartners} />
      <ProtectedRoute path="/dashboard/settings" component={Settings} />
      
      {/* Payment routes - protected but available to all users */}
      <ProtectedRoute path="/checkout" component={Checkout} />
      <ProtectedRoute path="/paypal-checkout" component={PayPalCheckout} />
      <ProtectedRoute path="/subscribe" component={Subscribe} />
      <ProtectedRoute path="/payment-success" component={PaymentSuccess} />
      <ProtectedRoute path="/paypal-success" component={PayPalSuccess} />
      <ProtectedRoute path="/subscription-success" component={SubscriptionSuccess} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;

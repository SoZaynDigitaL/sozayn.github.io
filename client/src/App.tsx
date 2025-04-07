import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/useAuth";
import { FirebaseAuthProvider } from "./hooks/useFirebaseAuth";
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
import ECommerce from "@/pages/dashboard/ecommerce";
import Settings from "@/pages/dashboard/settings";
import ManagementPage from "@/pages/dashboard/management";
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
      
      {/* Dashboard routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/orders" component={Orders} />
      <Route path="/dashboard/clients" component={Clients} />
      <Route path="/dashboard/integrations" component={Integrations} />
      <Route path="/dashboard/ecommerce" component={ECommerce} />
      <Route path="/dashboard/loyalty" component={Loyalty} />
      <Route path="/dashboard/marketing" component={Marketing} />
      <Route path="/dashboard/management" component={ManagementPage} />
      <Route path="/dashboard/pos" component={POS} />
      <Route path="/dashboard/settings" component={Settings} />
      
      {/* Payment routes */}
      <Route path="/checkout" component={Checkout} />
      <Route path="/paypal-checkout" component={PayPalCheckout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/paypal-success" component={PayPalSuccess} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      
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

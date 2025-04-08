import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Orders from "@/pages/dashboard/orders";
import Integrations from "@/pages/dashboard/integrations";
import Loyalty from "@/pages/dashboard/loyalty";
import Marketing from "@/pages/dashboard/marketing";
import POS from "@/pages/dashboard/pos";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import Contact from "@/pages/contact";
import PaymentSuccess from "@/pages/payment-success";
import SubscriptionSuccess from "@/pages/subscription-success";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Dashboard routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/orders" component={Orders} />
      <Route path="/dashboard/integrations" component={Integrations} />
      <Route path="/dashboard/loyalty" component={Loyalty} />
      <Route path="/dashboard/marketing" component={Marketing} />
      <Route path="/dashboard/pos" component={POS} />
      
      {/* Payment routes */}
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/contact" component={Contact} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

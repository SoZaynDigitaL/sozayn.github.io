import { Route } from "wouter";
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
import MarketingSEO from "@/pages/dashboard/marketing/seo";
import MarketingEmail from "@/pages/dashboard/marketing/email";
import MarketingAutomated from "@/pages/dashboard/marketing/automated";
import SocialMedia from "@/pages/dashboard/social-media";
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
import Plans from "@/pages/plans";

function Router() {
  return (
    <>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/plans" component={Plans} />
      
      {/* Protected Dashboard routes - available to all authenticated users */}
      <ProtectedRoute path="/dashboard" component={Dashboard} exact />
      <ProtectedRoute path="/dashboard/orders" component={Orders} exact />
      
      {/* Admin-only routes */}
      <ProtectedRoute path="/dashboard/clients" component={Clients} adminOnly exact />
      <ProtectedRoute path="/dashboard/integrations" component={Integrations} adminOnly exact />
      <ProtectedRoute path="/dashboard/e-commerce" component={ECommerce} exact />
      <ProtectedRoute path="/dashboard/loyalty" component={Loyalty} adminOnly exact />
      
      {/* Marketing routes with exact matching for specific content */}
      <ProtectedRoute path="/dashboard/marketing" component={Marketing} adminOnly exact />
      <ProtectedRoute path="/dashboard/marketing/seo" component={MarketingSEO} adminOnly exact />
      <ProtectedRoute path="/dashboard/marketing/email" component={MarketingEmail} adminOnly exact />
      <ProtectedRoute path="/dashboard/marketing/automated" component={MarketingAutomated} adminOnly exact />
      
      <ProtectedRoute path="/dashboard/social-media" component={SocialMedia} exact />
      <ProtectedRoute path="/dashboard/management" component={ManagementPage} adminOnly exact />
      <ProtectedRoute path="/dashboard/pos" component={POS} adminOnly exact />
      <ProtectedRoute path="/dashboard/pos-integration" component={POSIntegration} exact />
      <ProtectedRoute path="/dashboard/delivery-partners" component={DeliveryPartners} exact />
      <ProtectedRoute path="/dashboard/settings" component={Settings} exact />
      
      {/* Payment routes - protected but available to all users */}
      <ProtectedRoute path="/checkout" component={Checkout} exact />
      <ProtectedRoute path="/paypal-checkout" component={PayPalCheckout} exact />
      <ProtectedRoute path="/subscribe" component={Subscribe} exact />
      <ProtectedRoute path="/payment-success" component={PaymentSuccess} exact />
      <ProtectedRoute path="/paypal-success" component={PayPalSuccess} exact />
      <ProtectedRoute path="/subscription-success" component={SubscriptionSuccess} exact />
      
      {/* Fallback to 404 */}
      <Route path="/:rest*">
        {() => <NotFound />}
      </Route>
    </>
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

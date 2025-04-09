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
import Webhooks from "@/pages/dashboard/webhooks";
import Settings from "@/pages/dashboard/settings";
import TestOrder from "@/pages/dashboard/test-order";
import DeliveryPartners from "@/pages/dashboard/delivery-partners-new";
import Users from "@/pages/dashboard/admin/users";
import AdminWebhooks from "@/pages/dashboard/admin/webhooks";
import Ecommerce from "@/pages/dashboard/ecommerce";
import ShopifyIntegration from "@/pages/dashboard/ecommerce/shopify";
import WooCommerceIntegration from "@/pages/dashboard/ecommerce/woocommerce";
import MagentoIntegration from "@/pages/dashboard/ecommerce/magento";
import BigCommerceIntegration from "@/pages/dashboard/ecommerce/bigcommerce";
import SquarespaceIntegration from "@/pages/dashboard/ecommerce/squarespace";
import WixIntegration from "@/pages/dashboard/ecommerce/wix";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import Contact from "@/pages/contact";
import PaymentSuccess from "@/pages/payment-success";
import SubscriptionSuccess from "@/pages/subscription-success";
import ManageSubscription from "@/pages/manage-subscription";

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
      <Route path="/dashboard/test-order" component={TestOrder} />
      <Route path="/dashboard/delivery-partners" component={DeliveryPartners} />
      <Route path="/dashboard/webhooks" component={Webhooks} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route path="/dashboard/admin/users" component={Users} />
      <Route path="/dashboard/admin/webhooks" component={AdminWebhooks} />
      
      {/* E-commerce platform routes */}
      <Route path="/dashboard/ecommerce" component={Ecommerce} />
      <Route path="/dashboard/ecommerce/shopify" component={ShopifyIntegration} />
      <Route path="/dashboard/ecommerce/woocommerce" component={WooCommerceIntegration} />
      <Route path="/dashboard/ecommerce/magento" component={MagentoIntegration} />
      <Route path="/dashboard/ecommerce/bigcommerce" component={BigCommerceIntegration} />
      <Route path="/dashboard/ecommerce/squarespace" component={SquarespaceIntegration} />
      <Route path="/dashboard/ecommerce/wix" component={WixIntegration} />
      
      {/* Payment routes */}
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/manage-subscription" component={ManageSubscription} />
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

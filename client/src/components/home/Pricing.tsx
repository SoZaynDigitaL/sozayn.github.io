import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-bg-dark to-bg-dark/90">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Simple, Transparent Pricing</h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
          Choose the plan that best fits your business needs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-card/70 p-6 
                shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <h3 className="text-xl font-semibold mb-2">Starter</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-text-secondary text-sm">/month</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">Perfect for small businesses just getting started</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Up to 100 deliveries/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Shopify integration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Access to UberDirect and JetGo</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Basic analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Email support</span>
              </li>
            </ul>
            
            <Link to="/checkout">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </div>
          
          {/* Professional Plan - Highlighted */}
          <div className="rounded-xl border border-primary bg-card/80 p-6 
                shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 duration-300
                relative z-10 scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-semibold py-1 px-3 rounded-full">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-text-secondary text-sm">/month</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">Ideal for growing businesses with higher volume</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Up to 500 deliveries/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Shopify integration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Access to UberDirect and JetGo</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Advanced analytics dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Priority email & chat support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Custom delivery rules</span>
              </li>
            </ul>
            
            <Link to="/subscribe">
              <Button className="w-full">Subscribe Now</Button>
            </Link>
          </div>
          
          {/* Enterprise Plan */}
          <div className="rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-card/70 p-6 
                shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">Custom</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">For large-scale operations with custom needs</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Unlimited deliveries</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Shopify integration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Access to UberDirect and JetGo</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Advanced analytics & reporting</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">24/7 priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Custom delivery rules</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">SLA guarantees</span>
              </li>
            </ul>
            
            <Link to="/contact">
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
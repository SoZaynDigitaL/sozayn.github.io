import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "wouter";

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  highlight = false,
  cta = "Get Started"
}: { 
  title: string;
  price: string;
  description: string;
  features: { name: string; included: boolean; note?: string }[];
  highlight?: boolean;
  cta?: string;
}) => {
  return (
    <div className={`rounded-xl border ${highlight ? 'border-accent-blue shadow-md shadow-accent-blue/20' : 'border-border-color'} p-6 flex flex-col h-full glow-effect ${highlight ? 'shadow-glow-blue-sm' : ''}`}>
      <div className="mb-5">
        <h3 className="text-xl font-bold glow-text">{title}</h3>
        <div className="mt-3">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Free" && <span className="text-text-secondary">/month</span>}
        </div>
        <p className="mt-2 text-text-secondary">{description}</p>
      </div>
      
      <div className="space-y-3 flex-grow">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            {feature.included ? (
              <Check className="h-5 w-5 text-accent-green flex-shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 text-text-secondary flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className={feature.included ? "" : "text-text-secondary"}>
                {feature.name}
              </span>
              {feature.note && (
                <span className="block text-xs text-text-secondary">
                  {feature.note}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <Link href="/auth?tab=register">
          <Button 
            className={`w-full ${highlight ? 'bg-accent-blue hover:bg-accent-blue/90 glow-button-blue' : 'glow-border-blue'}`}
            variant={highlight ? "default" : "outline"}
          >
            {cta}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default function Pricing() {
  const starterFeatures = [
    { name: "Online Ordering", included: true },
    { name: "Admin Dashboard", included: true },
    { name: "POS Sync/API", included: false },
    { name: "Loyalty & Rewards", included: false },
    { name: "Delivery Integrations", included: false },
    { name: "Custom Domain", included: false },
    { name: "Multi-location Support", included: false },
    { name: "Analytics & Reports", included: true, note: "Basic" },
    { name: "Support", included: true, note: "Community Only" },
  ];
  
  const growthFeatures = [
    { name: "Online Ordering", included: true },
    { name: "Admin Dashboard", included: true },
    { name: "POS Sync/API", included: true },
    { name: "Loyalty & Rewards", included: true },
    { name: "Delivery Integrations", included: true, note: "UberDirect only" },
    { name: "Custom Domain", included: true },
    { name: "Multi-location Support", included: false },
    { name: "Analytics & Reports", included: true, note: "Advanced" },
    { name: "Support", included: true, note: "Email Support" },
  ];
  
  const proFeatures = [
    { name: "Online Ordering", included: true },
    { name: "Admin Dashboard", included: true },
    { name: "POS Sync/API", included: true },
    { name: "Loyalty & Rewards", included: true, note: "with tiers" },
    { name: "Delivery Integrations", included: true, note: "Uber, Relay, Jet, more" },
    { name: "Custom Domain", included: true },
    { name: "Multi-location Support", included: true },
    { name: "Analytics & Reports", included: true, note: "Premium" },
    { name: "Support", included: true, note: "Priority Support" },
  ];

  return (
    <section id="pricing" className="py-16 bg-bg-dark relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Honest Pricing — Built to Save You Money
          </h2>
          <p className="text-text-secondary text-lg">
            No commissions. No hidden fees. Just the tools you need to run and grow your food business — online and offline.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <PricingTier
            title="Starter 🍽️"
            price="Free"
            description="Just getting started"
            features={starterFeatures}
            cta="Try It Free"
          />
          
          <PricingTier
            title="Growth 🚀"
            price="$29"
            description="Growing locations"
            features={growthFeatures}
            highlight={true}
            cta="Start Free Trial"
          />
          
          <PricingTier
            title="Pro 🔥"
            price="$79"
            description="Full-service operations"
            features={proFeatures}
            cta="Start Free Trial"
          />
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-xl font-medium mb-4">
            Try it Free Today — No Credit Card Required
          </p>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Start saving on every order. Keep your profits, own your data, and give your customers the experience they deserve.
          </p>
          <Link href="/auth?tab=register">
            <Button className="px-8 py-6 h-auto text-lg bg-accent-blue hover:bg-accent-blue/90 glow-button-blue">
              Get Started Now
            </Button>
          </Link>
          
          <p className="mt-8 text-text-secondary italic">
            Want to migrate from another platform? We'll help you switch — for free.
          </p>
        </div>
      </div>
    </section>
  );
}
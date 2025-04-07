import React from 'react';
import { Check, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlans, Plan, Feature } from '@/hooks/usePlans';
import { useAuth } from '@/hooks/useAuth';
import { PlanType } from '@/lib/plans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PlansPage() {
  const { plans, userPlan, isLoadingPlans, upgradePlanMutation } = usePlans();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly');

  // Handle plan upgrade
  const handleUpgrade = (planId: PlanType) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Don't allow upgrading to the current plan
    if (userPlan && userPlan.id === planId) {
      return;
    }

    upgradePlanMutation.mutate({ planId, billingCycle });
  };

  // Get pricing based on billing cycle
  const getPrice = (plan: Plan) => {
    return billingCycle === 'monthly' 
      ? plan.priceMonthly 
      : Math.round(plan.priceAnnual / 12);
  };

  // Calculate annual savings
  const getAnnualSavings = (plan: Plan) => {
    return Math.round(plan.priceMonthly * 12 - plan.priceAnnual);
  };

  // Render feature availability icon
  const renderFeatureAvailability = (available: boolean) => {
    return available ? (
      <Check className="h-5 w-5 text-green-500" />
    ) : (
      <X className="h-5 w-5 text-red-500" />
    );
  };

  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-center">No subscription plans available</h1>
        <p className="text-center text-muted-foreground mt-2">Please check back later.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  // Get all unique features across all plans
  const allFeatures: Feature[] = [];
  plans.forEach(plan => {
    plan.features.forEach(feature => {
      if (!allFeatures.some(f => f.id === feature.id)) {
        allFeatures.push(feature);
      }
    });
  });

  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.priceMonthly - b.priceMonthly);

  return (
    <div className="container py-16 px-4 md:px-6">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold">Choose the Right Plan for Your Business</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Select a plan that best fits your needs. All plans include access to our core features.
        </p>
        
        <Tabs defaultValue="monthly" className="mt-6" onValueChange={(value) => setBillingCycle(value as 'monthly' | 'annual')}>
          <TabsList className="grid w-64 grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>
          <p className="text-sm text-muted-foreground mt-2">
            {billingCycle === 'annual' ? 'Save with annual billing' : 'Flexible monthly billing'}
          </p>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPlans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col ${plan.isPopular ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader>
              {plan.isPopular && (
                <Badge className="self-start mb-2">Most Popular</Badge>
              )}
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <p className="text-3xl font-bold">
                  ${getPrice(plan)}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-green-500 font-medium">
                    Save ${getAnnualSavings(plan)} per year
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                {allFeatures.map((feature) => {
                  const included = plan.features.some(f => f.id === feature.id);
                  return (
                    <div key={feature.id} className="flex items-center gap-2">
                      {renderFeatureAvailability(included)}
                      <span className={!included ? 'text-muted-foreground' : ''}>
                        {feature.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleUpgrade(plan.id as PlanType)}
                variant={userPlan?.id === plan.id ? "outline" : "default"}
                disabled={upgradePlanMutation.isPending || (userPlan?.id === plan.id)}
              >
                {upgradePlanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : userPlan?.id === plan.id ? (
                  'Current Plan'
                ) : (
                  `Get ${plan.name}`
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          For larger businesses with specific requirements, we offer custom enterprise plans 
          with dedicated support and additional features.
        </p>
        <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
          Contact Sales
        </Button>
      </div>
    </div>
  );
}
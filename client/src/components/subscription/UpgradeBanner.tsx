import React from 'react';
import { usePlans } from '@/hooks/usePlans';
import { PlanType } from '@/lib/plans';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';

interface UpgradeBannerProps {
  featureId: string;
  title?: string;
  description?: string;
}

export function UpgradeBanner({ 
  featureId, 
  title = "Unlock This Feature", 
  description 
}: UpgradeBannerProps) {
  const { userPlan, hasFeature, getRecommendedPlanForFeature, isSubscriptionExpired } = usePlans();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  
  // If the user has access to this feature, don't show the banner
  if (hasFeature(featureId) && !isSubscriptionExpired()) {
    return null;
  }
  
  const recommendedPlan = getRecommendedPlanForFeature(featureId);
  
  // If no plan includes this feature (shouldn't happen), don't show the banner
  if (!recommendedPlan) {
    return null;
  }
  
  const handleUpgrade = () => {
    navigate('/plans');
  };
  
  const isExpired = isSubscriptionExpired() && userPlan?.features.some(f => f.id === featureId);
  
  return (
    <Card className="bg-primary/5 border-primary/20 mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-lg">
                {isExpired ? "Your Subscription Has Expired" : title}
              </h3>
              <p className="text-muted-foreground">
                {isExpired 
                  ? "Please renew your subscription to continue using this feature." 
                  : description || `Upgrade to the ${recommendedPlan.name} plan to access this feature.`}
              </p>
            </div>
          </div>
          <Button onClick={handleUpgrade} className="shrink-0">
            {isExpired ? "Renew Now" : "Upgrade Now"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureAccessProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureAccess({ featureId, children, fallback }: FeatureAccessProps) {
  const { hasFeature, isSubscriptionExpired } = usePlans();
  
  const hasAccess = hasFeature(featureId) && !isSubscriptionExpired();
  
  if (!hasAccess) {
    return fallback ? (
      <>
        <UpgradeBanner featureId={featureId} />
        {fallback}
      </>
    ) : (
      <div className="space-y-4">
        <UpgradeBanner featureId={featureId} />
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-muted/20 rounded-lg">
          <h3 className="text-lg font-medium">Feature Not Available</h3>
          <p className="text-muted-foreground text-center mt-2 max-w-md">
            This feature is not included in your current plan. 
            Please upgrade to access this functionality.
          </p>
        </div>
      </div>
    );
  }
  
  return children;
}
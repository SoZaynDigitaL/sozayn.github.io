import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FEATURES } from '@/lib/plans';
import { LockIcon, UnlockIcon } from 'lucide-react';

/**
 * Example component showing different ways to use feature access control
 */
export function FeatureAccessExample() {
  const { 
    canAccess, 
    handleFeatureAccess, 
    FeatureGate, 
    PremiumFeatureBadge, 
    UpgradeDialog 
  } = useFeatureAccess();

  // Method 1: Direct check with custom handling
  const handleAdvancedAnalyticsClick = () => {
    if (canAccess(FEATURES.ADVANCED_ANALYTICS.id)) {
      // Navigate to analytics or show advanced analytics UI
      console.log('Showing advanced analytics...');
    } else {
      // Custom handling (in this case we'll rely on the button being disabled)
      console.log('Advanced analytics not available in your plan');
    }
  };

  // Method 2: Using the handleFeatureAccess helper
  const handleMarketingAutomationClick = () => {
    if (handleFeatureAccess(FEATURES.EMAIL_MARKETING.id)) {
      // This only runs if user has access
      console.log('Showing marketing automation tools...');
    }
    // No need for else - handleFeatureAccess shows the upgrade dialog automatically
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Feature Access Control Examples</h2>
      
      {/* Example 1: Direct canAccess check with disabled button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Advanced Analytics
            <span className="ml-2">
              <PremiumFeatureBadge featureId={FEATURES.ADVANCED_ANALYTICS.id} />
            </span>
          </CardTitle>
          <CardDescription>
            Dive deep into your business data with advanced analytics and reporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            {canAccess(FEATURES.ADVANCED_ANALYTICS.id) 
              ? 'You have access to Advanced Analytics in your current plan.' 
              : 'Upgrade your plan to unlock Advanced Analytics capabilities.'}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            disabled={!canAccess(FEATURES.ADVANCED_ANALYTICS.id)} 
            onClick={handleAdvancedAnalyticsClick}
          >
            {canAccess(FEATURES.ADVANCED_ANALYTICS.id) 
              ? <><UnlockIcon className="w-4 h-4 mr-2" /> Access Analytics</> 
              : <><LockIcon className="w-4 h-4 mr-2" /> Locked Feature</>}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Example 2: Using the handleFeatureAccess helper which shows upgrade dialog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Marketing Automation
            <span className="ml-2">
              <PremiumFeatureBadge featureId={FEATURES.EMAIL_MARKETING.id} />
            </span>
          </CardTitle>
          <CardDescription>
            Create powerful automated marketing campaigns for your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Marketing automation helps you create targeted campaigns that 
            trigger based on customer behavior and preferences.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleMarketingAutomationClick}>
            Launch Marketing Tools
          </Button>
        </CardFooter>
      </Card>
      
      {/* Example 3: Using the FeatureGate component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            POS Integration
            <span className="ml-2">
              <PremiumFeatureBadge featureId={FEATURES.POS_INTEGRATION.id} />
            </span>
          </CardTitle>
          <CardDescription>
            Connect your physical point-of-sale systems with your online presence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Integrate with popular POS systems to synchronize inventory, orders, and customer data.
          </p>
        </CardContent>
        <CardFooter>
          {/* FeatureGate automatically handles rendering based on access */}
          <FeatureGate
            featureId={FEATURES.POS_INTEGRATION.id}
            fallback={
              <Button variant="outline">
                <LockIcon className="w-4 h-4 mr-2" /> Upgrade to Access
              </Button>
            }
          >
            <Button>
              <UnlockIcon className="w-4 h-4 mr-2" /> Configure POS Integration
            </Button>
          </FeatureGate>
        </CardFooter>
      </Card>
      
      {/* The upgrade dialog - will show when handleFeatureAccess is called */}
      <UpgradeDialog />
    </div>
  );
}
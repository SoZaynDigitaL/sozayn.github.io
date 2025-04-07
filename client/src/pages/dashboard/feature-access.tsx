import DashboardLayout from '@/components/layout/DashboardLayout';
import { FeatureAccessExample } from '@/components/features/FeatureAccessExample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

/**
 * Feature Access Documentation Page
 * 
 * This page demonstrates how to implement feature access controls
 * in the application based on user subscription plans.
 */
export default function FeatureAccessPage() {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Feature Access Control</h1>
        
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Documentation Page</AlertTitle>
          <AlertDescription>
            This page demonstrates how to implement feature access controls based on user subscription plans.
            Developers can use these patterns throughout the application.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="examples">
          <TabsList className="mb-4">
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="usage">Usage Guide</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>
          
          <TabsContent value="examples">
            <FeatureAccessExample />
          </TabsContent>
          
          <TabsContent value="usage">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">How to Implement Feature Access Control</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">1. Import the useFeatureAccess hook</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-x-auto">
                      <code>{`import { useFeatureAccess } from '@/hooks/useFeatureAccess';`}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">2. Use the hook in your component</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-x-auto">
                      <code>{`const { 
  canAccess, 
  handleFeatureAccess, 
  FeatureGate, 
  PremiumFeatureBadge, 
  UpgradeDialog 
} = useFeatureAccess();`}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">3. Check feature access with canAccess</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-x-auto">
                      <code>{`if (canAccess(FEATURES.ADVANCED_ANALYTICS.id)) {
  // User has access to the feature
} else {
  // User doesn't have access
}`}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">4. Use handleFeatureAccess for automatic upgrade dialogs</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-x-auto">
                      <code>{`const handleFeatureClick = () => {
  if (handleFeatureAccess(FEATURES.EMAIL_MARKETING.id)) {
    // This only runs if user has access
    // If they don't, an upgrade dialog is shown automatically
  }
};`}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">5. Use the FeatureGate component</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-x-auto">
                      <code>{`<FeatureGate
  featureId={FEATURES.POS_INTEGRATION.id}
  fallback={<p>Upgrade to access this feature</p>}
>
  {/* Content only shown to users with access */}
  <p>You have access to this feature</p>
</FeatureGate>`}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">6. Add the UpgradeDialog component</h3>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-x-auto">
                      <code>{`// Add this at the end of your component
<UpgradeDialog />`}</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="api">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">API Reference</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold">canAccess(featureId: string): boolean</h3>
                    <p className="text-muted-foreground mt-1">
                      Checks if the current user has access to a specific feature.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">handleFeatureAccess(featureId: string): boolean</h3>
                    <p className="text-muted-foreground mt-1">
                      Checks access and automatically shows the upgrade dialog if the user doesn't have access.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{'<FeatureGate />'}</h3>
                    <p className="text-muted-foreground mt-1">
                      Component that conditionally renders content based on feature access.
                    </p>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-x-auto">
                      <code>{`Props:
- featureId: string - The feature ID to check
- children: React.ReactNode - Content to show if user has access
- fallback?: React.ReactNode - Optional content to show if user doesn't have access`}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{'<PremiumFeatureBadge />'}</h3>
                    <p className="text-muted-foreground mt-1">
                      Component that shows a badge for premium features.
                    </p>
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-x-auto">
                      <code>{`Props:
- featureId: string - The feature ID to check`}</code>
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{'<UpgradeDialog />'}</h3>
                    <p className="text-muted-foreground mt-1">
                      Dialog component that shows an upgrade prompt.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
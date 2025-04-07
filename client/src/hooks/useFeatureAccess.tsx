import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to check if the current user has access to a specific feature
 * and provide UI components for handling feature access
 */
export function useFeatureAccess() {
  const { user } = useAuth();
  const { hasFeature, userPlan, getRecommendedPlanForFeature } = usePlans();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [featureId, setFeatureId] = useState<string | null>(null);
  const [, navigate] = useLocation();

  /**
   * Check if the user has access to a specific feature
   * @param featureId The feature ID to check
   * @returns True if the user has access, false otherwise
   */
  const canAccess = (featureId: string): boolean => {
    // Admin users have access to all features
    if (user?.role === 'admin') return true;
    
    // Check if the user's plan includes the feature
    return hasFeature(featureId);
  };

  /**
   * Handle a feature access attempt
   * - If the user has access, returns true
   * - If not, shows the upgrade dialog and returns false
   * 
   * @param featureId The feature ID to check
   * @returns True if the user has access, false otherwise
   */
  const handleFeatureAccess = (featureId: string): boolean => {
    if (canAccess(featureId)) {
      return true;
    }
    
    // Show upgrade dialog
    setFeatureId(featureId);
    setUpgradeDialogOpen(true);
    return false;
  };

  /**
   * UI component for handling access to gated features
   * Wraps children in a component that checks for feature access
   * 
   * @param featureId The feature ID required to access
   * @param children The components to render if the user has access
   * @param fallback Optional component to render if the user doesn't have access
   */
  const FeatureGate = ({ 
    featureId, 
    children, 
    fallback = null 
  }: { 
    featureId: string, 
    children: React.ReactNode, 
    fallback?: React.ReactNode 
  }) => {
    if (canAccess(featureId)) {
      return <>{children}</>;
    }
    
    return <>{fallback}</>;
  };

  /**
   * UI component for showing a tooltip/badge for premium features
   */
  const PremiumFeatureBadge = ({ 
    featureId 
  }: { 
    featureId: string 
  }) => {
    if (canAccess(featureId)) {
      return null;
    }
    
    const recommendedPlan = getRecommendedPlanForFeature(featureId);
    
    return (
      <div className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-md">
        {recommendedPlan ? `${recommendedPlan.name} Plan+` : 'Premium'}
      </div>
    );
  };

  /**
   * Upgrade dialog component
   */
  const UpgradeDialog = () => {
    const recommendedPlan = featureId ? getRecommendedPlanForFeature(featureId) : null;
    
    return (
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              This feature is only available on the {recommendedPlan?.name || 'higher tier'} plan or above.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <p>
              Your current plan: <span className="font-medium">{userPlan?.name || 'Free'}</span>
            </p>
            <p>
              To access this feature and more, please upgrade your subscription.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setUpgradeDialogOpen(false);
              navigate('/plans');
            }}>
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return {
    canAccess,
    handleFeatureAccess,
    FeatureGate,
    PremiumFeatureBadge,
    UpgradeDialog
  };
}
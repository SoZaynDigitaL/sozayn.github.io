import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PlanType } from '@/lib/plans';

export interface Feature {
  id: string;
  name: string;
  description: string;
}

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  features: Feature[];
  stripeMonthlyPriceId?: string;
  stripeAnnualPriceId?: string;
  paypalMonthlyPlanId?: string;
  paypalAnnualPlanId?: string;
  isPopular?: boolean;
}

export interface UserPlan extends Plan {
  planExpiresAt?: string | null;
}

export function usePlans() {
  const { toast } = useToast();

  // Get all available plans
  const {
    data: plans,
    isLoading: isLoadingPlans,
    error: plansError
  } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    queryFn: getQueryFn({ on401: 'returnNull' })
  });

  // Get the current user's plan
  const {
    data: userPlan,
    isLoading: isLoadingUserPlan,
    error: userPlanError
  } = useQuery<UserPlan>({
    queryKey: ['/api/user/plan'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!queryClient.getQueryData(['/api/auth/me'])
  });

  // Upgrade plan mutation
  const upgradePlanMutation = useMutation({
    mutationFn: async ({ planId, billingCycle }: { planId: PlanType, billingCycle: 'monthly' | 'annual' }) => {
      const res = await apiRequest('POST', '/api/user/plan/upgrade', { planId, billingCycle });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Plan upgrade initiated',
        description: 'You will be redirected to complete the payment.',
        variant: 'default',
      });

      // If the backend returns a redirect URL, navigate to it
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to upgrade plan',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const res = await apiRequest('POST', '/api/subscription/cancel', { subscriptionId });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Subscription canceled',
        description: data.message,
        variant: 'default',
      });
      // Invalidate user plan query
      queryClient.invalidateQueries({ queryKey: ['/api/user/plan'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to cancel subscription',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Helper function to check if a feature is included in user's plan
  const hasFeature = (featureId: string): boolean => {
    if (!userPlan) return false;
    return userPlan.features.some(feature => feature.id === featureId);
  };

  // Helper function to check if subscription has expired
  const isSubscriptionExpired = (): boolean => {
    if (!userPlan || !userPlan.planExpiresAt) return false;
    return new Date(userPlan.planExpiresAt) < new Date();
  };

  // Helper function to get the recommended upgrade plan for a specific feature
  const getRecommendedPlanForFeature = (featureId: string): Plan | undefined => {
    if (!plans) return undefined;
    
    // Return the cheapest plan that includes the feature
    return plans
      .filter(plan => plan.features.some(feature => feature.id === featureId))
      .sort((a, b) => a.priceMonthly - b.priceMonthly)[0];
  };

  return {
    plans,
    userPlan,
    isLoadingPlans,
    isLoadingUserPlan,
    plansError,
    userPlanError,
    upgradePlanMutation,
    cancelSubscriptionMutation,
    hasFeature,
    isSubscriptionExpired,
    getRecommendedPlanForFeature
  };
}
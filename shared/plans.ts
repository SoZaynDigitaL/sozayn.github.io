// Subscription plan definitions for SoZayn platform

export enum PlanType {
  FREE = 'free',
  GROWTH = 'growth',
  PRO = 'pro'
}

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
  features: string[]; // Array of feature IDs
  stripeMonthlyPriceId?: string; // Stripe price ID for monthly billing
  stripeAnnualPriceId?: string;  // Stripe price ID for annual billing
  paypalMonthlyPlanId?: string;  // PayPal plan ID for monthly billing
  paypalAnnualPlanId?: string;   // PayPal plan ID for annual billing
  isPopular?: boolean;
}

// Define all available features
export const FEATURES: Record<string, Feature> = {
  ONLINE_ORDERING: {
    id: 'ONLINE_ORDERING',
    name: 'Online Ordering',
    description: 'Allow customers to place orders directly through your platform'
  },
  BASIC_ANALYTICS: {
    id: 'BASIC_ANALYTICS',
    name: 'Basic Analytics',
    description: 'View simple analytics about your orders and customers'
  },
  ADVANCED_ANALYTICS: {
    id: 'ADVANCED_ANALYTICS',
    name: 'Advanced Analytics',
    description: 'In-depth business intelligence and predictive analytics'
  },
  SOCIAL_MEDIA_INTEGRATION: {
    id: 'SOCIAL_MEDIA_INTEGRATION',
    name: 'Social Media Integration',
    description: 'Connect and post to your social media accounts'
  },
  EMAIL_MARKETING: {
    id: 'EMAIL_MARKETING',
    name: 'Email Marketing',
    description: 'Create and send email campaigns to your customers'
  },
  SMS_MARKETING: {
    id: 'SMS_MARKETING',
    name: 'SMS Marketing',
    description: 'Send promotional messages directly to customer phones'
  },
  LOYALTY_PROGRAM: {
    id: 'LOYALTY_PROGRAM',
    name: 'Loyalty & Rewards Program',
    description: 'Create a rewards program to encourage repeat business'
  },
  POS_INTEGRATION: {
    id: 'POS_INTEGRATION', 
    name: 'POS Integration',
    description: 'Connect with popular point-of-sale systems'
  },
  DELIVERY_INTEGRATION: {
    id: 'DELIVERY_INTEGRATION',
    name: 'Delivery Integration',
    description: 'Integrate with third-party delivery services'
  },
  INVENTORY_MANAGEMENT: {
    id: 'INVENTORY_MANAGEMENT',
    name: 'Inventory Management',
    description: 'Track and manage your product inventory'
  },
  E_COMMERCE: {
    id: 'E_COMMERCE',
    name: 'E-Commerce Platform',
    description: 'Sell products online with integrated shopping cart'
  },
  CUSTOM_DOMAIN: {
    id: 'CUSTOM_DOMAIN',
    name: 'Custom Domain',
    description: 'Use your own domain name for your digital storefront'
  },
  PRIORITY_SUPPORT: {
    id: 'PRIORITY_SUPPORT',
    name: 'Priority Support',
    description: 'Get faster responses from our support team'
  },
  WHITE_LABEL: {
    id: 'WHITE_LABEL',
    name: 'White Label Solution',
    description: 'Remove SoZayn branding from your customer-facing pages'
  }
};

// Define the subscription plans
export const PLANS: Plan[] = [
  {
    id: PlanType.FREE,
    name: 'Free',
    description: 'Basic tools to get started with your digital presence',
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      FEATURES.ONLINE_ORDERING.id,
      FEATURES.BASIC_ANALYTICS.id
    ]
  },
  {
    id: PlanType.GROWTH,
    name: 'Growth',
    description: 'Everything you need to grow your business online',
    priceMonthly: 29,
    priceAnnual: 290, // Save 2 months with annual billing
    stripeMonthlyPriceId: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID,
    stripeAnnualPriceId: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID,
    paypalMonthlyPlanId: process.env.PAYPAL_GROWTH_MONTHLY_PLAN_ID,
    paypalAnnualPlanId: process.env.PAYPAL_GROWTH_ANNUAL_PLAN_ID,
    isPopular: true,
    features: [
      FEATURES.ONLINE_ORDERING.id,
      FEATURES.BASIC_ANALYTICS.id,
      FEATURES.SOCIAL_MEDIA_INTEGRATION.id,
      FEATURES.EMAIL_MARKETING.id,
      FEATURES.DELIVERY_INTEGRATION.id,
      FEATURES.E_COMMERCE.id
    ]
  },
  {
    id: PlanType.PRO,
    name: 'Professional',
    description: 'Advanced tools for established businesses',
    priceMonthly: 79,
    priceAnnual: 790, // Save 2 months with annual billing
    stripeMonthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripeAnnualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    paypalMonthlyPlanId: process.env.PAYPAL_PRO_MONTHLY_PLAN_ID,
    paypalAnnualPlanId: process.env.PAYPAL_PRO_ANNUAL_PLAN_ID,
    features: [
      FEATURES.ONLINE_ORDERING.id,
      FEATURES.ADVANCED_ANALYTICS.id,
      FEATURES.SOCIAL_MEDIA_INTEGRATION.id,
      FEATURES.EMAIL_MARKETING.id,
      FEATURES.SMS_MARKETING.id,
      FEATURES.LOYALTY_PROGRAM.id,
      FEATURES.POS_INTEGRATION.id,
      FEATURES.DELIVERY_INTEGRATION.id,
      FEATURES.INVENTORY_MANAGEMENT.id,
      FEATURES.E_COMMERCE.id,
      FEATURES.CUSTOM_DOMAIN.id,
      FEATURES.PRIORITY_SUPPORT.id,
      FEATURES.WHITE_LABEL.id
    ]
  }
];

// Helper functions
export function getPlanById(planId: PlanType): Plan | undefined {
  return PLANS.find(plan => plan.id === planId);
}

export function getPlanFeatures(planId: PlanType): Feature[] {
  const plan = getPlanById(planId);
  if (!plan) return [];
  
  return plan.features.map(featureId => FEATURES[featureId]);
}

export function isPlanIncludesFeature(planId: PlanType, featureId: string): boolean {
  const plan = getPlanById(planId);
  if (!plan) return false;
  
  return plan.features.includes(featureId);
}
import { UberDirectService } from './UberDirectService';
import { JetGoService } from './JetGoService';
import { EcommerceService, createEcommerceService } from './EcommerceService';
import { db } from '../db';
import { integrations } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Service type for any delivery service
type DeliveryService = UberDirectService | JetGoService;

// Service type for any e-commerce service
type EcommerceServiceType = EcommerceService;

// Get a service client for a specific e-commerce integration
export async function getEcommerceServiceClient(integrationId?: number, platform?: string, credentials?: any): Promise<EcommerceServiceType | null> {
  try {
    // If an integration ID is provided, load from the database
    if (integrationId) {
      // Get the integration from the database
      const [integration] = await db.select().from(integrations).where(eq(integrations.id, integrationId));
      
      if (!integration || integration.type !== 'ecommerce') {
        console.error(`E-commerce integration with ID ${integrationId} not found`);
        return null;
      }
      
      // Create and return the e-commerce service client
      return createEcommerceService({
        platform: integration.provider.toLowerCase(),
        apiKey: integration.apiKey || 'demo_api_key',
        apiSecret: integration.apiSecret || 'demo_api_secret',
        storeUrl: integration.storeUrl || 'https://example-store.com',
        environment: integration.environment as 'sandbox' | 'live'
      });
    }
    // If credentials are provided directly, use them
    else if (platform && credentials) {
      return createEcommerceService({
        platform: platform,
        apiKey: credentials.apiKey || 'demo_api_key',
        apiSecret: credentials.apiSecret || 'demo_api_secret',
        storeUrl: credentials.storeUrl || 'https://example-store.com',
        environment: credentials.environment || 'sandbox'
      });
    }
    
    return null;
  } catch (error) {
    console.error('Error getting e-commerce service client:', error);
    return null;
  }
}

// Get a service client for a specific delivery integration
export async function getDeliveryServiceClient(integrationId: number, provider?: string, credentials?: any): Promise<DeliveryService | null> {
  try {
    // For direct testing with provider and credentials (no database lookup)
    if (provider && credentials) {
      console.log(`Creating ${provider} delivery service client directly with provided credentials`);
      
      if (provider === 'UberDirect' || provider === 'UberEats') {
        return new UberDirectService({
          customerId: credentials.customerId || "demo_customer_id",
          clientId: credentials.clientId || "demo_client_id",
          clientSecret: credentials.clientSecret || "demo_client_secret",
          environment: credentials.environment || 'sandbox'
        });
      } 
      else if (provider === 'JetGo') {
        return new JetGoService({
          apiKey: credentials.apiKey || "demo_api_key",
          merchantId: credentials.merchantId || "demo_merchant_id",
          webhookSecret: credentials.webhookSecret || "demo_webhook_secret",
          environment: credentials.environment || 'sandbox'
        });
      }
      else {
        console.error(`Unsupported delivery provider: ${provider}`);
        return null;
      }
    }
    
    // If integration ID is 0 or negative, return a default UberDirect client for testing
    if (integrationId <= 0) {
      console.log(`Creating default UberDirect client for testing (integrationId: ${integrationId})`);
      return new UberDirectService({
        customerId: "demo_customer_id",
        clientId: "demo_client_id",
        clientSecret: "demo_client_secret",
        environment: 'sandbox'
      });
    }
    
    console.log(`Looking up delivery service client for integration ID: ${integrationId}`);
    
    // Get the integration from the database
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, integrationId));
    
    if (!integration) {
      console.error(`Integration with ID ${integrationId} not found`);
      // For testing purposes, create a default client rather than failing
      console.log(`Creating fallback UberDirect client since integration ${integrationId} was not found`);
      return new UberDirectService({
        customerId: "demo_customer_id",
        clientId: "demo_client_id",
        clientSecret: "demo_client_secret",
        environment: 'sandbox'
      });
    }
    
    console.log(`Found integration:`, JSON.stringify({
      id: integration.id,
      provider: integration.provider,
      environment: integration.environment,
      hasDevId: !!integration.developerId,
      hasKeyId: !!integration.keyId,
      hasSecret: !!integration.signingSecret
    }));
    
    // Support both UberDirect and JetGo providers
    if (integration.provider === 'UberDirect' || integration.provider === 'UberEats') {
      // Check if the integration has the required fields
      if (!integration.developerId || !integration.keyId || !integration.signingSecret) {
        console.error(`UberDirect integration ${integrationId} is missing required credentials - using defaults for testing`);
        
        // For test/demo purposes, use demo credentials to allow testing delivery functionality
        integration.developerId = integration.developerId || "demo_customer_id";
        integration.keyId = integration.keyId || "demo_key_id";
        integration.signingSecret = integration.signingSecret || "demo_signing_secret";
      }
      
      // Create and return the UberDirect service client
      return new UberDirectService({
        customerId: integration.developerId,
        clientId: integration.keyId,
        clientSecret: integration.signingSecret,
        environment: integration.environment as 'sandbox' | 'live'
      });
    } 
    else if (integration.provider === 'JetGo') {
      // Check if the integration has the required fields for JetGo
      if (!integration.apiKey || !integration.merchantId || !integration.webhookSecret) {
        console.error(`JetGo integration ${integrationId} is missing required credentials - using defaults for testing`);
        
        // For test/demo purposes, use demo credentials
        integration.apiKey = integration.apiKey || "demo_api_key";
        integration.merchantId = integration.merchantId || "demo_merchant_id";
        integration.webhookSecret = integration.webhookSecret || "demo_webhook_secret";
      }
      
      // Create and return the JetGo service client
      return new JetGoService({
        apiKey: integration.apiKey,
        merchantId: integration.merchantId,
        webhookSecret: integration.webhookSecret,
        environment: integration.environment as 'sandbox' | 'live'
      });
    } 
    else {
      console.error(`Unsupported delivery provider: ${integration.provider}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting delivery service client:', error);
    return null;
  }
}
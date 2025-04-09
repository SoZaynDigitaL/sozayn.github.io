import { UberDirectService } from './UberDirectService';
import { JetGoService } from './JetGoService';
import { db } from '../db';
import { integrations } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Service type for any delivery service
type DeliveryService = UberDirectService | JetGoService;

// Get a service client for a specific delivery integration
export async function getDeliveryServiceClient(integrationId: number): Promise<DeliveryService | null> {
  try {
    console.log(`Getting delivery service client for integration ID: ${integrationId}`);
    
    // Get the integration from the database
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, integrationId));
    
    if (!integration) {
      console.error(`Integration with ID ${integrationId} not found`);
      return null;
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
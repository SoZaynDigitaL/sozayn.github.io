import { UberDirectService } from './UberDirectService';
import { db } from '../db';
import { integrations } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Get a service client for a specific delivery integration
export async function getDeliveryServiceClient(integrationId: number): Promise<UberDirectService | null> {
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
    
    // We support UberDirect or UberEats integrations that have Direct Delivery credentials
    if (integration.provider !== 'UberDirect' && integration.provider !== 'UberEats') {
      console.error(`Unsupported delivery provider: ${integration.provider}`);
      return null;
    }
    
    // Check if the integration has the required fields
    if (!integration.developerId || !integration.keyId || !integration.signingSecret) {
      console.error(`Integration ${integrationId} is missing required credentials`);
      return null;
    }
    
    // Create and return the appropriate service client
    return new UberDirectService({
      customerId: integration.developerId,
      clientId: integration.keyId,
      clientSecret: integration.signingSecret,
      environment: integration.environment as 'sandbox' | 'live'
    });
  } catch (error) {
    console.error('Error getting delivery service client:', error);
    return null;
  }
}
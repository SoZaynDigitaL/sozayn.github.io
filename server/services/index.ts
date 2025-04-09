import { UberDirectService } from './UberDirectService';
import { db } from '../db';
import { integrations } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Get a service client for a specific delivery integration
export async function getDeliveryServiceClient(integrationId: number): Promise<UberDirectService | null> {
  try {
    // Get the integration from the database
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, integrationId));
    
    if (!integration) {
      console.error(`Integration with ID ${integrationId} not found`);
      return null;
    }
    
    // Only UberDirect is supported currently
    if (integration.provider !== 'UberDirect') {
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
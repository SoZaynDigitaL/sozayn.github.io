import axios from 'axios';
import crypto from 'crypto';

interface UberDirectCredentials {
  customerId: string;   // developerId in our integration table
  clientId: string;     // keyId in our integration table
  clientSecret: string; // signingSecret in our integration table
  environment: 'sandbox' | 'live';
}

interface DeliveryQuote {
  id: string;
  fee: number;
  eta: number;
  currency: string;
  expires_at: string;
}

interface DeliveryRequest {
  pickup: {
    name: string;
    address: string;
    phoneNumber: string;
    instructions?: string;
    latitude?: number;
    longitude?: number;
  };
  dropoff: {
    name: string;
    address: string;
    phoneNumber: string;
    instructions?: string;
    latitude?: number;
    longitude?: number;
  };
  orderValue: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface DeliveryResponse {
  id: string;
  status: string;
  tracking_url: string;
  fee: number;
  currency: string;
  created_at: string;
  pickup_eta: string;
  dropoff_eta: string;
}

export class UberDirectService {
  private credentials: UberDirectCredentials;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpires: Date | null = null;

  constructor(credentials: UberDirectCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.environment === 'sandbox' 
      ? 'https://api.uber.com/v1/sandbox/delivery' 
      : 'https://api.uber.com/v1/delivery';
  }

  /**
   * Authenticate with the UberDirect API and get an access token
   */
  async authenticate(): Promise<string> {
    // If we have a valid token, return it
    if (this.token && this.tokenExpires && this.tokenExpires > new Date()) {
      return this.token;
    }

    try {
      // In a real implementation, this would make an actual API call to Uber
      // For now, we'll simulate the authentication process
      const authUrl = 'https://login.uber.com/oauth/v2/token';
      
      console.log(`Authenticating with UberDirect using client ID: ${this.credentials.clientId}`);
      
      // Set token expiration to 1 hour from now (typical for OAuth tokens)
      const expiresIn = 3600;
      this.tokenExpires = new Date(Date.now() + expiresIn * 1000);
      
      // For the demo, create a simulated token
      this.token = `UBER_SIMULATED_TOKEN_${crypto.randomBytes(16).toString('hex')}`;
      
      console.log(`UberDirect authentication successful, token expires in ${expiresIn} seconds`);
      
      return this.token;
    } catch (error) {
      console.error('Error authenticating with UberDirect:', error);
      throw new Error('Failed to authenticate with UberDirect');
    }
  }

  /**
   * Get a delivery quote from UberDirect
   */
  async getQuote(request: any): Promise<DeliveryQuote> {
    try {
      const token = await this.authenticate();
      
      console.log(`Attempting to get delivery quote with request:`, JSON.stringify(request, null, 2));
      
      // Validate the request has the minimum required structure
      if (!request.pickup || !request.dropoff) {
        console.error(`Missing pickup or dropoff in request`);
        throw new Error('Invalid request: Missing pickup or dropoff data');
      }
      
      console.log(`Getting delivery quote for delivery from ${request.pickup.address} to ${request.dropoff.address}`);
      
      // Ensure pickup and dropoff objects have the required fields
      const pickup = {
        name: request.pickup.name || 'Customer',
        address: request.pickup.address || '123 Main St, San Francisco, CA',
        phoneNumber: request.pickup.phoneNumber || '555-555-5555',
        instructions: request.pickup.instructions || '',
        latitude: request.pickup.latitude || 37.7749,
        longitude: request.pickup.longitude || -122.4194
      };
      
      const dropoff = {
        name: request.dropoff.name || 'Customer',
        address: request.dropoff.address || '456 Market St, San Francisco, CA',
        phoneNumber: request.dropoff.phoneNumber || '555-555-5555',
        instructions: request.dropoff.instructions || '',
        latitude: request.dropoff.latitude || 37.7833,
        longitude: request.dropoff.longitude || -122.4167
      };
      
      // Create standardized items array
      let items = [];
      if (Array.isArray(request.items)) {
        items = request.items;
      } else if (Array.isArray(request.orderItems)) {
        items = request.orderItems;
      } else {
        // Default item if none provided
        items = [{ name: "Food item", quantity: 1, price: 15.0 }];
      }
      
      // Update the request with normalized data
      request.pickup = pickup;
      request.dropoff = dropoff;
      request.items = items;
      request.currency = request.currency || 'USD';
      request.orderValue = request.orderValue || 15.0;
      
      console.log(`Normalized request:`, JSON.stringify({
        pickup: request.pickup,
        dropoff: request.dropoff,
        itemsCount: request.items.length,
        currency: request.currency,
        orderValue: request.orderValue
      }, null, 2));
      
      // In a real implementation, this would make an actual API call to Uber
      // For now, we'll return a simulated quote
      return {
        id: `quote_${crypto.randomBytes(8).toString('hex')}`,
        fee: Math.floor(Math.random() * 1000) / 100 + 5, // Random fee between $5 and $15
        eta: Math.floor(Math.random() * 30) + 15, // Random ETA between 15 and 45 minutes
        currency: request.currency || 'USD',
        expires_at: new Date(Date.now() + 15 * 60000).toISOString() // Expires in 15 minutes
      };
    } catch (error) {
      console.error('Error getting delivery quote from UberDirect:', error);
      throw new Error('Failed to get delivery quote from UberDirect');
    }
  }

  /**
   * Create a delivery with UberDirect
   */
  async createDelivery(request: any, quoteId?: string): Promise<DeliveryResponse> {
    try {
      const token = await this.authenticate();
      
      console.log(`Attempting to create delivery with request:`, JSON.stringify(request, null, 2));
      
      // Validate the request has the minimum required structure
      if (!request.pickup || !request.dropoff) {
        console.error(`Missing pickup or dropoff in request`);
        throw new Error('Invalid request: Missing pickup or dropoff data');
      }
      
      console.log(`Creating delivery from ${request.pickup.address} to ${request.dropoff.address}`);
      
      // Ensure pickup and dropoff objects have the required fields
      const pickup = {
        name: request.pickup.name || 'Customer',
        address: request.pickup.address || '123 Main St, San Francisco, CA',
        phoneNumber: request.pickup.phoneNumber || '555-555-5555',
        instructions: request.pickup.instructions || '',
        latitude: request.pickup.latitude || 37.7749,
        longitude: request.pickup.longitude || -122.4194
      };
      
      const dropoff = {
        name: request.dropoff.name || 'Customer',
        address: request.dropoff.address || '456 Market St, San Francisco, CA',
        phoneNumber: request.dropoff.phoneNumber || '555-555-5555',
        instructions: request.dropoff.instructions || '',
        latitude: request.dropoff.latitude || 37.7833,
        longitude: request.dropoff.longitude || -122.4167
      };
      
      // Create standardized items array
      let items = [];
      if (Array.isArray(request.items)) {
        items = request.items;
      } else if (Array.isArray(request.orderItems)) {
        items = request.orderItems;
      } else {
        // Default item if none provided
        items = [{ name: "Food item", quantity: 1, price: 15.0 }];
      }
      
      // Update the request with normalized data
      request.pickup = pickup;
      request.dropoff = dropoff;
      request.items = items;
      request.currency = request.currency || 'USD';
      request.orderValue = request.orderValue || 15.0;
      
      console.log(`Normalized delivery request:`, JSON.stringify({
        pickup: request.pickup,
        dropoff: request.dropoff,
        itemsCount: request.items.length,
        currency: request.currency,
        orderValue: request.orderValue,
        quoteId: quoteId || 'none'
      }, null, 2));
      
      // In a real implementation, this would make an actual API call to Uber
      // For now, we'll return a simulated delivery
      const deliveryId = `delivery_${crypto.randomBytes(8).toString('hex')}`;
      const now = new Date();
      const pickupEta = new Date(now.getTime() + 15 * 60000); // 15 minutes from now
      const dropoffEta = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
      
      return {
        id: deliveryId,
        status: 'processing',
        tracking_url: `https://track.uber.com/delivery/${deliveryId}`,
        fee: quoteId ? Math.floor(Math.random() * 1000) / 100 + 5 : 8.99,
        currency: request.currency || 'USD',
        created_at: now.toISOString(),
        pickup_eta: pickupEta.toISOString(),
        dropoff_eta: dropoffEta.toISOString()
      };
    } catch (error) {
      console.error('Error creating delivery with UberDirect:', error);
      throw new Error('Failed to create delivery with UberDirect');
    }
  }

  /**
   * Get the status of a delivery from UberDirect
   */
  async getDeliveryStatus(deliveryId: string): Promise<{status: string, tracking_url: string}> {
    try {
      const token = await this.authenticate();
      
      console.log(`Getting status for delivery: ${deliveryId}`);
      
      // In a real implementation, this would make an actual API call to Uber
      // For now, we'll return a simulated status
      const statuses = [
        'processing', 'picking_up', 'picked_up', 'delivering', 'delivered', 'canceled'
      ];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        status: randomStatus,
        tracking_url: `https://track.uber.com/delivery/${deliveryId}`
      };
    } catch (error) {
      console.error('Error getting delivery status from UberDirect:', error);
      throw new Error('Failed to get delivery status from UberDirect');
    }
  }

  /**
   * Cancel a delivery with UberDirect
   */
  async cancelDelivery(deliveryId: string): Promise<boolean> {
    try {
      const token = await this.authenticate();
      
      console.log(`Canceling delivery: ${deliveryId}`);
      
      // In a real implementation, this would make an actual API call to Uber
      // For now, we'll simulate a successful cancellation
      
      // 80% chance of successful cancellation
      const isSuccessful = Math.random() < 0.8;
      
      if (!isSuccessful) {
        throw new Error('Delivery could not be canceled');
      }
      
      return true;
    } catch (error) {
      console.error('Error canceling delivery with UberDirect:', error);
      throw new Error('Failed to cancel delivery with UberDirect');
    }
  }
}
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWebhookSchema, insertSocialMediaAccountSchema } from "../shared/schema";
import { z } from "zod";
import session from "express-session";
import Stripe from "stripe";
import crypto from "crypto";

// Extend the Express Session interface
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Helper function to authenticate requests
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request body
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Create user
      const newUser = await storage.createUser(userData);
      
      // Don't return password
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check password (simplified for demo)
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId as number);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Demo data generation
  app.post("/api/demo/generate", isAuthenticated, async (req, res) => {
    try {
      // For now just return success - the frontend will mock data
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate demo data" });
    }
  });

  // Mock API endpoints for the dashboard
  app.get("/api/orders/recent", isAuthenticated, (req, res) => {
    // Return empty array for now - frontend will handle demo data
    res.json([]);
  });

  app.get("/api/integrations", isAuthenticated, (req, res) => {
    // Return demo data for delivery integrations
    res.json([
      {
        id: 1,
        provider: "DoorDash",
        type: "delivery",
        apiKey: "demo_api_key",
        isActive: true,
        environment: "sandbox",
        developerId: "demo_developer_id",
        keyId: "demo_key_id",
        signingSecret: "demo_signing_secret",
        webhookUrl: "https://delivery.apps.hyperzod.com/api/v1/4404/webhook/order/doordash",
        sendOrderStatus: true,
        settings: {}
      },
      {
        id: 2,
        provider: "UberEats",
        type: "delivery",
        apiKey: "demo_api_key",
        isActive: false,
        environment: "sandbox",
        developerId: "demo_developer_id",
        keyId: "demo_key_id",
        signingSecret: "demo_signing_secret",
        webhookUrl: "https://delivery.apps.hyperzod.com/api/v1/4404/webhook/order/ubereats",
        sendOrderStatus: true,
        settings: {}
      }
    ]);
  });
  
  // Mock endpoint to add new integration
  app.post("/api/integrations", isAuthenticated, (req, res) => {
    // For demo purposes, just return the data that was sent
    const newIntegration = {
      id: Math.floor(Math.random() * 1000) + 10, // Random ID
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json(newIntegration);
  });
  
  // Mock endpoint to update integration
  app.patch("/api/integrations/:id", isAuthenticated, (req, res) => {
    const id = parseInt(req.params.id);
    
    // Return the updated integration object
    res.json({
      id,
      ...req.body,
      updatedAt: new Date().toISOString()
    });
  });

  app.get("/api/customers", isAuthenticated, (req, res) => {
    // Return empty array for now - frontend will handle demo data
    res.json([]);
  });

  // Social Media Account routes
  app.get("/api/social-media-accounts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const accounts = await storage.getSocialMediaAccounts(userId);
      res.json(accounts);
    } catch (error: any) {
      console.error("Error fetching social media accounts:", error);
      res.status(500).json({ 
        error: "Error fetching social media accounts", 
        message: error.message 
      });
    }
  });

  app.get("/api/social-media-accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getSocialMediaAccount(id);
      
      if (!account) {
        return res.status(404).json({ error: "Social media account not found" });
      }
      
      // Check if the account belongs to this user
      const userId = req.session.userId as number;
      if (account.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(account);
    } catch (error: any) {
      console.error("Error fetching social media account:", error);
      res.status(500).json({ 
        error: "Error fetching social media account", 
        message: error.message 
      });
    }
  });

  app.post("/api/social-media-accounts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate and create the social media account
      const accountData = insertSocialMediaAccountSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if account for this platform already exists
      const existingAccount = await storage.getSocialMediaAccountByPlatform(userId, accountData.platform);
      if (existingAccount) {
        return res.status(400).json({ error: "An account for this platform already exists" });
      }
      
      const newAccount = await storage.createSocialMediaAccount(accountData);
      res.status(201).json(newAccount);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating social media account:", error);
      res.status(500).json({ 
        error: "Error creating social media account", 
        message: error.message 
      });
    }
  });

  app.patch("/api/social-media-accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if the account exists and belongs to this user
      const account = await storage.getSocialMediaAccount(id);
      if (!account) {
        return res.status(404).json({ error: "Social media account not found" });
      }
      
      if (account.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update the account
      const updatedAccount = await storage.updateSocialMediaAccount(id, req.body);
      res.json(updatedAccount);
    } catch (error: any) {
      console.error("Error updating social media account:", error);
      res.status(500).json({ 
        error: "Error updating social media account", 
        message: error.message 
      });
    }
  });

  app.delete("/api/social-media-accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if the account exists and belongs to this user
      const account = await storage.getSocialMediaAccount(id);
      if (!account) {
        return res.status(404).json({ error: "Social media account not found" });
      }
      
      if (account.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Delete the account
      await storage.deleteSocialMediaAccount(id);
      res.status(204).end();
    } catch (error: any) {
      console.error("Error deleting social media account:", error);
      res.status(500).json({ 
        error: "Error deleting social media account", 
        message: error.message 
      });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      // Check if Stripe secret key is available
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ 
          error: "Stripe secret key is not set. Please configure STRIPE_SECRET_KEY environment variable." 
        });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-03-31.basil" as any,
      });

      const { amount } = req.body;
      
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });

      // Return the client secret to the client
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        error: "Error creating payment intent", 
        message: error.message 
      });
    }
  });

  // Subscription handling endpoint
  app.post("/api/get-or-create-subscription", isAuthenticated, async (req, res) => {
    try {
      // Check if Stripe secret key is available
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ 
          error: "Stripe secret key is not set. Please configure STRIPE_SECRET_KEY environment variable." 
        });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-03-31.basil" as any,
      });

      const userId = req.session.userId;
      const user = await storage.getUser(userId as number);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // For demo purposes - in a real app, we would retrieve or create a subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 2000, // $20.00
        currency: "usd",
        description: "SoZayn Monthly Subscription",
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        subscriptionId: "demo_subscription_id"
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ 
        error: "Error creating subscription", 
        message: error.message 
      });
    }
  });

  // Webhook Management Routes
  app.get("/api/webhooks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const webhooksData = await storage.getWebhooks(userId);
      res.json(webhooksData);
    } catch (error: any) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ 
        error: "Error fetching webhooks", 
        message: error.message 
      });
    }
  });

  app.get("/api/webhooks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.getWebhook(id);
      
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      // Check if the webhook belongs to this user
      const userId = req.session.userId as number;
      if (webhook.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(webhook);
    } catch (error: any) {
      console.error("Error fetching webhook:", error);
      res.status(500).json({ 
        error: "Error fetching webhook", 
        message: error.message 
      });
    }
  });

  app.post("/api/webhooks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Validate and create the webhook
      const webhookData = insertWebhookSchema.parse({
        ...req.body,
        userId
      });
      
      const newWebhook = await storage.createWebhook(webhookData);
      res.status(201).json(newWebhook);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating webhook:", error);
      res.status(500).json({ 
        error: "Error creating webhook", 
        message: error.message 
      });
    }
  });

  app.patch("/api/webhooks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if the webhook exists and belongs to this user
      const webhook = await storage.getWebhook(id);
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      if (webhook.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update the webhook
      const updatedWebhook = await storage.updateWebhook(id, req.body);
      res.json(updatedWebhook);
    } catch (error: any) {
      console.error("Error updating webhook:", error);
      res.status(500).json({ 
        error: "Error updating webhook", 
        message: error.message 
      });
    }
  });

  app.delete("/api/webhooks/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if the webhook exists and belongs to this user
      const webhook = await storage.getWebhook(id);
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      if (webhook.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Delete the webhook
      await storage.deleteWebhook(id);
      res.status(204).end();
    } catch (error: any) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ 
        error: "Error deleting webhook", 
        message: error.message 
      });
    }
  });

  // Webhook logs
  app.get("/api/webhooks/:id/logs", isAuthenticated, async (req, res) => {
    try {
      const webhookId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if the webhook exists and belongs to this user
      const webhook = await storage.getWebhook(webhookId);
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      if (webhook.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get the logs with a default limit
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getWebhookLogs(webhookId, limit);
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching webhook logs:", error);
      res.status(500).json({ 
        error: "Error fetching webhook logs", 
        message: error.message 
      });
    }
  });

  // Webhook receiver endpoint (public)
  app.post("/api/webhook/:secretKey", async (req, res) => {
    const start = Date.now();
    try {
      const { secretKey } = req.params;
      
      // Find the webhook by the secret key
      const webhook = await storage.getWebhookBySecretKey(secretKey);
      if (!webhook || !webhook.isActive) {
        return res.status(404).json({ error: "Webhook not found or inactive" });
      }
      
      // Determine the event type based on the request body or headers
      const eventType = req.headers['x-event-type'] as string || 'unknown';
      
      // Process the webhook based on configuration
      // This is where you'd implement the webhook handling logic
      // For now, we'll just log the request
      
      // Generate a signature for the response
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      // Create response payload
      const responsePayload = {
        success: true,
        message: "Webhook received and processed",
        webhook_id: webhook.id,
        signature
      };
      
      // Log the webhook call
      await storage.createWebhookLog({
        webhookId: webhook.id,
        eventType,
        requestPayload: req.body,
        responsePayload,
        statusCode: 200,
        processingTimeMs: Date.now() - start
      });
      
      res.json(responsePayload);
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      
      // Try to log the error if possible
      try {
        if (req.params.secretKey) {
          const webhook = await storage.getWebhookBySecretKey(req.params.secretKey);
          if (webhook) {
            await storage.createWebhookLog({
              webhookId: webhook.id,
              eventType: req.headers['x-event-type'] as string || 'unknown',
              requestPayload: req.body,
              errorMessage: error.message,
              statusCode: 500,
              processingTimeMs: Date.now() - start
            });
          }
        }
      } catch (logError) {
        console.error("Error logging webhook failure:", logError);
      }
      
      res.status(500).json({ 
        error: "Error processing webhook", 
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

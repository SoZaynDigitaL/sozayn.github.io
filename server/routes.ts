import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "../shared/schema";
import { z } from "zod";
import session from "express-session";
import Stripe from "stripe";
import { setupCloudflareRoutes } from "./cloudflare";
import paypal from "@paypal/checkout-server-sdk";

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

// Function to create a PayPal environment
function getPayPalEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal client ID or secret is not set");
  }

  // By default, we'll use the sandbox environment for testing
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// Create a PayPal client
function getPayPalClient() {
  const environment = getPayPalEnvironment();
  return new paypal.core.PayPalHttpClient(environment);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Cloudflare integration routes
  setupCloudflareRoutes(app);
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
      console.log("Login attempt with:", req.body);
      const { username, password } = req.body;
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log(`User not found: ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      console.log(`User found: ${username}, comparing passwords...`);
      
      // Check password (simplified for demo)
      if (user.password !== password) {
        console.log(`Password mismatch for user: ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      console.log(`Password correct for user: ${username}, setting session`);
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      
      console.log(`Login successful for user: ${username}`);
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
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
    // Return empty array for now - frontend will handle demo data
    res.json([]);
  });

  app.get("/api/customers", isAuthenticated, (req, res) => {
    // Return empty array for now - frontend will handle demo data
    res.json([]);
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
        apiVersion: "2025-03-31.basil",
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
        apiVersion: "2025-03-31.basil",
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

  // PayPal payment routes
  app.post("/api/paypal/create-order", isAuthenticated, async (req, res) => {
    try {
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        return res.status(500).json({
          error: "PayPal credentials are not set. Please configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables."
        });
      }

      const { amount } = req.body;

      try {
        const client = getPayPalClient();
        
        // Create order request
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        
        // Define the order
        request.requestBody({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount.toString()
              },
              description: "SoZayn Digital Restaurant Platform"
            }
          ],
          application_context: {
            return_url: `${req.protocol}://${req.get('host')}/paypal-success`,
            cancel_url: `${req.protocol}://${req.get('host')}/checkout`
          }
        });

        // Execute the order creation
        const response = await client.execute<paypal.PayPalOrderResponse>(request);
        
        // Find the approval URL
        const approvalUrl = response.result.links.find(link => link.rel === "approve")?.href;
        
        if (!approvalUrl) {
          throw new Error("Approval URL not found in PayPal response");
        }

        // Return the approval URL to redirect the user
        res.json({ approvalUrl, orderId: response.result.id });
      } catch (error: any) {
        console.error("Error creating PayPal order:", error);
        res.status(500).json({
          error: "Failed to create PayPal order",
          message: error.message
        });
      }
    } catch (error: any) {
      res.status(500).json({
        error: "Error in PayPal order creation",
        message: error.message
      });
    }
  });

  app.post("/api/paypal/capture-order", isAuthenticated, async (req, res) => {
    try {
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        return res.status(500).json({
          error: "PayPal credentials are not set. Please configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables."
        });
      }

      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      try {
        const client = getPayPalClient();
        
        // Create capture request
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        
        // Execute the capture
        const response = await client.execute<paypal.PayPalCaptureResponse>(request);
        
        // Check if payment was successful
        if (response.result.status === "COMPLETED") {
          // Here you would typically update your database to mark the order as paid
          // and handle any other business logic (send emails, update inventory, etc.)
          
          res.json({ 
            success: true,
            orderId: response.result.id,
            status: response.result.status
          });
        } else {
          res.status(400).json({
            error: "Payment not completed",
            status: response.result.status
          });
        }
      } catch (error: any) {
        console.error("Error capturing PayPal order:", error);
        res.status(500).json({
          error: "Failed to capture PayPal payment",
          message: error.message
        });
      }
    } catch (error: any) {
      res.status(500).json({
        error: "Error in PayPal payment capture",
        message: error.message
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

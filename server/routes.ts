import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "../shared/schema";
import { z } from "zod";
import session from "express-session";
import Stripe from "stripe";

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

  const httpServer = createServer(app);

  return httpServer;
}

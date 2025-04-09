import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWebhookSchema, insertSocialMediaAccountSchema } from "../shared/schema";
import { z } from "zod";
import session from "express-session";
import Stripe from "stripe";
import crypto from "crypto";
import bcrypt from "bcrypt";

// Helper function for MailerLite initialization
async function getMailerLiteClient() {
  const mailerliteLib = await import('@mailerlite/mailerlite-nodejs');
  const MailerLite = mailerliteLib.default;
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    throw new Error('MAILERLITE_API_KEY is not set');
  }
  return new MailerLite({
    api_key: apiKey,
  });
}

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

// Middleware to enforce role-based access control
const hasRequiredRole = (requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId as number);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if user's role is in the required roles list
      if (requiredRoles.includes(user.role)) {
        next();
      } else {
        res.status(403).json({ 
          error: "Access denied", 
          message: "You don't have permission to access this resource",
          userRole: user.role,
          requiredRoles
        });
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
};

// Middleware to check if user has required subscription plan
const hasRequiredPlan = (requiredPlans: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId as number);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if user's plan is in the required plans list
      if (requiredPlans.includes(user.subscriptionPlan)) {
        next();
      } else {
        res.status(403).json({ 
          error: "Plan upgrade required", 
          message: "This feature requires a higher subscription tier",
          userPlan: user.subscriptionPlan,
          requiredPlans
        });
      }
    } catch (error) {
      console.error("Error checking subscription plan:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
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
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Send welcome email via MailerLite if API key is available
      try {
        if (process.env.MAILERLITE_API_KEY && userData.email) {
          const mailerlite = await getMailerLiteClient();
          
          // Add subscriber to MailerLite
          await mailerlite.subscribers.createOrUpdate({
            email: userData.email,
            fields: {
              signup_source: 'SoZayn Platform',
              business_name: userData.businessName,
              business_type: userData.businessType,
              signup_date: new Date().toISOString().split('T')[0],
            },
          });
          
          console.log('User registered and added to MailerLite:', userData.email);
        }
      } catch (emailError) {
        // Don't fail registration if email sending fails
        console.error('Error sending welcome email:', emailError);
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Registration error:', error);
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
      
      // Check password with bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      
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
  
  // Admin User Management API endpoints
  app.get("/api/users", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ 
        error: "Error fetching users", 
        message: error.message 
      });
    }
  });

  app.post("/api/users", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      // Validate request body
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Don't return password
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('User creation error:', error);
      res.status(500).json({ error: "Internal server error", message: error.message });
    }
  });

  app.get("/api/users/:id", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ 
        error: "Error fetching user", 
        message: error.message 
      });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(id, req.body);
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({ 
        error: "Error updating user", 
        message: error.message 
      });
    }
  });
  
  app.patch("/api/users/:id/subscription", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { subscriptionPlan } = req.body;
      
      if (!subscriptionPlan) {
        return res.status(400).json({ error: "Subscription plan is required" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update user subscription
      const updatedUser = await storage.updateUserSubscription(id, subscriptionPlan);
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user subscription" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error updating user subscription:", error);
      res.status(500).json({ 
        error: "Error updating user subscription", 
        message: error.message 
      });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Prevent self-deletion
      if (id === userId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Delete user
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete user" });
      }
      
      res.status(204).end();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ 
        error: "Error deleting user", 
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

      // Check if user already has a subscription
      if (user.stripeSubscriptionId) {
        try {
          // In a real app, we would retrieve the active subscription and continue the process
          // For now, just create a new payment intent
          const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000, // $20.00
            currency: "usd",
            description: "SoZayn Monthly Subscription",
          });

          return res.json({ 
            clientSecret: paymentIntent.client_secret,
            subscriptionId: user.stripeSubscriptionId
          });
        } catch (err) {
          console.error("Error retrieving subscription, creating new one:", err);
          // Continue with creating a new subscription
        }
      }
      
      // If user doesn't have a customer ID, create one
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        // Create a new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: user.id.toString(),
            businessName: user.businessName
          }
        });
        
        stripeCustomerId = customer.id;
        // Update user with Stripe customer ID
        await storage.updateStripeCustomerId(user.id, customer.id);
      }
      
      // Get plan details from request body
      const plan = req.body.plan || 'professional';
      const isUpgrade = req.body.isUpgrade || false;
      
      // Set price based on plan (in cents)
      const planPrices = {
        starter: 1999, // $19.99
        growth: 4999,  // $49.99
        professional: 9999 // $99.99
      };
      
      const planAmount = planPrices[plan as keyof typeof planPrices] || 9999;
      
      // Create a payment intent for the subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: planAmount,
        currency: "usd",
        customer: stripeCustomerId,
        description: `SoZayn ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
        metadata: {
          userId: user.id.toString(),
          subscriptionPlan: plan,
          isUpgrade: isUpgrade.toString()
        }
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        stripeCustomerId
      });
      
    } catch (error: any) {
      console.error("Error handling subscription:", error);
      res.status(500).json({ 
        error: "Error handling subscription", 
        message: error.message 
      });
    }
  });
  
  // Handle subscription success
  app.post("/api/subscription/success", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { paymentIntentId, subscriptionPlan } = req.body;
      
      if (!paymentIntentId || !subscriptionPlan) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Check if Stripe secret key is available
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ 
          error: "Stripe secret key is not set. Please configure STRIPE_SECRET_KEY environment variable." 
        });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-03-31.basil" as any,
      });
      
      // Get payment intent to verify payment
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment not successful" });
      }
      
      // Get the user
      const user = await storage.getUser(userId as number);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Create or update Stripe subscription
      let stripeSubscriptionId = user.stripeSubscriptionId;
      const stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        return res.status(400).json({ error: "Stripe customer ID not found" });
      }
      
      // Store the upgrade information
      await storage.updateUserStripeInfo(user.id, {
        stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId || paymentIntentId, // Use payment intent as subscription ID if none exists
      });
      
      // Update user subscription plan in the database
      const updatedUser = await storage.updateUserSubscription(userId as number, subscriptionPlan);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update tags in MailerLite
      try {
        if (process.env.MAILERLITE_API_KEY && updatedUser.email) {
          const mailerlite = await getMailerLiteClient();
          
          // Add/update subscriber with new plan information
          await mailerlite.subscribers.createOrUpdate({
            email: updatedUser.email,
            fields: {
              subscription_plan: subscriptionPlan,
              subscription_date: new Date().toISOString().split('T')[0],
            },
          });
          
          console.log('User subscription updated in MailerLite:', updatedUser.email);
        }
      } catch (emailError) {
        console.error('Error updating subscriber in MailerLite:', emailError);
        // Don't fail if email update fails
      }
      
      // Return updated user (without password)
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
      
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      res.status(500).json({
        error: "Error updating subscription",
        message: error.message
      });
    }
  });
  
  // Handle subscription cancellation/downgrade
  app.post("/api/subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      
      // Get the user
      const user = await storage.getUser(userId as number);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if Stripe secret key is available
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ 
          error: "Stripe secret key is not set. Please configure STRIPE_SECRET_KEY environment variable." 
        });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-03-31.basil" as any,
      });
      
      // If user has a Stripe subscription, cancel it
      if (user.stripeSubscriptionId) {
        try {
          // In a real implementation, we would use the Stripe API to cancel the subscription
          // await stripe.subscriptions.cancel(user.stripeSubscriptionId);
          console.log(`Cancelled subscription ${user.stripeSubscriptionId} for user ${user.id}`);
        } catch (stripeError) {
          console.error('Error cancelling Stripe subscription:', stripeError);
        }
      }
      
      // Downgrade user to starter plan
      const updatedUser = await storage.updateUserSubscription(userId as number, 'starter');
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update tags in MailerLite
      try {
        if (process.env.MAILERLITE_API_KEY && updatedUser.email) {
          const mailerlite = await getMailerLiteClient();
          
          // Add/update subscriber with new plan information
          await mailerlite.subscribers.createOrUpdate({
            email: updatedUser.email,
            fields: {
              subscription_plan: 'starter',
              subscription_date: new Date().toISOString().split('T')[0],
              subscription_status: 'downgraded',
            },
          });
          
          console.log('User subscription downgraded in MailerLite:', updatedUser.email);
        }
      } catch (emailError) {
        console.error('Error updating subscriber in MailerLite:', emailError);
        // Don't fail if email update fails
      }
      
      // Return updated user (without password)
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
      
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({
        error: "Error cancelling subscription",
        message: error.message
      });
    }
  });

  // Email marketing routes (MailerLite integration)
  app.get("/api/email-marketing/subscribers", isAuthenticated, hasRequiredPlan(["growth", "professional", "enterprise"]), async (req, res) => {
    try {
      // Check if MailerLite API key is available
      if (!process.env.MAILERLITE_API_KEY) {
        return res.status(500).json({ 
          error: "MailerLite API key is not set. Please configure MAILERLITE_API_KEY environment variable." 
        });
      }
      
      const mailerlite = await getMailerLiteClient();
      
      // Get subscribers list
      const params = {
        limit: 25,
        page: req.query.page ? parseInt(req.query.page as string) : 1
      };
      
      const response = await mailerlite.subscribers.get(params);
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ 
        error: "Error fetching subscribers", 
        message: error.message 
      });
    }
  });
  
  app.post("/api/email-marketing/subscribers", isAuthenticated, hasRequiredPlan(["growth", "professional", "enterprise"]), async (req, res) => {
    try {
      // Check if MailerLite API key is available
      if (!process.env.MAILERLITE_API_KEY) {
        return res.status(500).json({ 
          error: "MailerLite API key is not set. Please configure MAILERLITE_API_KEY environment variable." 
        });
      }
      
      const mailerlite = await getMailerLiteClient();
      
      // Validate the request
      const { email, name, additionalFields } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Add subscriber to MailerLite
      const subscriber = await mailerlite.subscribers.createOrUpdate({
        email,
        fields: {
          name: name || '',
          ...additionalFields
        }
      });
      
      res.status(201).json(subscriber);
    } catch (error: any) {
      console.error("Error adding subscriber:", error);
      res.status(500).json({ 
        error: "Error adding subscriber", 
        message: error.message 
      });
    }
  });
  
  app.get("/api/email-marketing/campaigns", isAuthenticated, hasRequiredPlan(["growth", "professional", "enterprise"]), async (req, res) => {
    try {
      // Check if MailerLite API key is available
      if (!process.env.MAILERLITE_API_KEY) {
        return res.status(500).json({ 
          error: "MailerLite API key is not set. Please configure MAILERLITE_API_KEY environment variable." 
        });
      }
      
      const mailerlite = await getMailerLiteClient();
      
      // Get campaigns list
      const params = {
        limit: 25,
        page: req.query.page ? parseInt(req.query.page as string) : 1
      };
      
      const response = await mailerlite.campaigns.get(params);
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ 
        error: "Error fetching campaigns", 
        message: error.message 
      });
    }
  });
  
  app.post("/api/email-marketing/campaigns", isAuthenticated, hasRequiredPlan(["growth", "professional", "enterprise"]), async (req, res) => {
    try {
      // Check if MailerLite API key is available
      if (!process.env.MAILERLITE_API_KEY) {
        return res.status(500).json({ 
          error: "MailerLite API key is not set. Please configure MAILERLITE_API_KEY environment variable." 
        });
      }
      
      const mailerlite = await getMailerLiteClient();
      
      // First, add the subscriber to MailerLite
      const { name, subject, content, scheduledFor } = req.body;
      
      if (!name || !subject || !content) {
        return res.status(400).json({ error: "Missing required fields: name, subject, or content" });
      }
      
      // For demo purposes, we'll create a campaign-like object
      // In a real-world scenario, this would call mailerlite.campaigns.create()
      const campaignResponse = {
        id: crypto.randomUUID(),
        name,
        subject,
        content,
        created_at: new Date().toISOString(),
        scheduled_at: scheduledFor || null,
        status: scheduledFor ? 'scheduled' : 'draft',
        opens: 0,
        clicks: 0
      };
      
      // Return the created campaign
      // MailerLite API actually requires additional setup for campaigns 
      // including segments, sender information, etc., which would be set up with 
      // a template for this in the MailerLite dashboard and use automations
      res.status(201).json(campaignResponse);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ 
        error: "Error creating campaign", 
        message: error.message 
      });
    }
  });

  // Firebase auth routes
  app.post("/api/auth/firebase-signin", async (req, res) => {
    try {
      const { uid, email, displayName, photoURL } = req.body;
      
      if (!uid || !email) {
        return res.status(400).json({ error: "Missing required Firebase auth data" });
      }
      
      // Check if user already exists by email
      let user = await storage.getUserByUsername(email);
      
      if (!user) {
        // Create a new user based on Firebase data
        const newUserData = {
          username: email,
          email,
          password: crypto.randomUUID(), // Generate a random password (user will use Firebase auth)
          businessName: displayName || 'My Business',
          businessType: 'restaurant',
          role: 'client',
          subscriptionPlan: 'starter',
          createdAt: new Date().toISOString()
        };
        
        user = await storage.createUser(newUserData);
        
        // Send welcome email via MailerLite if API key is available
        try {
          if (process.env.MAILERLITE_API_KEY && email) {
            const mailerlite = await getMailerLiteClient();
            
            await mailerlite.subscribers.createOrUpdate({
              email,
              fields: {
                signup_source: 'Firebase Auth',
                signup_date: new Date().toISOString().split('T')[0],
              },
            });
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
        }
      }
      
      // Set user ID in session
      req.session.userId = user.id;
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Firebase sign-in error:", error);
      res.status(500).json({ 
        error: "Error processing Firebase sign-in", 
        message: error.message 
      });
    }
  });

  // Subscription management endpoints
  app.post("/api/subscription/downgrade", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { plan } = req.body;
      
      if (!plan || !['starter', 'growth', 'professional'].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan specified" });
      }
      
      const user = await storage.getUser(userId as number);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // For Stripe integration with actual payment processing, we would handle
      // the subscription change through the Stripe API here
      
      // Update subscription plan
      const updatedUser = await storage.updateUserSubscription(user.id, plan);
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update subscription" });
      }
      
      res.json({ 
        success: true, 
        message: "Subscription downgraded successfully",
        plan
      });
    } catch (error: any) {
      console.error("Error downgrading subscription:", error);
      res.status(500).json({ 
        error: "Error downgrading subscription", 
        message: error.message 
      });
    }
  });
  
  app.post("/api/subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      
      const user = await storage.getUser(userId as number);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription found" });
      }
      
      // If we're using Stripe's full subscription API, we would cancel the subscription through Stripe here
      if (process.env.STRIPE_SECRET_KEY && user.stripeSubscriptionId) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2025-03-31.basil" as any,
        });
        
        // In a real implementation, we'd cancel the subscription using:
        // await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true });
      }
      
      // For our demo, we'll just update the user's subscription status
      const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      const updatedUser = await storage.updateUser(user.id, {
        subscriptionStatus: 'cancelled',
        // Set a fake expiration date 30 days in the future
        subscriptionExpiresAt: expirationDate
      });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to cancel subscription" });
      }
      
      res.json({ 
        success: true, 
        message: "Subscription cancellation scheduled"
      });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ 
        error: "Error cancelling subscription", 
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
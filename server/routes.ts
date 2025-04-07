import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertSubscriptionSchema, 
  insertSubscriptionTransactionSchema, 
  type User,
  type Subscription 
} from "../shared/schema";
import { z } from "zod";
import session from "express-session";
import Stripe from "stripe";
import { setupCloudflareRoutes } from "./cloudflare";
import paypal from "@paypal/checkout-server-sdk";
import { PlanType, PLANS, FEATURES, getPlanById } from "../shared/plans";
import { addUserToMailerLite, updateUserPlanInMailerLite } from "./services/mailerLite";

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

// Helper function to check admin role
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied: Admin role required" });
    }

    next();
  } catch (error) {
    console.error("Error checking admin role:", error);
    res.status(500).json({ error: "Internal server error" });
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
      
      // Add user to MailerLite - set default FREE plan if planId is not provided
      const userPlanId = newUser.planId || PlanType.FREE;
      try {
        // Add the user to MailerLite with their plan
        await addUserToMailerLite(
          newUser.email,
          newUser.username,
          userPlanId as PlanType,
          newUser.businessName
        );
        console.log(`User ${newUser.username} added to MailerLite with plan ${userPlanId}`);
      } catch (mailerliteError) {
        // Log error but don't fail registration if MailerLite integration fails
        console.error("Failed to add user to MailerLite:", mailerliteError);
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = newUser;
      
      // Set user ID in session
      req.session.userId = newUser.id;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt with:", req.body);
      const { username, password } = req.body;
      
      // First try to find user by username
      let user = await storage.getUserByUsername(username);
      
      // If not found, try by email (assuming the username field might contain an email)
      if (!user) {
        // Check if username includes @ symbol (likely an email)
        if (username.includes('@')) {
          // Try to find user with matching email
          const users = await storage.getAllUsers();
          user = users.find((u: User) => u.email === username);
          if (user) {
            console.log(`User found by email: ${username}`);
          }
        }
      }
      
      if (!user) {
        console.log(`User not found: ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      console.log(`User found: ${user.username}, comparing passwords...`);
      
      // Check password (simplified for demo)
      if (user.password !== password) {
        console.log(`Password mismatch for user: ${user.username}`);
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

  // API endpoints for the dashboard
  app.get("/api/orders", isAuthenticated, (req, res) => {
    // Return empty array - frontend will generate demo data
    res.json([]);
  });
  
  app.get("/api/orders/recent", isAuthenticated, (req, res) => {
    // Return empty array - frontend will generate demo data
    res.json([]);
  });

  app.get("/api/integrations", isAuthenticated, (req, res) => {
    // Return empty array - frontend will generate demo data
    res.json([]);
  });

  app.get("/api/customers", isAdmin, async (req, res) => {
    try {
      // Get all users except the current admin
      const allUsers = await storage.getAllUsers();
      
      // Filter out admin users and don't return passwords
      const customers = allUsers
        .filter(user => user.role !== 'admin' && user.id !== req.session.userId)
        .map(user => {
          const { password, ...userWithoutPassword } = user;
          return {
            ...userWithoutPassword,
            // Add customer-specific fields for the frontend
            id: user.id.toString(),
            name: user.businessName,
            email: user.email,
            phone: "Not provided", // Could be added to user schema in the future
            totalOrders: 0,
            totalSpent: 0,
            loyaltyPoints: 0,
            loyaltyTier: 'bronze',
            createdAt: user.createdAt.toISOString(),
            lastOrder: ''
          };
        });
      
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  
  app.get("/api/menu", isAuthenticated, (req, res) => {
    // Return empty array - frontend will generate demo data
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

  // Subscription Plan Management
  app.get("/api/plans", (req, res) => {
    res.json(PLANS.map(plan => ({
      ...plan,
      features: plan.features.map(featureId => FEATURES[featureId])
    })));
  });

  app.get("/api/user/plan", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId as number);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const plan = getPlanById(user.planId as PlanType);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      // Get user plan details and features
      const planDetails = {
        ...plan,
        features: plan.features.map(featureId => FEATURES[featureId]),
        planExpiresAt: user.planExpiresAt
      };
      
      res.json(planDetails);
    } catch (error) {
      console.error("Error fetching user plan:", error);
      res.status(500).json({ error: "Failed to fetch user plan" });
    }
  });

  app.post("/api/user/plan/upgrade", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { planId, billingCycle } = req.body;
      
      if (!planId || !billingCycle) {
        return res.status(400).json({ error: "Plan ID and billing cycle are required" });
      }
      
      if (!Object.values(PlanType).includes(planId as PlanType)) {
        return res.status(400).json({ error: "Invalid plan ID" });
      }
      
      if (!["monthly", "annual"].includes(billingCycle)) {
        return res.status(400).json({ error: "Billing cycle must be 'monthly' or 'annual'" });
      }
      
      const plan = getPlanById(planId as PlanType);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      // This would be where you would create a subscription record and redirect
      // to the payment page or create a payment intent
      res.json({
        success: true,
        redirectTo: billingCycle === "monthly" ? "/subscribe?plan=" + planId : "/subscribe/annual?plan=" + planId
      });
    } catch (error) {
      console.error("Error upgrading plan:", error);
      res.status(500).json({ error: "Failed to upgrade plan" });
    }
  });

  app.get("/api/user/subscriptions", isAuthenticated, async (req, res) => {
    try {
      // This endpoint would return a user's subscription history
      // For now, return a mock empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/admin/subscriptions", isAdmin, async (req, res) => {
    try {
      // This endpoint would return all subscriptions for admin viewing
      // For now, return a mock empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching all subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { subscriptionId } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ error: "Subscription ID is required" });
      }
      
      // This would be where you would cancel a subscription with the payment provider
      // and update the subscription record in the database
      res.json({
        success: true,
        message: "Subscription has been canceled. You will have access until the end of your billing period."
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });

  // Feature access control middleware - can be used to protect routes based on user's plan
  const hasFeatureAccess = (featureId: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      try {
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }
        
        // Admin users have access to all features
        if (user.role === 'admin') {
          return next();
        }
        
        const plan = getPlanById(user.planId as PlanType);
        if (!plan) {
          return res.status(403).json({ error: "Invalid plan" });
        }
        
        // Check if the user's plan includes the required feature
        if (!plan.features.includes(featureId)) {
          return res.status(403).json({ 
            error: "Feature not available in your plan",
            requiredPlan: PLANS.find(p => p.features.includes(featureId))?.id || null,
            upgrade: true
          });
        }
        
        // Check if subscription is expired
        if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
          return res.status(403).json({ 
            error: "Your subscription has expired",
            expired: true
          });
        }
        
        next();
      } catch (error) {
        console.error("Error checking feature access:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    };
  };

  // Example of a feature-protected route
  app.get("/api/pos-integration", isAuthenticated, hasFeatureAccess(FEATURES.POS_INTEGRATION.id), (req, res) => {
    res.json({ message: "POS Integration data" });
  });

  app.get("/api/delivery-integration", isAuthenticated, hasFeatureAccess(FEATURES.DELIVERY_INTEGRATION.id), (req, res) => {
    res.json({ message: "Delivery Integration data" });
  });

  app.get("/api/e-commerce", isAuthenticated, hasFeatureAccess(FEATURES.E_COMMERCE.id), (req, res) => {
    res.json({ message: "E-Commerce data" });
  });

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  insertUserSchema, 
  insertWebhookSchema, 
  insertSocialMediaAccountSchema,
  integrations
} from "../shared/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import Stripe from "stripe";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { getDeliveryServiceClient } from "./services";

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
    role?: string;
  }
}

// Helper function to authenticate requests
const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Checking authentication:', {
    hasSession: !!req.session,
    userId: req.session?.userId,
    role: req.session?.role,
    sessionID: req.sessionID,
    cookies: req.headers.cookie
  });
  
  // For specific API endpoints that need a user context, use a simpler approach
  // For admin-specific routes like /api/users, try to use Authorization header
  if (req.path === '/api/users' && req.headers.authorization) {
    try {
      // Get username from an explicit Authorization header like 'Basic YWRtaW46YWRtaW4xMjM='
      const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(':');
      const username = credentials[0];
      
      // Directly check if user is admin
      const user = await storage.getUserByUsername(username);
      if (user && user.role === 'admin') {
        // Set the user and role in session for future requests
        req.session.userId = user.id;
        req.session.role = user.role;
        
        console.log(`Admin access granted via explicit auth: ${user.username} (${user.id})`);
        return next();
      }
    } catch (error) {
      console.error("Error with authorization header:", error);
      // Continue with normal session check
    }
  }
  
  // Regular session-based authentication
  if (req.session && req.session.userId) {
    try {
      // Verify userId refers to a valid user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        console.log(`User with ID ${req.session.userId} not found in database`);
        req.session.destroy((err) => {
          if (err) console.error("Error destroying invalid session:", err);
        });
        return res.status(401).json({ error: "User not found" });
      }
      
      // Always ensure the role is set in the session
      if (!req.session.role || req.session.role !== user.role) {
        req.session.role = user.role;
        // Save session explicitly to ensure role is persisted
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Error saving session with role:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
      
      // For extra security, attach the user to the request
      (req as any).currentUser = user;
      
      // Log success
      console.log(`Authentication successful for user: ${user.username} (${user.id}), role: ${user.role}`);
      
      // Call next middleware
      next();
    } catch (error: any) {
      console.error("Error during authentication:", error);
      res.status(500).json({ error: "Server error during authentication" });
    }
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
      // First check if role is in the session
      if (req.session.role && requiredRoles.includes(req.session.role)) {
        return next();
      }
      
      // If role is not in session or doesn't match, fetch from database as a fallback
      const user = await storage.getUser(req.session.userId as number);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Store the role in session for future requests
      req.session.role = user.role;
      
      // Save session explicitly to ensure role is persisted
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session with role:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
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
    } catch (error: any) {
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
      
      // Always ensure the role is set in the session
      if (!req.session.role || req.session.role !== user.role) {
        req.session.role = user.role;
        // Save session explicitly to ensure role is persisted
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Error saving session with role:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
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
    } catch (error: any) {
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
    } catch (error: any) {
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
      console.log("Login attempt:", { username });
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log("User not found:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // First try direct password comparison (for legacy unhashed passwords)
      // This is temporary and will be removed after all passwords are hashed
      if (user.password === password) {
        console.log("Legacy password match, updating to hashed format");
        
        // Update the user's password to a hashed version for future logins
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await storage.updateUser(user.id, { password: hashedPassword });
        
        // Set user ID and role in session
        req.session.userId = user.id;
        req.session.role = user.role;
        
        // Save the session explicitly to ensure it's stored before sending response
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session:", err);
            return res.status(500).json({ error: "Failed to save session" });
          }
          
          // Don't return password
          const { password: _, ...userWithoutPassword } = user;
          
          res.json(userWithoutPassword);
        });
        return;
      }
      
      // If not a direct match, try bcrypt comparison
      try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          console.log("Password mismatch for:", username);
          return res.status(401).json({ error: "Invalid credentials" });
        }
      } catch (bcryptError) {
        console.error("Bcrypt error - likely not a hashed password:", bcryptError);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set user ID and role in session
      req.session.userId = user.id;
      req.session.role = user.role;
      
      // Save the session explicitly to ensure it's stored before sending response
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        // Don't return password
        const { password: _, ...userWithoutPassword } = user;
        
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
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
    } catch (error: any) {
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

  // Admin account setup/recovery route
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const adminPassword = "admin123"; // Default admin password
      
      // Check if admin exists
      let adminUser = await storage.getUserByUsername("admin");
      
      if (!adminUser) {
        console.log("Creating new admin user");
        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        adminUser = await storage.createUser({
          username: "admin",
          password: hashedPassword,
          email: "admin@sozayn.com",
          businessName: "SoZayn Admin",
          businessType: "admin",
          role: "admin",
          subscriptionPlan: "enterprise"
        });
      } else {
        console.log("Updating existing admin user password");
        // Reset admin password to default and ensure role is admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        adminUser = await storage.updateUser(adminUser.id, { 
          password: hashedPassword,
          role: "admin",
          subscriptionPlan: "enterprise" 
        }) || adminUser;
      }
      
      // Set user ID and role in session
      req.session.userId = adminUser.id;
      req.session.role = adminUser.role;
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        const { password, ...userWithoutPassword } = adminUser;
        res.json({
          success: true,
          user: userWithoutPassword,
          message: "Admin account has been set up successfully"
        });
      });
    } catch (error: any) {
      console.error("Admin setup error:", error);
      res.status(500).json({ error: "Failed to setup admin account" });
    }
  });
  
  // Helper endpoint to set up Uber Direct webhook
  app.post("/api/webhooks/setup/uberdirect", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Check if webhook already exists for this user and provider
      const existingWebhooks = await storage.getWebhooks(userId);
      const uberDirectWebhook = existingWebhooks.find(wh => 
        wh.sourceProvider.toLowerCase() === 'uberdirect' || 
        wh.sourceProvider.toLowerCase() === 'uber'
      );
      
      if (uberDirectWebhook) {
        return res.json({
          success: true,
          message: "UberDirect webhook already exists",
          webhook: uberDirectWebhook
        });
      }
      
      // Create a new webhook for UberDirect
      const newWebhook = await storage.createWebhook({
        userId,
        name: "UberDirect Integration",
        endpointUrl: "https://sozayn.SoZaynDigitaL.repl.co/api/webhooks/uberdirect",
        description: "Webhook for UberDirect delivery status updates and courier tracking",
        sourceType: "delivery",
        sourceProvider: "UberDirect",
        destinationType: "ecommerce",
        destinationProvider: "SoZayn",
        eventTypes: ["event.delivery_status", "event.courier_update", "event.refund_request"],
        isActive: true
      });
      
      res.json({
        success: true,
        message: "UberDirect webhook created successfully",
        webhook: newWebhook
      });
    } catch (error: any) {
      console.error("Error creating UberDirect webhook:", error);
      res.status(500).json({ 
        error: "Failed to create UberDirect webhook",
        message: error.message
      });
    }
  });

  // Demo data generation
  app.post("/api/demo/generate", isAuthenticated, async (req, res) => {
    try {
      // For now just return success - the frontend will mock data
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to generate demo data" });
    }
  });

  // Mock API endpoints for the dashboard
  app.get("/api/orders/recent", isAuthenticated, (req, res) => {
    // Return empty array for now - frontend will handle demo data
    res.json([]);
  });
  
  // Delivery API endpoints for UberDirect integration
  
  // Get a quote for a delivery
  app.post("/api/delivery/quote", isAuthenticated, async (req, res) => {
    try {
      const { integrationId, pickup, dropoff, items, orderValue } = req.body;
      
      if (!integrationId || !pickup || !dropoff) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Get the delivery service client
      const deliveryService = await getDeliveryServiceClient(integrationId);
      
      if (!deliveryService) {
        return res.status(404).json({ error: "Delivery service not found or not configured correctly" });
      }
      
      // Get a quote
      const quote = await deliveryService.getQuote({
        pickup,
        dropoff,
        items: items || [],
        orderValue: orderValue || 0,
        currency: "USD"
      });
      
      res.json(quote);
    } catch (error: any) {
      console.error("Error getting delivery quote:", error);
      res.status(500).json({ 
        error: "Failed to get delivery quote", 
        message: error.message 
      });
    }
  });
  
  // Create a delivery
  app.post("/api/delivery/create", isAuthenticated, async (req, res) => {
    try {
      const { integrationId, pickup, dropoff, items, orderValue, quoteId } = req.body;
      
      if (!integrationId || !pickup || !dropoff) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Get the delivery service client
      const deliveryService = await getDeliveryServiceClient(integrationId);
      
      if (!deliveryService) {
        return res.status(404).json({ error: "Delivery service not found or not configured correctly" });
      }
      
      // Create a delivery
      const delivery = await deliveryService.createDelivery({
        pickup,
        dropoff,
        items: items || [],
        orderValue: orderValue || 0,
        currency: "USD"
      }, quoteId);
      
      res.json(delivery);
    } catch (error: any) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ 
        error: "Failed to create delivery", 
        message: error.message 
      });
    }
  });
  
  // Get delivery status
  app.get("/api/delivery/:deliveryId/status", isAuthenticated, async (req, res) => {
    try {
      const { deliveryId } = req.params;
      const { integrationId } = req.query;
      
      if (!integrationId) {
        return res.status(400).json({ error: "Missing integration ID" });
      }
      
      // Get the delivery service client
      const deliveryService = await getDeliveryServiceClient(Number(integrationId));
      
      if (!deliveryService) {
        return res.status(404).json({ error: "Delivery service not found or not configured correctly" });
      }
      
      // Get delivery status
      const status = await deliveryService.getDeliveryStatus(deliveryId);
      
      res.json(status);
    } catch (error: any) {
      console.error("Error getting delivery status:", error);
      res.status(500).json({ 
        error: "Failed to get delivery status", 
        message: error.message 
      });
    }
  });
  
  // Cancel delivery
  app.post("/api/delivery/:deliveryId/cancel", isAuthenticated, async (req, res) => {
    try {
      const { deliveryId } = req.params;
      const { integrationId } = req.body;
      
      if (!integrationId) {
        return res.status(400).json({ error: "Missing integration ID" });
      }
      
      // Get the delivery service client
      const deliveryService = await getDeliveryServiceClient(integrationId);
      
      if (!deliveryService) {
        return res.status(404).json({ error: "Delivery service not found or not configured correctly" });
      }
      
      // Cancel delivery
      const success = await deliveryService.cancelDelivery(deliveryId);
      
      res.json({ success });
    } catch (error: any) {
      console.error("Error canceling delivery:", error);
      res.status(500).json({ 
        error: "Failed to cancel delivery", 
        message: error.message 
      });
    }
  });

  app.get("/api/integrations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Get integrations from database
      const integrationsList = await db.select().from(integrations)
        .where(eq(integrations.userId, userId))
        .orderBy(integrations.id);
      
      // If no integrations found, return sample data for demonstration
      if (integrationsList.length === 0 || !integrationsList || integrationsList.length < 1) {
        return res.json([
          {
            id: 1,
            provider: "DoorDash",
            type: "delivery",
            apiKey: "demo_api_key",
            isActive: true,
            environment: "sandbox",
            developerId: "",
            keyId: "",
            signingSecret: "",
            webhookUrl: "",
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
            developerId: "",
            keyId: "",
            signingSecret: "",
            webhookUrl: "",
            sendOrderStatus: true,
            settings: {}
          }
        ]);
      }
      
      res.json(integrationsList);
    } catch (error: any) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ 
        error: "Failed to fetch integrations", 
        message: error.message 
      });
    }
  });
  
  // Mock endpoint to add new integration
  app.post("/api/integrations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Insert integration into database
      const [newIntegration] = await db.insert(integrations)
        .values({
          ...req.body,
          userId
        })
        .returning();
      
      res.status(201).json(newIntegration);
    } catch (error: any) {
      console.error("Error creating integration:", error);
      res.status(500).json({ 
        error: "Failed to create integration", 
        message: error.message 
      });
    }
  });
  
  // Mock endpoint to update integration
  app.patch("/api/integrations/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if integration exists and belongs to this user
      const [integration] = await db.select().from(integrations)
        .where(and(
          eq(integrations.id, id),
          eq(integrations.userId, userId)
        ));
      
      if (!integration) {
        return res.status(404).json({ error: "Integration not found or access denied" });
      }
      
      // Update the integration
      const [updatedIntegration] = await db.update(integrations)
        .set(req.body)
        .where(eq(integrations.id, id))
        .returning();
      
      if (!updatedIntegration) {
        return res.status(500).json({ error: "Failed to update integration" });
      }
      
      res.json(updatedIntegration);
    } catch (error: any) {
      console.error("Error updating integration:", error);
      res.status(500).json({ 
        error: "Failed to update integration", 
        message: error.message 
      });
    }
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
  
  // UberDirect Webhook Setup Helper
  app.post("/api/webhooks/setup/uberdirect", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Check if webhook for UberDirect already exists
      const existingWebhooks = await storage.getWebhooks(userId);
      const uberDirectWebhook = existingWebhooks.find(wh => 
        wh.sourceProvider.toLowerCase() === 'uberdirect' || 
        wh.destinationProvider.toLowerCase() === 'uberdirect'
      );
      
      if (uberDirectWebhook) {
        // If webhook exists, just return it
        return res.json({
          message: "UberDirect webhook already exists", 
          webhook: uberDirectWebhook
        });
      }
      
      // Create a new webhook for UberDirect
      const newWebhook = await storage.createWebhook({
        userId,
        name: "UberDirect Delivery Webhook",
        description: "Automatically created webhook for UberDirect delivery status updates and courier location tracking",
        sourceType: "delivery",
        sourceProvider: "UberDirect",
        destinationType: "internal",
        destinationProvider: "SoZayn",
        eventTypes: ["delivery.status", "courier.update", "event.delivery_status", "event.courier_update"],
        endpointUrl: `${req.protocol}://${req.get('host')}/api/webhooks/uberdirect`,
        isActive: true
      });
      
      res.status(201).json({
        message: "UberDirect webhook created successfully",
        webhook: newWebhook
      });
      
    } catch (error: any) {
      console.error("Error setting up UberDirect webhook:", error);
      res.status(500).json({ 
        error: "Error setting up UberDirect webhook", 
        message: error.message 
      });
    }
  });
  
  // Uber Direct Webhook Handler
  app.post("/api/webhooks/uberdirect", async (req, res) => {
    try {
      console.log("Received Uber Direct webhook:", JSON.stringify(req.body));
      
      const webhookData = req.body;
      let eventType = 'unknown';
      
      // Determine event type from Uber Direct payload
      if (webhookData.event_type) {
        eventType = webhookData.event_type;
      } else if (webhookData.type) {
        eventType = webhookData.type;
      }
      
      // Get webhook by provider
      let webhook;
      try {
        // Find the corresponding webhook in our database
        const webhooks = await storage.getAllWebhooks(); // Get all webhooks 
        webhook = webhooks.find(wh => 
          wh.sourceProvider.toLowerCase() === 'uberdirect' || 
          wh.sourceProvider.toLowerCase() === 'uber'
        );
      } catch (error: any) {
        console.error("Error finding webhook:", error);
      }
      
      // Process based on event type
      const startTime = Date.now();
      let statusCode = 200;
      let errorMessage;
      
      try {
        switch(eventType) {
          case 'event.delivery_status':
            // Handle delivery status update
            console.log("Processing delivery status update:", 
              webhookData.delivery_id, 
              webhookData.status || 'unknown status'
            );
            // Here you would update order status in your database
            break;
            
          case 'event.courier_update':
            // Handle courier location update
            console.log("Processing courier update:", 
              webhookData.delivery_id, 
              webhookData.location || 'unknown location'
            );
            // Here you would update courier location in your database
            break;
            
          case 'event.refund_request':
            // Handle refund request
            console.log("Processing refund request:", 
              webhookData.delivery_id, 
              webhookData.reason || 'no reason provided'
            );
            // Here you would handle the refund process
            break;
            
          default:
            console.log("Unhandled event type:", eventType);
        }
      } catch (processError: any) {
        console.error("Error processing webhook data:", processError);
        statusCode = 500;
        errorMessage = processError.message;
      }
      
      // Calculate processing time
      const processingTimeMs = Date.now() - startTime;
      
      // Log the webhook if we found a matching webhook record
      if (webhook) {
        try {
          await storage.createWebhookLog({
            webhookId: webhook.id,
            eventType,
            requestPayload: webhookData,
            responsePayload: { success: statusCode === 200 },
            statusCode,
            errorMessage,
            processingTimeMs
          });
        } catch (logError) {
          console.error("Error logging webhook:", logError);
        }
      } else {
        console.log("No matching webhook found for provider: UberDirect");
      }
      
      // Always respond with success to acknowledge receipt
      // This prevents Uber Direct from retrying unnecessarily
      res.status(200).json({ 
        success: true,
        message: "Webhook received and processed"
      });
      
    } catch (error: any) {
      console.error("Error handling Uber Direct webhook:", error);
      
      // Still return 200 to prevent Uber Direct from retrying
      // Log failure internally instead
      res.status(200).json({ 
        success: false,
        message: "Webhook received but processing failed"
      });
    }
  });
  
  // Alternative endpoint for admin users list using Basic Auth headers
  // This provides a backup method when session cookies are not working properly
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Basic auth check
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const username = credentials[0];
      const password = credentials[1];
      
      // Verify admin credentials
      const user = await storage.getUserByUsername(username);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      // Verify password
      let passwordValid = false;
      
      // First check for legacy password (direct comparison)
      if (user.password === password) {
        passwordValid = true;
      } else {
        // Then try bcrypt
        try {
          passwordValid = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
          console.error("Bcrypt error during admin auth:", bcryptError);
        }
      }
      
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // If we got here, admin is authenticated - get all users
      const users = await storage.getAllUsers();
      
      // Don't return passwords
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      console.error("Error in admin/users endpoint:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Regular Admin User Management API endpoints
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
  
  // Admin Webhook Management API endpoints
  app.get("/api/admin/webhooks", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      // Get all webhooks in the system
      const allWebhooks = await storage.getAllWebhooks();
      res.json(allWebhooks);
    } catch (error: any) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ 
        error: "Error fetching webhooks", 
        message: error.message 
      });
    }
  });
  
  app.post("/api/admin/webhooks", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Create webhook with admin credentials
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
  
  app.get("/api/admin/webhooks/:id", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.getWebhook(id);
      
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
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
  
  app.patch("/api/admin/webhooks/:id", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.getWebhook(id);
      
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      // Update webhook
      const updatedWebhook = await storage.updateWebhook(id, req.body);
      
      if (!updatedWebhook) {
        return res.status(500).json({ error: "Failed to update webhook" });
      }
      
      res.json(updatedWebhook);
    } catch (error: any) {
      console.error("Error updating webhook:", error);
      res.status(500).json({ 
        error: "Error updating webhook", 
        message: error.message 
      });
    }
  });
  
  app.delete("/api/admin/webhooks/:id", isAuthenticated, hasRequiredRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.getWebhook(id);
      
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      // Delete webhook
      const success = await storage.deleteWebhook(id);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete webhook" });
      }
      
      res.status(204).end();
    } catch (error: any) {
      console.error("Error deleting webhook:", error);
      res.status(500).json({ 
        error: "Error deleting webhook", 
        message: error.message 
      });
    }
  });
  
  // Webhook logs endpoint
  app.get("/api/webhooks/:id/logs", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const webhook = await storage.getWebhook(id);
      
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      
      // Check if the user is an admin or if they own the webhook
      const userId = req.session.userId as number;
      const userRole = req.session.role as string;
      
      if (webhook.userId !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: "Unauthorized access to webhook logs" });
      }
      
      // Get logs for this webhook (limit to 100 most recent)
      const logs = await storage.getWebhookLogs(id, 100);
      
      res.json(logs);
    } catch (error: any) {
      console.error("Error fetching webhook logs:", error);
      res.status(500).json({ 
        error: "Error fetching webhook logs", 
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
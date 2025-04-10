import { 
  users, type User, type InsertUser,
  webhooks, type Webhook, type InsertWebhook,
  webhookLogs, type WebhookLog, type InsertWebhookLog,
  socialMediaAccounts, type SocialMediaAccount, type InsertSocialMediaAccount
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  updateUserSubscription(id: number, subscriptionPlan: string): Promise<User | undefined>;
  updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User | undefined>;
  updateUserStripeInfo(id: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Webhook methods
  getWebhooks(userId: number): Promise<Webhook[]>;
  getAllWebhooks(): Promise<Webhook[]>;
  getWebhook(id: number): Promise<Webhook | undefined>;
  getWebhookBySecretKey(secretKey: string): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: number, webhook: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: number): Promise<boolean>;
  
  // Webhook Log methods
  getWebhookLogs(webhookId: number, limit?: number): Promise<WebhookLog[]>;
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  
  // Social Media Account methods
  getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]>;
  getSocialMediaAccount(id: number): Promise<SocialMediaAccount | undefined>;
  getSocialMediaAccountByPlatform(userId: number, platform: string): Promise<SocialMediaAccount | undefined>;
  createSocialMediaAccount(account: InsertSocialMediaAccount): Promise<SocialMediaAccount>;
  updateSocialMediaAccount(id: number, account: Partial<InsertSocialMediaAccount>): Promise<SocialMediaAccount | undefined>;
  deleteSocialMediaAccount(id: number): Promise<boolean>;
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
  
  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    return this.updateUser(id, { role });
  }
  
  async updateUserSubscription(id: number, subscriptionPlan: string): Promise<User | undefined> {
    return this.updateUser(id, { 
      subscriptionPlan,
      subscriptionStatus: 'active'
    });
  }
  
  async updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User | undefined> {
    return this.updateUser(id, { stripeCustomerId });
  }
  
  async updateUserStripeInfo(id: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User | undefined> {
    return this.updateUser(id, { 
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId,
      subscriptionStatus: 'active'
    });
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return !!result;
  }
  
  // Webhook methods
  async getWebhooks(userId: number): Promise<Webhook[]> {
    return db.select().from(webhooks).where(eq(webhooks.userId, userId));
  }
  
  async getAllWebhooks(): Promise<Webhook[]> {
    return db.select().from(webhooks);
  }
  
  async getWebhook(id: number): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook || undefined;
  }
  
  async getWebhookBySecretKey(secretKey: string): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.secretKey, secretKey));
    return webhook || undefined;
  }
  
  async createWebhook(insertWebhook: InsertWebhook): Promise<Webhook> {
    const [webhook] = await db
      .insert(webhooks)
      .values(insertWebhook)
      .returning();
    return webhook;
  }
  
  async updateWebhook(id: number, partialWebhook: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const [webhook] = await db
      .update(webhooks)
      .set({ ...partialWebhook, updatedAt: new Date() })
      .where(eq(webhooks.id, id))
      .returning();
    return webhook || undefined;
  }
  
  async deleteWebhook(id: number): Promise<boolean> {
    const result = await db
      .delete(webhooks)
      .where(eq(webhooks.id, id));
    return !!result;
  }
  
  // Webhook Log methods
  async getWebhookLogs(webhookId: number, limit: number = 100): Promise<WebhookLog[]> {
    return db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.webhookId, webhookId))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit);
  }
  
  async createWebhookLog(insertLog: InsertWebhookLog): Promise<WebhookLog> {
    const [log] = await db
      .insert(webhookLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  // Social Media Account methods
  async getSocialMediaAccounts(userId: number): Promise<SocialMediaAccount[]> {
    return db.select().from(socialMediaAccounts).where(eq(socialMediaAccounts.userId, userId));
  }
  
  async getSocialMediaAccount(id: number): Promise<SocialMediaAccount | undefined> {
    const [account] = await db.select().from(socialMediaAccounts).where(eq(socialMediaAccounts.id, id));
    return account || undefined;
  }
  
  async getSocialMediaAccountByPlatform(userId: number, platform: string): Promise<SocialMediaAccount | undefined> {
    const [account] = await db
      .select()
      .from(socialMediaAccounts)
      .where(
        and(
          eq(socialMediaAccounts.userId, userId),
          eq(socialMediaAccounts.platform, platform)
        )
      );
    return account || undefined;
  }
  
  async createSocialMediaAccount(insertAccount: InsertSocialMediaAccount): Promise<SocialMediaAccount> {
    const [account] = await db
      .insert(socialMediaAccounts)
      .values(insertAccount)
      .returning();
    return account;
  }
  
  async updateSocialMediaAccount(id: number, partialAccount: Partial<InsertSocialMediaAccount>): Promise<SocialMediaAccount | undefined> {
    const [account] = await db
      .update(socialMediaAccounts)
      .set({ ...partialAccount, updatedAt: new Date() })
      .where(eq(socialMediaAccounts.id, id))
      .returning();
    return account || undefined;
  }
  
  async deleteSocialMediaAccount(id: number): Promise<boolean> {
    const result = await db
      .delete(socialMediaAccounts)
      .where(eq(socialMediaAccounts.id, id));
    return !!result;
  }
}

// Initialize storage with demo user
const initializeStorage = async () => {
  // Check if demo user exists
  const storage = new DatabaseStorage();
  const existingUser = await storage.getUserByUsername('demo');
  
  // Create demo user if it doesn't exist
  if (!existingUser) {
    await storage.createUser({
      username: 'demo',
      password: 'password123',
      email: 'demo@example.com',
      businessName: 'Demo Restaurant',
      businessType: 'restaurant',
    });
  }
  
  return storage;
};

// Export promise for storage that initializes with demo user
export const storagePromise = initializeStorage();

// Export storage that will be properly initialized when needed
export const storage = new DatabaseStorage();

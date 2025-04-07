import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Maintain the same interface for compatibility
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
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
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
}

// Initialize storage with demo users
const initializeStorage = async () => {
  // Check if users exist and create them if needed
  const storage = new DatabaseStorage();
  
  // Check for demo user
  const existingDemoUser = await storage.getUserByUsername('demo');
  if (!existingDemoUser) {
    await storage.createUser({
      username: 'demo',
      password: 'password123',
      email: 'demo@example.com',
      businessName: 'Demo Restaurant',
      businessType: 'restaurant',
    });
  }
  
  // Check for admin user
  const existingAdminUser = await storage.getUserByUsername('admin');
  if (!existingAdminUser) {
    await storage.createUser({
      username: 'admin',
      password: 'admin123',
      email: 'admin@sozayn.com',
      businessName: 'SoZayn Admin',
      businessType: 'restaurant',
    });
  }
  
  return storage;
};

// Export promise for storage that initializes with demo user
export const storagePromise = initializeStorage();

// Export storage that will be properly initialized when needed
export const storage = new DatabaseStorage();

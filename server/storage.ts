import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Maintain the same interface for compatibility
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

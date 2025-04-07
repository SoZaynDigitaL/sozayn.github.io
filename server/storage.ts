import { 
  users, customers, 
  type User, type InsertUser,
  type Customer, type InsertCustomer 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Maintain the same interface for compatibility
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Customer management
  getCustomer(id: number): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<Customer>): Promise<Customer>;
  updateCustomerStatus(id: number, isActive: boolean): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  // User Management
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
  
  // Customer Management
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }
  
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }
  
  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(customerData)
      .returning();
    return customer;
  }
  
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(data)
      .where(eq(customers.id, id))
      .returning();
    
    if (!updatedCustomer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    return updatedCustomer;
  }
  
  async updateCustomerStatus(id: number, isActive: boolean): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ isActive })
      .where(eq(customers.id, id))
      .returning();
    
    if (!updatedCustomer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    return updatedCustomer;
  }
  
  async deleteCustomer(id: number): Promise<void> {
    await db
      .delete(customers)
      .where(eq(customers.id, id));
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
  
  try {
    // Check for admin user
    const existingAdminUser = await storage.getUserByUsername('admin');
    if (!existingAdminUser) {
      // Create admin user
      const adminUser: InsertUser = {
        username: 'admin',
        password: 'admin123',
        email: 'admin@sozayn.com',
        businessName: 'SoZayn Admin',
        businessType: 'restaurant',
      };
      await storage.createUser(adminUser);
      
      // Try to update the role after creation if the column exists
      try {
        await db.execute(
          `UPDATE users SET role = 'admin' WHERE username = 'admin'`
        );
      } catch (err) {
        console.log("Note: Could not set admin role, role column may not exist yet");
      }
    } else {
      // Try to update existing admin to have admin role if needed
      try {
        await db.execute(
          `UPDATE users SET role = 'admin' WHERE username = 'admin'`
        );
      } catch (err) {
        console.log("Note: Could not update admin role, role column may not exist yet");
      }
    }
  } catch (error) {
    console.error("Error in initializing admin user:", error);
  }
  
  return storage;
};

// Export promise for storage that initializes with demo user
export const storagePromise = initializeStorage();

// Export storage that will be properly initialized when needed
export const storage = new DatabaseStorage();

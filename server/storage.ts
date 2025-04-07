import { users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Add a demo user
    const demoUser: User = {
      id: this.currentId++,
      username: 'demo',
      password: 'password123',
      email: 'demo@example.com',
      businessName: 'Demo Restaurant',
      businessType: 'restaurant',
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();

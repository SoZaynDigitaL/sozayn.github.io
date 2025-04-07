import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { PlanType } from "./plans";

// Users (restaurant owners/managers)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(), // restaurant, grocery, etc.
  role: text("role").default("client").notNull(), // admin or client
  planId: text("plan_id").default(PlanType.FREE).notNull(), // free, growth, pro
  planFeatures: json("plan_features").default([]), // JSON array of feature IDs
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  paypalSubscriptionId: text("paypal_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  planExpiresAt: timestamp("plan_expires_at"),
});

export const insertUserSchema = createInsertSchema(users, {
  planId: z.nativeEnum(PlanType),
  planFeatures: z.array(z.string()).optional(),
}).pick({
  username: true,
  password: true,
  email: true,
  businessName: true,
  businessType: true,
  planId: true,
});

// Integrations (delivery services, POS systems)
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // delivery, pos
  provider: text("provider").notNull(), // doordash, ubereats, toast, square, etc.
  apiKey: text("api_key"),
  isActive: boolean("is_active").default(false),
  settings: json("settings"), // provider-specific settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  userId: true,
  type: true,
  provider: true,
  apiKey: true,
  settings: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderNumber: text("order_number").notNull(),
  source: text("source").notNull(), // website, doordash, ubereats, etc.
  status: text("status").notNull(), // received, prepared, picked_up, in_transit, delivered
  customerName: text("customer_name"),
  customerAddress: text("customer_address"),
  items: json("items").notNull(), // array of order items
  totalAmount: integer("total_amount").notNull(), // in cents
  deliveryFee: integer("delivery_fee"), // in cents
  deliveryPartner: text("delivery_partner"), // doordash, ubereats, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  orderNumber: true,
  source: true,
  status: true,
  customerName: true,
  customerAddress: true,
  items: true,
  totalAmount: true,
  deliveryFee: true,
  deliveryPartner: true,
});

// Customers/Loyalty
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  name: text("name"),
  phone: text("phone"),
  pointsBalance: integer("points_balance").default(0),
  totalOrders: integer("total_orders").default(0),
  totalSpent: integer("total_spent").default(0), // in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  userId: true,
  email: true,
  name: true,
  phone: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: text("plan_id").notNull(), // free, growth, pro
  status: text("status").notNull(), // active, canceled, expired, past_due
  billingCycle: text("billing_cycle").notNull(), // monthly, annual
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  amount: integer("amount").notNull(), // in cents
  provider: text("provider"), // stripe, paypal
  providerId: text("provider_id"), // ID from payment provider
  paymentMethodId: text("payment_method_id"), // ID of payment method used
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  billingCycle: true,
  startDate: true,
  endDate: true,
  amount: true,
  provider: true,
  providerId: true,
  paymentMethodId: true,
});

// Subscription Transactions
export const subscriptionTransactions = pgTable("subscription_transactions", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // payment, refund, credit
  status: text("status").notNull(), // successful, failed, pending
  amount: integer("amount").notNull(), // in cents
  provider: text("provider"), // stripe, paypal
  providerId: text("provider_id"), // Transaction ID from payment provider
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionTransactionSchema = createInsertSchema(subscriptionTransactions).pick({
  subscriptionId: true,
  userId: true,
  type: true,
  status: true,
  amount: true,
  provider: true,
  providerId: true,
  description: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type SubscriptionTransaction = typeof subscriptionTransactions.$inferSelect;
export type InsertSubscriptionTransaction = z.infer<typeof insertSubscriptionTransactionSchema>;

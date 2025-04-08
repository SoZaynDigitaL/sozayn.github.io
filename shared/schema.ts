import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (restaurant owners/managers)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(), // restaurant, grocery, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  businessName: true,
  businessType: true,
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

// Webhooks
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  secretKey: uuid("secret_key").defaultRandom().notNull(),
  endpointUrl: text("endpoint_url").notNull(),
  description: text("description"),
  sourceType: text("source_type").notNull(), // ecommerce, delivery
  sourceProvider: text("source_provider").notNull(), // shopify, doordash, etc.
  destinationType: text("destination_type").notNull(), // ecommerce, delivery
  destinationProvider: text("destination_provider").notNull(), // shopify, doordash, etc.
  eventTypes: json("event_types").notNull(), // array of event types to listen for
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWebhookSchema = createInsertSchema(webhooks).pick({
  userId: true,
  name: true,
  endpointUrl: true,
  description: true,
  sourceType: true,
  sourceProvider: true,
  destinationType: true,
  destinationProvider: true,
  eventTypes: true,
  isActive: true,
});

// Webhook logs
export const webhookLogs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhook_id").notNull().references(() => webhooks.id),
  eventType: text("event_type").notNull(),
  requestPayload: json("request_payload"),
  responsePayload: json("response_payload"),
  statusCode: integer("status_code"),
  errorMessage: text("error_message"),
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).pick({
  webhookId: true,
  eventType: true,
  requestPayload: true,
  responsePayload: true,
  statusCode: true,
  errorMessage: true,
  processingTimeMs: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;

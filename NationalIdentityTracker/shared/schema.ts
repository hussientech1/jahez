import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nationalNumber: varchar("national_number", { length: 12 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  profileComplete: boolean("profile_complete").default(false),
  darkMode: boolean("dark_mode").default(false),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents table schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // Passport, ID Card, Birth Certificate, etc.
  documentNumber: text("document_number").notNull(),
  issuedDate: timestamp("issued_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: text("status").default("active"), // active, expired, revoked
  additionalInfo: text("additional_info"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services table schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isEmergency: boolean("is_emergency").default(false),
  active: boolean("active").default(true),
});

// Offices table schema
export const offices = pgTable("offices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  active: boolean("active").default(true),
});

// Applications table schema
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  officeId: integer("office_id").notNull().references(() => offices.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status").default("pending"), // pending, approved, rejected
  isEmergency: boolean("is_emergency").default(false),
  rejectionReason: text("rejection_reason"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  type: text("type").default("info"), // info, success, warning, error
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    nationalNumber: z.string().regex(/^[A-Za-z]{2}\d{10}$/, "National number must be 2 letters followed by 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

export const loginSchema = z.object({
  nationalNumber: z.string().regex(/^[A-Za-z]{2}\d{10}$/, "National number must be 2 letters followed by 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });

export const insertOfficeSchema = createInsertSchema(offices).omit({ id: true });

export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, appliedAt: true, updatedAt: true });

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Login = z.infer<typeof loginSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Office = typeof offices.$inferSelect;
export type InsertOffice = z.infer<typeof insertOfficeSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

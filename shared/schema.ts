import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define resume types for the application
export interface ResumeData {
  personal?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    period?: string;
    details?: string[];
  }>;
  education?: {
    degree?: string;
    institution?: string;
    period?: string;
    gpa?: string;
  };
  [key: string]: any; // Allow additional sections
}

export interface TailorResumeRequest {
  vlmApiKey: string;
  geminiApiKey: string;
  applicationUrl: string;
  resumeFile: File;
}

export interface TailorResumeResponse {
  originalResume: ResumeData;
  tailoredResume: ResumeData;
}

// Schemas for validation
export const tailorResumeRequestSchema = z.object({
  vlmApiKey: z.string().min(1, "VLM Run API Key is required"),
  geminiApiKey: z.string().min(1, "Gemini API Key is required"),
  applicationUrl: z.string().url("Please enter a valid URL"),
});

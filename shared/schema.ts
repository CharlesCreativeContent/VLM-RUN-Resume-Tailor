import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define resume data structure
export interface ContactInfo {
  name: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  institution: string;
  years: string;
  gpa: string;
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  concepts: string[];
}

export interface Project {
  name: string;
  description: string[];
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string[];
  technologies: string[];
}

export interface AdditionalSections {
  [key: string]: string[];
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education?: Education[];
  skills: Skills;
  projects: Project[];
  workExperience?: WorkExperience[];
  additionalSections?: AdditionalSections;
  // Allow dynamically added sections in VLM response
  [key: string]: any;
}

// Define database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  original: jsonb("original").$type<ResumeData>(),
  tailored: jsonb("tailored").$type<ResumeData>(),
  jobUrl: text("job_url"),
  createdAt: text("created_at"),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  userId: true,
  original: true,
  tailored: true,
  jobUrl: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

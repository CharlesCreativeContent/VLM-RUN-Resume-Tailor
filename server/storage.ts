import { users, resumes, type User, type InsertUser, type Resume, type InsertResume } from "@shared/schema";

// Define storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume methods
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUserId(userId: number): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private userCurrentId: number;
  private resumeCurrentId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.userCurrentId = 1;
    this.resumeCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Resume methods
  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      (resume) => resume.userId === userId,
    );
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.resumeCurrentId++;
    const resume: Resume = { ...insertResume, id };
    this.resumes.set(id, resume);
    return resume;
  }

  async updateResume(id: number, resumeData: Partial<InsertResume>): Promise<Resume | undefined> {
    const existingResume = this.resumes.get(id);
    if (!existingResume) return undefined;

    const updatedResume = { ...existingResume, ...resumeData };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async deleteResume(id: number): Promise<boolean> {
    return this.resumes.delete(id);
  }
}

// Create and export storage instance
export const storage = new MemStorage();

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseResume } from "./services/vlmrun";
import { fetchJobDetails } from "./services/jobFetcher";
import { tailorResume } from "./services/gemini";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      return callback(new Error("Only PDF files are allowed"));
    }
    callback(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Parse resume PDF with VLM Run
  app.post("/api/resume/parse", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const vlmApiKey = req.body.vlmApiKey;
      if (!vlmApiKey) {
        return res.status(400).json({ message: "VLM Run API key is required" });
      }

      // Parse the resume using VLM Run
      const resumeData = await parseResume(req.file.buffer, vlmApiKey);
      
      return res.status(200).json(resumeData);
    } catch (error) {
      console.error("Error parsing resume:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to parse resume",
      });
    }
  });

  // Fetch job posting
  app.post("/api/job/fetch", async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "Job posting URL is required" });
      }

      // Fetch job posting
      const jobDetails = await fetchJobDetails(url);
      
      return res.status(200).json({ jobDetails });
    } catch (error) {
      console.error("Error fetching job posting:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch job posting",
      });
    }
  });

  // Tailor resume with Gemini
  app.post("/api/resume/tailor", async (req: Request, res: Response) => {
    try {
      const { resume, vlmApiKey, geminiApiKey, applicationUrl } = req.body;
      
      if (!resume || !geminiApiKey || !applicationUrl) {
        return res.status(400).json({ 
          message: "Resume data, Gemini API key, and application URL are required" 
        });
      }

      // Fetch job details
      const jobDetails = await fetchJobDetails(applicationUrl);
      
      // Tailor resume using Gemini
      const tailoredResume = await tailorResume(resume, jobDetails, geminiApiKey);
      
      return res.status(200).json(tailoredResume);
    } catch (error) {
      console.error("Error tailoring resume:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to tailor resume",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

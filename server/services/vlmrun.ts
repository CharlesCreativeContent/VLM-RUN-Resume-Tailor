import { VlmRun } from "vlmrun";
import { ResumeData } from "@shared/schema";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Parse a resume PDF using VLM Run API
 * @param fileBuffer PDF file buffer
 * @param apiKey VLM Run API key
 * @returns Structured resume data
 */
export async function parseResume(fileBuffer: Buffer, apiKey: string): Promise<ResumeData> {
  try {
    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `resume-${Date.now()}.pdf`);
    
    // Write buffer to temporary file
    fs.writeFileSync(tempFilePath, fileBuffer);
    
    // Initialize VLM Run client
    const client = new VlmRun({
      apiKey,
    });
    
    // Upload the document
    const file = await client.files.upload({
      filePath: tempFilePath,
    });
    
    // Process document using VLM Run
    const response = await client.document.generate({
      fileId: file.id,
      model: "vlm-1",
      domain: "document.resume",
    });
    
    // Clean up temporary file
    fs.unlinkSync(tempFilePath);
    
    // Parse and structure the response into our ResumeData format
    const resumeData = parseVlmResponse(response);
    
    return resumeData;
  } catch (error) {
    console.error("Error parsing resume with VLM Run:", error);
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse VLM Run response into our structured ResumeData format
 * @param response VLM Run API response
 * @returns Structured resume data
 */
function parseVlmResponse(response: any): ResumeData {
  // Log the response for debugging
  console.log("VLM Run response:", JSON.stringify(response).substring(0, 500) + "...");
  
  // Create default resume structure with empty fields
  const defaultResume: ResumeData = {
    contact: {
      name: "",
      location: "",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: {
      languages: [],
      frameworks: [],
      tools: [],
      concepts: [],
    },
    projects: [],
  };
  
  // Parse if response exists, otherwise return default structure
  if (!response) {
    console.warn("Empty VLM Run response, returning default structure");
    return defaultResume;
  }
  
  try {
    return {
      contact: {
        name: extractValue(response, "name") || extractValue(response, "contact.name") || "",
        location: extractValue(response, "location") || extractValue(response, "contact.location") || "",
        email: extractValue(response, "email") || extractValue(response, "contact.email") || "",
        phone: extractValue(response, "phone") || extractValue(response, "contact.phone") || "",
        linkedin: extractValue(response, "linkedin") || extractValue(response, "contact.linkedin") || "",
        github: extractValue(response, "github") || extractValue(response, "contact.github") || "",
      },
      summary: extractValue(response, "summary") || "",
      experience: extractExperiences(response),
      education: extractEducation(response),
      skills: {
        languages: extractSkills(response, "languages"),
        frameworks: extractSkills(response, "frameworks"),
        tools: extractSkills(response, "tools"),
        concepts: extractSkills(response, "concepts"),
      },
      projects: extractProjects(response),
    };
  } catch (error) {
    console.error("Error parsing VLM Run response:", error);
    return defaultResume;
  }
}

// Helper functions to extract data from VLM response
function extractValue(response: any, field: string): string {
  try {
    if (!response) return "";
    
    // Check if this is a nested field (contains a dot)
    if (field.includes('.')) {
      const parts = field.split('.');
      let current = response;
      
      // Navigate through the nested properties
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return "";
        }
      }
      
      return typeof current === 'string' ? current : "";
    }
    
    // Direct field access
    return typeof response[field] === 'string' ? response[field] : "";
  } catch (error) {
    return "";
  }
}

function extractExperiences(response: any): any[] {
  try {
    // This would be replaced with actual experience extraction logic
    if (response.experience && Array.isArray(response.experience)) {
      return response.experience.map((exp: any) => ({
        title: exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

function extractEducation(response: any): any[] {
  try {
    // This would be replaced with actual education extraction logic
    if (response.education && Array.isArray(response.education)) {
      return response.education.map((edu: any) => ({
        degree: edu.degree || "",
        institution: edu.institution || "",
        years: edu.years || "",
        gpa: edu.gpa || "",
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

function extractSkills(response: any, skillType: string): string[] {
  try {
    // This would be replaced with actual skill extraction logic
    if (response.skills && response.skills[skillType] && Array.isArray(response.skills[skillType])) {
      return response.skills[skillType];
    }
    return [];
  } catch (error) {
    return [];
  }
}

function extractProjects(response: any): any[] {
  try {
    // This would be replaced with actual project extraction logic
    if (response.projects && Array.isArray(response.projects)) {
      return response.projects.map((proj: any) => ({
        name: proj.name || "",
        description: Array.isArray(proj.description) ? proj.description : [],
      }));
    }
    return [];
  } catch (error) {
    return [];
  }
}

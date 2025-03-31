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
    workExperience: [],
    additionalSections: {},
  };
  
  // Parse if response exists, otherwise return default structure
  if (!response || !response.response) {
    console.warn("Empty VLM Run response, returning default structure");
    return defaultResume;
  }
  
  try {
    // The actual response data is in the 'response' property
    const vlmData = response.response;
    console.log("VLM Run data structure:", Object.keys(vlmData).join(", "));
    
    // Extract contact info
    const contactInfo = vlmData.contact_info || {};
    const contact = {
      name: contactInfo.full_name || "",
      location: contactInfo.address || "",
      email: contactInfo.email || "",
      phone: contactInfo.phone || "",
      linkedin: contactInfo.linkedin || "",
      github: contactInfo.github || "",
    };
    
    // Extract summary
    const summary = vlmData.summary || "";
    
    // Extract experience
    const experience = (vlmData.experience || []).map((exp: any) => ({
      title: exp.title || "",
      company: exp.company || "",
      location: exp.location || "",
      startDate: exp.start_date || "",
      endDate: exp.end_date || "",
      responsibilities: exp.description ? 
        (Array.isArray(exp.description) ? exp.description : [exp.description]) : 
        (exp.responsibilities || []),
    }));
    
    // Extract work experience (added for VLM Run's specific work_experience field)
    const workExperience = (vlmData.work_experience || []).map((exp: any) => ({
      company: exp.company || "",
      position: exp.position || "",
      startDate: exp.start_date || "",
      endDate: exp.end_date || "",
      isCurrent: exp.is_current || false,
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
      technologies: exp.technologies ? 
        (Array.isArray(exp.technologies) ? exp.technologies : [exp.technologies]) : [],
    }));
    
    // Extract education
    const education = (vlmData.education || []).map((edu: any) => ({
      degree: edu.degree || "",
      institution: edu.institution || "",
      years: `${edu.start_date || ""} - ${edu.end_date || ""}`,
      gpa: edu.gpa || "",
    }));
    
    // Extract skills
    const skills = {
      languages: extractArrayOrSplit(vlmData.skills?.programming_languages || vlmData.programming_languages || []),
      frameworks: extractArrayOrSplit(vlmData.skills?.frameworks || vlmData.frameworks || []),
      tools: extractArrayOrSplit(vlmData.skills?.tools || vlmData.tools || []),
      concepts: extractArrayOrSplit(vlmData.skills?.concepts || vlmData.concepts || []),
    };
    
    // Extract projects
    const projects = (vlmData.projects || []).map((proj: any) => ({
      name: proj.name || proj.title || "",
      description: proj.description ? 
        (Array.isArray(proj.description) ? proj.description : [proj.description]) : [],
    }));
    
    // Extract additional sections
    const additionalSections: {[key: string]: string[]} = {};
    if (vlmData.additional_sections && typeof vlmData.additional_sections === 'object') {
      for (const [key, value] of Object.entries(vlmData.additional_sections)) {
        if (Array.isArray(value)) {
          additionalSections[key] = value;
        } else if (typeof value === 'string') {
          additionalSections[key] = [value];
        }
      }
    }
    
    const resumeData = {
      contact,
      summary,
      experience,
      education,
      skills,
      projects,
      workExperience: workExperience.length > 0 ? workExperience : undefined,
      additionalSections: Object.keys(additionalSections).length > 0 ? additionalSections : undefined,
    };
    
    // Log the structured data
    console.log("Parsed resume data:", JSON.stringify(resumeData).substring(0, 200) + "...");
    
    return resumeData;
  } catch (error) {
    console.error("Error parsing VLM Run response:", error);
    return defaultResume;
  }
}

// Helper function to handle values that might be strings or arrays
function extractArrayOrSplit(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(item => item.trim());
  return [];
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

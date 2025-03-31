import { ResumeData } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Tailor a resume to a job posting using Gemini API
 * @param resume Original resume data
 * @param jobDetails Job posting details
 * @param apiKey Gemini API key
 * @returns Tailored resume data
 */
export async function tailorResume(
  resume: ResumeData,
  jobDetails: string,
  apiKey: string
): Promise<ResumeData> {
  try {
    // Initialize the Gemini API client with the correct API version
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the appropriate model name for the current Gemini API version
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prepare the prompt
    const prompt = `
    I need you to tailor a resume for a job application.

    Here's the original resume data in JSON format:
    ${JSON.stringify(resume, null, 2)}

    And here are the job details:
    ${jobDetails}

    Please analyze the job posting and tailor the resume to highlight relevant skills and experiences.
    Return a modified JSON with the same structure as the original resume.
    Emphasize skills and experiences that match the job requirements.
    Modify work experience descriptions to emphasize relevant responsibilities.
    Keep the same JSON schema/structure but modify the content to be more relevant to the job.
    Return ONLY the JSON data, without any explanations or markdown formatting.
    `;

    // Generate response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse response text to get tailored resume
    return parseTailoredResume(responseText, resume);
  } catch (error) {
    console.error("Error tailoring resume with Gemini:", error);
    throw new Error(`Failed to tailor resume: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse Gemini response to extract tailored resume JSON
 * @param responseText Response text from Gemini
 * @param originalResume Original resume data as fallback
 * @returns Tailored resume data
 */
function parseTailoredResume(responseText: string, originalResume: ResumeData): ResumeData {
  try {
    // Log the raw response for debugging
    console.log("Raw Gemini response:", responseText.substring(0, 500) + "...");
    
    // Extract JSON from response text
    // This handles cases where Gemini might wrap the JSON in backticks or add explanations
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                    responseText.match(/```\n([\s\S]*?)\n```/);
    
    let jsonText;
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      // Try to find the JSON object directly
      const startIdx = responseText.indexOf('{');
      const endIdx = responseText.lastIndexOf('}');
      
      if (startIdx >= 0 && endIdx >= 0 && endIdx > startIdx) {
        jsonText = responseText.substring(startIdx, endIdx + 1);
      } else {
        throw new Error("Could not locate valid JSON in the response");
      }
    }
    
    // Clean the JSON text - this helps fix common issues that cause parsing to fail
    jsonText = jsonText
      .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
      .replace(/,\s*}/g, "}") // Remove trailing commas in objects
      .replace(/\n/g, " ")    // Replace newlines with spaces
      .replace(/\\"/g, '"')   // Handle escaped quotes
      .replace(/\\n/g, " ");  // Replace escaped newlines with spaces
    
    // Log the cleaned JSON text for debugging
    console.log("Cleaned JSON text:", jsonText.substring(0, 200) + "...");
    
    // Parse the JSON
    const tailoredResume = JSON.parse(jsonText) as ResumeData;
    
    // Create a complete resume with all required fields
    const completeResume: ResumeData = {
      contact: {
        name: "",
        location: "",
        email: "",
        phone: "",
        linkedin: "",
        github: ""
      },
      summary: "",
      experience: [],
      education: [],
      skills: {
        languages: [],
        frameworks: [],
        tools: [],
        concepts: []
      },
      projects: []
    };
    
    // Merge the tailored resume with the complete resume structure
    // This ensures all required fields exist
    if (tailoredResume.contact) {
      completeResume.contact = {
        ...completeResume.contact,
        ...tailoredResume.contact
      };
    } else {
      completeResume.contact = originalResume.contact;
    }
    
    completeResume.summary = tailoredResume.summary || originalResume.summary;
    completeResume.experience = tailoredResume.experience || originalResume.experience;
    completeResume.education = tailoredResume.education || originalResume.education;
    
    if (tailoredResume.skills) {
      completeResume.skills = {
        languages: tailoredResume.skills.languages || originalResume.skills.languages,
        frameworks: tailoredResume.skills.frameworks || originalResume.skills.frameworks,
        tools: tailoredResume.skills.tools || originalResume.skills.tools,
        concepts: tailoredResume.skills.concepts || originalResume.skills.concepts
      };
    } else {
      completeResume.skills = originalResume.skills;
    }
    
    completeResume.projects = tailoredResume.projects || originalResume.projects;
    
    return completeResume;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.log("Using original resume as fallback");
    return originalResume;
  }
}

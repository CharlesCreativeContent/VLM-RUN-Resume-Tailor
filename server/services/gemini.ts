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
    // Extract JSON from response text
    // This handles cases where Gemini might wrap the JSON in backticks or add explanations
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                      responseText.match(/```\n([\s\S]*?)\n```/) ||
                      responseText.match(/\{[\s\S]*\}/);
                      
    let jsonText;
    if (jsonMatch) {
      jsonText = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
    } else {
      jsonText = responseText;
    }
    
    // Parse the JSON
    const tailoredResume = JSON.parse(jsonText) as ResumeData;
    
    // Validate the structure by ensuring all required fields exist
    // If any field is missing, use the original data as fallback
    if (!tailoredResume.contact) tailoredResume.contact = originalResume.contact;
    if (!tailoredResume.summary) tailoredResume.summary = originalResume.summary;
    if (!tailoredResume.experience) tailoredResume.experience = originalResume.experience;
    if (!tailoredResume.education) tailoredResume.education = originalResume.education;
    if (!tailoredResume.skills) tailoredResume.skills = originalResume.skills;
    if (!tailoredResume.projects) tailoredResume.projects = originalResume.projects;
    
    return tailoredResume;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.log("Using original resume as fallback");
    return originalResume;
  }
}

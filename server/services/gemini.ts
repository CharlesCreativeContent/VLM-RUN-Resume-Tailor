import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData, Experience, Education, Project } from '@shared/schema';

/**
 * Ask a question about a resume and get an AI-generated answer
 * @param resume Resume data
 * @param question User's question about the resume
 * @param apiKey Gemini API key
 * @returns AI-generated answer to the question
 */
export async function askResumeQuestion(
  resume: ResumeData,
  question: string,
  apiKey: string
): Promise<string> {
  try {
    console.log("Processing resume question with Gemini");
    
    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash-lite to avoid rate limits
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    // Format resume data for the prompt
    const resumeJson = JSON.stringify(resume, null, 2);
    
    // Create the prompt
    const prompt = `
    I have a resume in JSON format:
    
    ${resumeJson}
    
    Based on this resume, please answer the following question:
    
    "${question}"
    
    If the format is not specified, please provide your answer in a clear, star-format highlighting the most relevant experience and qualifications from the resume that relate to the question.
    `;
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error answering resume question:", error);
    throw error;
  }
}

/**
 * Tailor a resume to a job posting using Gemini API by updating each section individually
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
    console.log("Starting resume tailoring process with Gemini");
    
    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash-lite to avoid rate limits
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    // Create a deep copy of the original resume to build our tailored version
    const tailoredResume: ResumeData = JSON.parse(JSON.stringify(resume));
    
    // 1. Tailor the summary
    console.log("Tailoring professional summary...");
    const summaryPrompt = `
    Tailor this professional summary for a job with the following details:
    
    Original summary: "${resume.summary}"
    
    Job details:
    ${jobDetails}
    
    Provide ONLY the improved summary text without any additional notes, formatting, quotes, or explanations.
    Ensure it highlights relevant skills and experiences that match the job requirements.
    Keep it concise and professional. Maximum 4-5 sentences.
    `;
    
    try {
      const summaryResult = await model.generateContent(summaryPrompt);
      const summaryResponse = await summaryResult.response;
      tailoredResume.summary = summaryResponse.text().trim();
      console.log("Summary tailored successfully");
    } catch (error) {
      console.error("Error tailoring summary:", error);
      // If there's an error, keep the original summary
    }
    
    // 2. Tailor each experience entry
    console.log("Tailoring work experience...");
    if (resume.experience && resume.experience.length > 0) {
      const tailoredExperiences = [];
      
      for (const exp of resume.experience) {
        try {
          const experiencePrompt = `
          Tailor these job responsibilities to be more relevant for a job with the following details:
          
          Job title: "${exp.title}"
          Company: "${exp.company}"
          
          Original responsibilities:
          ${exp.responsibilities.join('\n')}
          
          Job details to tailor for:
          ${jobDetails}
          
          Provide ONLY a list of improved bullet points - one per line, without numbers, quotes, or any additional formatting.
          Focus on highlighting relevant skills and achievements that match the job requirements.
          Don't mention the job posting or that this is a tailored version.
          Keep each bullet point concise (1-2 sentences each).
          Maintain approximately the same number of bullet points.
          `;
          
          const expResult = await model.generateContent(experiencePrompt);
          const expResponse = await expResult.response;
          const tailoredResponsibilities = expResponse.text()
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.trim().replace(/^[•\-\*]\s*/, ''));
          
          tailoredExperiences.push({
            ...exp,
            responsibilities: tailoredResponsibilities.length > 0 ? tailoredResponsibilities : exp.responsibilities
          });
          
        } catch (error) {
          console.error(`Error tailoring experience for ${exp.title}:`, error);
          // If there's an error, keep the original experience entry
          tailoredExperiences.push(exp);
        }
      }
      
      tailoredResume.experience = tailoredExperiences;
      console.log("Work experience tailored successfully");
    }
    
    // 3. Tailor skills (frameworks, tools, concepts first, then languages)
    console.log("Tailoring skills...");
    try {
      const skillsPrompt = `
      Based on this job description, which of these skills should be emphasized and prioritized?
      
      Original skills:
      - Languages: ${resume.skills.languages.join(', ')}
      - Frameworks: ${resume.skills.frameworks.join(', ')}
      - Tools: ${resume.skills.tools.join(', ')}
      - Concepts: ${resume.skills.concepts.join(', ')}
      
      Job details:
      ${jobDetails}
      
      Format your response as a JSON object with these exact keys:
      {
        "languages": ["list", "of", "tailored", "skills"],
        "frameworks": ["list", "of", "tailored", "skills"],
        "tools": ["list", "of", "tailored", "skills"],
        "concepts": ["list", "of", "tailored", "skills"]
      }
      
      Don't remove any skills, but reorder them to put the most relevant ones first.
      `;
      
      const skillsResult = await model.generateContent(skillsPrompt);
      const skillsResponse = await skillsResult.response;
      const skillsText = skillsResponse.text();
      
      try {
        // Try to extract and parse JSON
        const jsonMatch = skillsText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedSkills = JSON.parse(jsonMatch[0]);
          
          // Only update if we got valid arrays, otherwise keep original
          if (Array.isArray(parsedSkills.languages)) {
            tailoredResume.skills.languages = parsedSkills.languages;
          }
          if (Array.isArray(parsedSkills.frameworks)) {
            tailoredResume.skills.frameworks = parsedSkills.frameworks;
          }
          if (Array.isArray(parsedSkills.tools)) {
            tailoredResume.skills.tools = parsedSkills.tools;
          }
          if (Array.isArray(parsedSkills.concepts)) {
            tailoredResume.skills.concepts = parsedSkills.concepts;
          }
          console.log("Skills tailored successfully");
        } else {
          console.log("Could not extract skills JSON, keeping original skills");
        }
      } catch (parseError) {
        console.error("Error parsing skills response:", parseError);
        // Keep original skills on parse error
      }
    } catch (error) {
      console.error("Error tailoring skills:", error);
      // Keep original skills on API error
    }
    
    // 4. Tailor projects (if present)
    console.log("Tailoring projects...");
    if (resume.projects && resume.projects.length > 0) {
      const tailoredProjects = [];
      
      for (const project of resume.projects) {
        try {
          const projectPrompt = `
          Tailor this project description to be more relevant for a job with the following details:
          
          Project name: "${project.name}"
          
          Original description:
          ${project.description.join('\n')}
          
          Job details to tailor for:
          ${jobDetails}
          
          Provide ONLY a list of improved bullet points - one per line, without numbers, quotes, or any additional formatting.
          Focus on highlighting aspects of the project that match the job requirements.
          Don't mention the job posting or that this is a tailored version.
          Keep each bullet point concise (1-2 sentences each).
          Maintain approximately the same number of bullet points.
          `;
          
          const projectResult = await model.generateContent(projectPrompt);
          const projectResponse = await projectResult.response;
          const tailoredDescription = projectResponse.text()
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.trim().replace(/^[•\-\*]\s*/, ''));
          
          tailoredProjects.push({
            ...project,
            description: tailoredDescription.length > 0 ? tailoredDescription : project.description
          });
          
        } catch (error) {
          console.error(`Error tailoring project ${project.name}:`, error);
          // If there's an error, keep the original project
          tailoredProjects.push(project);
        }
      }
      
      tailoredResume.projects = tailoredProjects;
      console.log("Projects tailored successfully");
    }
    
    // 5. Tailor work experience (if present)
    console.log("Tailoring work experience...");
    if (resume.workExperience && resume.workExperience.length > 0) {
      const tailoredWorkExperiences = [];
      
      for (const exp of resume.workExperience) {
        try {
          const workExperiencePrompt = `
          Tailor these work responsibilities to be more relevant for a job with the following details:
          
          Position: "${exp.position || 'Not specified'}"
          Company: "${exp.company || 'Not specified'}"
          
          Original responsibilities:
          ${exp.responsibilities.join('\n')}
          
          Job details to tailor for:
          ${jobDetails}
          
          Provide ONLY a list of improved bullet points - one per line, without numbers, quotes, or any additional formatting.
          Focus on highlighting relevant skills and achievements that match the job requirements.
          Don't mention the job posting or that this is a tailored version.
          Keep each bullet point concise (1-2 sentences each).
          Maintain approximately the same number of bullet points.
          `;
          
          const workExpResult = await model.generateContent(workExperiencePrompt);
          const workExpResponse = await workExpResult.response;
          const tailoredResponsibilities = workExpResponse.text()
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.trim().replace(/^[•\-\*]\s*/, ''));
          
          tailoredWorkExperiences.push({
            ...exp,
            responsibilities: tailoredResponsibilities.length > 0 ? tailoredResponsibilities : exp.responsibilities
          });
          
        } catch (error) {
          console.error(`Error tailoring work experience for ${exp.position || 'position'}:`, error);
          // If there's an error, keep the original experience entry
          tailoredWorkExperiences.push(exp);
        }
      }
      
      tailoredResume.workExperience = tailoredWorkExperiences;
      console.log("Work experience tailored successfully");
    }
    
    // 6. Tailor additional sections (if present)
    console.log("Tailoring additional sections...");
    if (resume.additionalSections && Object.keys(resume.additionalSections).length > 0) {
      const tailoredAdditionalSections: {[key: string]: string[]} = {};
      
      for (const [sectionName, items] of Object.entries(resume.additionalSections)) {
        if (Array.isArray(items) && items.length > 0) {
          try {
            const additionalSectionPrompt = `
            Tailor these items to be more relevant for a job with the following details:
            
            Section name: "${sectionName}"
            
            Original items:
            ${items.join('\n')}
            
            Job details to tailor for:
            ${jobDetails}
            
            Provide ONLY a list of improved items - one per line, without numbers, quotes, or any additional formatting.
            Focus on highlighting relevant information that matches the job requirements.
            Don't mention the job posting or that this is a tailored version.
            Keep approximately the same amount of information.
            `;
            
            const sectionResult = await model.generateContent(additionalSectionPrompt);
            const sectionResponse = await sectionResult.response;
            const tailoredItems = sectionResponse.text()
              .split('\n')
              .filter(line => line.trim())
              .map(line => line.trim().replace(/^[•\-\*]\s*/, ''));
            
            tailoredAdditionalSections[sectionName] = tailoredItems.length > 0 ? tailoredItems : items;
            
          } catch (error) {
            console.error(`Error tailoring additional section ${sectionName}:`, error);
            // If there's an error, keep the original section items
            tailoredAdditionalSections[sectionName] = items;
          }
        } else {
          tailoredAdditionalSections[sectionName] = items;
        }
      }
      
      tailoredResume.additionalSections = tailoredAdditionalSections;
      console.log("Additional sections tailored successfully");
    }
    
    // We don't modify education - just keep the original
    
    // Process any other dynamic sections that are arrays of strings or objects
    // This handles resume sections that didn't exist when we originally built the app
    for (const [key, value] of Object.entries(resume)) {
      // Skip already processed sections
      if ([
        'contact', 'summary', 'experience', 'workExperience', 
        'education', 'skills', 'projects', 'additionalSections'
      ].includes(key)) {
        continue;
      }
      
      // Handle array sections that might contain relevant information
      if (Array.isArray(value) && value.length > 0) {
        console.log(`Tailoring additional section: ${key}...`);
        
        try {
          // For arrays of strings
          if (typeof value[0] === 'string') {
            const arrayPrompt = `
            Tailor these ${key.replace(/_/g, ' ')} items to be more relevant for the job:
            
            Original items:
            ${value.join('\n')}
            
            Job details to tailor for:
            ${jobDetails}
            
            Provide ONLY a list of improved items - one per line, without numbers, quotes, or any additional formatting.
            Focus on highlighting aspects that match the job requirements.
            Keep each item concise and professional.
            Maintain approximately the same number of items.
            `;
            
            const result = await model.generateContent(arrayPrompt);
            const response = await result.response;
            const tailoredItems = response.text()
              .split('\n')
              .filter(line => line.trim())
              .map(line => line.trim().replace(/^[•\-\*]\s*/, ''));
            
            if (tailoredItems.length > 0) {
              tailoredResume[key] = tailoredItems;
            }
          }
          // For arrays of objects (like experiences)
          else if (typeof value[0] === 'object' && value[0] !== null) {
            const tailoredItems = [];
            
            for (const item of value) {
              // Find the main text content field (description, responsibilities, etc.)
              let contentField = '';
              let contentValue: string[] = [];
              
              // Identify which field contains the descriptive text
              for (const [fieldKey, fieldValue] of Object.entries(item)) {
                if (Array.isArray(fieldValue) && 
                    fieldValue.length > 0 && 
                    typeof fieldValue[0] === 'string' &&
                    ['description', 'responsibilities', 'achievements', 'details', 'bullets'].includes(fieldKey)) {
                  contentField = fieldKey;
                  contentValue = fieldValue;
                  break;
                }
              }
              
              // If we found a valid content field, tailor it
              if (contentField && contentValue.length > 0) {
                const itemPrompt = `
                Tailor this ${key.replace(/_/g, ' ')} item to be more relevant for the job:
                
                ${Object.entries(item)
                  .filter(([k, v]) => k !== contentField && typeof v === 'string' && v.trim())
                  .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                  .join('\n')}
                
                Original ${contentField}:
                ${contentValue.join('\n')}
                
                Job details to tailor for:
                ${jobDetails}
                
                Provide ONLY a list of improved bullet points - one per line, without numbers, quotes, or any additional formatting.
                Focus on highlighting aspects that match the job requirements.
                Keep each bullet point concise and professional.
                Maintain approximately the same number of bullet points.
                `;
                
                try {
                  const result = await model.generateContent(itemPrompt);
                  const response = await result.response;
                  const tailoredContent = response.text()
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => line.trim().replace(/^[•\-\*]\s*/, ''));
                  
                  // Create a shallow copy of the item and update just the content field
                  const tailoredItem = { ...item };
                  if (tailoredContent.length > 0) {
                    tailoredItem[contentField] = tailoredContent;
                  }
                  
                  tailoredItems.push(tailoredItem);
                } catch (error) {
                  console.error(`Error tailoring ${key} item:`, error);
                  tailoredItems.push(item); // Keep original on error
                }
              } else {
                // If no content field found, keep the original item
                tailoredItems.push(item);
              }
            }
            
            tailoredResume[key] = tailoredItems;
          }
          
          console.log(`Section ${key} tailored successfully`);
        } catch (error) {
          console.error(`Error tailoring ${key} section:`, error);
          // Keep original on error
        }
      }
    }
    
    console.log("Resume tailoring completed successfully");
    return tailoredResume;
    
  } catch (error) {
    console.error("Error in overall tailoring process:", error);
    // Return the original resume as fallback in case of errors
    return resume;
  }
}
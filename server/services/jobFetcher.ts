import axios from "axios";
import { JSDOM } from "jsdom";

/**
 * Fetch and extract content from a job posting URL
 * @param url Job posting URL
 * @returns Extracted job details as text
 */
export async function fetchJobDetails(url: string): Promise<string> {
  try {
    // Validate URL
    const validatedUrl = validateUrl(url);
    
    // Fetch HTML content from URL
    const response = await axios.get(validatedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000, // 10 second timeout
    });
    
    // Parse HTML and extract job details
    const jobDetails = extractJobDetails(response.data);
    
    return jobDetails;
  } catch (error) {
    console.error("Error fetching job details:", error);
    throw new Error(`Failed to fetch job details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate and format the URL
 * @param url URL to validate
 * @returns Validated URL
 */
function validateUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch (error) {
    throw new Error("Invalid URL provided");
  }
}

/**
 * Extract job details from HTML content
 * @param html HTML content
 * @returns Extracted job details as text
 */
function extractJobDetails(html: string): string {
  try {
    // Parse HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract the main content
    // This is a simplified extraction - in production, you'd use more sophisticated
    // techniques to identify job descriptions across different websites
    
    // Common elements where job details might be found
    const possibleSelectors = [
      // Job description containers
      ".job-description",
      "#job-description",
      "[data-automation='jobDescriptionSection']",
      "[data-testid='jobDescriptionText']",
      ".description",
      "#description",
      
      // Job requirements
      ".job-requirements",
      "#job-requirements",
      ".qualifications",
      "#qualifications",
      
      // Generic content containers
      ".content",
      "#content",
      "article",
      "main",
      ".main",
    ];
    
    let contentElement = null;
    
    // Try each selector until we find content
    for (const selector of possibleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent && element.textContent.trim().length > 100) {
        contentElement = element;
        break;
      }
    }
    
    // If no specific container found, use the body
    if (!contentElement) {
      contentElement = document.body;
    }
    
    // Extract and clean text
    let jobDetails = contentElement.textContent || "";
    
    // Clean up the text
    jobDetails = jobDetails
      .replace(/\s+/g, " ")  // Replace multiple spaces with single space
      .replace(/\n+/g, "\n") // Replace multiple new lines with single new line
      .trim();
    
    return jobDetails;
  } catch (error) {
    console.error("Error extracting job details:", error);
    throw new Error("Failed to extract job details from the provided URL");
  }
}

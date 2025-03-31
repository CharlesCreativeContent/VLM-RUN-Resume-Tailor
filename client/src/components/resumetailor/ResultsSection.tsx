import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeSection } from "./ResumeSection";
import { ResumeData } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ResultsSectionProps {
  tailoredResume: ResumeData;
  onRestart: () => void;
  geminiApiKey?: string;
}

// Mapping for section names to make them more readable
const sectionTitles: Record<string, string> = {
  contact: "Contact Information",
  summary: "Professional Summary",
  experience: "Work Experience",
  workExperience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  publications: "Publications",
  conferences: "Conferences",
  volunteer_work: "Volunteer Work",
  additionalSections: "Additional Sections",
  technical_skills: "Technical Skills",
  certifications: "Certifications",
  languages: "Languages",
  interests: "Interests",
  achievements: "Achievements",
  awards: "Awards & Recognition",
  leadership: "Leadership Experience",
  extracurricular: "Extracurricular Activities",
  hobbies: "Hobbies & Interests",
  research: "Research Experience",
  relevant_courses: "Relevant Courses",
  coursework: "Coursework",
  portfolio: "Portfolio Projects",
  workshops: "Workshops & Training",
  community_service: "Community Service",
  military: "Military Service",
  patents: "Patents",
  references: "References",
  speaking_engagements: "Speaking Engagements",
  affiliations: "Professional Affiliations",
  volunteer_experience: "Volunteer Experience"
};

export function ResultsSection({ tailoredResume, onRestart, geminiApiKey }: ResultsSectionProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const askQuestionMutation = useMutation({
    mutationFn: async (data: { resume: ResumeData, question: string, geminiApiKey: string }) => {
      const response = await apiRequest("POST", '/api/resume/question', data);
      return response.json(); // Parse the JSON from the response
    },
    onSuccess: (data: any) => {
      // Log the response to help debug
      console.log("Question answer received:", data);
      
      // Process the answer for display
      if (data && typeof data.answer === 'string' && data.answer.trim()) {
        console.log("Setting answer:", data.answer.substring(0, 50) + "...");
        setAnswer(data.answer.trim());
      } else {
        setAnswer("No answer was generated. Please try another question.");
      }
    },
    onError: (error) => {
      console.error("Error asking question:", error);
      setAnswer("Sorry, I couldn't process your question. Please try again.");
    }
  });

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    if (!geminiApiKey) {
      setAnswer("Error: Please provide a Gemini API key to ask questions.");
      return;
    }
    
    askQuestionMutation.mutate({
      resume: tailoredResume,
      question: question.trim(),
      geminiApiKey
    });
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(tailoredResume, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tailored-resume.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Format a section key into a readable title
  const formatSectionTitle = (key: string): string => {
    // Check if we have a pre-defined title for this section
    if (sectionTitles[key]) {
      return sectionTitles[key];
    }
    
    // Otherwise, format the key name by:
    // 1. Converting underscores to spaces
    // 2. Capitalizing each word
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Determine if a section should be displayed based on its content
  const shouldDisplaySection = (key: string, value: any): boolean => {
    if (value === null || value === undefined) {
      return false;
    }
    
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    
    return false;
  };

  return (
    <section>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Ask Questions to Your Tailored Resume</h2>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onRestart}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Start Over
            </Button>
            <Button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 bg-secondary text-white text-sm font-medium rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              Download JSON
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleAskQuestion} className="mb-4">
          <div className="flex gap-3">
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this resume (e.g., 'What are the key skills for a Developer Relations role?')"
              className="flex-1"
            />
            <Button 
              type="submit"
              disabled={askQuestionMutation.isPending || !question.trim()}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {askQuestionMutation.isPending ? "Asking..." : "Ask"}
            </Button>
          </div>
        </form>
        
        {/* Only show the answer container when needed */}
        {(askQuestionMutation.isPending || answer) && (
          <div className="mb-6 mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {askQuestionMutation.isPending ? (
              <>
                <h3 className="text-base font-medium mb-2">Generating answer...</h3>
                <div className="text-sm animate-pulse">Thinking...</div>
              </>
            ) : answer && (
              <>
                <h3 className="text-base font-medium mb-2 text-primary">Answer:</h3>
                <div className="text-sm prose prose-sm max-w-none bg-white p-3 rounded border border-slate-100">
                  {answer.split('\n').map((line, i) => {
                    // Skip empty lines
                    if (!line.trim()) {
                      return <div key={i} className="h-2"></div>;
                    }
                    
                    // Handle markdown bullet points
                    if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                      return (
                        <div key={i} className="ml-2 my-1 flex">
                          <span className="mr-2 text-primary">•</span>
                          <span>{line.trim().replace(/^[*\-]\s*/, '')}</span>
                        </div>
                      );
                    }
                    
                    // Handle headers (e.g., # Header)
                    if (line.trim().startsWith('#')) {
                      const level = line.trim().match(/^#+/)?.[0].length || 1;
                      const text = line.trim().replace(/^#+\s*/, '');
                      
                      if (level === 1) {
                        return <h3 key={i} className="text-lg font-semibold mt-3 mb-2">{text}</h3>;
                      } else {
                        return <h4 key={i} className="text-base font-medium mt-2 mb-1">{text}</h4>;
                      }
                    }
                    
                    // Handle regular text
                    return <div key={i} className="my-1">{line}</div>;
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Dynamically render all resume sections based on what's available in the data */}
        {Object.entries(tailoredResume).map(([key, value]) => {
          // Skip the additionalSections property as we'll handle it separately
          if (key === 'additionalSections') {
            return null;
          }
          
          // Only display sections that have content
          if (!shouldDisplaySection(key, value)) {
            return null;
          }
          
          // Special handling for workExperience vs experience - avoid displaying both
          if (key === 'experience' && tailoredResume.workExperience && 
              Array.isArray(tailoredResume.workExperience) && 
              tailoredResume.workExperience.length > 0) {
            return null;
          }
          
          // Special handling for skills vs technical_skills - avoid displaying both empty skills
          if (key === 'skills' && tailoredResume.technical_skills && 
              typeof tailoredResume.technical_skills === 'object') {
            return null;
          }
          
          // Use the section ID directly
          const sectionId = key;
          
          return (
            <ResumeSection
              key={key}
              title={formatSectionTitle(key)}
              sectionId={sectionId}
              content={value}
            />
          );
        })}
        
        {/* Handle additional sections if present */}
        {tailoredResume.additionalSections && 
          typeof tailoredResume.additionalSections === 'object' && 
          Object.keys(tailoredResume.additionalSections).length > 0 && 
          Object.entries(tailoredResume.additionalSections).map(([sectionName, items]) => {
            if (Array.isArray(items) && items.length > 0) {
              return (
                <ResumeSection
                  key={sectionName}
                  title={formatSectionTitle(sectionName)}
                  sectionId={`additionalSection-${sectionName}`}
                  content={items}
                />
              );
            }
            return null;
          })
        }
      </div>
    </section>
  );
}

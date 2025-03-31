import { Button } from "@/components/ui/button";
import { ResumeSection } from "./ResumeSection";
import { ResumeData } from "@shared/schema";

interface ResultsSectionProps {
  tailoredResume: ResumeData;
  onRestart: () => void;
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

export function ResultsSection({ tailoredResume, onRestart }: ResultsSectionProps) {
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
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Tailored Resume</h2>
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
          
          // Special case for technical_skills (which should be rendered like 'skills')
          const sectionId = key === 'technical_skills' ? 'skills' : key;
          
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

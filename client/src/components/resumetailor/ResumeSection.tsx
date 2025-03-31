import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ResumeSectionProps {
  title: string;
  sectionId: string;
  content: any;
}

export function ResumeSection({ title, sectionId, content }: ResumeSectionProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = () => {
    // Check if content is empty
    const isEmptyContent = () => {
      if (typeof content === 'undefined' || content === null) return true;
      if (typeof content === 'string') return content.trim() === '';
      if (Array.isArray(content)) return content.length === 0;
      if (typeof content === 'object') return Object.keys(content).length === 0;
      return false;
    };
    
    // Show message if trying to copy empty content
    if (isEmptyContent()) {
      toast({
        title: "Nothing to copy",
        description: `No content available for ${title}`,
        variant: "destructive"
      });
      return;
    }
    
    // Convert content to string representation
    let textToCopy = '';
    
    if (typeof content === 'string') {
      textToCopy = content.trim();
    } else if (sectionId === 'contact') {
      const contact = content as any;
      const contactLines = [];
      
      if (contact.name) contactLines.push(contact.name);
      if (contact.location) contactLines.push(contact.location);
      
      const contactInfo = [];
      if (contact.email) contactInfo.push(contact.email);
      if (contact.phone) contactInfo.push(contact.phone);
      if (contactInfo.length > 0) contactLines.push(contactInfo.join(' | '));
      
      const links = [];
      if (contact.linkedin) links.push(contact.linkedin);
      if (contact.github) links.push(contact.github);
      if (links.length > 0) contactLines.push(links.join(' | '));
      
      textToCopy = contactLines.join('\n');
    } else if (sectionId === 'experience') {
      if (Array.isArray(content)) {
        const experience = content as any[];
        textToCopy = experience.map(exp => {
          const expLines = [];
          
          if (exp.title) expLines.push(exp.title);
          
          const companyDetails = [];
          if (exp.company) companyDetails.push(exp.company);
          if (exp.location) companyDetails.push(exp.location);
          
          const dateRange = [];
          if (exp.startDate) dateRange.push(exp.startDate);
          if (exp.endDate) dateRange.push(exp.endDate);
          
          const companyLine = [];
          if (companyDetails.length > 0) companyLine.push(companyDetails.join(', '));
          if (dateRange.length > 0) companyLine.push(dateRange.join(' - '));
          
          if (companyLine.length > 0) expLines.push(companyLine.join(' | '));
          
          if (Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0) {
            expLines.push(...exp.responsibilities.map((r: string) => `• ${r}`));
          }
          
          return expLines.join('\n');
        }).join('\n\n');
      }
    } else if (sectionId === 'education') {
      if (Array.isArray(content)) {
        const education = content as any[];
        textToCopy = education.map(edu => {
          const eduLines = [];
          
          if (edu.degree) eduLines.push(edu.degree);
          
          const instLine = [];
          if (edu.institution) instLine.push(edu.institution);
          if (edu.years) instLine.push(edu.years);
          if (instLine.length > 0) eduLines.push(instLine.join(' | '));
          
          if (edu.gpa) eduLines.push(`GPA: ${edu.gpa}`);
          
          return eduLines.join('\n');
        }).join('\n\n');
      }
    } else if (sectionId === 'skills') {
      const skills = content as any;
      const skillLines = [];
      
      if (Array.isArray(skills.languages) && skills.languages.length > 0) {
        skillLines.push(`Languages: ${skills.languages.join(', ')}`);
      }
      
      if (Array.isArray(skills.frameworks) && skills.frameworks.length > 0) {
        skillLines.push(`Frameworks/Libraries: ${skills.frameworks.join(', ')}`);
      }
      
      if (Array.isArray(skills.tools) && skills.tools.length > 0) {
        skillLines.push(`Tools: ${skills.tools.join(', ')}`);
      }
      
      if (Array.isArray(skills.concepts) && skills.concepts.length > 0) {
        skillLines.push(`Concepts: ${skills.concepts.join(', ')}`);
      }
      
      textToCopy = skillLines.join('\n');
    } else if (sectionId === 'projects') {
      if (Array.isArray(content)) {
        const projects = content as any[];
        textToCopy = projects.map(proj => {
          const projLines = [];
          
          if (proj.name) projLines.push(proj.name);
          
          if (Array.isArray(proj.description) && proj.description.length > 0) {
            projLines.push(...proj.description.map((d: string) => `• ${d}`));
          }
          
          return projLines.join('\n');
        }).join('\n\n');
      }
    } else if (sectionId === 'workExperience') {
      if (Array.isArray(content)) {
        const experiences = content as any[];
        textToCopy = experiences.map(exp => {
          const expLines = [];
          
          // Title/Position line
          if (exp.position) {
            expLines.push(exp.position);
          }
          
          // Company and date line
          const companyDateLine = [];
          if (exp.company) companyDateLine.push(exp.company);
          
          const dateRange = [];
          if (exp.startDate) dateRange.push(exp.startDate);
          if (exp.endDate) dateRange.push(exp.endDate);
          else if (exp.isCurrent) dateRange.push('Present');
          
          if (dateRange.length > 0) {
            companyDateLine.push(dateRange.join(' - '));
          }
          
          if (companyDateLine.length > 0) {
            expLines.push(companyDateLine.join(' | '));
          }
          
          // Responsibilities
          if (Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0) {
            expLines.push(...exp.responsibilities.map((r: string) => `• ${r}`));
          }
          
          // Technologies used
          if (Array.isArray(exp.technologies) && exp.technologies.length > 0) {
            expLines.push(`Technologies: ${exp.technologies.join(', ')}`);
          }
          
          return expLines.join('\n');
        }).join('\n\n');
      }
    } else if (sectionId.startsWith('additionalSection-')) {
      if (Array.isArray(content)) {
        // Format each item as a bullet point
        textToCopy = content.map((item: string) => `• ${item}`).join('\n');
      }
    } else {
      // Default to JSON
      textToCopy = JSON.stringify(content, null, 2);
    }
    
    // If after all processing, there's still no text, show error
    if (!textToCopy.trim()) {
      toast({
        title: "Nothing to copy",
        description: `No content available for ${title}`,
        variant: "destructive"
      });
      return;
    }
    
    // Create a temporary textarea element to copy the text
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Set copied state
    setIsCopied(true);
    
    // Show toast notification
    toast({
      title: "Copied!",
      description: `${title} copied to clipboard`,
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  const renderContent = () => {
    // Add a "not available" message when content is empty
    const renderEmptyState = () => (
      <div className="text-sm text-gray-500 italic">
        <p>No content available for this section.</p>
      </div>
    );
    
    // Check if the content is empty (by type)
    const isEmptyContent = () => {
      if (typeof content === 'undefined' || content === null) return true;
      if (typeof content === 'string') return content.trim() === '';
      if (Array.isArray(content)) return content.length === 0;
      if (typeof content === 'object') return Object.keys(content).length === 0;
      return false;
    };
    
    // Return empty state if content is empty
    if (isEmptyContent()) {
      return renderEmptyState();
    }
    
    if (sectionId === 'contact') {
      const contact = content as any;
      
      // Check if all contact fields are empty
      const allEmpty = 
        !contact.name && 
        !contact.location && 
        !contact.email && 
        !contact.phone && 
        !contact.linkedin && 
        !contact.github;
        
      if (allEmpty) return renderEmptyState();
      
      return (
        <div className="text-sm text-gray-700 space-y-2">
          {contact.name && <p className="font-medium">{contact.name}</p>}
          {contact.location && <p>{contact.location}</p>}
          
          {/* Only show the email/phone line if at least one exists */}
          {(contact.email || contact.phone) && (
            <p>
              {contact.email}
              {contact.email && contact.phone && " | "}
              {contact.phone}
            </p>
          )}
          
          {/* Only show the linkedin/github line if at least one exists */}
          {(contact.linkedin || contact.github) && (
            <p>
              {contact.linkedin}
              {contact.linkedin && contact.github && " | "}
              {contact.github}
            </p>
          )}
        </div>
      );
    } 
    
    if (sectionId === 'summary') {
      if (!content || content.trim() === '') return renderEmptyState();
      
      return (
        <div className="text-sm text-gray-700">
          <p>{content}</p>
        </div>
      );
    }
    
    if (sectionId === 'experience') {
      if (!Array.isArray(content) || content.length === 0) return renderEmptyState();
      
      return (
        <div className="text-sm text-gray-700 space-y-4">
          {content.map((experience: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between">
                <p className="font-medium">{experience.title || 'Untitled Position'}</p>
                <p className="text-sm text-gray-500">
                  {experience.startDate || ''}
                  {experience.startDate && experience.endDate && " - "}
                  {experience.endDate || ''}
                </p>
              </div>
              <p className="text-sm">
                {experience.company || ''}
                {experience.company && experience.location && ", "}
                {experience.location || ''}
              </p>
              
              {Array.isArray(experience.responsibilities) && experience.responsibilities.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                  {experience.responsibilities.map((responsibility: string, respIndex: number) => (
                    <li key={respIndex}>{responsibility}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    if (sectionId === 'education') {
      if (!Array.isArray(content) || content.length === 0) return renderEmptyState();
      
      return (
        <div className="text-sm text-gray-700 space-y-3">
          {content.map((education: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between">
                <p className="font-medium">{education.degree || 'Degree not specified'}</p>
                {education.years && <p className="text-sm text-gray-500">{education.years}</p>}
              </div>
              {education.institution && <p>{education.institution}</p>}
              {education.gpa && <p>GPA: {education.gpa}</p>}
            </div>
          ))}
        </div>
      );
    }
    
    if (sectionId === 'skills') {
      if (!content || !content.languages && !content.frameworks && !content.tools && !content.concepts) {
        return renderEmptyState();
      }
      
      return (
        <div className="text-sm text-gray-700">
          <div className="space-y-2">
            {Array.isArray(content.languages) && content.languages.length > 0 && (
              <p><span className="font-medium">Languages:</span> {content.languages.join(', ')}</p>
            )}
            
            {Array.isArray(content.frameworks) && content.frameworks.length > 0 && (
              <p><span className="font-medium">Frameworks/Libraries:</span> {content.frameworks.join(', ')}</p>
            )}
            
            {Array.isArray(content.tools) && content.tools.length > 0 && (
              <p><span className="font-medium">Tools:</span> {content.tools.join(', ')}</p>
            )}
            
            {Array.isArray(content.concepts) && content.concepts.length > 0 && (
              <p><span className="font-medium">Concepts:</span> {content.concepts.join(', ')}</p>
            )}
          </div>
        </div>
      );
    }
    
    if (sectionId === 'projects') {
      if (!Array.isArray(content) || content.length === 0) return renderEmptyState();
      
      return (
        <div className="text-sm text-gray-700 space-y-4">
          {content.map((project: any, index: number) => (
            <div key={index} className="space-y-1">
              <p className="font-medium">{project.name || 'Untitled Project'}</p>
              
              {Array.isArray(project.description) && project.description.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                  {project.description.map((desc: string, descIndex: number) => (
                    <li key={descIndex}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    if (sectionId === 'workExperience') {
      if (!Array.isArray(content) || content.length === 0) return renderEmptyState();
      
      return (
        <div className="text-sm text-gray-700 space-y-4">
          {content.map((exp: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between">
                <p className="font-medium">{exp.position || 'Position not specified'}</p>
                <p className="text-sm text-gray-500">
                  {exp.startDate || ''}
                  {exp.startDate && exp.endDate && " - "}
                  {exp.endDate || (exp.isCurrent ? 'Present' : '')}
                </p>
              </div>
              <p className="text-sm">{exp.company || 'Company not specified'}</p>
              
              {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                  {exp.responsibilities.map((responsibility: string, respIndex: number) => (
                    <li key={respIndex}>{responsibility}</li>
                  ))}
                </ul>
              )}
              
              {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                <p className="mt-1"><span className="font-medium">Technologies:</span> {exp.technologies.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    if (sectionId.startsWith('additionalSection-')) {
      // This is a custom section from additional_sections
      if (!Array.isArray(content) || content.length === 0) {
        console.log("Empty additional section content:", content);
        return renderEmptyState();
      }
      
      console.log("Rendering additional section content:", content);
      
      return (
        <div className="text-sm text-gray-700">
          <ul className="list-disc pl-5 space-y-2">
            {content.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
    
    // Default fallback to JSON representation
    return <pre className="text-sm text-gray-700">{JSON.stringify(content, null, 2)}</pre>;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-800">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            ></path>
          </svg>
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, ClipboardCopy } from "lucide-react";

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
      const contactLines: string[] = [];
      
      // Format each contact field on its own line
      Object.entries(contact).forEach(([key, value]) => {
        if (value) {
          // Format the label from camelCase to Title Case
          const formattedLabel = key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
          
          contactLines.push(`${formattedLabel}: ${value}`);
        }
      });
      
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
      const skillLines: string[] = [];
      
      // Mapping of category keys to display names
      const categoryLabels = {
        languages: 'Languages',
        frameworks: 'Frameworks/Libraries',
        tools: 'Tools',
        concepts: 'Concepts'
      };
      
      // Iterate through all properties in the skills object
      Object.entries(skills).forEach(([category, skillArray]) => {
        // Skip if not an array or empty array
        if (!Array.isArray(skillArray) || skillArray.length === 0) {
          return;
        }
        
        // Get the display name for this category or use the category key with first letter capitalized
        const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || 
          category.charAt(0).toUpperCase() + category.slice(1);
        
        skillLines.push(`${categoryLabel}: ${skillArray.join(', ')}`);
      });
      
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
      
      // Render each contact field as a separate entry
      return (
        <div className="text-sm text-gray-700 space-y-2">
          {Object.entries(contact).map(([key, value]) => {
            // Skip empty values
            if (!value) return null;
            
            // Format the label from camelCase to Title Case
            const formattedLabel = key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
            
            return (
              <div key={key} className="flex">
                <span className="font-medium w-24">{formattedLabel}:</span>
                <span>{String(value)}</span>
              </div>
            );
          })}
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
    
    if (sectionId === 'technical_skills') {
      // Special handling for technical_skills structure from VLM Run
      if (!content || typeof content !== 'object') {
        return renderEmptyState();
      }
      
      console.log("Rendering technical skills:", content);
      
      return (
        <div className="text-sm text-gray-700">
          <div className="space-y-3">
            {Object.entries(content).map(([category, skills]) => {
              // Skip if not an array or empty array
              if (!Array.isArray(skills) || skills.length === 0) {
                return null;
              }
              
              // Format the category name
              const formattedCategory = category
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              
              return (
                <div key={category} className="mb-2">
                  <div className="font-medium mb-1">{formattedCategory}:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {skills.map((skill: any, index: number) => (
                      <li key={index}>
                        {typeof skill === 'object' && skill !== null
                          ? skill.name || JSON.stringify(skill)
                          : String(skill)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (sectionId === 'skills') {
      // Check if skills object is missing or has no valid arrays
      if (!content || typeof content !== 'object') {
        return renderEmptyState();
      }
      
      // Count how many valid skill categories we have
      const validCategories = ['languages', 'frameworks', 'tools', 'concepts'].filter(
        category => Array.isArray(content[category]) && content[category].length > 0
      );
      
      if (validCategories.length === 0) {
        return renderEmptyState();
      }
      
      // Mapping of category keys to display names
      const categoryLabels = {
        languages: 'Languages',
        frameworks: 'Frameworks/Libraries',
        tools: 'Tools',
        concepts: 'Concepts'
      };
      
      return (
        <div className="text-sm text-gray-700">
          <div className="space-y-2">
            {Object.entries(content).map(([category, skills]) => {
              // Skip if not an array or empty array
              if (!Array.isArray(skills) || skills.length === 0) {
                return null;
              }
              
              // Get the display name for this category or use the category key with first letter capitalized
              const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || 
                category.charAt(0).toUpperCase() + category.slice(1);
              
              return (
                <div key={category} className="mb-2">
                  <span className="font-medium">{categoryLabel}:</span>{' '}
                  {skills.join(', ')}
                </div>
              );
            })}
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
    
    // For array sections: display as bullet points
    if (Array.isArray(content)) {
      return (
        <div className="text-sm text-gray-700">
          <ul className="list-disc pl-5 space-y-2">
            {content.map((item: any, index: number) => {
              // If item is a string, render directly
              if (typeof item === 'string') {
                return <li key={index}>{item}</li>;
              }
              
              // If item is an object, try to extract common fields
              if (typeof item === 'object' && item !== null) {
                // Try to find a title/name property
                const title = 
                  item.title || 
                  item.name || 
                  item.position || 
                  item.topic || 
                  item.header || 
                  '';
                
                // Try to find a description property
                let description = '';
                if (Array.isArray(item.description)) {
                  description = item.description.join(', ');
                } else if (typeof item.description === 'string') {
                  description = item.description;
                }
                
                // Try to find a date range
                const dateRange = [];
                if (item.date) dateRange.push(item.date);
                if (item.startDate || item.start_date) dateRange.push(item.startDate || item.start_date);
                if (item.endDate || item.end_date) {
                  dateRange.push(' - ');
                  dateRange.push(item.endDate || item.end_date);
                } else if (item.isCurrent || item.is_current) {
                  dateRange.push(' - Present');
                }
                
                // Try to find a location
                const location = item.location || '';
                
                // Combine components
                const parts = [];
                if (title) parts.push(<span key="title" className="font-medium">{title}</span>);
                if (dateRange.length > 0) parts.push(<span key="date" className="text-gray-500 ml-2">{dateRange.join('')}</span>);
                if (location) parts.push(<span key="location" className="ml-2">{location}</span>);
                if (description) parts.push(<div key="desc" className="mt-1">{description}</div>);
                
                // If we found any recognizable content
                if (parts.length > 0) {
                  return <li key={index} className="mb-2">{parts}</li>;
                }
                
                // Otherwise display the whole object as JSON
                return (
                  <li key={index}>
                    <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(item, null, 2)}</pre>
                  </li>
                );
              }
              
              // Fallback
              return <li key={index}>{String(item)}</li>;
            })}
          </ul>
        </div>
      );
    }
    
    // For object sections not handled above
    if (typeof content === 'object' && content !== null) {
      return (
        <div className="text-sm text-gray-700 space-y-2">
          {Object.entries(content).map(([key, value]) => {
            // Skip empty values
            if (!value || 
                (typeof value === 'string' && value.trim() === '') || 
                (Array.isArray(value) && value.length === 0)) {
              return null;
            }
            
            // Format the key name
            const formattedKey = key
              .replace(/_/g, ' ')
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
            
            // Render arrays with commas
            let formattedValue;
            if (Array.isArray(value)) {
              formattedValue = value.join(', ');
            } else {
              formattedValue = String(value);
            }
            
            return (
              <div key={key} className="flex">
                <span className="font-medium w-36">{formattedKey}:</span>
                <span>{formattedValue}</span>
              </div>
            );
          })}
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
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary transition-colors duration-200"
        >
          {isCopied ? (
            <>
              <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardCopy className="h-4 w-4 mr-1" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
}

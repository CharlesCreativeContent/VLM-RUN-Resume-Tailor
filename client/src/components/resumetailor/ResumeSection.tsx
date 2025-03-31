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
    // Convert content to string representation
    let textToCopy = '';
    
    if (typeof content === 'string') {
      textToCopy = content;
    } else if (sectionId === 'contact') {
      const contact = content as any;
      textToCopy = [
        contact.name,
        contact.location,
        `${contact.email} | ${contact.phone}`,
        `${contact.linkedin} | ${contact.github}`,
      ].join('\n');
    } else if (sectionId === 'experience') {
      const experience = content as any[];
      textToCopy = experience.map(exp => {
        return [
          `${exp.title}`,
          `${exp.company}, ${exp.location} | ${exp.startDate} - ${exp.endDate}`,
          ...exp.responsibilities.map(r => `• ${r}`)
        ].join('\n');
      }).join('\n\n');
    } else if (sectionId === 'education') {
      const education = content as any[];
      textToCopy = education.map(edu => {
        return [
          `${edu.degree}`,
          `${edu.institution} | ${edu.years}`,
          `GPA: ${edu.gpa}`
        ].join('\n');
      }).join('\n\n');
    } else if (sectionId === 'skills') {
      const skills = content as any;
      textToCopy = [
        `Languages: ${skills.languages.join(', ')}`,
        `Frameworks/Libraries: ${skills.frameworks.join(', ')}`,
        `Tools: ${skills.tools.join(', ')}`,
        `Concepts: ${skills.concepts.join(', ')}`
      ].join('\n');
    } else if (sectionId === 'projects') {
      const projects = content as any[];
      textToCopy = projects.map(proj => {
        return [
          `${proj.name}`,
          ...proj.description.map(d => `• ${d}`)
        ].join('\n');
      }).join('\n\n');
    } else {
      textToCopy = JSON.stringify(content, null, 2);
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
    if (sectionId === 'contact') {
      const contact = content as any;
      return (
        <div className="text-sm text-gray-700 space-y-2">
          <p className="font-medium">{contact.name}</p>
          <p>{contact.location}</p>
          <p>{contact.email} | {contact.phone}</p>
          <p>{contact.linkedin} | {contact.github}</p>
        </div>
      );
    } 
    
    if (sectionId === 'summary') {
      return (
        <div className="text-sm text-gray-700">
          <p>{content}</p>
        </div>
      );
    }
    
    if (sectionId === 'experience') {
      return (
        <div className="text-sm text-gray-700 space-y-4">
          {content.map((experience: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between">
                <p className="font-medium">{experience.title}</p>
                <p className="text-sm text-gray-500">{experience.startDate} - {experience.endDate}</p>
              </div>
              <p className="text-sm">{experience.company}, {experience.location}</p>
              <ul className="list-disc pl-5 space-y-1">
                {experience.responsibilities.map((responsibility: string, respIndex: number) => (
                  <li key={respIndex}>{responsibility}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    
    if (sectionId === 'education') {
      return (
        <div className="text-sm text-gray-700 space-y-3">
          {content.map((education: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between">
                <p className="font-medium">{education.degree}</p>
                <p className="text-sm text-gray-500">{education.years}</p>
              </div>
              <p>{education.institution}</p>
              <p>GPA: {education.gpa}</p>
            </div>
          ))}
        </div>
      );
    }
    
    if (sectionId === 'skills') {
      return (
        <div className="text-sm text-gray-700">
          <div className="space-y-2">
            <p><span className="font-medium">Languages:</span> {content.languages.join(', ')}</p>
            <p><span className="font-medium">Frameworks/Libraries:</span> {content.frameworks.join(', ')}</p>
            <p><span className="font-medium">Tools:</span> {content.tools.join(', ')}</p>
            <p><span className="font-medium">Concepts:</span> {content.concepts.join(', ')}</p>
          </div>
        </div>
      );
    }
    
    if (sectionId === 'projects') {
      return (
        <div className="text-sm text-gray-700 space-y-4">
          {content.map((project: any, index: number) => (
            <div key={index} className="space-y-1">
              <p className="font-medium">{project.name}</p>
              <ul className="list-disc pl-5 space-y-1">
                {project.description.map((desc: string, descIndex: number) => (
                  <li key={descIndex}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    
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

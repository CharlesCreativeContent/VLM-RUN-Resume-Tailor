import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export interface TailoredResume {
  personal?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    period?: string;
    details?: string[];
  }>;
  education?: {
    degree?: string;
    institution?: string;
    period?: string;
    gpa?: string;
  };
  // Add any other sections as needed
}

interface ResumeSection {
  id: string;
  title: string;
  content: string | React.ReactNode;
}

interface ResultsSectionProps {
  resume: TailoredResume;
  onStartOver: () => void;
}

export default function ResultsSection({ resume, onStartOver }: ResultsSectionProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper function to convert resume object to sections
  const resumeSections: ResumeSection[] = [
    // Personal Information Section
    {
      id: "personal",
      title: "Personal Information",
      content: resume.personal 
        ? (
          <p>
            {resume.personal.name}<br />
            {resume.personal.address}<br />
            {resume.personal.phone}<br />
            {resume.personal.email}
          </p>
        ) 
        : "No personal information available",
    },
    // Summary Section
    {
      id: "summary",
      title: "Summary",
      content: resume.summary || "No summary available",
    },
    // Skills Section
    {
      id: "skills",
      title: "Skills",
      content: resume.skills && resume.skills.length > 0 
        ? (
          <ul>
            {resume.skills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        ) 
        : "No skills available",
    },
    // Experience Section
    {
      id: "experience",
      title: "Experience",
      content: resume.experience && resume.experience.length > 0 
        ? (
          <div>
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <h5 className="font-medium">{exp.title} - {exp.company}</h5>
                <p className="text-xs text-slate-500">{exp.period}</p>
                {exp.details && exp.details.length > 0 && (
                  <ul className="mt-2">
                    {exp.details.map((detail, detailIdx) => (
                      <li key={detailIdx}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) 
        : "No experience available",
    },
    // Education Section
    {
      id: "education",
      title: "Education",
      content: resume.education 
        ? (
          <div>
            <h5 className="font-medium">{resume.education.degree}</h5>
            <p>{resume.education.institution}, {resume.education.period}</p>
            {resume.education.gpa && <p>GPA: {resume.education.gpa}</p>}
          </div>
        ) 
        : "No education information available",
    },
  ];

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : '')
      .then(() => {
        setCopiedId(sectionId);
        toast({
          title: "Copied!",
          description: "Section copied to clipboard",
        });

        // Reset copied status after 2 seconds
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy text to clipboard",
          variant: "destructive",
        });
      });
  };

  // Helper function to extract plain text from React nodes
  const extractTextContent = (content: string | React.ReactNode): string => {
    if (typeof content === 'string') {
      return content;
    }
    
    // This is a simplified approach - in a real app you might need a more robust solution
    return JSON.stringify(content)
      .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
      .replace(/[{}[\],:\\"]/g, " ")  // Replace JSON syntax with spaces
      .replace(/\s+/g, " ")           // Replace multiple spaces with one
      .trim();
  };

  return (
    <Card className="bg-white rounded-lg shadow-md col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Your Tailored Resume</h3>
          <div className="flex space-x-2">
            <Button
              onClick={onStartOver}
              variant="outline"
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md text-slate-700"
            >
              <span className="material-icons text-sm mr-1">refresh</span>
              <span>Start Over</span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {resumeSections.map((section) => (
            <div key={section.id} className="resume-section bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-slate-900">{section.title}</h4>
                <Button
                  onClick={() => copyToClipboard(extractTextContent(section.content), section.id)}
                  variant="outline"
                  size="sm"
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                    copiedId === section.id
                      ? "text-green-700 bg-green-50 hover:bg-green-100"
                      : "text-primary-700 bg-primary-50 hover:bg-primary-100"
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors`}
                >
                  <span className="material-icons text-sm mr-1">
                    {copiedId === section.id ? "check" : "content_copy"}
                  </span>
                  <span>{copiedId === section.id ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
              <div className="prose prose-sm max-w-none text-slate-700">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

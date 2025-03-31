import { Button } from "@/components/ui/button";
import { ResumeSection } from "./ResumeSection";
import { ResumeData } from "@shared/schema";

interface ResultsSectionProps {
  tailoredResume: ResumeData;
  onRestart: () => void;
}

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
        {/* Contact Information Section */}
        <ResumeSection
          title="Contact Information"
          sectionId="contact"
          content={tailoredResume.contact}
        />
        
        {/* Summary Section */}
        <ResumeSection
          title="Professional Summary"
          sectionId="summary"
          content={tailoredResume.summary}
        />
        
        {/* Experience Section */}
        <ResumeSection
          title="Work Experience"
          sectionId="experience"
          content={tailoredResume.experience}
        />
        
        {/* Education Section */}
        <ResumeSection
          title="Education"
          sectionId="education"
          content={tailoredResume.education}
        />
        
        {/* Skills Section */}
        <ResumeSection
          title="Skills"
          sectionId="skills"
          content={tailoredResume.skills}
        />
        
        {/* Projects Section */}
        <ResumeSection
          title="Projects"
          sectionId="projects"
          content={tailoredResume.projects}
        />
        
        {/* Work Experience Section (if present) */}
        {tailoredResume.workExperience && tailoredResume.workExperience.length > 0 && (
          <ResumeSection
            title="Work Experience"
            sectionId="workExperience"
            content={tailoredResume.workExperience}
          />
        )}
        
        {/* Additional Sections (if present) */}
        {tailoredResume.additionalSections && Object.keys(tailoredResume.additionalSections).length > 0 && 
          Object.entries(tailoredResume.additionalSections).map(([sectionName, items]) => (
            <ResumeSection
              key={sectionName}
              title={sectionName.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
              sectionId={`additionalSection-${sectionName}`}
              content={items}
            />
          ))
        }
      </div>
    </section>
  );
}

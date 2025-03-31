import { FormSection } from "@/components/resumetailor/FormSection";
import { LoadingSection } from "@/components/resumetailor/LoadingSection";
import { ResultsSection } from "@/components/resumetailor/ResultsSection";
import { ErrorSection } from "@/components/resumetailor/ErrorSection";
import { useState } from "react";
import { ResumeData } from "@shared/schema";

type AppView = "form" | "results";
type LoadingStep = "idle" | "parse" | "fetch" | "tailor";

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalResume, setOriginalResume] = useState<ResumeData | null>(null);
  const [tailoredResume, setTailoredResume] = useState<ResumeData | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("idle");

  // Reset to initial form state
  const handleRestart = () => {
    setCurrentView("form");
    setTailoredResume(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Resume Tailor</h1>
          <p className="text-gray-600 mt-2">
            Customize your resume instantly for any job application
          </p>
        </header>

        {/* Main Content */}
        <main>
          {/* Form Section */}
          {!isLoading && !error && currentView === "form" && (
            <FormSection
              setIsLoading={setIsLoading}
              setError={setError}
              setLoadingStep={setLoadingStep}
              setOriginalResume={setOriginalResume}
              setTailoredResume={setTailoredResume}
              setCurrentView={setCurrentView}
            />
          )}

          {/* Loading Section */}
          {isLoading && (
            <LoadingSection loadingStep={loadingStep} />
          )}

          {/* Error Section */}
          {error && (
            <ErrorSection 
              error={error} 
              onTryAgain={() => {
                setError(null);
                setCurrentView("form");
              }} 
            />
          )}

          {/* Results Section */}
          {!isLoading && !error && currentView === "results" && tailoredResume && (
            <ResultsSection 
              tailoredResume={tailoredResume} 
              onRestart={handleRestart} 
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Resume Tailor. All rights reserved.</p>
          <p className="mt-1">Powered by VLM Run & Gemini</p>
        </footer>
      </div>
    </div>
  );
}

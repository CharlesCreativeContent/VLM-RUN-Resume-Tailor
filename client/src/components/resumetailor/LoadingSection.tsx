import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingStepProps {
  step: string;
  label: string;
  currentStep: string;
}

function LoadingStep({ step, label, currentStep }: LoadingStepProps) {
  const isCompleted = 
    (currentStep === "fetch" && step === "parse") ||
    (currentStep === "tailor" && (step === "parse" || step === "fetch"));
  
  const isActive = currentStep === step;

  return (
    <div className="flex items-center space-x-3">
      <div 
        className={cn(
          "loading-step-indicator h-6 w-6 rounded-full flex items-center justify-center",
          isCompleted ? "bg-green-500" : 
          isActive ? "bg-blue-500" : 
          "bg-gray-200"
        )}
      >
        {isCompleted && (
          <svg 
            className="h-4 w-4 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
        {isActive && (
          <div className="h-3 w-3 rounded-full border-2 border-gray-500 border-t-transparent animate-spin"></div>
        )}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

interface LoadingSectionProps {
  loadingStep: "idle" | "parse" | "fetch" | "tailor";
}

export function LoadingSection({ loadingStep }: LoadingSectionProps) {
  const getLoadingTitle = () => {
    switch (loadingStep) {
      case "parse":
        return "Processing Your Resume";
      case "fetch":
        return "Analyzing Job Posting";
      case "tailor":
        return "Tailoring Your Resume";
      default:
        return "Processing";
    }
  };

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case "parse":
        return "Converting your PDF to structured data...";
      case "fetch":
        return "Retrieving and processing the job description...";
      case "tailor":
        return "Customizing your resume for this specific job...";
      default:
        return "Please wait...";
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12">
          <svg 
            className="animate-spin h-12 w-12 text-primary mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {getLoadingTitle()}
          </h2>
          <p className="text-gray-600">{getLoadingMessage()}</p>
          
          {/* Loading Steps */}
          <div className="w-full max-w-md mt-6 space-y-3">
            <LoadingStep 
              step="parse" 
              label="Parsing your resume" 
              currentStep={loadingStep} 
            />
            <LoadingStep 
              step="fetch" 
              label="Fetching job details" 
              currentStep={loadingStep} 
            />
            <LoadingStep 
              step="tailor" 
              label="Tailoring your resume" 
              currentStep={loadingStep} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

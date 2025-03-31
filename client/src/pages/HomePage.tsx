import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FormSection from "@/components/FormSection";
import ProcessingSection, { Step } from "@/components/ProcessingSection";
import ResultsSection, { TailoredResume } from "@/components/ResultsSection";
import { TailorResumeResponse } from "@shared/schema";

export default function HomePage() {
  const { toast } = useToast();
  const [view, setView] = useState<"form" | "processing" | "results">("form");
  const [steps, setSteps] = useState<Step[]>([
    { id: "parse", name: "Parsing Resume", description: "Converting your PDF to structured data", status: "pending" },
    { id: "fetch", name: "Fetching Job Details", description: "Retrieving job posting information", status: "pending" },
    { id: "tailor", name: "Tailoring Resume", description: "Customizing your resume for the job", status: "pending" }
  ]);
  const [originalResume, setOriginalResume] = useState<TailoredResume | null>(null);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);

  // Check if we have cached resumes in localStorage
  useEffect(() => {
    const cachedOriginalResume = localStorage.getItem("originalResume");
    const cachedTailoredResume = localStorage.getItem("tailoredResume");
    
    if (cachedOriginalResume) {
      try {
        setOriginalResume(JSON.parse(cachedOriginalResume));
      } catch (error) {
        console.error("Error parsing cached original resume:", error);
      }
    }
    
    if (cachedTailoredResume) {
      try {
        setTailoredResume(JSON.parse(cachedTailoredResume));
        // If we have a tailored resume, show the results view
        if (view === "form") {
          setView("results");
        }
      } catch (error) {
        console.error("Error parsing cached tailored resume:", error);
      }
    }
  }, []);

  const updateStepStatus = (stepId: string, status: Step["status"]) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const resetSteps = () => {
    setSteps(steps.map(step => ({ ...step, status: "pending" })));
  };

  const tailorResumeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/tailor-resume", formData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to process resume");
      }
      return await response.json() as TailorResumeResponse;
    },
    onSuccess: (data) => {
      // Cache the resumes
      localStorage.setItem("originalResume", JSON.stringify(data.originalResume));
      localStorage.setItem("tailoredResume", JSON.stringify(data.tailoredResume));
      
      // Update state
      setOriginalResume(data.originalResume);
      setTailoredResume(data.tailoredResume);
      
      // Show results view
      setView("results");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process resume",
        variant: "destructive",
      });
      // Keep the processing view so user can see which step failed
    }
  });

  const handleFormSubmit = async (formValues: {
    vlmApiKey: string;
    geminiApiKey: string;
    applicationUrl: string;
    resumeFile: File;
  }) => {
    // Reset steps and show processing view
    resetSteps();
    setView("processing");

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("vlmApiKey", formValues.vlmApiKey);
    formData.append("geminiApiKey", formValues.geminiApiKey);
    formData.append("applicationUrl", formValues.applicationUrl);
    formData.append("resumeFile", formValues.resumeFile);

    // Start the mutation process
    tailorResumeMutation.mutate(formData);
  };

  const handleCancelProcessing = () => {
    tailorResumeMutation.reset();
    setView("form");
    resetSteps();
  };

  const handleStartOver = () => {
    setView("form");
    resetSteps();
  };

  // Subscribe to the mutation status to update steps
  useEffect(() => {
    // Update step status based on mutation state
    if (tailorResumeMutation.isPending) {
      // Find the current step
      if (!steps.some(step => step.status === "progress")) {
        // Start with the first step
        updateStepStatus("parse", "progress");
      }
    }
  }, [tailorResumeMutation.isPending]);

  return (
    <div className="bg-slate-50 font-sans text-slate-800 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Tailor Your Resume with AI</h2>
            <p className="text-slate-600 max-w-3xl">
              Upload your resume, provide a job posting URL, and let AI create a tailored version that highlights your most relevant skills and experiences.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-10">
            {view === "form" && (
              <FormSection onSubmit={handleFormSubmit} />
            )}
            
            {view === "processing" && (
              <ProcessingSection 
                steps={steps} 
                isProcessing={tailorResumeMutation.isPending}
                error={tailorResumeMutation.error?.message || null}
                onCancel={handleCancelProcessing}
              />
            )}
            
            {view === "results" && tailoredResume && (
              <ResultsSection 
                resume={tailoredResume}
                onStartOver={handleStartOver}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ResumeData } from "@shared/schema";

interface FormSectionProps {
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLoadingStep: (step: "idle" | "parse" | "fetch" | "tailor") => void;
  setOriginalResume: (resume: ResumeData | null) => void;
  setTailoredResume: (resume: ResumeData | null) => void;
  setCurrentView: (view: "form" | "results") => void;
  setGeminiApiKey?: (key: string) => void;
}

export function FormSection({
  setIsLoading,
  setError,
  setLoadingStep,
  setOriginalResume,
  setTailoredResume,
  setCurrentView,
  setGeminiApiKey,
}: FormSectionProps) {
  const { toast } = useToast();
  const [vlmApiKey, setVlmApiKey] = useState("");
  const [geminiApiKey, setLocalGeminiApiKey] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("No file selected");
  const [showFileDisplay, setShowFileDisplay] = useState(false);
  
  // Update parent component's geminiApiKey when local state changes
  const updateGeminiApiKey = (value: string) => {
    setLocalGeminiApiKey(value);
    if (setGeminiApiKey) {
      setGeminiApiKey(value);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setResumeFile(file);
      setFileName(file.name);
      setShowFileDisplay(true);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    setFileName("No file selected");
    setShowFileDisplay(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!vlmApiKey || !geminiApiKey || !applicationUrl || !resumeFile) {
      setError("Please fill out all fields and upload a resume PDF.");
      return;
    }
    
    // Start loading
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("vlmApiKey", vlmApiKey);
      formData.append("geminiApiKey", geminiApiKey);
      formData.append("applicationUrl", applicationUrl);
      
      // Step 1: Parse Resume
      setLoadingStep("parse");
      
      const parseResponse = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!parseResponse.ok) {
        throw new Error(`Error parsing resume: ${parseResponse.statusText}`);
      }
      
      const originalResumeData = await parseResponse.json();
      setOriginalResume(originalResumeData);
      
      // Save to localStorage
      localStorage.setItem("originalResume", JSON.stringify(originalResumeData));
      
      // Step 2: Fetch Job Posting
      setLoadingStep("fetch");
      
      const fetchResponse = await apiRequest("POST", "/api/job/fetch", {
        url: applicationUrl,
      });
      
      if (!fetchResponse.ok) {
        throw new Error(`Error fetching job posting: ${fetchResponse.statusText}`);
      }
      
      // Step 3: Tailor Resume
      setLoadingStep("tailor");
      
      const tailorResponse = await apiRequest("POST", "/api/resume/tailor", {
        resume: originalResumeData,
        vlmApiKey,
        geminiApiKey,
        applicationUrl,
      });
      
      if (!tailorResponse.ok) {
        throw new Error(`Error tailoring resume: ${tailorResponse.statusText}`);
      }
      
      const tailoredResumeData = await tailorResponse.json();
      setTailoredResume(tailoredResumeData);
      
      // Save to localStorage
      localStorage.setItem("tailoredResume", JSON.stringify(tailoredResumeData));
      
      // Complete and show results
      setIsLoading(false);
      setCurrentView("results");
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Start Tailoring Your Resume
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vlm-api-key" className="text-sm font-medium text-gray-700">
                VLM Run API Key
              </Label>
              <Input
                id="vlm-api-key"
                type="password"
                placeholder="Enter your VLM Run API key"
                value={vlmApiKey}
                onChange={(e) => setVlmApiKey(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gemini-api-key" className="text-sm font-medium text-gray-700">
                Gemini API Key
              </Label>
              <Input
                id="gemini-api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={geminiApiKey}
                onChange={(e) => updateGeminiApiKey(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="application-url" className="text-sm font-medium text-gray-700">
              Job Application URL
            </Label>
            <Input
              id="application-url"
              type="url"
              placeholder="https://example.com/job-posting"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
            <p className="text-xs text-gray-500">
              Enter the full URL of the job posting you're applying to
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resume-file" className="text-sm font-medium text-gray-700">
              Resume PDF
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="resume-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {!showFileDisplay ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF only</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 w-full bg-gray-100 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 text-gray-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      <span className="text-sm text-gray-500">{fileName}</span>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-500"
                      onClick={removeFile}
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Tailor My Resume
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

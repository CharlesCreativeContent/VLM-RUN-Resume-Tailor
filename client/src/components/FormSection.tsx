import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FormSectionProps {
  onSubmit: (formData: {
    vlmApiKey: string;
    geminiApiKey: string;
    applicationUrl: string;
    resumeFile: File;
  }) => void;
}

export default function FormSection({ onSubmit }: FormSectionProps) {
  const [vlmApiKey, setVlmApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (file: File) => {
    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size should be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!vlmApiKey || !geminiApiKey || !applicationUrl || !resumeFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload a resume.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      vlmApiKey,
      geminiApiKey,
      applicationUrl,
      resumeFile,
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6 text-slate-800">Enter Your Information</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="vlmApiKey" className="block text-sm font-medium text-slate-700 mb-1">
                VLM Run API Key
              </Label>
              <Input
                type="password"
                id="vlmApiKey"
                value={vlmApiKey}
                onChange={(e) => setVlmApiKey(e.target.value)}
                placeholder="Enter your VLM Run API key"
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="geminiApiKey" className="block text-sm font-medium text-slate-700 mb-1">
                Gemini API Key
              </Label>
              <Input
                type="password"
                id="geminiApiKey"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="applicationUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Job Application URL
            </Label>
            <Input
              type="url"
              id="applicationUrl"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              placeholder="https://example.com/job-posting"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="resumeFile" className="block text-sm font-medium text-slate-700 mb-1">
              Resume PDF File
            </Label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                isDragging ? "border-primary-400" : "border-slate-300 hover:border-primary-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <span className="material-icons text-slate-400 text-3xl mb-2">upload_file</span>
                <div className="flex text-sm text-slate-600">
                  <label htmlFor="resumeFile" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                    <span>Upload a file</span>
                    <input
                      id="resumeFile"
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PDF up to 10MB</p>
              </div>
            </div>
            
            {resumeFile && (
              <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                <div className="flex items-center">
                  <span className="material-icons text-slate-500 mr-2">description</span>
                  <span className="text-sm font-medium text-slate-700 truncate">{resumeFile.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="ml-auto p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Tailor Resume
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

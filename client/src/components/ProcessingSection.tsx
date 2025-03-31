import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface Step {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'progress' | 'success' | 'error';
}

interface ProcessingSectionProps {
  steps: Step[];
  isProcessing: boolean;
  error: string | null;
  onCancel: () => void;
}

export default function ProcessingSection({ steps, isProcessing, error, onCancel }: ProcessingSectionProps) {
  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6 text-slate-800">Processing Your Resume</h3>
        
        <div className="space-y-8">
          {/* Processing Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="step-item">
                <div className="flex items-center">
                  <div 
                    className={`step-icon flex-shrink-0 rounded-full w-8 h-8 flex items-center justify-center mr-3
                      ${step.status === 'pending' ? 'bg-slate-200 text-slate-500' : 
                        step.status === 'progress' ? 'bg-primary-100 text-primary-700' : 
                        step.status === 'success' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'}`}
                  >
                    {step.status === 'pending' && <span className="material-icons text-sm">{`looks_${index + 1}`}</span>}
                    {step.status === 'progress' && <span className="material-icons text-sm">hourglass_top</span>}
                    {step.status === 'success' && <span className="material-icons text-sm">check</span>}
                    {step.status === 'error' && <span className="material-icons text-sm">close</span>}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-slate-800">{step.name}</h4>
                    <p className="text-sm text-slate-500">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Processing Status */}
          {isProcessing && !error && (
            <div id="processingStatus" className="text-center py-4">
              <div className="flex items-center justify-center mb-2 space-x-1">
                <div className="h-2.5 w-2.5 bg-primary-500 rounded-full animate-pulse"></div>
                <div className="h-2.5 w-2.5 bg-primary-500 rounded-full animate-pulse delay-150"></div>
                <div className="h-2.5 w-2.5 bg-primary-500 rounded-full animate-pulse delay-300"></div>
              </div>
              <p className="text-slate-600 text-sm">Processing your request. This may take a minute...</p>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="material-icons text-red-400">error</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Cancel Button */}
          <div className="text-center">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="inline-flex justify-center items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700"
            >
              <span className="material-icons text-sm mr-1">cancel</span>
              <span>Cancel</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

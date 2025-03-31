import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorSectionProps {
  error: string;
  onTryAgain: () => void;
}

export function ErrorSection({ error, onTryAgain }: ErrorSectionProps) {
  return (
    <Card className="bg-white rounded-lg shadow-md p-6 mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-red-100 text-red-700 p-4 rounded-full mb-4">
            <svg 
              className="h-10 w-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {error}
          </p>
          <Button
            onClick={onTryAgain}
            className="inline-flex items-center px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

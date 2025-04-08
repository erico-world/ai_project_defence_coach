"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Log the error to help with debugging
    console.error("Application error:", error);

    // Show a toast notification
    toast.error("An error occurred. Please try again.");
  }, [error]);

  // Only render detailed error in development
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-md p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">
          Something went wrong
        </h2>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We've encountered an unexpected error. Please try again or contact
          support if the problem persists.
        </p>

        {isDev && isClient && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left overflow-auto max-h-[200px]">
            <p className="font-mono text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  Stack trace
                </summary>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <button
          onClick={resetErrorBoundary}
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

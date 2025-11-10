import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message = 'Unable to load data. Please try again.',
  onRetry
}: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900 mb-1">Error Loading Data</p>
          <p className="text-xs text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

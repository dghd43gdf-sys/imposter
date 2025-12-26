import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
};
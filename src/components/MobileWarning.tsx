
import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const MobileWarning = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <Alert className="max-w-md bg-gray-900 border-gray-700 text-white">
        <Monitor className="h-6 w-6 text-white" />
        <AlertTitle className="text-white text-lg font-semibold mb-3">
          Desktop Required
        </AlertTitle>
        <AlertDescription className="text-gray-300 space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <Smartphone className="h-5 w-5 text-red-400" />
            <span className="text-sm">Touch devices not supported</span>
          </div>
          <p className="text-sm leading-relaxed">
            This interactive flare experience requires cursor functionality and is optimized for desktop computers. 
            Please access this website from a computer or laptop for the full experience.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MobileWarning;

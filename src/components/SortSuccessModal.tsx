
import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { RotateCcw, Sparkles } from 'lucide-react';

interface SortSuccessModalProps {
  isOpen: boolean;
  onTryAgain: () => void;
}

const SortSuccessModal: React.FC<SortSuccessModalProps> = ({ isOpen, onTryAgain }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-sm border border-white/20 text-white">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 text-yellow-300 animate-ping opacity-75">
                <Sparkles className="w-full h-full" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            🎉 Congratulations! 🎉
          </DialogTitle>
          
          <DialogDescription className="text-lg text-white/90">
            You've successfully sorted all the flares into their respective quadrants! 
            Your cosmic organization skills are out of this world! ✨
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-6">
          <Button
            onClick={onTryAgain}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SortSuccessModal;

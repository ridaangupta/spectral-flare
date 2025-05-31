
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';

interface SortModeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: (checked: boolean) => void;
}

const SortModeTutorial: React.FC<SortModeTutorialProps> = ({ 
  isOpen, 
  onClose, 
  onDontShowAgain 
}) => {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  const handleClose = () => {
    onDontShowAgain(dontShowAgain);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Sort Mode</DialogTitle>
          <DialogDescription className="text-base mt-3 text-gray-300">
            In Sort Mode, your goal is to organize flares by color into their respective quadrants. 
            Each quadrant corresponds to a different color from your selected palette.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
          <p className="text-sm text-blue-300 font-medium">
            💡 Tip: Use "Intense" or "Chaotic" sensitivity settings for the best Sort Mode experience!
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="dont-show"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <label htmlFor="dont-show" className="text-sm font-medium text-gray-300">
            Don't show this message again
          </label>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleClose} className="px-6 bg-blue-600 hover:bg-blue-700 text-white">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SortModeTutorial;

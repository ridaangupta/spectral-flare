
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Sort Mode</DialogTitle>
          <DialogDescription className="text-base mt-3">
            In Sort Mode, your goal is to organize flares by color into their respective quadrants. 
            Each quadrant corresponds to a different color from your selected palette.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">
            💡 Tip: Use "Intense" or "Chaotic" sensitivity settings for the best Sort Mode experience!
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="dont-show"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
          />
          <label htmlFor="dont-show" className="text-sm font-medium">
            Don't show this message again
          </label>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleClose} className="px-6">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SortModeTutorial;

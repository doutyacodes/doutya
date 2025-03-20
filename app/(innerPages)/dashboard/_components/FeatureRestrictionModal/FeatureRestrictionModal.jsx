import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

const FeatureRestrictionModal = ({ isOpen, onClose, onViewPlans }) => {
  const router = useRouter();

  const handleNavigateToSuggestions = () => {
    onClose(); // Close the modal
    router.push('/dashboard/careers/career-suggestions');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2c2c2c] text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-200">
            Add a Career
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-300">
                <ArrowRight className="w-5 h-5 mr-2" />
                Career Suggestions
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Discover tailored career paths based on your profile and interests.
              </p>
              <button
                onClick={handleNavigateToSuggestions}
                className="w-full px-4 py-2 bg-blue-600/70 hover:bg-blue-600 rounded-lg transition-colors text-white"
              >
                Goto Career Suggestions
              </button>
            </div>
            
            <div className="bg-yellow-900/10 border border-yellow-600/30 p-4 rounded-lg">
            <div className="py-4">
              <p className="text-gray-300 mb-6">
                Adding custom career is a Pro feature. Upgrade your plan to unlock:
              </p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Add up to 5 different custom careers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Manual career addition beyond suggestions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  Get personalized feedback
                </li>
              </ul>
            </div>

              <h3 className="text-sm font-medium mb-2 flex items-center text-gray-400">
                <Lock className="w-5 h-5 text-yellow-500 mr-3 opacity-70" />
                Custom Career Addition
              </h3>
              <button
                onClick={onViewPlans}
                className="w-full px-4 py-2 bg-transparent border border-gray-700 text-gray-400 hover:text-gray-300 rounded-lg transition-colors text-xs"
              >
                Pro Feature
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureRestrictionModal;
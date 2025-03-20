import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

const TestsNotCompltedWarning = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleNavigateToTests = () => {
    onClose(); // Close the modal
  
    // Get the URL from localStorage
    const dashboardUrl = localStorage.getItem('dashboardUrl');
  
    // Navigate to the stored URL or fallback to '/dashboard'
    router.push(dashboardUrl || '/dashboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2c2c2c] text-white border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-200">
            Complete Initial Tests
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-2 flex items-center text-green-300">
                <CheckCircle className="w-5 h-5 mr-2" />
                Unlock Customized Careers
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                To add a career, you need to complete the <span className="text-green-400 font-medium">Initial Tests</span>. These tests help us suggest tailored career paths based on your skills and preferences.
              </p>
              <button
                onClick={handleNavigateToTests}
                className="w-full px-4 py-2 bg-green-600/70 hover:bg-green-600 rounded-lg transition-colors text-white"
              >
                Go to Tests Section
              </button>
            </div>

            <div className="bg-blue-900/10 border border-blue-600/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2 flex items-center text-gray-400">
                <ArrowRight className="w-5 h-5 text-blue-500 mr-3 opacity-70" />
                Why Complete the Tests?
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                By completing the tests, you unlock access to <span className="text-blue-400">personalized career recommendations</span> and gain insights into fields that align with your strengths and interests.
              </p>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Get career suggestions tailored to your profile
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Discover hidden strengths through skill analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  Gain access to expert recommendations
                </li>
              </ul>
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

export default TestsNotCompltedWarning;

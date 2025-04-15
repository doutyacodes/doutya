import React, { useState, useEffect } from 'react';

const FeatureGuideModal = ({ featureKey, title, content, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const storageKey = `${featureKey}GuideDismissed`;

  useEffect(() => {
    // Check if this guide was dismissed before
    const isDismissed = localStorage.getItem(storageKey);
    if (isDismissed === 'true') {
      setVisible(false);
    }
  }, [storageKey]);

  const toggleDontShowAgain = (e) => {
    setDontShowAgain(e.target.checked);
  };

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem(storageKey, 'true');
    }
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-2 sm:p-4">
      {/* Floating close button */}
      <button 
        onClick={handleDismiss}
        className="fixed top-2 right-2 z-[60] bg-gray-100 md:bg-gray-800 hover:bg-gray-700 text-gray-800 md:text-white rounded-full p-2 shadow-lg border border-gray-700"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="bg-white md:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] relative overflow-hidden">
        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-grow">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="min-h-32 sm:min-h-48">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="text-3xl sm:text-5xl mb-2 sm:mb-4">🚀</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 md:text-white mb-2 text-center">{title}</h2>
                <div className="text-sm sm:text-base text-gray-600 md:text-gray-300 text-center">
                  {content}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed navigation buttons */}
        <div className="bg-gray-100 md:bg-gray-800 px-3 py-3 sm:px-4 md:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-700">
          <div className="flex items-center w-full sm:w-auto">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={toggleDontShowAgain}
              className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"
            />
            <label
              htmlFor="dontShowAgain"
              className="text-gray-600 md:text-gray-300 text-xs sm:text-sm"
            >
              Don&apos;t show again
            </label>
          </div>
          <div className="w-full sm:w-auto">
            <button 
              onClick={handleDismiss}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGuideModal;
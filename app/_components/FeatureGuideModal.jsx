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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Content */}
        <div className="p-10">
          <div className="min-h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <div className="text-gray-300">
                {content}
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="bg-gray-800 px-4 md:px-6 py-3 md:py-4 flex flex-wrap md:flex-nowrap justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={toggleDontShowAgain}
              className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"
            />
            <label
              htmlFor="dontShowAgain"
              className="text-gray-300 text-xs sm:text-sm"
            >
              Don&apos;t show again
            </label>
          </div>
          <div>
            <button 
              onClick={handleDismiss}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
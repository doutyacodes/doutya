import React from 'react';

const Onboarding = ({ title, children, onClose, onDismiss, showDismissButton, onNext, onPrevious, currentStep, totalSteps }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Progress bar */}
        {totalSteps > 1 && (
          <div className="flex justify-between bg-gray-800 px-6 py-3">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full mx-1 ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-10">
          <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
          <div className="min-h-64">{children}</div>
        </div>

        {/* Navigation buttons */}
        <div className="bg-gray-800 px-6 py-4 flex justify-between">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
          )}

          <div>
            {showDismissButton && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
              >
                Don&apos;t Show Again
              </button>
            )}

            {onNext ? (
              <button
                onClick={onNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
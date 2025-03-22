import React from 'react';

function TestLevelModal({ isOpen, onClose, onSelect, testType = 'certification' }) {
  if (!isOpen) return null;

  const levels = [
    { id: 'beginner', label: 'Beginner', description: 'For those just starting out' },
    { id: 'intermediate', label: 'Intermediate', description: 'For those with some experience' },
    { id: 'advanced', label: 'Advanced', description: 'For experienced professionals' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Select Difficulty Level</h2>
        <p className="text-gray-300 mb-6">Choose the difficulty level for your {testType} test</p>
        
        <div className="space-y-3">
          {levels.map(level => (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left transition-colors"
            >
              <div>
                <h3 className="font-semibold text-white">{level.label}</h3>
                {/* <p className="text-sm text-gray-300">{level.description}</p> */}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestLevelModal;
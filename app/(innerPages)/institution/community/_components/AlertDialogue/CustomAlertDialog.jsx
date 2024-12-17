import React from 'react';
import { AlertTriangle } from 'lucide-react';

const CustomAlertDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  description = "Are you sure you want to proceed?",
  confirmText = "Continue",
  cancelText = "Cancel"
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="mr-2 text-yellow-500" size={24} />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          
          <p className="text-gray-600 mb-6">{description}</p>
          
          <div className="flex justify-end space-x-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlertDialog;
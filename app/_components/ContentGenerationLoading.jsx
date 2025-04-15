import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const ContentGenerationLoading = ({ 
    isOpen, 
    onClose, 
    title, 
    description,
    page,
    autoCloseDelay = null, // in milliseconds, null for no auto-close
    showDelay, // NEW: delay in milliseconds before showing the modal
  }) => {
    const [progress, setProgress] = useState(0);
    const [shouldShow, setShouldShow] = useState(false); // NEW: control actual visibility
    
    // NEW: Handle delayed showing of the modal
    useEffect(() => {
      let showTimer;
      
      if (isOpen) {
        // Only show the modal after the specified delay
        showTimer = setTimeout(() => {
          setShouldShow(true);
        }, showDelay);
      } else {
        // When closed, immediately hide and reset
        setShouldShow(false);
        setProgress(0);
      }
      
      return () => clearTimeout(showTimer);
    }, [isOpen, showDelay]);
    
    // Auto-close functionality
    useEffect(() => {
      if (!isOpen || !autoCloseDelay) return;
      
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }, [isOpen, autoCloseDelay, onClose]);
    
    // Animated progress bar
    useEffect(() => {
      if (!shouldShow) {
        setProgress(0);
        return;
      }
      
      const interval = setInterval(() => {
        setProgress(prev => {
          // Slow down as it approaches 90%
          const increment = prev < 30 ? 3 : prev < 60 ? 2 : prev < 85 ? 0.5 : 0.2;
          const newProgress = prev + increment;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }, [shouldShow]);
    
    // Page-specific content configurations
    const pageConfigs = {
      roadmap: {
        icon: "🗺️",
        title: "Generating Your Personalized Roadmap",
        description: "We're creating tailored milestones for your physical, mental, and educational growth journey.",
        color: "from-purple-600 to-indigo-800"
      },
      test: {
        icon: "📝",
        title: "Preparing Your Career Tests",
        description: "We're assembling your weekly tests based on your selected career path.",
        color: "from-blue-600 to-cyan-800"
      },
      challenges: {
        icon: "🏆",
        title: "Creating Your Weekly Challenges",
        description: "We're designing personalized challenges aligned with your career goals.",
        color: "from-green-600 to-emerald-800"
      },
      careerSuggestions: {
        icon: "💼",
        title: "Finding Your Perfect Career Match",
        description: "We're analyzing your test results to recommend personalized career options just for you.",
        color: "from-red-600 to-orange-800"
      },
      industrySelection: {
        icon: "🏢",
        title: "Identifying Suitable Industries",
        description: "We're processing your personality traits and interests to find your ideal industry sectors.",
        color: "from-yellow-600 to-amber-800"
      },
      certificationTest: {
        icon: "🎓",
        title: "Generating Certification Test",
        description: "We're creating a set of test questions and answers tailored to your expertise level.",
        color: "from-teal-600 to-blue-800"
      },
      default: {
        icon: "⚙️",
        title: "Processing Your Request",
        description: "Please wait while we generate your personalized content.",
        color: "from-gray-600 to-gray-800"
      }
    };
    
    // Get configuration based on page
    const config = pageConfigs[page] || pageConfigs.default;
    
    // NEW: Don't render anything if we're in the delay period
    if (!isOpen || !shouldShow) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
          {/* Header with close button */}
          <div className="flex justify-between items-center bg-gray-800 px-6 py-4">
            <h3 className="text-xl font-bold text-white">
              {title || config.title}
            </h3>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-700">
            <div 
              className={`h-full bg-gradient-to-r ${config.color} transition-all duration-300 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Content */}
          <div className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl mb-6">{config.icon}</div>
              
              <div className="flex items-center justify-center mb-6">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
                <span className="text-blue-400 font-medium">Processing...</span>
              </div>
              
              <p className="text-gray-300 mb-8">
                {description || config.description}
              </p>
              
              <div className="bg-gray-800 p-6 rounded-lg w-full">
                <h4 className="text-lg font-semibold text-white mb-3">While You Wait</h4>
                <p className="text-gray-400 text-sm">
                  This process typically takes 15-30 seconds depending on the complexity of your profile data.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          {/* <div className="bg-gray-800 px-6 py-4 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div> */}
        </div>
      </div>
    );
  };
  
export default ContentGenerationLoading;
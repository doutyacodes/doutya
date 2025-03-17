import React, { useState, useEffect } from 'react';

const CareerOnboarding = ({ forceShow = false, onClose}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);


  useEffect(() => {
      // Check if user has chosen to not show again
      const savedDontShowAgain = localStorage.getItem('onboardingDontShowAgain') === 'true';
      
      // Set the initial state of dontShowAgain
      setDontShowAgain(savedDontShowAgain);

      // Determine whether to show the explanation
      if (savedDontShowAgain && !forceShow) {
        setShowOnboarding(false);
      }
  }, [forceShow]);

  const toggleDontShowAgain = () => {
    // Toggle the checkbox state
    setDontShowAgain(!dontShowAgain);
  };

  const handleDismiss = () => {
    localStorage.setItem('onboardingDontShowAgain', dontShowAgain.toString());
    setShowOnboarding(false);
    onClose()
  };

  const handleClose = () => {
    setShowOnboarding(false);
    onClose()
  };


  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const steps = [
    {
      title: "Welcome to Xortcut",
      content: (
        <div className="flex flex-col items-center space-y-4 text-center">
          <img 
            src={"/assets/images/logo-full.png"}
            alt="Xortcut Logo" 
            className="w-32 md:w-48 h-auto mb-2 object-contain"
          />
          <h1 className="text-xl md:text-3xl font-bold text-white mb-2">Your AI-Powered Complete Career Companion</h1>
          <div className="space-y-2">
            <p className="text-gray-300 text-base md:text-lg">
              Welcome to Xortcut - Your Career Guidance Destination
            </p>
            <p className="text-gray-300 text-sm md:text-base">
              More than a career platform, we are your dedicated partner. We help you identify the perfect 
              careers and provide AI-powered guidance that adapts and supports your professional journey.
            </p>
            <p className="text-gray-300 font-semibold text-sm md:text-base">
              Transforming Career Guidance into a Personalized Experience
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Discover Your Perfect Career Path",
      content: (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-4xl md:text-5xl mb-2">🚀</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Your Career Journey Begins</h2>
          <p className="text-gray-300 text-sm md:text-base">
            We&apos;ll guide you through a series of steps to understand your personality, 
            interests, and preferences to recommend the best career options for you.
          </p>
          <p className="text-gray-300 text-sm md:text-base mt-2">
            Let&apos;s get started on your journey to finding a fulfilling career!
          </p>
        </div>
      )
    },
    {
      title: "Step 1: Personality Test",
      content: (
        <div className="space-y-3">
          <p className="text-gray-300 text-sm md:text-base">
            In this step, you&apos;ll complete a personality test consisting of 12 questions about your 
            preferences, work style, and decision-making approach.
          </p>
          <p className="text-gray-300 text-sm md:text-base">
            Your answers will help us understand your personality traits and how they align with 
            different career paths and work environments.
          </p>
          <div className="bg-gray-800 p-3 md:p-4 rounded-lg text-center">
            <div className="text-3xl md:text-4xl mb-1">🧠</div>
            <h3 className="text-md md:text-lg font-semibold text-white">Personality Assessment</h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1">12 questions to understand your work style</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Interest Test",
      content: (
        <div className="space-y-3">
          <p className="text-gray-300 text-sm md:text-base">
            Next, you&apos;ll take our interest assessment with 30 questions to determine your field 
            preferences, skills, and natural aptitudes.
          </p>
          <p className="text-gray-300 text-sm md:text-base">
            You&apos;ll rate statements on a scale from "Strongly Disagree" to "Strongly Agree" to help us 
            identify your key interest areas and strengths.
          </p>
          <div className="bg-gray-800 p-3 md:p-4 rounded-lg text-center">
            <div className="text-3xl md:text-4xl mb-1">🔍</div>
            <h3 className="text-md md:text-lg font-semibold text-white">Interest Assessment</h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1">30 questions to identify your strengths and interests</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Industry Selection",
      content: (
        <div className="space-y-3">
          <p className="text-gray-300 text-sm md:text-base">
            Based on your personality and interests, we&apos;ll recommend industries that might be a good fit for you.
          </p>
          <p className="text-gray-300 text-sm md:text-base">
            You can select from our recommended industries or choose to be industry-agnostic to explore broader options.
          </p>
          <div className="bg-gray-800 p-3 md:p-4 rounded-lg text-center">
            <div className="text-3xl md:text-4xl mb-1">🏢</div>
            <h3 className="text-md md:text-lg font-semibold text-white">Industry Selection</h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Choose your preferred industry or explore all options</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Career Suggestions",
      content: (
        <div className="space-y-3">
          <p className="text-gray-300 text-sm md:text-base">
            Based on your selections, we&apos;ll present you with personalized career options categorized by type:
            Trending, Offbeat, and Traditional Careers.
          </p>
          <p className="text-gray-300 text-sm md:text-base">
            You can select multiple careers that interest you and add them to your career list for further exploration.
          </p>
          <div className="bg-gray-800 p-3 md:p-4 rounded-lg text-center">
            <div className="text-3xl md:text-4xl mb-1">💼</div>
            <h3 className="text-md md:text-lg font-semibold text-white">Career Suggestions</h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Explore and select career options that match your profile</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Career Roadmaps",
      content: (
        <div className="space-y-3">
          <p className="text-gray-300 text-sm md:text-base">
            Finally, you&apos;ll be able to view your selected careers in the top navigation bar of the app.
          </p>
          <p className="text-gray-300 text-sm md:text-base">
            Click on any career to access detailed roadmaps that outline the education, skills, and experience 
            needed to succeed in that field, along with potential growth paths.
          </p>
          <div className="bg-gray-800 p-3 md:p-4 rounded-lg text-center">
            <div className="text-3xl md:text-4xl mb-1">🗺️</div>
            <h3 className="text-md md:text-lg font-semibold text-white">Career Roadmaps</h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Detailed guides to help you navigate your chosen career paths</p>
          </div>
        </div>
      )
    }
  ];

  // Render logic remains the same
  if (!showOnboarding && !forceShow) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="flex justify-between bg-gray-800 px-4 md:px-6 py-2 md:py-3">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 flex-1 rounded-full mx-1 ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="p-4 md:p-6 lg:p-10">
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 text-center">{steps[currentStep].title}</h2>
          <div className="h-96 md:h-72 overflow-y-auto">
            {steps[currentStep].content}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="bg-gray-800 px-4 md:px-6 py-3 md:py-4 flex flex-wrap md:flex-nowrap justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0 w-full md:w-auto">
            {currentStep > 0 ? (
              <button 
                onClick={handlePrevious}
                className="px-3 py-1 md:px-4 md:py-2 mr-3 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep === steps.length - 1 && (
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={toggleDontShowAgain}
                  className="mr-2"
                />
                <label 
                  htmlFor="dontShowAgain" 
                  className="text-gray-300 text-xs md:text-sm"
                >
                  Don&apos;t show again
                </label>
              </div>
            )}
          </div>
          <div className="w-full md:w-auto text-right">
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={handleNext}
                className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleDismiss}
                className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerOnboarding;
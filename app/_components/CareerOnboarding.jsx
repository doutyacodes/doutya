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
          setShowExplanation(false);
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
      title: "Welcome to Xortlist",
      content: (
        <div className="flex flex-col items-center space-y-6 text-center">
          <img 
            src={"/assets/images/logo-full.png"}
            alt="Xortlist Logo" 
            className="w-48 h-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-white mb-4">Your AI-Powered Complete Career Companion</h1>
          <div className="space-y-4">
            <p className="text-gray-300 text-lg">
              Welcome to Xortlist - Your Career Guidance Destination
            </p>
            <p className="text-gray-300">
              More than a career platform, we are your dedicated partner. We help you identify the perfect 
              careers and provide AI-powered guidance that adapts and supports your professional journey 
              every step of the way.
            </p>
            <p className="text-gray-300 font-semibold">
              Transforming Career Guidance into a Continuous, Personalized Experience
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Discover Your Perfect Career Path",
      content: (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Career Journey Begins</h2>
          <p className="text-gray-300">
            We&apos;ll guide you through a series of steps to understand your personality, 
            interests, and preferences to recommend the best career options for you.
          </p>
          <p className="text-gray-300 mt-2">
            Let&apos;s get started on your journey to finding a fulfilling career!
          </p>
        </div>
      )
    },
    {
      title: "Step 1: Personality Test",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            In this step, you&apos;ll complete a personality test consisting of 12 questions about your 
            preferences, work style, and decision-making approach.
          </p>
          <p className="text-gray-300">
            Your answers will help us understand your personality traits and how they align with 
            different career paths and work environments.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🧠</div>
            <h3 className="text-lg font-semibold text-white">Personality Assessment</h3>
            <p className="text-gray-400 mt-2">12 questions to understand your work style</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Interest Test",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Next, you&apos;ll take our interest assessment with 30 questions to determine your field 
            preferences, skills, and natural aptitudes.
          </p>
          <p className="text-gray-300">
            You&apos;ll rate statements on a scale from "Strongly Disagree" to "Strongly Agree" to help us 
            identify your key interest areas and strengths.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-lg font-semibold text-white">Interest Assessment</h3>
            <p className="text-gray-400 mt-2">30 questions to identify your strengths and interests</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Industry Selection",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Based on your personality and interests, we&apos;ll recommend industries that might be a good fit for you.
          </p>
          <p className="text-gray-300">
            You can select from our recommended industries or choose to be industry-agnostic to explore broader options.
            You can also manually enter a specific industry if you have a particular field in mind.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🏢</div>
            <h3 className="text-lg font-semibold text-white">Industry Selection</h3>
            <p className="text-gray-400 mt-2">Choose your preferred industry or explore all options</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Career Suggestions",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Based on your selections, we&apos;ll present you with personalized career options categorized by type:
            Trending Careers, Offbeat Careers, and Traditional Careers.
          </p>
          <p className="text-gray-300">
            You can select multiple careers that interest you and add them to your career list for further exploration.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">💼</div>
            <h3 className="text-lg font-semibold text-white">Career Suggestions</h3>
            <p className="text-gray-400 mt-2">Explore and select career options that match your profile</p>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Career Roadmaps",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Finally, you&apos;ll be able to view your selected careers in the top navigation bar of the app.
          </p>
          <p className="text-gray-300">
            Click on any career to access detailed roadmaps that outline the education, skills, and experience 
            needed to succeed in that field, along with potential growth paths.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <h3 className="text-lg font-semibold text-white">Career Roadmaps</h3>
            <p className="text-gray-400 mt-2">Detailed guides to help you navigate your chosen career paths</p>
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="flex justify-between bg-gray-800 px-6 py-3">
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
        <div className="p-10">
          <h2 className="text-xl font-bold text-white mb-4 text-center">{steps[currentStep].title}</h2>
          <div className="min-h-64">
            {steps[currentStep].content}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="bg-gray-800 px-6 py-4 flex justify-between">
            <div className='flex items-center'>

                {currentStep > 0 ? (
                  <button 
                    onClick={handlePrevious}
                    className="px-4 py-2 mr-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                ) : (
                  <div>
                    
                  </div>
                )}

                  {currentStep === steps.length - 1 && (
                    <div className="flex items-center mr-4">
                        <input 
                            type="checkbox" 
                            id="dontShowAgain"
                            checked={dontShowAgain}
                            onChange={toggleDontShowAgain}
                            className="mr-2"
                        />
                        <label 
                            htmlFor="dontShowAgain" 
                            className="text-gray-300 text-sm"
                        >
                            Don&apos;t show again
                        </label>
                    </div>
                  )}
            </div>
          <div>
            {/* {currentStep === steps.length - 1 && (
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
              >
                Don't Show Again
              </button>
            )} */}
            
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
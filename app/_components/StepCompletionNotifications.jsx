import React, { useState, useEffect } from 'react';

export const StartPersonalityTest = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Check if this notification was dismissed before
        const isDismissed = localStorage.getItem('personalityTestStartNotifyDismissed');
        if (isDismissed === 'true') {
          setVisible(false);
        }
      }, []);
  
    const handleDismiss = () => {
    localStorage.setItem('personalityTestStartNotifyDismissed', 'true');
      setVisible(false);
    };

    const handleClose = () => {
        setVisible(false);
      };
    
    return (
      <>
        {/* the Modal */}
        {
          visible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
                <button 
                  onClick={handleClose}
                  className="fixed top-2 right-2 z-[60] bg-gray-100 md:bg-gray-800 hover:bg-gray-700 text-gray-800 md:text-white rounded-full p-2 shadow-lg border border-gray-700"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              <div className="bg-white md:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Content */}
                <div className="p-10">
                  <div className="min-h-64">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-5xl mb-4">🚀</div>
                      <h2 className="text-2xl font-bold text-gray-800 md:text-white mb-2">Ready to Discover Yourself?</h2>
                      <p className="text-gray-600 md:text-gray-300">
                        Kickstart your journey by taking the Personality Test for <strong>Career Path Discovery</strong>. 
                        Understand your strengths and find careers that fit you!
                      </p>
                      <p className="text-gray-600 md:text-gray-300 mt-2">
                        Let&apos;s get started on your journey to finding a fulfilling career!
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Navigation buttons */}
                <div className="bg-gray-100 md:bg-gray-800 px-4 md:px-6 py-3 md:py-4 flex flex-wrap md:flex-nowrap justify-between md:justify-end items-center">
                  <div>
                    <button 
                      onClick={handleDismiss}
                      className="px-4 py-2 bg-gray-700 text-gray-800 md:text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
                    >
                      Don&apos;t Show Again
                    </button>
                  
                      <button 
                        onClick={handleClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Get Started
                      </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </>

    );
  };
  

// Step 1 Completion: Personality Test
export const PersonalityTestComplete = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if this notification was dismissed before
    const isDismissed = localStorage.getItem('personalityTestNotificationDismissed');
    if (isDismissed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('personalityTestNotificationDismissed', 'true');
    setVisible(false);
  };


  return (
    <>
      {/* the Modal */}
      {
          visible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
                <button 
                  onClick={handleDismiss}
                  className="fixed top-2 right-2 z-[60] bg-gray-100 md:bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg border border-gray-700"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              <div className="bg-white md:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Content */}
                <div className="p-10">
                  <div className="min-h-64">
                    <div className="flex flex-col items-center space-y-4">
                      <h2 className="text-2xl font-bold text-gray-800 md:text-white mb-2">Personality Test Completed!</h2>
                      <p className="text-gray-600 md:text-gray-300">
                        Great job! You&apos;ve completed the personality assessment. Now take the Interest Test to further refine your career matches.
                      </p>
                      <div className="bg-gray-100 md:bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-4xl mb-2">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-800 md:text-white">Interest Assessment</h3>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation buttons */}
                <div className="bg-gray-100 md:bg-gray-800 px-4 md:px-6 py-3 md:py-4 flex flex-wrap md:flex-nowrap justify-between items-center">
                  <div className="w-full flex flex-wrap md:flex-nowrap gap-2">
                    <button 
                      onClick={handleDismiss}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors w-full md:w-auto"
                    >
                      Don&apos;t Show Again
                    </button>
                  
                    <a 
                      href="/CareerQuizSection/2"
                      className="px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto"
                    >
                      Start Interest Test
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </>
  );
};

// Step 2 Completion: Interest Test
export const InterestTestComplete = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if this notification was dismissed before
    const isDismissed = localStorage.getItem('interestTestNotificationDismissed');
    if (isDismissed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('interestTestNotificationDismissed', 'true');
    setVisible(false);
  };

  const handleClose = () => {
    setVisible(false);
  }

  return (
    <>
      {/* the Modal */}
      {
        visible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
              <button 
                  onClick={handleClose}
                  className="fixed top-2 right-2 z-[60] bg-gray-100 md:bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg border border-gray-700"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
            <div className="bg-white md:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
              {/* Content */}
              <div className="p-10">
                <div className="min-h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 md:text-white mb-2">Interest Test Completed!</h2>
                    <p className="text-gray-600 md:text-gray-300">
                      Excellent work! Now it&apos;s time to select an industry that aligns with your personality and interests.
                    </p>
                    <div className="bg-gray-100 md:bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">🏢</div>
                      <h3 className="text-lg font-semibold text-gray-800 md:text-white">Industry Selection</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="bg-gray-100 md:bg-gray-800 px-3 sm:px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                  <button 
                    onClick={handleDismiss}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-gray-800 md:text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Don&apos;t Show Again
                  </button>
                
                  <button 
                    onClick={handleClose}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Select Industry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export const IndustrySelectionComplete = () => {
  const [visible, setVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      title: 'Congratulations on Your Industry Selection!',
      content: (
        <div className="text-center p-6">
          <div className="text-4xl md:text-5xl mb-4">🎉</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 md:text-white mb-4">Excellent Industry Choice!</h2>
          <p className="text-gray-600 md:text-gray-300 mb-6">
            You've taken a significant step in your career journey by selecting an industry that aligns with your interests and goals.
          </p>
          <div className="bg-gray-100 md:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 md:text-white mb-4">What's Next?</h3>
            <p className="text-gray-600 md:text-gray-300">
              It's time to explore and select specific career options within your chosen industry.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Welcome to Your Career Planning Hub',
      content: (
        <div className="text-center p-6">
          <div className="text-4xl md:text-5xl mb-4">🎯</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 md:text-white mb-4">Career Slot System Explained</h2>
          <div className="bg-gray-100 md:bg-gray-800 p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 md:text-gray-300 mb-4">
              We've designed a unique Career Slot system to help you strategically plan your professional journey.
            </p>
            <div className="text-left space-y-4">
              <div className="flex items-start">
                <span className="mr-3 text-blue-500 text-lg">•</span>
                <span className="text-gray-600 md:text-gray-300">You have <strong>5 Career Slots</strong> to map out your professional path</span>
              </div>
              <div className="flex items-start">
                <span className="mr-3 text-blue-500 text-lg">•</span>
                <span className="text-gray-600 md:text-gray-300">These slots allow you to explore and organize potential career options</span>
              </div>
              <div className="flex items-start">
                <span className="mr-3 text-blue-500 text-lg">•</span>
                <span className="text-gray-600 md:text-gray-300">Think of them as your personal career planning canvas</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Understanding Your Career Slots',
      content: (
        <div className="p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 md:text-white mb-4 text-center">Slot Access Levels</h2>
          
          <div className="space-y-6 text-gray-600 md:text-gray-300">
            <div className="bg-gray-100 md:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 md:text-white mb-4">Slot Availability</h3>
              <ul className="space-y-4">
                <li className="pb-3 border-b border-gray-200 md:border-gray-700">
                  <p className="font-semibold text-gray-800 md:text-white mb-2">Free Users:</p>
                  <ul className="ml-5 space-y-1">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>2 slots immediately available</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>3 additional slots locked</span>
                    </li>
                  </ul>
                </li>
                <li>
                  <p className="font-semibold text-gray-800 md:text-white mb-2">Pro Users:</p>
                  <ul className="ml-5 space-y-1">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>All 5 slots fully unlocked</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500">•</span>
                      <span>Ability to add custom careers</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Your Career Development Journey',
      content: (
        <div className="text-center p-6">
          <div className="text-4xl md:text-5xl mb-4">🚀</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 md:text-white mb-4">Maximize Your Career Potential</h2>
          <div className="bg-gray-100 md:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 md:text-white mb-4">How to Fill Your Slots</h3>
            <ol className="space-y-4 list-decimal pl-5 text-left">
              <li className="text-gray-800 md:text-white">
                <p className="font-semibold">From Career Suggestions:</p>
                <p className="text-gray-600 md:text-gray-300 mt-1">Browse suggested careers and click "Move to Career"</p>
              </li>
              <li className="text-gray-800 md:text-white">
                <p className="font-semibold">Pro Users - Custom Addition:</p>
                <p className="text-gray-600 md:text-gray-300 mt-1">Use the plus button to add a custom career as well</p>
              </li>
            </ol>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const isDismissed = localStorage.getItem('industrySelectionNotificationDismissed');
    if (isDismissed === 'true') {
      setVisible(false);
    }
  }, []);

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

  const handleDismiss = () => {
    localStorage.setItem('industrySelectionNotificationDismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 z-60 bg-gray-100 md:bg-gray-800 hover:bg-gray-200 md:hover:bg-gray-700 text-gray-800 md:text-white rounded-full p-2 shadow-lg transition-colors duration-200"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div className="bg-white md:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="flex bg-gray-200 md:bg-gray-800 px-6 py-3">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 flex-1 rounded-full mx-1 transition-all duration-300 ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-400 md:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="h-96 md:h-80 overflow-y-auto">
          {steps[currentStep].content}
        </div>

        {/* Navigation buttons */}
        <div className="bg-gray-100 md:bg-gray-800 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-3 sm:mb-0">
            {currentStep > 0 && (
              <button 
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-300 md:bg-gray-700 text-gray-800 md:text-white rounded-md hover:bg-gray-400 md:hover:bg-gray-600 transition-colors w-full sm:w-auto"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            {currentStep === steps.length - 1 && (
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-300 md:bg-gray-700 text-gray-800 md:text-white rounded-md hover:bg-gray-400 md:hover:bg-gray-600 transition-colors"
              >
                Don't Show Again
              </button>
            )}
            
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

export default IndustrySelectionComplete;


export const CareerSelectionComplete = () => {
  const [visible, setVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Reduced to two steps focusing on career guidance page
  const steps = [
    {
      title: "Congratulations on Your Career Selection!",
      description: "You've made an excellent choice by carefully selecting your potential career path. Now, let's dive into your personalized career guidance platform.",
      content: (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-100 rounded-full p-4">
            <svg className="h-12 w-12 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 text-center">
            Your thoughtful career selection reflects potential and ambition. We&apos;re excited to provide you with a comprehensive roadmap to success.
          </p>
        </div>
      )
    },
    {
      title: "Your Comprehensive Career Guidance Platform",
      description: "Unlock a transformative journey of personal and professional growth tailored specifically to your career aspirations.",
      content: (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-blue-100 rounded-full p-4">
            <svg className="h-12 w-12 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="text-gray-700 text-center space-y-3">
            <p className="text-lg font-semibold">Your Personalized Success Blueprint Awaits!</p>
            <p className="text-sm">We&apos;ve crafted a comprehensive platform designed to guide you through every aspect of your career journey:</p>
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <ul className="space-y-2 text-left">
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Comprehensive Roadmaps with Strategic Milestones</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Mental and Academic Progression Tracks</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Professional Certification Tracking</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>In-Depth Test Results and Personalized Feedback</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Weekly Career Development Activities</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Supportive Community Engagement Sections</span>
                </li>
              </ul>
            </div>
            <p className="text-sm italic text-gray-600 mt-2">
              Your journey to success starts here - every step is a step towards your dreams!
            </p>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    // Check if this notification was dismissed before
    const isDismissed = localStorage.getItem('careerSelectionNotificationDismissed');
    if (isDismissed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('careerSelectionNotificationDismissed', 'true');
    }
    setVisible(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleDontShowAgain = () => {
    setDontShowAgain(!dontShowAgain);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
    <button 
      onClick={handleDismiss}
      className="fixed top-2 right-2 z-[60] bg-gray-100 md:bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg border border-gray-700"
      aria-label="Close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
      <div className="bg-white md:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Content */}
        <div className="p-10">
          <div className="min-h-64">
            <div className="flex flex-col items-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 md:text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600 md:text-gray-300 text-center">
                {steps[currentStep].description}
              </p>
              
              {steps[currentStep].content}
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="bg-gray-100 md:bg-gray-800 px-6 py-4 flex justify-between">
          <div className='flex items-center'>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 mr-4 bg-gray-300 md:bg-gray-700 text-gray-800 md:text-white rounded-md hover:bg-gray-400 md:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
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
                  className="text-gray-600 md:text-gray-300 text-sm"
                >
                  Don&apos;t show again
                </label>
              </div>
            )}
          </div>
          
          <div>
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

export const CareerDataCollectionGuide = () => {
  const [visible, setVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Guide steps explaining what data will be collected
  const steps = [
    {
      title: "Education & Experience Details",
      description: "The first step in personalizing your career journey after your tests.",
      content: (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-blue-100 rounded-full p-4">
            <svg className="h-12 w-12 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-600 md:text-gray-300 text-center">
            We'll ask about your current education status to tailor recommendations to your specific stage.
          </p>
          <div className="bg-gray-100 md:bg-gray-800 p-4 rounded-lg shadow-sm w-full">
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 md:text-gray-300">Your current education level (high school, college, etc.)</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 md:text-gray-300">Your subjects or areas of specialization</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 md:text-gray-300">Any work or job experience you may have</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-800 md:text-gray-400 italic">
            This information helps us create a personalized career roadmap aligned with your current life stage.
          </p>
        </div>
      )
    },
    {
      title: "Institution Connection",
      description: "Link your educational institution for enhanced guidance.",
      content: (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-purple-100 rounded-full p-4">
            <svg className="h-12 w-12 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-gray-600 md:text-gray-300 text-center">
            Connect your school or college to access institution-specific resources and guidance.
          </p>
          <div className="bg-gray-100 md:bg-gray-800 p-4 rounded-lg shadow-sm w-full">
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 md:text-gray-300">Your school or college name</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 md:text-gray-300">Current academic year and term</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 md:text-gray-300">Option to link to enrolled institutions</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-800 md:text-gray-400 italic">
            Don't worry if your institution isn't enrolled - you can still manually enter your details!
          </p>
        </div>
      )
    },
    {
      title: "Location Preferences",
      description: "Help us understand where you are and where you want to be.",
      content: (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-100 rounded-full p-4">
            <svg className="h-12 w-12 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 md:text-gray-300 text-center">
            Share your current location and where you'd like to pursue your career.
          </p>
          <div className="bg-gray-100 md:bg-gray-800 p-4 rounded-lg shadow-sm w-full">
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 md:text-gray-300">Your current country of residence</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 md:text-gray-300">Target country for career opportunities</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-800 md:text-gray-400 italic">
            This helps us personalize opportunities with location-specific insights.
          </p>
        </div>
      )
    }
  ];

  useEffect(() => {
    // Check if this guide was dismissed before
    const isDismissed = localStorage.getItem('careerDataGuidesDismissed');
    if (isDismissed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('careerDataGuidesDismissed', 'true');
    }
    setVisible(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleDontShowAgain = () => {
    setDontShowAgain(!dontShowAgain);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
      <button 
        onClick={handleDismiss}
        className="fixed top-2 right-2 z-[60] bg-gray-100 md:bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg border border-gray-700"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
        <div className="bg-white md:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
          {/* Content */}
          <div className="p-4 md:p-6 lg:p-10">
            <div className="h-[calc(100vh-250px)] min-h-64 md:h-96 overflow-y-auto">
              <div className="flex flex-col items-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 md:text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 md:text-gray-300 text-center mb-4">
                  {steps[currentStep].description}
                </p>
                
                {steps[currentStep].content}
              </div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="px-8 pb-4">
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-600 w-8' : 'bg-gray-200 md:bg-gray-600 w-4'
                  } transition-all duration-300`}
                />
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="bg-gray-100 md:bg-gray-800 px-3 sm:px-6 py-3 sm:py-4 flex justify-between">
            <div className='flex items-center'>
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-2 py-1 sm:px-4 sm:py-2 mr-2 sm:mr-4 bg-gray-300 md:bg-gray-700 text-gray-800 md:text-white rounded-md hover:bg-gray-400 md:hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep === steps.length - 1 && (
                <div className="flex items-center mr-2 sm:mr-4">
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
              )}
            </div>
            
            <div>
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleDismiss}
                  className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 transition-colors"
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

// Final Step Completion: Journey Complete
export const JourneyComplete = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if this notification was dismissed before
    const isDismissed = localStorage.getItem('journeyCompleteNotificationDismissed');
    if (isDismissed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('journeyCompleteNotificationDismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-lg shadow-lg p-4 mb-6 animate-fadeIn">
      <button 
        onClick={handleDismiss}
        className="fixed top-2 right-2 z-[60] bg-gray-100 md:bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg border border-gray-700"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
            <svg className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-800 md:text-white">Career Journey Complete!</h3>
            <div className="mt-2 text-sm text-indigo-100">
              <p>Congratulations! You&apos;ve completed all steps in your career discovery journey. Your personalized roadmaps are now available in your dashboard.</p>
            </div>
            <div className="mt-3">
              <a href="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-indigo-100 hover:text-white">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

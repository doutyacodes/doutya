import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CareerGuideExplanation = ({ forceShow = false, onClose}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showExplanation, setShowExplanation] = useState(true);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        // Check if user has chosen to not show again
        const savedDontShowAgain = localStorage.getItem('careerGuideExplanationDontShowAgain') === 'true';
        
        // Set the initial state of dontShowAgain
        setDontShowAgain(savedDontShowAgain);

        // Determine whether to show the explanation
        if (savedDontShowAgain && !forceShow) {
            setShowExplanation(false);
        }
    }, [forceShow]);

    const handleDismiss = () => {
         // Save the "Don't Show Again" preference
        localStorage.setItem('careerGuideExplanationDontShowAgain', dontShowAgain.toString());
        
        // Close the explanation
        setShowExplanation(false);

        onClose()
    };

    const toggleDontShowAgain = () => {
    // Toggle the checkbox state
    setDontShowAgain(!dontShowAgain);
    };

    const handleClose = () => {
        setShowExplanation(false);
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

    // Render logic remains the same
    if (!showExplanation && !forceShow) {
        return null;
    }

  const steps = [
    {
      title: "Welcome to Your Career Guide",
      content: (
        <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Personalized Career Companion</h2>
          <p className="text-gray-300 text-center">
            The Career Guide is your comprehensive platform for professional growth, 
            offering personalized guidance, resources, and support to help you 
            navigate and excel in your chosen career path.
          </p>
          <p className="text-gray-300 text-center mt-2">
            Discover a holistic approach to career development with our integrated tools 
            and supportive community.
          </p>
        </div>
      )
    },
    {
      title: "Roadmap: Your Career Navigation Tool",
      content: (
        <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
          <p className="text-gray-300">
            The Roadmap is a comprehensive tracking system divided into three key areas 
            to ensure balanced personal and professional development:
          </p>
          <div className="space-y-3">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">📚</span>
                <h3 className="text-lg font-semibold text-white">Educational Milestones</h3>
              </div>
              <p className="text-gray-400">
                Divided into Academic and Certification tracks:
                • Academic Milestones: Self-verified educational achievements
                • Certification Milestones: Professional certifications and skill validations
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">💪</span>
                <h3 className="text-lg font-semibold text-white">Physical Milestones</h3>
              </div>
              <p className="text-gray-400">
                Track and achieve physical wellness goals that complement your 
                professional development.
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">🧠</span>
                <h3 className="text-lg font-semibold text-white">Mental Milestones</h3>
              </div>
              <p className="text-gray-400">
                Focus on personal growth through activities like reading, 
                stress management, and mental resilience building.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Tests: Continuous Learning & Assessment",
      content: (
        <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
          <p className="text-gray-300">
            Our comprehensive testing system helps you track and enhance your skills:
          </p>
          <div className="space-y-3">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">📝</span>
                <h3 className="text-lg font-semibold text-white">Weekly Tests</h3>
              </div>
              <p className="text-gray-400">
                Targeted tests for each subject related to your selected career. 
                Assess your knowledge, identify strengths, and focus on improvement areas.
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">📊</span>
                <h3 className="text-lg font-semibold text-white">Test History</h3>
              </div>
              <p className="text-gray-400">
                Track your progress over time. Review past performance, 
                understand improvement areas, and monitor your learning journey.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Feedback: Your Growth Compass",
      content: (
        <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
          <p className="text-gray-300">
            Gain insights into your professional development through comprehensive feedback:
          </p>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">📈</span>
              <h3 className="text-lg font-semibold text-white">Monthly Performance Evaluation</h3>
            </div>
            <p className="text-gray-400">
              Receive detailed monthly assessments based on your test scores, 
              completed activities, and overall progress. Understand your 
              strengths and areas for improvement.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">🎯</span>
              <h3 className="text-lg font-semibold text-white">Career Progress Insights</h3>
            </div>
            <p className="text-gray-400">
              Comprehensive career feedback providing a holistic view of 
              your professional growth, skill development, and potential opportunities.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Challenges: Skill Enhancement Platform",
      content: (
        <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
          <p className="text-gray-300">
            Transform learning into an engaging and rewarding experience:
          </p>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">🏆</span>
              <h3 className="text-lg font-semibold text-white">Activity-Based Learning</h3>
            </div>
            <p className="text-gray-400">
              Complete diverse challenges designed to enhance your skills. 
              Submit your work for verification and earn rewards. Each challenge 
              is a step towards professional mastery.
            </p>
          </div>
          <p className="text-gray-300 text-center">
            Challenges are curated to provide practical, hands-on experience 
            in your chosen career path.
          </p>
        </div>
      )
    },
    {
      title: "Community: Connect & Grow Together",
      content: (
        <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
          <p className="text-gray-300">
            Your professional network starts here:
          </p>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">👥</span>
              <h3 className="text-lg font-semibold text-white">Career-Specific Communities</h3>
            </div>
            <p className="text-gray-400">
              Connect with peers in careers you&apos;ve selected. Share achievements, 
              learn from other&apos;s experiences, and build meaningful professional relationships.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">🤝</span>
              <h3 className="text-lg font-semibold text-white">Collaborative Growth</h3>
            </div>
            <p className="text-gray-400">
              Engage in discussions, share insights, and support each other&apos;s 
              professional journeys.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Career Overview: Your Professional Roadmap",
      content: (
        <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
          <p className="text-gray-300">
            A comprehensive exploration of your chosen career trajectory:
          </p>
          <div className="space-y-3">
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">🌐</span>
                <h3 className="text-lg font-semibold text-white">Comprehensive Career Insights</h3>
                </div>
                <p className="text-gray-400">
                A holistic exploration of your career, offering in-depth analysis, strategic guidance, 
                and actionable intelligence to support your professional journey from exploration 
                to advanced career development.
                </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">🚀</span>
                <h3 className="text-lg font-semibold text-white">Strategic Career Navigation</h3>
                </div>
                <p className="text-gray-400">
                Empower your professional growth with a dynamic, comprehensive approach to career 
                planning. Discover personalized strategies, resources, and insights tailored to 
                your unique career aspirations and potential.
                </p>
            </div>
            </div>
        </div>
      )
    }
  ];

  if (!showExplanation && !forceShow) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden relative">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X size={24} />
        </button>

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
        <div className="p-4 md:p-6 lg:p-10">
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 text-center">{steps[currentStep].title}</h2>
          <div className="h-96 md:h-72 overflow-y-auto">
            {steps[currentStep].content}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {currentStep > 0 ? (
              <button 
                onClick={handlePrevious}
                className="px-4 py-2 mr-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
            ) : (
              <div></div>
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
            {currentStep === steps.length - 1 && (
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            )}
            
            {currentStep < steps.length - 1 && (
              <button 
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerGuideExplanation;
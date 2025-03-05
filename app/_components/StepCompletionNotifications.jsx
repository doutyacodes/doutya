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
        {/* <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-lg shadow-lg p-4 mb-6 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Ready to Discover Yourself?</h3>
                <div className="mt-2 text-sm text-green-100">
                  <p>
                      Kickstart your journey by taking the Personality Test for <strong>Career Path Discovery</strong>. 
                      Understand your strengths and find careers that fit you!
                  </p>              
              </div>
                <div className="mt-3">
                  <a href="/quiz-section/1" className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Start Personality Test
                  </a>
                </div>
              </div>
            </div>
            <button
            //  onClick={handleDismiss} 
             className="text-green-100 hover:text-white">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div> */}

        {/* the Modal */}
        {
          visible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
              <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Content */}
                <div className="p-10">
                  <div className="min-h-64">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-5xl mb-4">🚀</div>
                      <h2 className="text-2xl font-bold text-white mb-2">Ready to Discover Yourself?</h2>
                      <p className="text-gray-300">
                        Kickstart your journey by taking the Personality Test for <strong>Career Path Discovery</strong>. 
                        Understand your strengths and find careers that fit you!
                      </p>
                      <p className="text-gray-300 mt-2">
                        Let&apos;s get started on your journey to finding a fulfilling career!
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Navigation buttons */}
                <div className="bg-gray-800 px-6 py-4 flex justify-end">
                  <div>
                    <button 
                      onClick={handleDismiss}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
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
      {/* <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg shadow-lg p-4 mb-6 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div className="flex">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
              <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Personality Test Completed!</h3>
              <div className="mt-2 text-sm text-blue-100">
                <p>Great job! You&apos;ve completed the personality assessment. Now take the Interest Test to further refine your career matches.</p>
              </div>
              <div className="mt-3">
                <a href="/CareerQuizSection/2" className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Start Interest Test
                </a>
              </div>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-blue-100 hover:text-white">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div> */}

      {/* the Modal */}
      {
          visible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
              <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Content */}
                <div className="p-10">
                  <div className="min-h-64">
                    <div className="flex flex-col items-center space-y-4">
                      <h2 className="text-2xl font-bold text-white mb-2">Personality Test Completed!</h2>
                      <p className="text-gray-300">
                        Great job! You&apos;ve completed the personality assessment. Now take the Interest Test to further refine your career matches.
                      </p>
                      <div className="bg-gray-800 p-4 rounded-lg text-center">
                        <div className="text-4xl mb-2">🔍</div>
                        <h3 className="text-lg font-semibold text-white">Interest Assessment</h3>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation buttons */}
                <div className="bg-gray-800 px-6 py-4 flex justify-end">
                  <div>
                    <button 
                      onClick={handleDismiss}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
                    >
                      Don&apos;t Show Again
                    </button>
                  
                      <a 
                        href="/CareerQuizSection/2"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
      {/* <div className="bg-gradient-to-r from-orange-700 to-orange-500 rounded-lg shadow-lg p-4 mb-6 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div className="flex">
            <div className="flex-shrink-0 bg-orange-100 rounded-full p-2">
              <svg className="h-6 w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Interest Test Completed!</h3>
              <div className="mt-2 text-sm text-orange-100">
                <p>Excellent work! Now it&apos;s time to select an industry that aligns with your personality and interests.</p>
              </div>
              <div className="mt-3">
                <a 
                  // onClick={handleClose}
                  // href="/industry-selection"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Select one of the industries from below
                </a>
              </div>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-orange-100 hover:text-white">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div> */}

      {/* the Modal */}
      {
        visible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
              {/* Content */}
              <div className="p-10">
                <div className="min-h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-bold text-white mb-2">Interest Test Completed!</h2>
                    <p className="text-gray-300">
                      Excellent work! Now it&apos;s time to select an industry that aligns with your personality and interests.
                    </p>
                    <div className="bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">🏢</div>
                      <h3 className="text-lg font-semibold text-white">Industry Selection</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="bg-gray-800 px-6 py-4 flex justify-end">
                <div>
                  <button 
                    onClick={handleDismiss}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
                  >
                    Don&apos;t Show Again
                  </button>
                
                    <button 
                      onClick={handleClose}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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

// Step 3 Completion: Industry Selection
// export const IndustrySelectionComplete = () => {
//   const [visible, setVisible] = useState(true);

//   useEffect(() => {
//     // Check if this notification was dismissed before
//     const isDismissed = localStorage.getItem('industrySelectionNotificationDismissed');
//     if (isDismissed === 'true') {
//       setVisible(false);
//     }
//   }, []);

//   const handleDismiss = () => {
//     localStorage.setItem('industrySelectionNotificationDismissed', 'true');
//     setVisible(false);
//   };

//   const handleClose = () => {
//     setVisible(false);
//   };

//   if (!visible) return null;

//   return (
//     <>
//     {/* <div className="bg-gradient-to-r from-purple-800 to-purple-600 rounded-lg shadow-lg p-4 mb-6 animate-fadeIn">
//       <div className="flex items-start justify-between">
//         <div className="flex">
//           <div className="flex-shrink-0 bg-purple-100 rounded-full p-2">
//             <svg className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <div className="ml-4">
//             <h3 className="text-lg font-medium text-white">Industry Selected!</h3>
//             <div className="mt-2 text-sm text-purple-100">
//               <p>Great choice! Now explore career suggestions that match your profile within your selected industry.</p>
//             </div>
//             <div className="mt-3">
//               <a
//                href="/career-suggestions"
//                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
//                 Choose Your Career Below 
//               </a>
//             </div>
//           </div>
//         </div>
//         <button onClick={handleDismiss} className="text-purple-100 hover:text-white">
//           <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//           </svg>
//         </button>
//       </div>
//     </div> */}
//     {/* the Modal */}
//     {
//       visible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
//           <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
//             {/* Content */}
//             <div className="p-10">
//               <div className="min-h-64">
//                 <div className="flex flex-col items-center space-y-4">
//                   <h2 className="text-2xl font-bold text-white mb-2">Industry Selected!</h2>
//                   <p className="text-gray-300">
//                     Great choice! Now explore career suggestions that match your profile within your selected industry
//                   </p>
//                   <div className="bg-gray-800 p-4 rounded-lg text-center">
//                     <div className="text-4xl mb-2">💼</div>
//                     <h3 className="text-lg font-semibold text-white">Explore and select career options that match your profile</h3>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Navigation buttons */}
//             <div className="bg-gray-800 px-6 py-4 flex justify-end">
//               <div>
//                 <button 
//                   onClick={handleDismiss}
//                   className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
//                 >
//                   Don&apos;t Show Again
//                 </button>
              
//                   <button 
//                     onClick={handleClose}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//                   >
//                     Choose Your Career 
//                   </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )
//     }
//   </>
//   );
// };


// export const IndustrySelectionComplete = () => {
//   const [visible, setVisible] = useState(true);
//   const [currentStep, setCurrentStep] = useState(0);

//   const steps = [
//     {
//       title: 'Congratulations on Your Industry Selection!',
//       content: (
//         <div className="text-center">
//           <div className="text-4xl mb-4">🎉</div>
//           <h2 className="text-2xl font-bold text-white mb-4">Excellent Industry Choice!</h2>
//           <p className="text-gray-300 mb-6">
//             You've taken a significant step in your career journey by selecting an industry that aligns with your interests and goals.
//           </p>
//           <div className="bg-gray-800 p-6 rounded-lg">
//             <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
//             <p className="text-gray-300">
//               It's time to explore and select specific career options within your chosen industry.
//             </p>
//           </div>
//         </div>
//       )
//     },
//     {
//       title: 'Career Selection Guide',
//       content: (
//         <div>
//           <h2 className="text-2xl font-bold text-white mb-6">How to Choose Your Careers</h2>
          
//           <div className="space-y-6 text-gray-300">
//             <div className="bg-gray-800 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold text-white mb-3">Career Slot Overview</h3>
//               <p className="mb-4">
//                 You have 5 career slots available to customize your professional path:
//               </p>
//               <ul className="list-disc list-inside space-y-2">
//                 <li>2 slots are immediately available for all users</li>
//                 <li>3 additional slots are locked for free users</li>
//                 <li>Pro users can unlock all 5 slots</li>
//               </ul>
//             </div>

//             <div className="bg-gray-800 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold text-white mb-3">How to Add Careers</h3>
//               <p className="mb-4">You can add careers to your slots in two ways:</p>
//               <ol className="list-decimal list-inside space-y-2">
//                 <li>
//                   <strong>From Career Suggestions:</strong> 
//                   <p className="text-sm">Browse suggested careers and click "Move to Career" to add to your slots.</p>
//                 </li>
//                 <li>
//                   <strong>Pro Users - Custom Career Addition:</strong>
//                   <p className="text-sm">Click the plus button to add a custom career of your choice.</p>
//                 </li>
//               </ol>
//             </div>

//             <div className="bg-gray-800 p-4 rounded-lg text-sm">
//               <h3 className="text-lg font-semibold text-white mb-3">Pro Tip</h3>
//               <p>
//                 💡 Take your time exploring careers. Your selections can be refined as you learn more about 
//                 your industry and potential career paths.
//               </p>
//             </div>
//           </div>
//         </div>
//       )
//     }
//   ];

//   useEffect(() => {
//     const isDismissed = localStorage.getItem('industrySelectionNotificationDismissed');
//     if (isDismissed === 'true') {
//       setVisible(false);
//     }
//   }, []);

//   const handleNext = () => {
//     if (currentStep < steps.length - 1) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleDismiss = () => {
//     localStorage.setItem('industrySelectionNotificationDismissed', 'true');
//     setVisible(false);
//   };

//   if (!visible) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
//       <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
//         {/* Progress bar */}
//         <div className="flex justify-between bg-gray-800 px-6 py-3">
//           {steps.map((_, index) => (
//             <div 
//               key={index} 
//               className={`h-1 flex-1 rounded-full mx-1 ${
//                 index <= currentStep ? 'bg-blue-500' : 'bg-gray-600'
//               }`}
//             />
//           ))}
//         </div>

//         {/* Content */}
//         <div className="p-8">
//           {steps[currentStep].content}
//         </div>
        
//         {/* Navigation buttons */}
//         <div className="bg-gray-800 px-6 py-4 flex justify-between">
//           <div className='flex items-center'>
//             {currentStep > 0 && (
//               <button 
//                 onClick={handlePrevious}
//                 className="px-4 py-2 mr-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
//               >
//                 Previous
//               </button>
//             )}
//           </div>
//           <div>
//             {currentStep === steps.length - 1 && (
//               <button 
//                 onClick={handleDismiss}
//                 className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
//               >
//                 Don't Show Again
//               </button>
//             )}
            
//             {currentStep < steps.length - 1 ? (
//               <button 
//                 onClick={handleNext}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Next
//               </button>
//             ) : (
//               <button 
//                 onClick={handleDismiss}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Get Started
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IndustrySelectionComplete;

export const IndustrySelectionComplete = () => {
  const [visible, setVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Congratulations on Your Industry Selection!',
      content: (
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-4">Excellent Industry Choice!</h2>
          <p className="text-gray-300 mb-6">
            You've taken a significant step in your career journey by selecting an industry that aligns with your interests and goals.
          </p>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
            <p className="text-gray-300">
              It's time to explore and select specific career options within your chosen industry.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Welcome to Your Career Planning Hub',
      content: (
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-4">Career Slot System Explained</h2>
          <div className="bg-gray-800 p-6 rounded-lg text-gray-300 space-y-4">
            <p>
              We've designed a unique Career Slot system to help you strategically plan your professional journey.
            </p>
            <div className="text-left space-y-3">
              <div className="flex items-center">
                <span className="mr-3 text-blue-500">•</span>
                <span>You have <strong>5 Career Slots</strong> to map out your professional path</span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 text-blue-500">•</span>
                <span>These slots allow you to explore and organize potential career options</span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 text-blue-500">•</span>
                <span>Think of them as your personal career planning canvas</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Understanding Your Career Slots',
      content: (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Slot Access Levels</h2>
          
          <div className="space-y-6 text-gray-300">
            <div className="bg-gray-800 p-5 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Slot Availability</h3>
              <ul className="space-y-3">
                <li>
                  <strong>Free Users:</strong>
                  <p className="text-sm mt-1">
                    • 2 slots immediately available
                    • 3 additional slots locked
                  </p>
                </li>
                <li>
                  <strong>Pro Users:</strong>
                  <p className="text-sm mt-1">
                    • All 5 slots fully unlocked
                    • Ability to add custom careers
                  </p>
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
        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-6">Maximize Your Career Potential</h2>
          
          {/* <div className="bg-gray-800 p-6 rounded-lg text-gray-300 space-y-4">
            <p className="text-base">
              These career slots are more than just placeholders - they're your strategic career roadmap.
            </p>
            
            <div className="text-left space-y-3">
              <div className="flex items-center">
                <span className="mr-3 text-blue-500">✓</span>
                <span>Visualize multiple career paths</span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 text-blue-500">✓</span>
                <span>Track your professional exploration</span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 text-blue-500">✓</span>
                <span>Adapt and refine your career strategy</span>
              </div>
            </div>
            
            <p className="text-sm italic mt-4">
              Remember, your career journey is dynamic - these slots help you stay organized and focused!
            </p>
          </div> */}

            <div className="bg-gray-800 p-5 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">How to Fill Your Slots</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li>
                  <strong>From Career Suggestions:</strong>
                  <p className="text-sm mt-1">Browse suggested careers and click "Move to Career"</p>
                </li>
                <li>
                  <strong>Pro Users - Custom Addition:</strong>
                  <p className="text-sm mt-1">Use the plus button to add a custom career as well</p>
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
        <div className="p-8">
          {steps[currentStep].content}
        </div>
        
        {/* Navigation buttons */}
        <div className="bg-gray-800 px-6 py-4 flex justify-between">
          <div className='flex items-center'>
            {currentStep > 0 && (
              <button 
                onClick={handlePrevious}
                className="px-4 py-2 mr-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          <div>
            {currentStep === steps.length - 1 && (
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-3"
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
      <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Content */}
        <div className="p-10">
          <div className="min-h-64">
            <div className="flex flex-col items-center space-y-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-300 text-center">
                {steps[currentStep].description}
              </p>
              
              {steps[currentStep].content}
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="bg-gray-800 px-6 py-4 flex justify-between">
          <div className='flex items-center'>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 mr-4 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
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
                  className="text-gray-300 text-sm"
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
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
            <svg className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-white">Career Journey Complete!</h3>
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

// "use client"
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';

// const PlanSelection = () => {
//   const router = useRouter();
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [activationKey, setActivationKey] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const BASE_KEY = 'XORT-BS-74QP2L9F';
//   const PRO_KEY = 'XORT-PR-93XK7V4Z';

//   const handlePlanSelection = (plan) => {
//     setSelectedPlan(plan);
//     setError('');
//   };

//   const handleActivation = async () => {
//     setError('');
//     setLoading(true);

//     // Validate key against selected plan
//     if (selectedPlan === 'base' && activationKey !== BASE_KEY) {
//       setError('Invalid activation key for Base plan');
//       setLoading(false);
//       return;
//     }

//     if (selectedPlan === 'pro' && activationKey !== PRO_KEY) {
//       setError('Invalid activation key for Pro plan');
//       setLoading(false);
//       return;
//     }

//     try {
//     const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//       const response = await fetch('/api/user/update-plan', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//            'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           plan_type: selectedPlan,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         console.log("insode the ok ");
        
//         // Update local storage with the new token if provided
//         if (data.token) {
//             console.log("date.token", data.token);
            
//           localStorage.setItem('token', data.token);
//         }

//         const storedUrl = localStorage.getItem("navigateUrl");
//         console.log("storedUrl.storedUrl", storedUrl);

//         if (storedUrl) {
//             console.log("Navigating to:", storedUrl);
          
//             // Delay navigation to ensure cookie is propagated
//             setTimeout(() => {
//                 // router.refresh();
//                 // router.push(storedUrl);
//                 window.location.href = storedUrl;  // Force full reload
//             }, 1000);  // 100ms delay
//           }
        
//       } else {
//         setError(data.message || 'Failed to activate plan');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-10">
//           <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
//           <p className="text-gray-400">Select the plan that best fits your needs</p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8 mb-10">
//           {/* Base Plan */}
//           <div 
//             className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
//               selectedPlan === 'base' ? 'border-blue-500 transform scale-105' : 'border-gray-700'
//             }`}
//             onClick={() => handlePlanSelection('base')}
//           >
//             <div className="text-center mb-6">
//               <h2 className="text-xl font-bold mb-2">Basic Plan</h2>
//               <p className="text-gray-400">Get started with essential features</p>
//             </div>
//             <ul className="space-y-3 mb-6">
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Single country education & career suggestions</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Add up to 2 careers from suggestions</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Manual career addition</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Personalized feedback</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Downloadable certificate</span>
//               </li>
//             </ul>
//             <button 
//               className={`w-full py-2 px-4 rounded-md ${
//                 selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
//               } transition-colors`}
//               onClick={() => handlePlanSelection('base')}
//             >
//               Select Basic Plan
//             </button>
//           </div>

//           {/* Pro Plan */}
//           <div 
//             className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
//               selectedPlan === 'pro' ? 'border-purple-500 transform scale-105' : 'border-gray-700'
//             }`}
//             onClick={() => handlePlanSelection('pro')}
//           >
//             <div className="text-center mb-6">
//               <h2 className="text-xl font-bold mb-2">Pro Plan</h2>
//               <p className="text-gray-400">Unlock all premium features</p>
//             </div>
//             <ul className="space-y-3 mb-6">
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Multiple countries for education & career suggestions</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Add up to 5 careers</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Manual career addition beyond suggestions</span>
//               </li>
//               <li className="flex items-start">
//                 <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Detailed personalized feedback</span>
//               </li>
//               {/* <li className="flex items-start">
//                 <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 <span>Premium certificate with custom design</span>
//               </li> */}
//             </ul>
//             <button 
//               className={`w-full py-2 px-4 rounded-md ${
//                 selectedPlan === 'pro' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
//               } transition-colors`}
//               onClick={() => handlePlanSelection('pro')}
//             >
//               Select Pro Plan
//             </button>
//           </div>
//         </div>

//         {selectedPlan && (
//           <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
//             <h3 className="text-xl font-bold mb-4 text-center">
//               Activate Your {selectedPlan === 'base' ? 'Basic' : 'Pro'} Plan
//             </h3>
//             <div className="mb-4">
//               <label htmlFor="activationKey" className="block text-sm font-medium text-gray-400 mb-2">
//                 Enter Activation Key
//               </label>
//               <input
//                 type="text"
//                 id="activationKey"
//                 className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={activationKey}
//                 onChange={(e) => setActivationKey(e.target.value)}
//                 placeholder="Enter your activation key"
//               />
//             </div>
//             {error && (
//               <div className="text-red-500 text-sm mb-4">
//                 {error}
//               </div>
//             )}
//             <button
//               className={`w-full py-2 px-4 rounded-md ${
//                 selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
//               } transition-colors`}
//               onClick={handleActivation}
//               disabled={loading}
//             >
//               {loading ? 'Activating...' : 'Activate Plan'}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanSelection;

"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const PlanSelection = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activationKey, setActivationKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('selection'); // selection -> payment -> activation
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const BASE_KEY = 'XORT-BS-74QP2L9F';
  const PRO_KEY = 'XORT-PR-93XK7V4Z';

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    setError('');
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      setError('Please select a plan first');
      return;
    }
    setStep('payment');
    setError('');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setStep('activation');
    }, 1500);
  };

  const handleActivation = async () => {
    setError('');
    setLoading(true);

    // Validate key against selected plan
    if (selectedPlan === 'base' && activationKey !== BASE_KEY) {
      setError('Invalid activation key for Base plan');
      setLoading(false);
      return;
    }

    if (selectedPlan === 'pro' && activationKey !== PRO_KEY) {
      setError('Invalid activation key for Pro plan');
      setLoading(false);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch('/api/user/update-plan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_type: selectedPlan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage with the new token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        const storedUrl = localStorage.getItem("navigateUrl");

        if (storedUrl) {
          // Delay navigation to ensure cookie is propagated
          setTimeout(() => {
            window.location.href = storedUrl;  // Force full reload
          }, 1000);
        }
      } else {
        setError(data.message || 'Failed to activate plan');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to go back to previous step
  const goBack = () => {
    if (step === 'payment') {
      setStep('selection');
    } else if (step === 'activation') {
      setStep('payment');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-400">Select the plan that best fits your needs</p>
        </div>

        {/* Step progress indicator */}
        <div className="flex items-center justify-center mb-10">
          <div className={`flex flex-col items-center ${step === 'selection' ? 'text-blue-500' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step === 'selection' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}`}>1</div>
            <span className="text-xs mt-1">Select Plan</span>
          </div>
          <div className={`w-12 h-0.5 ${step === 'selection' ? 'bg-gray-600' : 'bg-blue-500'}`}></div>
          <div className={`flex flex-col items-center ${step === 'payment' ? 'text-blue-500' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step === 'payment' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}`}>2</div>
            <span className="text-xs mt-1">Payment</span>
          </div>
          <div className={`w-12 h-0.5 ${step === 'activation' ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
          <div className={`flex flex-col items-center ${step === 'activation' ? 'text-blue-500' : 'text-gray-400'}`}>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step === 'activation' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}`}>3</div>
            <span className="text-xs mt-1">Activation</span>
          </div>
        </div>

        {/* Plan Selection Step */}
        {step === 'selection' && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Base Plan */}
              <div 
                className={`bg-gray-800 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                  selectedPlan === 'base' ? 'border-blue-500 transform scale-105' : 'border-gray-700 hover:border-gray-500'
                }`}
                onClick={() => handlePlanSelection('base')}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-1 bg-blue-500 px-3 py-1 rounded-lg">Basic Plan</h2>
                  <div className="flex justify-center items-baseline mb-4">
                    <span className="text-3xl font-bold">₹99</span>
                    <span className="text-gray-400 ml-1">/month</span>
                  </div>
                  <p className="text-gray-400">Get started with essential features</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Single country education & career suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Add up to 2 careers from suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Manual career addition</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Personalized feedback</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Downloadable certificate</span>
                  </li>
                </ul>
                <button 
                  className={`w-full py-2 px-4 rounded-md ${
                    selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                  } transition-colors`}
                  onClick={() => handlePlanSelection('base')}
                >
                  Select Basic Plan
                </button>
              </div>

              {/* Pro Plan */}
              <div 
                className={`bg-gray-800 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                  selectedPlan === 'pro' ? 'border-purple-500 transform scale-105' : 'border-gray-700 hover:border-gray-500'
                }`}
                onClick={() => handlePlanSelection('pro')}
              >
                <div className="text-center mb-6">
                  {/* <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded absolute right-8 -mt-2">RECOMMENDED</div> */}
                  <h2 className="text-xl font-bold mb-1 bg-purple-500 px-3 py-1 rounded-lg">Pro Plan</h2>
                  <div className="flex justify-center items-baseline mb-4">
                    <span className="text-3xl font-bold">₹199</span>
                    <span className="text-gray-400 ml-1">/month</span>
                  </div>
                  <p className="text-gray-400">Unlock all premium features</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Multiple countries for education & career suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Add up to 5 careers</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Manual career addition beyond suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Detailed personalized feedback</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Premium support</span>
                  </li>
                </ul>
                <button 
                  className={`w-full py-2 px-4 rounded-md ${
                    selectedPlan === 'pro' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
                  } transition-colors`}
                  onClick={() => handlePlanSelection('pro')}
                >
                  Select Pro Plan
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                className="py-2 px-8 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-medium"
                onClick={handleProceedToPayment}
                disabled={!selectedPlan}
              >
                Proceed to Payment
              </button>
            </div>
          </>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">
              Payment for {selectedPlan === 'base' ? 'Basic' : 'Pro'} Plan
            </h3>
            <p className="text-center mb-6 text-gray-400">
              Amount: <span className="font-bold text-white">{selectedPlan === 'base' ? '₹99' : '₹199'}</span>
            </p>

            <div className="mb-6">
              <div className="flex border-b border-gray-700 mb-4">
                <button
                  className={`flex-1 py-2 text-center ${paymentMethod === 'upi' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  UPI
                </button>
                <button
                  className={`flex-1 py-2 text-center ${paymentMethod === 'card' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  Card
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <form onSubmit={handlePaymentSubmit}>
                  <div className="mb-4">
                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-400 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      id="upiId"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm mb-4">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="flex-1 py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                      onClick={goBack}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2 px-4 rounded-md ${
                        selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                      } transition-colors`}
                      disabled={loading || !upiId}
                    >
                      {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </form>
              )}

              {paymentMethod === 'card' && (
                <form onSubmit={handlePaymentSubmit}>
                  <div className="mb-4">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-400 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-400 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-400 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-400 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm mb-4">
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="flex-1 py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                      onClick={goBack}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2 px-4 rounded-md ${
                        selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                      } transition-colors`}
                      disabled={loading || !cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv}
                    >
                      {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Activation Step */}
        {step === 'activation' && (
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
              <p className="text-gray-400">
                Complete the activation to start using your {selectedPlan === 'base' ? 'Basic' : 'Pro'} plan
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="activationKey" className="block text-sm font-medium text-gray-400 mb-2">
                Enter Activation Key
              </label>
              <input
                type="text"
                id="activationKey"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={activationKey}
                onChange={(e) => setActivationKey(e.target.value)}
                placeholder="Enter your activation key"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                className="flex-1 py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                onClick={goBack}
              >
                Back
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md ${
                  selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                } transition-colors`}
                onClick={handleActivation}
                disabled={loading}
              >
                {loading ? 'Activating...' : 'Activate Plan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSelection;
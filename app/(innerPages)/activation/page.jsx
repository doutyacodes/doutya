// "use client"
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';

// const PlanSelection = () => {
//   const router = useRouter();
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [activationKey, setActivationKey] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState('selection'); // selection -> payment -> activation
//   const [paymentMethod, setPaymentMethod] = useState('upi');
//   const [upiId, setUpiId] = useState('');
//   const [cardDetails, setCardDetails] = useState({
//     number: '',
//     name: '',
//     expiry: '',
//     cvv: ''
//   });

//   const BASE_KEY = 'XORT-BS-74QP2L9F';
//   const PRO_KEY = 'XORT-PR-93XK7V4Z';

//   const handlePlanSelection = (plan) => {
//     setSelectedPlan(plan);
//     setError('');
//   };

//   const handleProceedToPayment = () => {
//     if (!selectedPlan) {
//       setError('Please select a plan first');
//       return;
//     }
//     setStep('payment');
//     setError('');
//   };

//   const handlePaymentSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Simulate payment processing
//     setTimeout(() => {
//       setLoading(false);
//       setStep('activation');
//     }, 1500);
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
//       const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//       const response = await fetch('/api/user/update-plan', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           plan_type: selectedPlan,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // Update local storage with the new token if provided
//         if (data.token) {
//           localStorage.setItem('token', data.token);
//         }

//         const storedUrl = localStorage.getItem("navigateUrl");

//         if (storedUrl) {
//           // Delay navigation to ensure cookie is propagated
//           setTimeout(() => {
//             window.location.href = storedUrl;  // Force full reload
//           }, 1000);
//         }
//       } else {
//         setError(data.message || 'Failed to activate plan');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to go back to previous step
//   const goBack = () => {
//     if (step === 'payment') {
//       setStep('selection');
//     } else if (step === 'activation') {
//       setStep('payment');
//     }
//     setError('');
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
//           <p className="text-gray-400">Select the plan that best fits your needs</p>
//         </div>

//         {/* Step progress indicator */}
//         <div className="flex items-center justify-center mb-10">
//           <div className={`flex flex-col items-center ${step === 'selection' ? 'text-blue-500' : 'text-gray-400'}`}>
//             <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step === 'selection' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}`}>1</div>
//             <span className="text-xs mt-1">Select Plan</span>
//           </div>
//           <div className={`w-12 h-0.5 ${step === 'selection' ? 'bg-gray-600' : 'bg-blue-500'}`}></div>
//           <div className={`flex flex-col items-center ${step === 'payment' ? 'text-blue-500' : 'text-gray-400'}`}>
//             <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step === 'payment' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}`}>2</div>
//             <span className="text-xs mt-1">Payment</span>
//           </div>
//           <div className={`w-12 h-0.5 ${step === 'activation' ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
//           <div className={`flex flex-col items-center ${step === 'activation' ? 'text-blue-500' : 'text-gray-400'}`}>
//             <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step === 'activation' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}`}>3</div>
//             <span className="text-xs mt-1">Activation</span>
//           </div>
//         </div>

//         {/* Plan Selection Step */}
//         {step === 'selection' && (
//           <>
//             <div className="grid md:grid-cols-2 gap-6 mb-8">
//               {/* Base Plan */}
//               <div 
//                 className={`bg-gray-800 rounded-lg p-6 border-2 transition-all cursor-pointer ${
//                   selectedPlan === 'base' ? 'border-blue-500 transform scale-105' : 'border-gray-700 hover:border-gray-500'
//                 }`}
//                 onClick={() => handlePlanSelection('base')}
//               >
//                 <div className="text-center mb-6">
//                   <h2 className="text-xl font-bold mb-1 bg-blue-500 px-3 py-1 rounded-lg">Basic Plan</h2>
//                   <div className="flex justify-center items-baseline mb-4">
//                     <span className="text-3xl font-bold">₹99</span>
//                     <span className="text-gray-400 ml-1">/month</span>
//                   </div>
//                   <p className="text-gray-400">Get started with essential features</p>
//                 </div>
//                 <ul className="space-y-3 mb-6">
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Single country education & career suggestions</span>
//                   </li>
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Add up to 2 careers from suggestions</span>
//                   </li>
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Manual career addition</span>
//                   </li>
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Personalized feedback</span>
//                   </li>
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Downloadable certificate</span>
//                   </li>
//                 </ul>
//                 <button 
//                   className={`w-full py-2 px-4 rounded-md ${
//                     selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
//                   } transition-colors`}
//                   onClick={() => handlePlanSelection('base')}
//                 >
//                   Select Basic Plan
//                 </button>
//               </div>

//               {/* Pro Plan */}
//               <div 
//                 className={`bg-gray-800 rounded-lg p-6 border-2 transition-all cursor-pointer ${
//                   selectedPlan === 'pro' ? 'border-purple-500 transform scale-105' : 'border-gray-700 hover:border-gray-500'
//                 }`}
//                 onClick={() => handlePlanSelection('pro')}
//               >
//                 <div className="text-center mb-6">
//                   {/* <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded absolute right-8 -mt-2">RECOMMENDED</div> */}
//                   <h2 className="text-xl font-bold mb-1 bg-purple-500 px-3 py-1 rounded-lg">Pro Plan</h2>
//                   <div className="flex justify-center items-baseline mb-4">
//                     <span className="text-3xl font-bold">₹199</span>
//                     <span className="text-gray-400 ml-1">/month</span>
//                   </div>
//                   <p className="text-gray-400">Unlock all premium features</p>
//                 </div>
//                 <ul className="space-y-3 mb-6">
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Multiple countries for education & career suggestions</span>
//                   </li>
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Add up to 5 careers</span>
//                   </li>
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Manual career addition beyond suggestions</span>
//                   </li>
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Detailed personalized feedback</span>
//                   </li>
//                   <li className="flex items-start">
//                     <svg className="h-5 w-5 text-purple-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Premium support</span>
//                   </li>
//                 </ul>
//                 <button 
//                   className={`w-full py-2 px-4 rounded-md ${
//                     selectedPlan === 'pro' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
//                   } transition-colors`}
//                   onClick={() => handlePlanSelection('pro')}
//                 >
//                   Select Pro Plan
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <div className="text-red-500 text-sm text-center mb-4">
//                 {error}
//               </div>
//             )}

//             <div className="flex justify-center">
//               <button
//                 className="py-2 px-8 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-medium"
//                 onClick={handleProceedToPayment}
//                 disabled={!selectedPlan}
//               >
//                 Proceed to Payment
//               </button>
//             </div>
//           </>
//         )}

//         {/* Payment Step */}
//         {step === 'payment' && (
//           <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
//             <h3 className="text-xl font-bold mb-4 text-center">
//               Payment for {selectedPlan === 'base' ? 'Basic' : 'Pro'} Plan
//             </h3>
//             <p className="text-center mb-6 text-gray-400">
//               Amount: <span className="font-bold text-white">{selectedPlan === 'base' ? '₹99' : '₹199'}</span>
//             </p>

//             <div className="mb-6">
//               <div className="flex border-b border-gray-700 mb-4">
//                 <button
//                   className={`flex-1 py-2 text-center ${paymentMethod === 'upi' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
//                   onClick={() => setPaymentMethod('upi')}
//                 >
//                   UPI
//                 </button>
//                 <button
//                   className={`flex-1 py-2 text-center ${paymentMethod === 'card' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
//                   onClick={() => setPaymentMethod('card')}
//                 >
//                   Card
//                 </button>
//               </div>

//               {paymentMethod === 'upi' && (
//                 <form onSubmit={handlePaymentSubmit}>
//                   <div className="mb-4">
//                     <label htmlFor="upiId" className="block text-sm font-medium text-gray-400 mb-2">
//                       UPI ID
//                     </label>
//                     <input
//                       type="text"
//                       id="upiId"
//                       className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={upiId}
//                       onChange={(e) => setUpiId(e.target.value)}
//                       placeholder="yourname@upi"
//                       required
//                     />
//                   </div>
                  
//                   {error && (
//                     <div className="text-red-500 text-sm mb-4">
//                       {error}
//                     </div>
//                   )}
                  
//                   <div className="flex gap-4">
//                     <button
//                       type="button"
//                       className="flex-1 py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
//                       onClick={goBack}
//                     >
//                       Back
//                     </button>
//                     <button
//                       type="submit"
//                       className={`flex-1 py-2 px-4 rounded-md ${
//                         selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
//                       } transition-colors`}
//                       disabled={loading || !upiId}
//                     >
//                       {loading ? 'Processing...' : 'Pay Now'}
//                     </button>
//                   </div>
//                 </form>
//               )}

//               {paymentMethod === 'card' && (
//                 <form onSubmit={handlePaymentSubmit}>
//                   <div className="mb-4">
//                     <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-400 mb-2">
//                       Card Number
//                     </label>
//                     <input
//                       type="text"
//                       id="cardNumber"
//                       className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={cardDetails.number}
//                       onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
//                       placeholder="1234 5678 9012 3456"
//                       required
//                     />
//                   </div>
//                   <div className="mb-4">
//                     <label htmlFor="cardName" className="block text-sm font-medium text-gray-400 mb-2">
//                       Cardholder Name
//                     </label>
//                     <input
//                       type="text"
//                       id="cardName"
//                       className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={cardDetails.name}
//                       onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
//                       placeholder="John Doe"
//                       required
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <label htmlFor="expiry" className="block text-sm font-medium text-gray-400 mb-2">
//                         Expiry Date
//                       </label>
//                       <input
//                         type="text"
//                         id="expiry"
//                         className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={cardDetails.expiry}
//                         onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
//                         placeholder="MM/YY"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="cvv" className="block text-sm font-medium text-gray-400 mb-2">
//                         CVV
//                       </label>
//                       <input
//                         type="text"
//                         id="cvv"
//                         className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={cardDetails.cvv}
//                         onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
//                         placeholder="123"
//                         maxLength="3"
//                         required
//                       />
//                     </div>
//                   </div>
                  
//                   {error && (
//                     <div className="text-red-500 text-sm mb-4">
//                       {error}
//                     </div>
//                   )}
                  
//                   <div className="flex gap-4">
//                     <button
//                       type="button"
//                       className="flex-1 py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
//                       onClick={goBack}
//                     >
//                       Back
//                     </button>
//                     <button
//                       type="submit"
//                       className={`flex-1 py-2 px-4 rounded-md ${
//                         selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
//                       } transition-colors`}
//                       disabled={loading || !cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv}
//                     >
//                       {loading ? 'Processing...' : 'Pay Now'}
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Activation Step */}
//         {step === 'activation' && (
//           <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
//             <div className="text-center mb-6">
//               <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
//                 <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
//               <p className="text-gray-400">
//                 Complete the activation to start using your {selectedPlan === 'base' ? 'Basic' : 'Pro'} plan
//               </p>
//             </div>
            
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
            
//             <div className="flex gap-4">
//               <button
//                 className="flex-1 py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
//                 onClick={goBack}
//               >
//                 Back
//               </button>
//               <button
//                 className={`flex-1 py-2 px-4 rounded-md ${
//                   selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
//                 } transition-colors`}
//                 onClick={handleActivation}
//                 disabled={loading}
//               >
//                 {loading ? 'Activating...' : 'Activate Plan'}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanSelection;

"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles, Shield, Zap } from "lucide-react";

export default function PlanSelectionPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script on component mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      showNotification('Failed to load payment gateway. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const plans = {
    base: {
      name: "Basic Plan",
      price: 99,
      description: "Perfect for getting started with essential features",
      icon: Shield,
      features: [
        "Single country education & career suggestions",
        "Add up to 2 careers from suggestions",
        "Manual career addition",
        "Personalized feedback",
        "Downloadable certificate"
      ],
      color: "blue",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent"
    },
    pro: {
      name: "Pro Plan",
      price: 199,
      description: "Unlock your full potential with premium features",
      icon: Sparkles,
      popular: true,
      features: [
        "Multiple countries for education & career suggestions",
        "Add up to 5 careers",
        "Manual career addition beyond suggestions",
        "Detailed personalized feedback",
        "Premium support",
        "Priority processing"
      ],
      color: "purple",
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent"
    }
  };

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      showNotification("Please select a plan to continue");
      return;
    }

    // Check if Razorpay is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      showNotification("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ plan_type: selectedPlan }),
      });

      const { order } = await res.json();

      if (!order) {
        showNotification("Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "XORTCUT",
        description: "Plan Upgrade",
        order_id: order.id,

        handler: async (response) => {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_type: selectedPlan,
              }),
            });

            const data = await verifyRes.json();

            if (verifyRes.ok) {
              setPaymentSuccess(true);
              showNotification("Payment successful! Redirecting...", "success");
              
              const storedUrl = localStorage.getItem("navigateUrl");
              setTimeout(() => {
                window.location.href = storedUrl || "/dashboard";
              }, 2000);
            } else {
              showNotification(data.message || "Payment verification failed. Please contact support.");
            }
          } catch (err) {
            showNotification("Verification error. Please contact support with your payment ID.");
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        },

        theme: {
          color: selectedPlan === "pro" ? "#8b5cf6" : "#3b82f6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      showNotification("Something went wrong. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 animate-pulse">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Payment Successful!</h2>
          <p className="text-gray-400 mb-6">Your {plans[selectedPlan].name} is now active</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            <span className="ml-2">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className={`rounded-lg px-6 py-4 shadow-2xl border backdrop-blur-sm ${
            notification.type === "success" 
              ? "bg-green-500/90 border-green-400 text-white" 
              : "bg-red-500/90 border-red-400 text-white"
          }`}>
            <div className="flex items-center space-x-3">
              {notification.type === "success" ? (
                <Check className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">!</div>
              )}
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">Secure Payment Gateway</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select the perfect plan for your career journey. Upgrade anytime, cancel anytime.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {Object.entries(plans).map(([key, plan]) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === key;
            
            return (
              <div
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`relative rounded-2xl backdrop-blur-sm transition-all duration-300 cursor-pointer group ${
                  isSelected
                    ? `bg-gradient-to-br ${plan.gradient} border-2 ${plan.color === 'blue' ? 'border-blue-500' : 'border-purple-500'} shadow-2xl scale-[1.02]`
                    : 'bg-gray-800/50 border-2 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/70'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                        plan.color === 'blue' ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600'
                      } flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      </div>
                    </div>
                    {isSelected && (
                      <div className={`w-8 h-8 rounded-full ${
                        plan.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                      } flex items-center justify-center`}>
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-5xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-gray-400 text-lg">/month</span>
                    </div>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full ${
                          plan.color === 'blue' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                        } flex items-center justify-center flex-shrink-0`}>
                          <Check className={`w-3 h-3 ${
                            plan.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                          }`} />
                        </div>
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(key);
                    }}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      isSelected
                        ? `bg-gradient-to-r ${
                            plan.color === 'blue' 
                              ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                              : 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                          } text-white shadow-lg`
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Button */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePayment}
            disabled={loading || !selectedPlan || !razorpayLoaded}
            className={`w-full py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-300 ${
              selectedPlan && !loading && razorpayLoaded
                ? `bg-gradient-to-r ${
                    selectedPlan === 'pro'
                      ? 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  } text-white shadow-2xl hover:shadow-3xl transform hover:-translate-y-0.5`
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </span>
            ) : !razorpayLoaded ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-3 border-gray-500/30 border-t-gray-500 rounded-full animate-spin"></div>
                <span>Loading Payment Gateway...</span>
              </span>
            ) : (
              `Proceed to Payment${selectedPlan ? ` • ₹${plans[selectedPlan].price}` : ''}`
            )}
          </button>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Instant Activation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
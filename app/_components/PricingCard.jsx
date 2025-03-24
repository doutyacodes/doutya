// import React from 'react';
// import { Check, X } from 'lucide-react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// const PricingCard = ({ onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
//       <div className="bg-gray-900 rounded-lg max-w-4xl w-full overflow-hidden text-gray-50">
//         <div className="p-6 flex justify-between items-center border-b border-gray-700">
//           <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
//           <button onClick={onClose} className="text-gray-300 hover:text-white">
//             <X size={24} />
//           </button>
//         </div>
        
//         <div className="p-6 grid md:grid-cols-2 gap-6">
//           {/* Basic Plan */}
//           <Card className="border-2 border-gray-600 relative overflow-hidden bg-gray-800">
//             <CardHeader className="bg-gray-800">
//               <CardTitle className="text-xl text-white">
//                 Basic Plan
//                 <span className="block text-sm font-normal text-gray-300 mt-1">
//                   Get started with essential features
//                 </span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <ul className="space-y-4">
//                 <li className="flex items-center gap-2 text-gray-100">
//                   <Check size={20} className="text-emerald-400" />
//                   <span>Single country education & career suggestions</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-100">
//                   <Check size={20} className="text-emerald-400" />
//                   <span>Add up to 2 careers from the career suggestion</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-400">
//                   <X size={20} />
//                   <span>Manual career addition</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-400">
//                   <X size={20} />
//                   <span>Personalized feedback</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-400">
//                   <X size={20} />
//                   <span>Downloadable certificate</span>
//                 </li>
//               </ul>
//               <button className="w-full mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
//                 Current Plan
//               </button>
//             </CardContent>
//           </Card>

//           {/* Pro Plan */}
//           <Card className="border-2 border-blue-400 relative overflow-hidden bg-gray-800">
//             <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
//               RECOMMENDED
//             </div>
//             <CardHeader className="bg-gray-800">
//               <CardTitle className="text-xl text-white">
//                 Pro Plan
//                 <span className="block text-sm font-normal text-gray-300 mt-1">
//                   Unlock all premium features
//                 </span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <ul className="space-y-4">
//                 <li className="flex items-center gap-2 text-gray-100">
//                   <Check size={20} className="text-emerald-400" />
//                   <span>Multiple countries for education & career suggestions</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-100">
//                   <Check size={20} className="text-emerald-400" />
//                   <span>Add up to 5 careers</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-100">
//                   <Check size={20} className="text-emerald-400" />
//                   <span>Manual career addition beyond suggestions</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-100">
//                   <Check size={20} className="text-emerald-400" />
//                   <span>Detailed personalized feedback</span>
//                 </li>
//                 <li className="flex items-center gap-2 text-gray-100">
//                   <Check size={20} className="text-emerald-400" />
//                   <span>Premium certificate with custom design</span>
//                 </li>
//               </ul>
//               <button className="w-full mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
//                 Upgrade to Pro
//               </button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PricingCard;

import React, { useState } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PricingCard = ({ onClose }) => {
  // State for activation step
  const [showActivation, setShowActivation] = useState(false);
  const [activationKey, setActivationKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Pro key for validation
  const PRO_KEY = 'XORT-PR-93XK7V4Z';
  
  const handleUpgradeClick = () => {
    setShowActivation(true);
  };
  
  const handleBackClick = () => {
    setShowActivation(false);
    setActivationKey('');
    setError('');
  };
  
  const handleActivation = async () => {
    setError('');
    setLoading(true);
    
    // Validate the pro key
    if (activationKey !== PRO_KEY) {
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
          plan_type: 'pro',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update local storage with the new token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Close the modal after successful activation
        onClose();
        
        // Navigate if needed (removed for modal context)
      } else {
        setError(data.message || 'Failed to activate plan');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center p-2 z-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl text-gray-50 my-2 mx-2 mt-4 mb-16"> 
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {showActivation ? 'Activate Pro Plan' : 'Choose Your Plan'}
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {!showActivation ? (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Basic Plan */}
            <Card className="border-2 border-gray-600 relative overflow-hidden bg-gray-800">
              <CardHeader className="bg-gray-800 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-white">
                  Basic Plan
                  <span className="block text-xs sm:text-sm font-normal text-gray-300 mt-1">
                    Get started with essential features
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-100">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Single country education & career suggestions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-100">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Add up to 2 careers from the career suggestion</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-400">
                    <X size={18} className="flex-shrink-0" />
                    <span>Manual career addition</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-400">
                    <X size={18} className="flex-shrink-0" />
                    <span>Personalized feedback</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-400">
                    <X size={18} className="flex-shrink-0" />
                    <span>Downloadable certificate</span>
                  </li>
                </ul>
                <button className="w-full mt-4 sm:mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base">
                  Current Plan
                </button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-400 relative overflow-hidden bg-gray-800">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs sm:text-sm font-medium">
                RECOMMENDED
              </div>
              <CardHeader className="bg-gray-800 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-white">
                  Pro Plan
                  <span className="block text-xs sm:text-sm font-normal text-gray-300 mt-1">
                    Unlock all premium features
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-100">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Multiple countries for education & career suggestions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-100">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Add up to 5 careers</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-100">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Manual career addition beyond suggestions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-100">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Detailed personalized feedback</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base text-gray-100">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Premium certificate with custom design</span>
                  </li>
                </ul>
                <button 
                  onClick={handleUpgradeClick}
                  className="w-full mt-4 sm:mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Upgrade to Pro
                </button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">
                Activate Pro Plan
              </h3>
              <div className="mb-4">
                <label htmlFor="activationKey" className="block text-sm font-medium text-gray-400 mb-2">
                  Enter Activation Key
                </label>
                <input
                  type="text"
                  id="activationKey"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  placeholder="Enter your activation key"
                />
              </div>
              {error && (
                <div className="text-red-500 text-xs sm:text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-sm sm:text-base"
                  onClick={handleBackClick}
                >
                  Back
                </button>
                <button
                  className="flex-1 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors flex justify-center items-center text-sm sm:text-base"
                  onClick={handleActivation}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Activating...
                    </>
                  ) : (
                    'Activate Plan'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingCard;
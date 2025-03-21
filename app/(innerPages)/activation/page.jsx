"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const PlanSelection = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activationKey, setActivationKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_KEY = 'XORT-BS-74QP2L9F';
  const PRO_KEY = 'XORT-PR-93XK7V4Z';

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    setError('');
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
        console.log("insode the ok ");
        
        // Update local storage with the new token if provided
        if (data.token) {
            console.log("date.token", data.token);
            
          localStorage.setItem('token', data.token);
        }

        const storedUrl = localStorage.getItem("navigateUrl");
        console.log("storedUrl.storedUrl", storedUrl);

        if (storedUrl) {
            console.log("Navigating to:", storedUrl);
          
            // Delay navigation to ensure cookie is propagated
            setTimeout(() => {
                // router.refresh();
                // router.push(storedUrl);
                window.location.href = storedUrl;  // Force full reload
            }, 1000);  // 100ms delay
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

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-400">Select the plan that best fits your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Base Plan */}
          <div 
            className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
              selectedPlan === 'base' ? 'border-blue-500 transform scale-105' : 'border-gray-700'
            }`}
            onClick={() => handlePlanSelection('base')}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Basic Plan</h2>
              <p className="text-gray-400">Get started with essential features</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Single country education & career suggestions</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Add up to 2 careers from suggestions</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Manual career addition</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Personalized feedback</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
              selectedPlan === 'pro' ? 'border-purple-500 transform scale-105' : 'border-gray-700'
            }`}
            onClick={() => handlePlanSelection('pro')}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">Pro Plan</h2>
              <p className="text-gray-400">Unlock all premium features</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Multiple countries for education & career suggestions</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Add up to 5 careers</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Manual career addition beyond suggestions</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Detailed personalized feedback</span>
              </li>
              {/* <li className="flex items-start">
                <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Premium certificate with custom design</span>
              </li> */}
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

        {selectedPlan && (
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">
              Activate Your {selectedPlan === 'base' ? 'Basic' : 'Pro'} Plan
            </h3>
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
            <button
              className={`w-full py-2 px-4 rounded-md ${
                selectedPlan === 'base' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
              } transition-colors`}
              onClick={handleActivation}
              disabled={loading}
            >
              {loading ? 'Activating...' : 'Activate Plan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSelection;
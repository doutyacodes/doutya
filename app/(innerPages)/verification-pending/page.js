"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

const VerificationPending = () => {
  const router = useRouter();

  const handleContactSupport = () => {
    // Implement support contact logic 
    window.location.href = 'mailto:support@institution.com';
  };

  const handleRetryLogin = async() => {
    await fetch('/api/logout', { method: 'GET' });

    // Clear localStorage
    localStorage.removeItem("token");

    // Remove specific cookie (auth_token)
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  
    // Redirect to login
    router.push('/login');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <AlertCircle 
          className="mx-auto text-yellow-500 mb-6" 
          size={64} 
          strokeWidth={1.5}
        />
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Verification in Progress
        </h1>

        <p className="text-gray-600 mb-6">
          Your account is awaiting approval from your institution. Once your institute verifies your details and confirms your class information, your account will be activated. 
          Please check back later or contact your institution if the verification takes longer than expected.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleRetryLogin}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Retry Login
          </button>
          <button 
            // onClick={handleContactSupport}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Contact Support
          </button>
        </div>
        {/* <p className="text-xs text-gray-500 mt-6">
          Verification typically takes 1-2 business days.
        </p> */}
      </div>
    </div>
  );
};

export default VerificationPending;
"use client"

import { useEffect, useState } from 'react';

export default function MaintenancePage() {
  const [dots, setDots] = useState('');

  // Auto-refresh every 2 minutes (120000ms) - hidden from user
  useEffect(() => {
    const autoRefreshTimer = setTimeout(() => {
      window.location.reload();
    }, 60000);

    return () => clearTimeout(autoRefreshTimer);
  }, []);

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-3xl blur-2xl"></div>
        
        {/* Main card */}
        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 p-10 rounded-2xl shadow-2xl">
          
          {/* Icon with animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-full border border-gray-600/50">
                <svg 
                  className="w-16 h-16 text-orange-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white text-center mb-3">
            Under Maintenance
          </h1>
          
          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-6"></div>

          {/* Message */}
          <p className="text-gray-300 text-center text-lg mb-2">
            We're currently upgrading <span className="text-orange-400 font-semibold">Xortcut</span> to serve you better
            <span className="inline-block w-8 text-left text-orange-400">{dots}</span>
          </p>
          
          <p className="text-gray-400 text-center mb-8">
            Our team is working hard to improve your experience. We'll be back online shortly.
          </p>

          {/* Refresh button */}
          <div className="flex justify-center">
            <button
              onClick={handleRefresh}
              className="group relative px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <span className="flex items-center gap-2">
                <svg 
                  className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Check Again
              </span>
            </button>
          </div>

          {/* Footer message */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Thank you for your patience{' '}
            <span className="text-red-400">❤️</span>
          </p>
        </div>
      </div>
    </div>
  );
}
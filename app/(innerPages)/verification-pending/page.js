"use client";
import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Mail } from 'lucide-react';

const VerificationPending = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@institution.com';
  };

  const handleRetryLogin = async () => {
    if (isRetrying) return;
    setIsRetrying(true);

    try {
      // 1. Tell backend to clear httpOnly cookies (auth_token, session, etc.)
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      }).catch((e) => console.warn('Logout fetch failed, continuing client cleanup', e));
    } catch (e) {
      console.warn('Logout network error:', e);
    }

    let inviteToken = null;
    try {
      // Preserve invite token if present so school branding stays intact on login page
      if (typeof window !== 'undefined') {
        inviteToken = sessionStorage.getItem('school_invite_token') ||
          new URLSearchParams(window.location.search).get('invite');
      }

      // 2. Wipe all user authentication and navigation keys from localStorage
      const keysToRemove = [
        'token',
        'navigateUrl',
        'dashboardUrl',
        'user_data',
        'user',
        'userId',
        'user_details',
        'user_institution',
        'auth',
        'authToken'
      ];
      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (err) {}
      });

      // 3. Clear sessionStorage but restore invite token if previously present
      sessionStorage.clear();
      if (inviteToken) {
        sessionStorage.setItem('school_invite_token', inviteToken);
      }
    } catch (err) {
      console.warn('Storage clear error:', err);
    }

    // 4. Clear client-accessible cookies
    try {
      const cookieNames = ['auth_token', 'token', 'session', 'authToken'];
      cookieNames.forEach((name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        if (typeof window !== 'undefined' && window.location.hostname) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        }
      });
    } catch (err) {}

    // 5. Force a hard full-page browser navigation to flush Next.js client-side router cache
    const targetUrl = inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : '/login';
    window.location.replace(targetUrl);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <AlertCircle 
          className="mx-auto text-amber-500 mb-6" 
          size={64} 
          strokeWidth={1.5}
        />
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">
          Verification in Progress
        </h1>

        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
          Your account is awaiting approval from your institution. Once your institute verifies your details and confirms your class information, your account will be activated. 
          Please check back later or contact your institution if the verification takes longer than expected.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="button"
            onClick={handleRetryLogin}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Resetting session...' : 'Retry Login'}</span>
          </button>
          <button 
            type="button"
            onClick={handleContactSupport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;

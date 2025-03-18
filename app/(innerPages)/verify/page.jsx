"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }
    
    setLoading(true);
    setError('');
    setVerificationResult(null);
    
    try {
      const response = await fetch('/api/verify/verify-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificateId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVerificationResult(data);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
          <p className="text-gray-400">Enter the certificate ID to verify its authenticity</p>
        </div>
        
        {/* Verification Form */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label htmlFor="certificateId" className="block text-sm font-medium text-gray-300 mb-2">
                Certificate ID
              </label>
              <input
                type="text"
                id="certificateId"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter certificate ID"
                className="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-md font-medium ${
                loading ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : 'Verify Certificate'}
            </button>
          </form>
        </div>
        
        {/* Result Display */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg"
          >
            <div className={`flex items-center justify-center p-4 rounded-md mb-4 ${
              verificationResult.status === 'valid' ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
            }`}>
              {verificationResult.status === 'valid' ? (
                <>
                  <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="font-medium text-green-400">Valid Certificate</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span className="font-medium text-red-400">Invalid Certificate</span>
                </>
              )}
            </div>
            
            {verificationResult.status === 'valid' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-400">{verificationResult.certification_name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issued To:</span>
                    <span className="font-medium">{verificationResult.user_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issue Date:</span>
                    <span>{new Date(verificationResult.issued_at).toLocaleDateString()}</span>
                  </div>
                  {verificationResult.score_percentage && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score:</span>
                      <span>{verificationResult.score_percentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {verificationResult.status === 'invalid' && (
              <p className="text-center text-gray-300">
                The certificate ID you provided could not be verified. Please check and try again.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
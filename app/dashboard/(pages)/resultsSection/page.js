"use client";

import GlobalApi from '@/app/_services/GlobalApi';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast'


const ResultsPage = () => {
  const [activeTab, setActiveTab] = useState('tests'); // Default tab
  const [resultData, setResultData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const getTestResults = async () => {
    setIsLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const response = await GlobalApi.GetTestResultData(token);
      if (response.status === 200) {  // Check for a 200 status code
        console.log(response.data)
        setResultData(response.data.results);
      } else {
        toast.error('Failed to fetch career data. Please try again later.');
      }
    } catch (err) {

      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error('Failed to fetch career data. Please try again later.');
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getTestResults()
  }, [])



  return (
    <div className="w-4/5 mx-auto p-8 bg-gray-100 min-h-screen">
    <Toaster />
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-300">
        <h1 className="text-3xl font-bold mb-4">Results</h1>
        <div className="flex space-x-4">
          <button
            className={`py-2 px-4 font-semibold ${activeTab === 'contests' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('contests')}
          >
            Contests
          </button>
          <button
            className={`py-2 px-4 font-semibold ${activeTab === 'tests' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('tests')}
          >
            Tests
          </button>
        </div>
      </div>

        {/* Results Section */}
        {activeTab === 'tests' && (
            <div>
                {resultData?.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md mb-4">
                        <h1 className="text-3xl font-bold mb-4">{item.decryptedTaskName}</h1>
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="text-6xl font-bold text-purple-600">{item.percentage}%</div>
                            <div className="text-lg text-gray-700">
                                <p className="font-semibold">Your Score:</p>
                                <p>Overall performance percentage</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

      {/* Placeholder for Contests Section */}
      {activeTab === 'contests' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">Contests Section</h1>
          <p className="text-gray-700">Results for contests will be displayed here.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;

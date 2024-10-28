import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

function HistoryView() {

    const [ TestResults, setTestResults ] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{
        const getTestResults = async () => {
            setIsLoading(true)
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetTestResults(token);
                
                if (response.status === 200) {  // Check for a 200 status code
                    console.log("log", response.data.subjects);
                    const results = response.data
                    setTestResults(results);

                } else {
                    toast.error('Failed to fetch Subjects. Please try again later.');
                }
            } catch (err) {
        
                if (err.response && err.response.data && err.response.data.message) {
                toast.error(`Error: ${err.response.data.message}`);
                } else {
                toast.error('Failed to fetch Test data. Please try again later.');
                }
                setIsLoading(false)

            } finally {
                setIsLoading(false)
            }
        }
        getTestResults()
    }, [])

    if (isLoading) {
        return (
          <div className='h-screen flex items-center justify-center text-white'>
            <div>
              <div className='font-semibold'>
                <LoadingOverlay loadText={"Loading..."} />
              </div>
            </div>
          </div>
        )
      }

    const getScoreColor = (score, total, passed) => {
      const percentage = (score / total) * 100;
      if (passed) {
        return 'bg-emerald-400';
      } else if (percentage > 75) {
        return 'bg-yellow-400';
      } else {
        return 'bg-red-500';
      }
    };

    console.log("isLoading", isLoading);
    
  return (
    <div className="space-y-4">
        {TestResults.map((item, index) => (
        <div key={index} className="relative">
            <div className="flex justify-between items-center mb-1">
            <span className="text-white text-sm">{item.subject}</span>
            <span className="text-white text-sm">- {item.score}/{item.total}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-8 overflow-hidden">
            <div
                className={`${getScoreColor(item.score, item.total, item.passed)} h-full rounded-full transition-all duration-500`}
                style={{ width: `${Math.min((item.score / item.total) * 100, 100)}%` }}
            ></div>
            </div>
            {item.passed && (
            <div className="absolute right-0 top-1/2 transform translate-x-[calc(100%+8px)] -translate-y-1/2">
                <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                    />
                </svg>
                </div>
            </div>
            )}
        </div>
        ))}
    </div>
  )
}

export default HistoryView

import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { Award, AlertCircle, CheckCircle } from 'lucide-react';

function HistoryView({selectedCareer, currentWeek}) {

    const [ testResults, setTestResults ] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{
        const getTestResults = async () => {
            setIsLoading(true)
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetTestResults(selectedCareer.career_group_id ,currentWeek, token);
                
                if (response.status === 200) {  // Check for a 200 status code
                    console.log("log", response.data.results);
                    const results = response.data.results
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

      const getStatusInfo = (score, total, passed) => {
        const percentage = (score / total) * 100;
        
        if (passed) {
          return {
            icon: <Award className="w-6 h-6 text-emerald-400" />,
            label: 'Excellent',
            bgColor: 'bg-emerald-400/10',
            textColor: 'text-emerald-400',
            borderColor: 'border-emerald-400'
          };
        } else if (percentage > 75) {
          return {
            icon: <CheckCircle className="w-6 h-6 text-yellow-400" />,
            label: 'Good',
            bgColor: 'bg-yellow-400/10',
            textColor: 'text-yellow-400',
            borderColor: 'border-yellow-400'
          };
        } else {
          return {
            icon: <AlertCircle className="w-6 h-6 text-red-400" />,
            label: 'Needs Improvement',
            bgColor: 'bg-red-400/10',
            textColor: 'text-red-400',
            borderColor: 'border-red-400'
          };
        }
      };

    console.log("isLoading", isLoading);
    
  return (
    // <div className="space-y-4">
    //     {TestResults?.map((item, index) => (
    //     <div key={index} className="relative">
    //         <div className="flex justify-between items-center mb-1">
    //         <span className="text-white text-sm">{item.subject}</span>
    //         <span className="text-white text-sm">- {item.score}/{item.total}</span>
    //         </div>
    //         <div className="w-full bg-gray-800 rounded-full h-8 overflow-hidden">
    //           <div
    //               className={`${getScoreColor(item.score, item.total, item.passed)} h-full rounded-full transition-all duration-500`}
    //               style={{ width: `${Math.min((item.score / item.total) * 100, 100)}%` }}
    //           ></div>
    //         </div>
    //         {item.passed && (
    //         <div className="absolute right-0 top-1/2 transform translate-x-[calc(100%+8px)] -translate-y-1/2">
    //             <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
    //             <svg
    //                 className="w-4 h-4 text-white"
    //                 fill="none"
    //                 stroke="currentColor"
    //                 viewBox="0 0 24 24"
    //             >
    //                 <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 d="M5 13l4 4L19 7"
    //                 />
    //             </svg>
    //             </div>
    //         </div>
    //         )}
    //     </div>
    //     ))}
    // </div>

  //   <div className="space-y-4">
  //     {testResults?.map((item, index) => (
  //     <div key={index} className="relative">
  //         <div className="flex justify-between items-center mb-1">
  //           <span className="text-white text-sm">{item.subject}</span>
  //           <span className="text-white text-sm">- {item.score}/{item.total}</span>
  //         </div>
  //         <div className="w-full bg-gray-800 rounded-full h-8 overflow-hidden">
  //           <div
  //               className={`${getScoreColor(item.score, item.total, item.passed)} h-full rounded-full transition-all duration-500`}
  //           ></div>
  //         </div>
  //         {item.passed && (
  //         <div className="absolute right-0 top-1/2 transform translate-x-[calc(100%+8px)] -translate-y-1/2">
  //             <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
  //             <svg
  //                 className="w-4 h-4 text-white"
  //                 fill="none"
  //                 stroke="currentColor"
  //                 viewBox="0 0 24 24"
  //             >
  //                 <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 strokeWidth="2"
  //                 d="M5 13l4 4L19 7"
  //                 />
  //             </svg>
  //           </div>
  //         </div>
  //         )}
  //     </div>
  //     ))}
  // </div>

  <div className="space-y-4">
      {testResults.map((item, index) => {
        const statusInfo = getStatusInfo(item.score, item.total, item.passed);
        
        return (
          <div 
            key={index}
            className={`rounded-lg p-4 border ${statusInfo.borderColor} ${statusInfo.bgColor} transition-all duration-300 hover:scale-102`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {statusInfo.icon}
                <div>
                  <h3 className="font-semibold text-white">{item.subject}</h3>
                  <span className={`text-sm ${statusInfo.textColor}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {item.score}/{item.total}
                </div>
                {/* <div className="text-sm text-gray-400">
                  {((item.score / item.total) * 100).toFixed(0)}%
                </div> */}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default HistoryView

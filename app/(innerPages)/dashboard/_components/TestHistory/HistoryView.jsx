import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { Award, AlertCircle, CheckCircle, ClipboardCheck, TrendingUp } from 'lucide-react';

function HistoryView({selectedCareer, currentWeek}) {

    const [ testResults, setTestResults ] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{
        const getTestResults = async () => {
            setIsLoading(true)
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetTestResults(selectedCareer.scope_grp_id ,currentWeek, token);
                
                if (response.status === 200) {
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

  const getStatusInfo = (score, total, passed, completed) => {
    // If the test is not completed at all
    if (!completed) {
      return {
        icon: <ClipboardCheck className="w-6 h-6 text-orange-400" />,
        label: 'Not Taken',
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30',
        gradientFrom: 'from-orange-500/5',
        gradientTo: 'to-red-500/5'
      };
    }
    
    // Rest of the existing logic for completed tests
    const percentage = (score / total) * 100;
    
    if (passed) {
      return {
        icon: <Award className="w-6 h-6 text-emerald-400" />,
        label: 'Excellent',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        gradientFrom: 'from-emerald-500/5',
        gradientTo: 'to-green-500/5'
      };
    } else if (percentage > 75) {
      return {
        icon: <CheckCircle className="w-6 h-6 text-yellow-400" />,
        label: 'Good',
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500/30',
        gradientFrom: 'from-yellow-500/5',
        gradientTo: 'to-orange-500/5'
      };
    } else {
      return {
        icon: <AlertCircle className="w-6 h-6 text-red-400" />,
        label: 'Needs Improvement',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30',
        gradientFrom: 'from-red-500/5',
        gradientTo: 'to-red-600/5'
      };
    }
  };

  // Calculate overall progress stats
  const completedTests = testResults.filter(test => test.completed).length;
  const totalTests = testResults.length;
  const averageScore = testResults.length > 0 
    ? testResults.reduce((acc, test) => acc + (test.completed ? (test.score / test.total) * 100 : 0), 0) / testResults.length
    : 0;
    
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      {testResults.length > 0 && (
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-xl"></div>
          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Test Progress Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Completed</p>
                    <p className="text-white font-semibold">{completedTests}/{totalTests}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Average Score</p>
                    <p className="text-white font-semibold">{averageScore.toFixed(1)}%</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-400">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(completedTests / totalTests) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-xs font-medium">
                        {Math.round((completedTests / totalTests) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results List */}
      <div className="space-y-4">
        {testResults.map((item, index) => {
          const statusInfo = getStatusInfo(item.score, item.total, item.passed, item.completed);
          const percentage = item.completed ? Math.round((item.score / item.total) * 100) : 0;
          
          return (
            <div 
              key={index}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${statusInfo.gradientFrom} ${statusInfo.gradientTo} rounded-xl`}></div>
              <div className={`relative backdrop-blur-sm bg-gray-800/60 border ${statusInfo.borderColor} rounded-xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group-hover:border-opacity-60`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 sm:p-3 ${statusInfo.bgColor} rounded-lg`}>
                      {statusInfo.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base sm:text-lg">{item.subject}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                        {item.completed && (
                          <span className="text-xs text-gray-400">
                            • {percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-bold text-white mb-1">
                      {item.completed ? (
                        <span>{item.score}/{item.total}</span>
                      ) : (
                        <span className="text-gray-400">--/--</span>
                      )}
                    </div>
                    {!item.completed && (
                      <span className="text-xs sm:text-sm text-orange-400 font-medium">
                        Take this test to progress
                      </span>
                    )}
                    {item.completed && (
                      <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentage >= 85 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                            percentage >= 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {testResults.length === 0 && !isLoading && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl"></div>
          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-8 shadow-xl text-center">
            <div className="p-4 bg-gray-700/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ClipboardCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Test History</h3>
            <p className="text-gray-400">
              Complete some tests to see your progress and results here.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryView
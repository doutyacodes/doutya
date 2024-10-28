import LoadingOverlay from '@/app/_components/LoadingOverlay'
import GlobalApi from '@/app/_services/GlobalApi'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EyeIcon, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ViewResult from '../ViewResult/ViewResult'
import { ChevronDown } from 'lucide-react';
import HistoryView from '../TestHistory/HistoryView'

function Tests({selectedCareer}) {

    const [activeTab, setActiveTab] = useState('weekly');
    const [isLoading, setIsLoading] = useState(false)
    const [testData, setTestData] = useState([])
    const [subjects, setSubjects] = useState([])
    const [selectedSubjectId, setSelectedSubjectId] = useState(null)

    const router = useRouter();


    const testHistory = [
      // Sample history data - replace with your actual history
      { week: 21, averageScore: 85, totalTests: 5 },
      { week: 20, averageScore: 78, totalTests: 5 },
      { week: 19, averageScore: 92, totalTests: 5 },
    ];

    useEffect(()=>{
        const getSubjects = async () => {
            setIsLoading(true)
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetSubjects(selectedCareer.career_group_id, token);
                
                if (response.status === 200) {  // Check for a 200 status code
                    console.log("log", response.data.subjects);
                    const results = response.data.subjects
                    setSubjects(results);

                } else {
                    toast.error('Failed to fetch Subjects. Please try again later.');
                }
            } catch (err) {
        
                if (err.response && err.response.data && err.response.data.message) {
                toast.error(`Error: ${err.response.data.message}`);
                } else {
                toast.error('Failed to fetch Test data. Please try again later.');
                }
            } finally {
                setIsLoading(false)
            }
        }

        getSubjects()
    }, [selectedCareer])

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

      // Handle the test button click
    //   const handleTakeTestClick = (subject) => {
    //     router.push(`/skillTestsSection/${subject.subjectId}`);
    // };
    
  const WeeklyTestsView = () => (
      subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[3em]">
            {subjects.map((subject) => (
                <div
                    key={subject.subjectId}
                    className="relative w-full h-full group cursor-pointer rounded-xl overflow-hidden"
                >
                    <Card
                        className={`shadow-lg transition-all duration-300 w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white text-center">
                                {subject.subjectName}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    {/* Overlay that shows on hover */}
        <div className="absolute inset-0 bg-green-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* <button
                onClick={() => handleTakeTestClick(subject)} // Handle test button
                className="flex items-center bg-blue-500 text-white font-extrabold py-2 px-4 rounded-lg focus:outline-none hover:bg-blue-600"
              >
                <span className="mr-2">Take Test</span>
                <EyeIcon className="mr-2 h-4 w-4" />
              </button> */}
            {
              subject.completed === "yes" ? (
                <button
                  onClick={() => handleResultsNavigation(subject)} // Handle results navigation
                  className="flex items-center bg-green-500 text-white font-extrabold py-2 px-4 rounded-lg focus:outline-none"
                >
                  <span className="mr-2">View Results</span>
                  <EyeIcon className="mr-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleTakeTestClick(subject)} // Handle test button
                  className="flex items-center bg-blue-500 text-white font-extrabold py-2 px-4 rounded-lg focus:outline-none hover:bg-blue-600"
                >
                  <span className="mr-2">Take Test</span>
                  <EyeIcon className="mr-2 h-4 w-4" />
                </button>
              )
            }
        </div>
      </div>
              ))}
        </div>
        ) : (
            <p className="text-center text-gray-600">No subjects found.</p>
    )
  );

    const handleTakeTestClick = (subject) => {
        // console.log("the testId", testId);
        router.push(`/testsSection/${subject.subjectId}`);
    };

    // const handleResultsNavigation = () => {
    // router.push(`/dashboard/resultsSection`);
    // };

      const handleResultsNavigation = (subject) => {
        setSelectedSubjectId(subject.subjectId)
      };

      if (isLoading) {
        return (
          <div className="h-screen flex items-center justify-center text-white">
            <div>
              <div className="font-semibold">
                <LoadingOverlay loadText={"Loading..."} />
              </div>
            </div>
          </div>
        );
      }

  return (
    <div className="w-full mx-auto">
      {selectedSubjectId ? (
        <ViewResult subjectId={selectedSubjectId} setSelectedSubjectId={setSelectedSubjectId}/>
      ) : (
        <>
        {/* Main Tabs */}
          {/* <div className="flex mb-4 overflow-x-scroll gap-2">
              {Object.keys(testTabs).map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 rounded px-4 py-2 lg:py-3 font-semibold lg:text-lg text-sm text-center focus:outline-none ${
                    activeTab === tab
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div> */}

            <div className="w-full bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => setActiveTab('weekly')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${
                      activeTab === 'weekly'
                        ? 'bg-gray-800 text-gray-400'
                        : 'bg-gray-700 text-gray-500 hover:bg-gray-800'
                    }`}
                  >
                    <span className="uppercase text-sm">WEEKLY TESTS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${
                      activeTab === 'history'
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-400 hover:bg-orange-500 text-white'
                    }`}
                  >
                    <span className="uppercase text-sm">TEST HISTORY</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-xl">WEEK - 22/52</h2>
                <button className="flex items-center bg-black text-white px-4 py-2 rounded">
                  <span className="mr-2">YEAR-3</span>
                  <ChevronDown size={20} />
                </button>
              </div>

              {activeTab === 'weekly' ? <WeeklyTestsView /> : <HistoryView />}
            </div>
      </>
      )
    }
  </div>
)
}

export default Tests
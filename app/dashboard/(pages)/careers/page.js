"use client"
import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import { PlusIcon } from 'lucide-react';
// import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import AddCareer from '../../_components/AddCareer/AddCareer';
import Tests from '../../_components/TestTab/Tests';
import Contests from '../../_components/ContestTab/Contests';


function page() {

  const [carrerData, setCarrerData] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [showDialogue, setShowDialogue] = useState(false)
  const [careerName, setCareerName] = useState('');

  const [showRoadMapDetails, setShowRoadMapDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState('roadmap'); // Single state for active tab
  const [showFinalRoadMap, setShowFinalRoadMap] = useState(true);
  const [country,setCountry]=useState('');
  const router = useRouter();

  const handleRoadmapClick = () => {
    setShowRoadmap(!showRoadmap); // Toggles the visibility
    setShowFeedback(false);
  };

  const handleShowRoadMapDetails = () => {
    setShowRoadMapDetails(!showRoadMapDetails);
  }

  const handleFeedbackClick = () => {
    setShowFinalRoadMap(false);
    setShowFeedback(true);
  };

  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push('/login');
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(true)
        }
      }
    };
    authCheck()

  }, [router]);

  useEffect(() => {
    // Set the first career as the default selected
    if (carrerData.length > 0) {
      setSelectedCareer(carrerData[0]);
    }
  }, [carrerData])

  

  // useEffect(() => {
  //   // Set the first career as the default selected
  //   if (carrerData.length > 0) {
  //     setSelectedCareer(carrerData[0]);
  //   }
  // }, [])


  const handleCareerClick = (career) => {
    setSelectedCareer(career);
  };
  const getCareers = async () => {
    setIsLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const response = await GlobalApi.GetCarrerData(token);
      if (response.status === 201) {  // Check for a 200 status code
        console.log(response.data)
        setCarrerData(response.data);
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
    getCareers()
  }, [])

  const handleAddCareerClick = () => {
    if (carrerData.length >= 5) {
      toast.error('You can only add up to 5 careers.');
      return;
    }
    setShowDialogue(true); // Show the dialog if career limit is not reached
  };

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const response = await GlobalApi.SaveInterestedCareer(token, careerName,country);

      if (response && response.status === 201) { // Check for a successful response
        console.log('Career saved successfully');
        setCareerName('');  // Clear the careerName field
        setCountry(''); 
      } else {
        // Handle the case where the response was not successful
        console.error('Failed to save career');
      }
    } catch (error) {
      console.error('Failed to save career data:', error); // Log the error for debugging purposes
      if (error.response && error.response.status === 400) {
        // Handle unauthorized access
        toast.error('Enter a valid career name');
      } else {
        toast.error('Failed to save career data. Please try again later.');
      }

    } finally {
      // Call getCareers regardless of the outcome of the API call
      getCareers();
      setShowDialogue(false)
      setIsLoading(false)  
    }
  }


  if (isLoading || !isAuthenticated) {
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
    <div className='w-4/5 mx-auto'>
      <Toaster />

      <AddCareer
        isOpen={showDialogue}
        onClose={() => setShowDialogue(false)}
        getCareers={getCareers}
        setCareerName={setCareerName}
        careerName={careerName}
        setCountry={setCountry}
        country={country}
        handleSubmit={handleSubmit}
      />
      {/* } */}

      <p className='text-center text-white text-3xl mb-8'>Careers</p>
      <div className='flex justify-start gap-5 text-white bg-gradient-to-r from-teal-200 to-orange-200 p-20 rounded-xl mb-10 overflow-x-auto'>
        {
          carrerData && carrerData.map((career, index) => (
            <div
              key={index}
              onClick={() => handleCareerClick(career)}
              className={`w-48 h-48 p-2 shadow-xl rounded-xl flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150 active:scale-95
                    ${selectedCareer && selectedCareer.id === career.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white'}`}
            >
              <p className='text-center text-lg font-bold text-blue-900 mb-4'>{career.career_name}</p>
            </div>
          ))
        }

        <div className='w-48 h-48 p-5 shadow-sm bg-white rounded-xl flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150 active:scale-95'
          onClick={handleAddCareerClick}>
          <PlusIcon className='text-gray-600 font-thin h-20 w-20' />
        </div>
      </div>


      <div className='flex flex-col text-white gap-5'>
        {selectedCareer && (
          <>
            <div className='bg-teal-400 h-24 rounded-sm'>
              <h2 className='text-center text-2xl mt-10 text-black font-bold'>{selectedCareer.career_name}</h2>
            </div>
            <div className="flex gap-8">
              {/* <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold py-2 px-4 rounded-full w-80" onClick={handleRoadmapClick}>
                ROADMAP
              </button>
              <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-full w-80">
                CONTESTS
              </button>
              <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-full w-80">
                TESTS
              </button>
              <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-full w-80">
                COMMUNITY
              </button> */}

              <button
                className={`${activeTab === 'roadmap' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-green-500'} text-white font-bold py-2 px-4 rounded-full w-80`}
                onClick={() => {setActiveTab('roadmap')}}
              >
                ROADMAP
              </button>
              <button
                className={`${activeTab === 'contests' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-green-500'} text-white font-bold py-2 px-4 rounded-full w-80`}
                onClick={() => setActiveTab('contests')}
              >
                CONTESTS
              </button>
              <button
                className={`${activeTab === 'tests' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-green-500'} text-white font-bold py-2 px-4 rounded-full w-80`}
                onClick={() => setActiveTab('tests')}
              >
                TESTS
              </button>
              <button
                className={`${activeTab === 'feedback' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-green-500'} text-white font-bold py-2 px-4 rounded-full w-80`}
                onClick={() => setActiveTab('feedback')}
              >
                FEEDBACK
              </button>
              <button
                className={`${activeTab === 'community' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-green-500'} text-white font-bold py-2 px-4 rounded-full w-80`}
                onClick={() => setActiveTab('community')}
              >
                COMMUNITY
              </button>

            </div>
            
            {activeTab === 'roadmap' && (
              <>
                <div className="flex gap-1">
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold py-2 px-4 w-1/2"
                    onClick={() => {
                      setShowFeedback(false);
                      setShowFinalRoadMap(true);
                    }}
                  >
                    Roadmap
                  </button>
                  <button className="bg-green-500 text-black font-bold py-2 px-4 w-1/2"
                    onClick={handleFeedbackClick}
                  >
                    Feedback
                  </button>
                </div>
                {showFinalRoadMap && (
                  <div className='bg-white'>
                    <button className='bg-green-500 text-black font-bold w-80 rounded-full py-2 px-4 mt-14 ml-96 mb-8' onClick={handleShowRoadMapDetails}>
                      {showRoadMapDetails ? 'Hide Roadmap' : 'Get Roadmap'}
                    </button>
                    {showRoadMapDetails && (
                      <>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2 ml-11'>Roadmap:</h3>
                        <ul className='list-disc ml-11 mb-4 text-black'>
                          {selectedCareer.roadmap.split('.,').map((step, idx) => (
                            <li key={idx}>{step.trim()}</li>
                          ))}
                        </ul>
                      </>
                    )};
                  </div>
                )}
              </>
            )}
            {showFeedback && (
              <div className="bg-white">
                <h3 className='text-2xl font-semibold text-gray-800 text-center mt-5 mb-5 '>Why this career suits you?</h3>
                <div className="bg-blue-300 p-4 rounded-lg mb-6 ml-6 mr-6">
                  <div className="flex">
                    <div className='text-black font-bold text-xl mt-12 ml-32'>
                      Your strengths
                    </div>
                    <div className='bg-white h-40 w-2/3 ml-12 mt-10 rounded-3xl text-black'>
                      {selectedCareer?.strengths ? (
                        selectedCareer.strengths.split('\r\n').map((strength, index) => (
                          <div
                            key={index}
                            className="rounded-xl ml-4 grid grid-flow-col bg-orange-300"
                          >
                            {strength}
                          </div>
                        ))
                      ) : (
                        <p>No strengths available</p> // Fallback when no strengths are provided
                      )}
                    </div>
                  </div>

                  <div className="flex">
                    <div className='text-black font-bold text-xl mt-12 ml-32'>
                      Things To
                      improve
                    </div>
                    <div className='bg-white h-40 w-2/3 ml-4 mt-10 rounded-3xl text-black'>
                      {selectedCareer.feedback}
                    </div>
                  </div>
                </div>

                <h3 className='text-2xl font-semibold text-gray-800 text-center mt-5 mb-5 '>What needs to be changed?</h3>
                <div className="bg-purple-300 p-4 rounded-lg mb-6 ml-6 mr-6">
                  <div className="flex">
                    <div className='text-black font-bold text-xl mt-12 ml-32'>
                      Your weakness
                    </div>
                    <div className='bg-white h-40 w-2/3 ml-12 mt-10 rounded-3xl text-black'>
                      {selectedCareer?.weaknesses ? (
                        selectedCareer.weaknesses.split('\r\n').map((weakness, index) => (
                          <div
                            key={index}
                            className="rounded-xl ml-4 grid grid-flow-col"
                          >
                            {weakness}
                          </div>
                        ))
                      ) : (
                        <p>No weakness available</p> // Fallback when no strengths are provided
                      )}
                    </div>
                  </div>

                  <div className="flex">
                    <div className='text-black font-bold text-xl mt-12 ml-32'>
                      Things To
                      change
                    </div>
                    <div className='bg-white h-40 w-2/3 ml-4 mt-10 rounded-3xl text-black'>
                      {selectedCareer.feedback}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* {
          activeTab === 'tests' && (
            <div className=''>

            </div>
          )
        } */}

        {
          activeTab === 'tests' && (
            <Tests selectedCareer={selectedCareer}/>
          )
        }

        {
          activeTab === 'contests' && (
            <Contests selectedCareer={selectedCareer}/>
          )
        }


      </div>
    </div>
  )
}

export default page

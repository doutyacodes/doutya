import GlobalApi from '@/app/_services/GlobalApi';
import { CheckCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

function RoadMap({ selectedCareer }) {
  const [activeTab, setActiveTab] = useState('Educational Milestones');
  const [roadMapData, setRoadMapData] = useState([])
  const [completedTasks, setCompletedTasks] = useState({});
  const [milestones, setMilestones] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [LoadMessage, setLoadMessage] = useState('')

  const language = localStorage.getItem('language') || 'en';


  // const getRoadmap = async () => {
  //     setIsLoading(true)
  //     // Clearing previous state before fetching new data
  //     setRoadMapData([]);
  //     setMilestones([]);
  //     setCompletedTasks({});
  //     try {
  //         const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  //         const response = await GlobalApi.GetRoadMapData(selectedCareer.career_group_id, token);
  //         if (response.status === 200) {  // Check for a 200 status code
              
  //             const results = response.data
  //             console.log(results)
  //             setRoadMapData(results);

  //         } else {
  //             toast.error('Failed to fetch RoadMap data. Please try again later.');
  //         }
  //     } catch (err) {
  
  //         if (err.response && err.response.data && err.response.data.message) {
  //         toast.error(`Error: ${err.response.data.message}`);
  //         } else {
  //         toast.error('Failed to fetch Road Map data. Please try again later.');
  //         }
  //     } finally {
  //         setIsLoading(false)
  //     }
  // }
  const requestIdRef = useRef(0); // Create a ref to track the request ID

  const getRoadmap = async () => {
    setIsLoading(true);
    // Clearing previous state before fetching new data
    setRoadMapData([]);
    setMilestones([]);
    setCompletedTasks({});
    setLoadMessage("Fetching roadmap data, please wait...");


    const currentRequestId = ++requestIdRef.current; // Increment the request ID
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const response = await GlobalApi.GetRoadMapData(selectedCareer.id, token, language);
      // console.log("GetRoadMapData",response.data)
      // Check for the response status
      if (response.status === 200) {  // Successful response
        if (currentRequestId === requestIdRef.current) { // Ensure this is the latest request
          const results = response.data;
          // console.log(results);
          setRoadMapData(results);
        }
      } else if (response.status === 202) {  // Data generation in progress
        console.log("resp Mesage", response.data.message)
        if (currentRequestId === requestIdRef.current) { // Ensure this is the latest request
          // setLoadMessage("Generating roadmap data, please wait...");
          setLoadMessage(response.data.message);
        }
        console.log("Status 202 received, starting polling.");
        // await checkForNewData(selectedCareer.id, token, currentRequestId);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error('Failed to fetch Road Map data. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

    // Function to check for new data periodically
    const checkForNewData = async (userCareerId, token) => {
      let attempts = 0;
      const maxAttempts = 2; // Maximum polling attempts
      const interval = 60000; 
  
      console.log("The apprempt", attempts);
  
      const intervalId = setInterval(async () => {
        attempts += 1;
        const response = await GlobalApi.GetRoadMapData(userCareerId, token);
        
        if (response.status === 200) {
          clearInterval(intervalId); // Stop polling
          const results = response.data;
          setRoadMapData(results);
          toast.success('Data generation completed successfully!');
        } else if (attempts >= maxAttempts) {
          clearInterval(intervalId); // Stop polling after max attempts
          toast.error('Data generation is still in progress. Please try again later.');
        }
      }, interval);
    };

  useEffect(()=>{
    getRoadmap()
  }, [selectedCareer])
  
  console.log("selectedCareer", selectedCareer);

  useEffect(()=>{

    if(roadMapData.length>0){
      // Extract milestones from selectedCareer
      const milestones = roadMapData.reduce((acc, milestone) => {
        const { milestoneCategoryName, ...milestoneData } = milestone;
        if (!acc[milestoneCategoryName]) {
          acc[milestoneCategoryName] = [];
        }
        acc[milestoneCategoryName].push(milestoneData);
        return acc;
      }, {});
      setMilestones(milestones)
    }

  }, [roadMapData])
  
  const handleComplete = async (tab, milestoneId) => {
    const isCompleted = !completedTasks[tab]?.[milestoneId];
    setCompletedTasks((prevState) => ({
      ...prevState,
      [tab]: {
        ...prevState[tab],
        [milestoneId]: isCompleted,
      },
    }));
  
    try {
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data = {
        milestoneId,
        completed: isCompleted,
      };
  
      const response = await GlobalApi.UpdateMileStoneStatus(data, token);
  
      if (response.status === 201) {
        toast.success("Milestone status updated");
      } else {
        const errorMessage = response.data?.message || "Failed to update status.";
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      // Handle any errors that occurred during the API call
      toast.error("An unexpected error occurred.");
    } finally {
      getRoadmap()
    }
  };

  return (
    <div className="p-4 bg-white">

       {/* Loading Message */}
       {/* {isLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-700">Generating roadmap data, please wait...</p>
        </div> */}
        {!milestones ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-700">{LoadMessage}</p>
          </div>
        ):(
          <>
            {/* Tabs */}
            <div className="flex mb-4">
              {Object.keys(milestones).map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 px-4 py-2 font-semibold text-lg text-center focus:outline-none ${
                    activeTab === tab
                      ? 'bg-orange-400 text-white'
                      : 'bg-green-300 text-black hover:bg-green-400'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-orange-100 p-6 shadow-lg min-h-[300px]">
              
              {milestones[activeTab]?.length > 0 ? (
                milestones[activeTab]?.map((item) => (
                  <div key={item.milestoneId} className="mb-6 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-black">
                        {/* • {item.milestoneTitle}: <span className="font-normal">{item.milestoneDescription}</span> */}
                        • <span className="font-normal">{item.milestoneDescription}</span>

                      </h3>
                      {/* <p className="italic text-gray-700">(How To: {item.milestoneHowTo})</p> */}
                    </div>
                    <button
                      onClick={() => handleComplete(activeTab, item.milestoneId)}
                      className={`ml-4 px-4 py-2 font-semibold text-white rounded-lg flex items-center justify-center w-[150px] ${
                        item.milestoneCompletionStatus ? 'bg-green-500' : 'bg-sky-500'
                      }`}
                    >
                      {item.milestoneCompletionStatus ? (
                        <>
                          <CheckCircle className="mr-2" /> Completed
                        </>
                      ) : (
                        'Complete'
                      )}
                    </button>

                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center">{LoadMessage}</p>
              )}
            </div>
            </>
          )}
    </div>
  );
}

export default RoadMap;

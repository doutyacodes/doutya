import GlobalApi from '@/app/_services/GlobalApi';
import { CheckCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

function RoadMap({ selectedCareer }) {
  const [activeTab, setActiveTab] = useState('Educational Milestones');
  const [roadMapData, setRoadMapData] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState('');

  const language = localStorage.getItem('language') || 'en';
  const requestIdRef = useRef(0);

  const getRoadmap = async () => {
    setIsLoading(true);
    setLoadMessage('Fetching roadmap data, please wait...');

    const currentRequestId = ++requestIdRef.current;

    try {
      const token = localStorage.getItem('token');
      const response = await GlobalApi.GetRoadMapData(selectedCareer.id, token, language);

      if (response.status === 200 && currentRequestId === requestIdRef.current) {
        setRoadMapData(response.data);
      } else if (response.status === 202 && currentRequestId === requestIdRef.current) {
        setLoadMessage(response.data.message || 'Generating roadmap data, please wait...');
        checkForNewData(selectedCareer.id, token);
      }
    } catch (err) {
      toast.error('Failed to fetch Road Map data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkForNewData = async (userCareerId, token) => {
    let attempts = 0;
    const maxAttempts = 5;
    const interval = 60000; // Poll every 30 seconds

    const intervalId = setInterval(async () => {
      attempts += 1;
      const response = await GlobalApi.GetRoadMapData(userCareerId, token);
      
      if (response.status === 200) {
        clearInterval(intervalId);
        setRoadMapData(response.data);
        toast.success('Data generation completed successfully!');
      } else if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        toast.error('Data generation is still in progress. Please try again later.');
      }
    }, interval);
  };

  useEffect(() => {
    getRoadmap();
  }, [selectedCareer]);

  useEffect(() => {
    if (roadMapData.length > 0) {
      const milestones = roadMapData.reduce((acc, milestone) => {
        const { milestoneCategoryName, ...milestoneData } = milestone;
        if (!acc[milestoneCategoryName]) {
          acc[milestoneCategoryName] = [];
        }
        acc[milestoneCategoryName].push(milestoneData);
        return acc;
      }, {});
      setMilestones(milestones);
    }
  }, [roadMapData]);

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
      const token = localStorage.getItem('token');
      const data = { milestoneId, completed: isCompleted };

      const response = await GlobalApi.UpdateMileStoneStatus(data, token);

      if (response.status === 201) {
        toast.success('Milestone status updated');
      } else {
        const errorMessage = response.data?.message || 'Failed to update status.';
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="p-2 sm:p-4 bg-white">
      {!milestones ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-700">{loadMessage}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap mb-4 gap-2">
            {Object.keys(milestones).map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-2 py-2 sm:py-4 font-semibold text-sm sm:text-lg text-center focus:outline-none ${
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

          <div className="bg-orange-100 p-3 sm:p-6 shadow-lg min-h-[300px]">
            {milestones[activeTab]?.length > 0 ? (
              milestones[activeTab]?.map((item) => (
                <div key={item.milestoneId} className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <h3 className="font-bold text-base sm:text-lg text-black">
                      • <span className="font-normal">{item.milestoneDescription}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => handleComplete(activeTab, item.milestoneId)}
                    className={`mt-2 sm:mt-0 px-3 py-1 sm:px-4 sm:py-2 font-semibold text-white text-sm sm:text-base rounded-lg flex items-center justify-center w-full sm:w-[150px] ${
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
              <p className="text-gray-600 text-center">{loadMessage}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RoadMap;
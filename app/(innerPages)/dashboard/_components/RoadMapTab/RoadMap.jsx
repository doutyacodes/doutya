import GlobalApi from '@/app/_services/GlobalApi';
import { CheckCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import SelectCommunity from '../SelectCommunityModal/SelectCommunity';
import { useRouter } from 'next/navigation';
import ContentGenerationLoading from '@/app/_components/ContentGenerationLoading';
import FeatureGuideWrapper from '@/app/_components/FeatureGuideWrapper';

function RoadMap({ selectedCareer }) {
  const [activeTab, setActiveTab] = useState('Educational Milestones');
  // const [activeEducationalSubTab, setActiveEducationalSubTab] = useState('Academic Milestones'); 
  const [roadMapData, setRoadMapData] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [LoadMessage, setLoadMessage] = useState('');
  const t = useTranslations('RoadMap');
  const [showCommunityModal, setShowCommunityModal] = useState(false); // Modal visibility
  const [selectedCommunities, setSelectedCommunities] = useState({
    global: false,
    countrySpecific: false
  });

  const router = useRouter();
  const [selectedMilestoneData, setSelectedMilestoneData] = useState(null);

  const language = localStorage.getItem('language') || 'en';
  const requestIdRef = useRef(0);

  const getRoadmap = async () => {
    setIsLoading(true);
    setRoadMapData([]);
    setMilestones([]);
    setCompletedTasks({});
    setLoadMessage(t('loadingMessage'));

    const currentRequestId = ++requestIdRef.current;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const response = await GlobalApi.GetRoadMapData(selectedCareer.id, token, language);
      if (response.status === 200) {
        if (currentRequestId === requestIdRef.current) {
          const results = response.data;
          // console.log(results);
          setRoadMapData(results);
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Error: ${err.response.data.message}`);
      } else {
        toast.error(t('errorMessages.fetchFailure'));
      }
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  if (selectedCareer && selectedCareer.id) {
    getRoadmap();
  }
}, [selectedCareer?.id]); // Only depend on the ID, not the entire object

    useEffect(() => {
      if (roadMapData.length > 0) {
        const milestones = roadMapData.reduce((acc, milestone) => {
          const { milestoneCategoryName, milestoneSubcategoryName, ...milestoneData } = milestone;
          
          // Handle Educational Milestones differently due to subcategories
          if (milestoneCategoryName === 'Educational Milestones') {
            if (!acc[milestoneCategoryName]) {
              acc[milestoneCategoryName] = {};
            }
            // Only include Academic Milestones
            if (milestoneSubcategoryName === 'Academic Milestones') {
              if (!acc[milestoneCategoryName][milestoneSubcategoryName]) {
                acc[milestoneCategoryName][milestoneSubcategoryName] = [];
              }
              acc[milestoneCategoryName][milestoneSubcategoryName].push(milestoneData);
            }
          } else {
            // Handle other categories as before
            if (!acc[milestoneCategoryName]) {
              acc[milestoneCategoryName] = [];
            }
            acc[milestoneCategoryName].push(milestoneData);
          }
          return acc;
        }, {});
        setMilestones(milestones);
      }
    }, [roadMapData]);

  const handleComplete = (tab, milestoneId, description, careerName) => {
    setShowCommunityModal(true); // Show modal before updating milestone
    setSelectedMilestoneData({
      tab,
      milestoneId,
      description,
      careerName
    });
  };

  const saveMilestone = async (tab, milestoneId, description, careerName, selectedCommunities) => {
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
        milestoneText: description,
        careerName,
        selectedCommunities, // Pass selected communities (global/country-specific)
      };

      const response = await GlobalApi.UpdateMileStoneStatus(data, token);

      if (response.status === 201) {
        toast.success(t('errorMessages.updateSuccess'));
      } else {
        const errorMessage = response.data?.message || t('errorMessages.updateFailure');
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      toast.error(t('errorMessages.unexpectedError'));
    } finally {
      getRoadmap(); // Refresh the roadmap data
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (community, isChecked) => {
    if (community === 'global') {
      setSelectedCommunities((prevState) => ({ ...prevState, global: isChecked }));
    } else if (community === 'countrySpecific') {
      setSelectedCommunities((prevState) => ({ ...prevState, countrySpecific: isChecked }));
    }
  };

  return (
    <FeatureGuideWrapper featureKey="roadmap">
      <div className="p-2 md:p-4 bg-gray-900 text-gray-200">

      {/* Loading Modal */}
      <ContentGenerationLoading
        isOpen={isLoading}
        onClose={() => setIsLoading(false)}
        page="roadmap" // Change this based on your current page
        showDelay={1000} // Only show if loading takes more than 1 second
        // Optional: auto close after 30 seconds
        // autoCloseDelay={30000}
      />

      {/* Modal for community selection */}
      {showCommunityModal && (
        <SelectCommunity
          handleComplete={() => {
            setShowCommunityModal(false); // Close modal after selection
            saveMilestone(
              selectedMilestoneData.tab,
              selectedMilestoneData.milestoneId,
              selectedMilestoneData.description,
              selectedMilestoneData.careerName,
              selectedCommunities // Communities selected from the modal
            );
          }}
          handleCheckboxChange={handleCheckboxChange}
          selectedCommunities={selectedCommunities}
        />
      )}

      {milestones.length == 0 ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-400">{LoadMessage}</p>
        </div>
      ) : (
        <>
          {/* Main Tabs */}
          <div className="flex mb-3 mb-4 overflow-x-auto gap-1 gap-2 md:overflow-x-visible">
            {Object.keys(milestones).map((tab) => (
              <button
                key={tab}
                className={`flex-1 rounded px-2 px-4 md:py-2 lg:py-3 py-1.5 font-medium font-semibold md:text-base lg:text-lg text-xs text-center focus:outline-none whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="bg-gray-800 p-3 p-4 md:p-6 shadow-lg min-h-[300px]">
            {activeTab === 'Physical Milestones' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 p-4 mb-4 text-blue-800 text-sm md:text-base">
                <p>
                  Physical milestones are crucial for holistic personal development. 
                  Even in careers that may seem primarily mental or desk-bound, 
                  maintaining physical health can significantly impact your professional performance 
                  and overall well-being.
                </p>
              </div>
            )}
            
            {activeTab === 'Mental Milestones' && (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-3 p-4 mb-4 text-purple-800 text-sm md:text-base">
                <p>
                  Mental milestones focus on psychological resilience and personal growth. 
                  Regardless of your career path, developing emotional intelligence, 
                  stress management, and mental well-being are key to long-term success 
                  and personal satisfaction.
                </p>
              </div>
            )}
            
            {activeTab === 'Educational Milestones' ? (
              // Render Educational milestones - only Academic Milestones
              milestones[activeTab]?.['Academic Milestones']?.length > 0 ? (
                milestones[activeTab]['Academic Milestones']?.map((item) => (
                  <div key={item.milestoneId} className="mb-4 mb-6 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-start justify-between">
                    <div className="flex-1 sm:pr-4">
                      <h3 className="font-bold text-base text-lg md:text-lg text-white">
                        • <span className="font-normal break-words text-sm md:text-base">{item.milestoneDescription}</span>
                      </h3>
                    </div>
                    <button
                      onClick={() => handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.career_name)}
                      className={`w-full sm:ml-4 sm:w-[150px] px-3 px-4 py-1.5 py-2 font-semibold text-xs text-sm md:text-sm text-white rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.milestoneCompletionStatus ? 'bg-green-600' : 'bg-sky-600'
                      }`}
                    >
                      {item.milestoneCompletionStatus ? (
                        <>
                          <CheckCircle className="mr-1 mr-2 w-4 h-4" /> {t('buttons.completed')}
                        </>
                      ) : (
                        t('buttons.complete')
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center text-sm md:text-base">{LoadMessage}</p>
              )
            ) : (
              // Render other milestone categories as before
              milestones[activeTab]?.length > 0 ? (
                milestones[activeTab]?.map((item) => (
                  <div key={item.milestoneId} className="mb-4 mb-6 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-start justify-between">
                    <div className="flex-1 sm:pr-4">
                      <h3 className="font-bold text-base text-lg md:text-lg text-white">
                        • <span className="font-normal break-words text-sm md:text-base">{item.milestoneDescription}</span>
                      </h3>
                    </div>
                    <button
                      onClick={() => handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.career_name)}
                      className={`w-full sm:ml-4 sm:w-[150px] px-3 px-4 py-1.5 py-2 font-semibold text-xs text-sm md:text-sm text-white rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.milestoneCompletionStatus ? 'bg-green-600' : 'bg-sky-600'
                      }`}
                    >
                      {item.milestoneCompletionStatus ? (
                        <>
                          <CheckCircle className="mr-1 mr-2 w-4 h-4" /> {t('buttons.completed')}
                        </>
                      ) : (
                        t('buttons.complete')
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center text-sm md:text-base">{LoadMessage}</p>
              )
            )}
          </div>
        </>
      )}


      </div>
    </FeatureGuideWrapper>
  );
}

export default RoadMap;

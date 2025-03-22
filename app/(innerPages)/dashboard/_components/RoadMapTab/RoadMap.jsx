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
          console.log(results);
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
    getRoadmap();
  }, [selectedCareer]);

  // Modify this useEffect for organizing milestones
    // useEffect(() => {
    //   if (roadMapData.length > 0) {
    //     const milestones = roadMapData.reduce((acc, milestone) => {
    //       const { milestoneCategoryName, milestoneSubcategoryName, ...milestoneData } = milestone;
          
    //       // Handle Educational Milestones differently due to subcategories
    //       if (milestoneCategoryName === 'Educational Milestones') {
    //         if (!acc[milestoneCategoryName]) {
    //           acc[milestoneCategoryName] = {};
    //         }
    //         // Organize by subcategory
    //         if (milestoneSubcategoryName) {
    //           if (!acc[milestoneCategoryName][milestoneSubcategoryName]) {
    //             acc[milestoneCategoryName][milestoneSubcategoryName] = [];
    //           }
    //           acc[milestoneCategoryName][milestoneSubcategoryName].push(milestoneData);
    //         }
    //       } else {
    //         // Handle other categories as before
    //         if (!acc[milestoneCategoryName]) {
    //           acc[milestoneCategoryName] = [];
    //         }
    //         acc[milestoneCategoryName].push(milestoneData);
    //       }
    //       return acc;
    //     }, {});
    //     setMilestones(milestones);
    //   }
    // }, [roadMapData]);

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
          <div className="flex mb-4 overflow-x-scroll gap-2 md:overflow-x-visible">
            {Object.keys(milestones).map((tab) => (
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
          </div>

          {/* Educational Subtabs - Commented out since we only want Academic Milestones */}
          {/* {activeTab === 'Educational Milestones' && (
            <div className="flex flex-row gap-2 text-xs md:text-base min-w-20 mt-10 w-full overflow-x-scroll md:overflow-x-visible justify-center items-center">
              {Object.keys(milestones['Educational Milestones']).map((subTab) => (
                <button
                  key={subTab}
                  className={`w-full rounded-md px-4 py-2 lg:py-3 bg-gray-500 font-semibold lg:text-lg text-sm text-center focus:outline-none transition-colors duration-200 ${
                    activeEducationalSubTab === subTab
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-gray-300 hover:bg-gray-500/50'
                  }`}
                  onClick={() => setActiveEducationalSubTab(subTab)}
                >
                  {subTab}
                </button>
              ))}
            </div>
          )} */}


          {/* Tab Content */}
            <div className="bg-gray-800 p-4 md:p-6 shadow-lg min-h-[300px]">
              {activeTab === 'Educational Milestones' ? (
                // Render Educational milestones - only Academic Milestones
                milestones[activeTab]?.['Academic Milestones']?.length > 0 ? (
                  milestones[activeTab]['Academic Milestones']?.map((item) => (
                    <div key={item.milestoneId} className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-start justify-between">
                      <div className="flex-1 sm:pr-4">
                        <h3 className="font-bold text-lg text-white">
                          • <span className="font-normal break-words">{item.milestoneDescription}</span>
                        </h3>
                      </div>
                      <button
                        onClick={() => handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.career_name)}
                        className={`w-full sm:ml-4 sm:w-[150px] px-4 py-2 font-semibold text-sm text-white rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.milestoneCompletionStatus ? 'bg-green-600' : 'bg-sky-600'
                        }`}
                      >
                        {item.milestoneCompletionStatus ? (
                          <>
                            <CheckCircle className="mr-2" /> {t('buttons.completed')}
                          </>
                        ) : (
                          t('buttons.complete')
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">{LoadMessage}</p>
                )
              ) : (
              // Render other milestone categories as before
              milestones[activeTab]?.length > 0 ? (
                milestones[activeTab]?.map((item) => (
                  // ... existing milestone rendering code for non-educational milestones ...
                  <div key={item.milestoneId} className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-start justify-between">
                    <div className="flex-1 sm:pr-4">
                      <h3 className="font-bold text-lg text-white">
                        • <span className="font-normal break-words">{item.milestoneDescription}</span>
                      </h3>
                    </div>
                    <button
                      onClick={() => handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.career_name)}
                      className={`w-full sm:ml-4 sm:w-[150px] px-4 py-2 font-semibold text-sm text-white rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.milestoneCompletionStatus ? 'bg-green-600' : 'bg-sky-600'
                      }`}
                    >
                      {item.milestoneCompletionStatus ? (
                        <>
                          <CheckCircle className="mr-2" /> {t('buttons.completed')}
                        </>
                      ) : (
                        t('buttons.complete')
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center">{LoadMessage}</p>
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

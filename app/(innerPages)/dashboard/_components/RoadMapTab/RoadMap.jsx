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
  const [roadMapData, setRoadMapData] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [LoadMessage, setLoadMessage] = useState('');
  const t = useTranslations('RoadMap');
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState({
    global: false,
    countrySpecific: false
  });

  const router = useRouter();
  const [selectedMilestoneData, setSelectedMilestoneData] = useState(null);

  console.log("selectedCareer", selectedCareer)
  console.log("selectedMilestoneData", selectedMilestoneData)

  const language = localStorage.getItem('language') || 'en';
  const requestIdRef = useRef(0);

  // Check if current tab is Academic Milestones
  const isAcademicMilestone = activeTab === 'Educational Milestones';

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
  }, [selectedCareer?.id]);

  useEffect(() => {
    if (roadMapData.length > 0) {
      const milestones = roadMapData.reduce((acc, milestone) => {
        const { milestoneCategoryName, milestoneSubcategoryName, ...milestoneData } = milestone;
        
        if (milestoneCategoryName === 'Educational Milestones') {
          if (!acc[milestoneCategoryName]) {
            acc[milestoneCategoryName] = {};
          }
          if (milestoneSubcategoryName === 'Academic Milestones') {
            if (!acc[milestoneCategoryName][milestoneSubcategoryName]) {
              acc[milestoneCategoryName][milestoneSubcategoryName] = [];
            }
            acc[milestoneCategoryName][milestoneSubcategoryName].push(milestoneData);
          }
        } else {
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
    // Prevent action if it's an academic milestone
    if (isAcademicMilestone) {
      return;
    }
    setShowCommunityModal(true);
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
        selectedCommunities,
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
      getRoadmap();
    }
  };

  const handleCheckboxChange = (community, isChecked) => {
    if (community === 'global') {
      setSelectedCommunities((prevState) => ({ ...prevState, global: isChecked }));
    } else if (community === 'countrySpecific') {
      setSelectedCommunities((prevState) => ({ ...prevState, countrySpecific: isChecked }));
    }
  };

  // return (
  //   <FeatureGuideWrapper featureKey="roadmap">
  //     <div className="w-full mx-auto">

  //       <ContentGenerationLoading
  //         isOpen={isLoading}
  //         onClose={() => setIsLoading(false)}
  //         page="roadmap"
  //         showDelay={1000}
  //       />

  //       {showCommunityModal && (
  //         <SelectCommunity
  //           handleComplete={() => {
  //             setShowCommunityModal(false);
  //             saveMilestone(
  //               selectedMilestoneData.tab,
  //               selectedMilestoneData.milestoneId,
  //               selectedMilestoneData.description,
  //               selectedMilestoneData.careerName,
  //               selectedCommunities
  //             );
  //           }}
  //           handleCheckboxChange={handleCheckboxChange}
  //           selectedCommunities={selectedCommunities}
  //         />
  //       )}

  //       {milestones.length == 0 ? (
  //         <div className="w-full bg-gray-900 p-3 md:p-6 rounded-lg">
  //           <div className="flex items-center justify-center h-[250px] md:h-[300px]">
  //             <div className="text-center">
  //               <div className="text-4xl md:text-6xl mb-4">🗺️</div>
  //               <p className="text-gray-400 text-base md:text-lg">{LoadMessage}</p>
  //             </div>
  //           </div>
  //         </div>
  //       ) : (
  //         <div className="w-full bg-gray-900 p-3 md:p-6 rounded-lg">
  //           <div className="flex mb-4 md:mb-6 overflow-x-auto gap-1 md:gap-2 scrollbar-hide pb-2">
  //             {Object.keys(milestones).map((tab) => (
  //               <button
  //                 key={tab}
  //                 className={`flex-shrink-0 px-2 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-colors duration-300 whitespace-nowrap ${
  //                   activeTab === tab
  //                     ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
  //                     : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
  //                 }`}
  //                 onClick={() => setActiveTab(tab)}
  //               >
  //                 {tab.toUpperCase()}
  //               </button>
  //             ))}
  //           </div>
            
  //           <div className="relative">
  //             <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-lg"></div>
  //             <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 md:p-6 shadow-2xl min-h-[300px] md:min-h-[400px]">
                
  //               {activeTab === 'Physical Milestones' && (
  //                 <div className="relative overflow-hidden rounded-xl mb-4 md:mb-6">
  //                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10"></div>
  //                   <div className="relative bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 md:p-4">
  //                     <div className="flex items-start gap-2 md:gap-3">
  //                       <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
  //                         <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-400 rounded-full"></div>
  //                       </div>
  //                       <p className="text-blue-200 text-xs md:text-sm leading-relaxed">
  //                         Physical milestones are crucial for holistic personal development. 
  //                         Even in careers that may seem primarily mental or desk-bound, 
  //                         maintaining physical health can significantly impact your professional performance 
  //                         and overall well-being.
  //                       </p>
  //                     </div>
  //                   </div>
  //                 </div>
  //               )}
                
  //               {activeTab === 'Mental Milestones' && (
  //                 <div className="relative overflow-hidden rounded-xl mb-4 md:mb-6">
  //                   <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"></div>
  //                   <div className="relative bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 md:p-4">
  //                     <div className="flex items-start gap-2 md:gap-3">
  //                       <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
  //                         <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-400 rounded-full"></div>
  //                       </div>
  //                       <p className="text-purple-200 text-xs md:text-sm leading-relaxed">
  //                         Mental milestones focus on psychological resilience and personal growth. 
  //                         Regardless of your career path, developing emotional intelligence, 
  //                         stress management, and mental well-being are key to long-term success 
  //                         and personal satisfaction.
  //                       </p>
  //                     </div>
  //                   </div>
  //                 </div>
  //               )}

  //               <div className="space-y-3 md:space-y-4">
  //                 {activeTab === 'Educational Milestones' ? (
  //                   milestones[activeTab]?.['Academic Milestones']?.length > 0 ? (
  //                     milestones[activeTab]['Academic Milestones']?.map((item, index) => (
  //                       <div key={item.milestoneId} className="group relative">
  //                         <div className="relative overflow-hidden rounded-xl transition-all duration-300 md:group-hover:scale-[1.02]">
  //                           <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 via-gray-700/10 to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
  //                           <div className={`relative backdrop-blur-sm border-2 rounded-xl p-3 md:p-6 shadow-lg transition-all duration-300 ${
  //                             item.milestoneCompletionStatus 
  //                               ? "bg-gradient-to-r from-emerald-600/30 to-green-600/30 border-emerald-500/40 shadow-emerald-500/20" 
  //                               : "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-blue-500/40 shadow-blue-500/20"
  //                           }`}>
                              
  //                             {/* Mobile Layout */}
  //                             <div className="flex flex-col space-y-3 md:hidden">
  //                               <div className="flex items-start gap-3">
  //                                 <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
  //                                   item.milestoneCompletionStatus 
  //                                     ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500/50" 
  //                                     : "bg-blue-500/30 text-blue-200 border-2 border-blue-500/50"
  //                                 }`}>
  //                                   {item.milestoneCompletionStatus ? (
  //                                     <CheckCircle className="w-4 h-4" />
  //                                   ) : (
  //                                     index + 1
  //                                   )}
  //                                 </div>
  //                                 <h3 className="text-white text-sm font-semibold leading-relaxed flex-1">
  //                                   {item.milestoneDescription}
  //                                 </h3>
  //                               </div>
                                
  //                               <div className="relative group/tooltip w-full">
  //                                 <button
  //                                   onClick={() => !isAcademicMilestone && handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.name)}
  //                                   className={`w-full px-3 py-2 font-semibold text-xs text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
  //                                     isAcademicMilestone 
  //                                       ? 'bg-gray-600 cursor-not-allowed opacity-60' 
  //                                       : item.milestoneCompletionStatus 
  //                                         ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' 
  //                                         : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
  //                                   }`}
  //                                 >
  //                                   {isAcademicMilestone ? (
  //                                     <>
  //                                       <div className="w-4 h-4">🔒</div>
  //                                       Institute Only
  //                                     </>
  //                                   ) : item.milestoneCompletionStatus ? (
  //                                     <>
  //                                       <CheckCircle className="w-4 h-4" />
  //                                       {t('buttons.completed')}
  //                                     </>
  //                                   ) : (
  //                                     <>
  //                                       <div className="w-4 h-4 border-2 border-white/60 rounded-full"></div>
  //                                       {t('buttons.complete')}
  //                                     </>
  //                                   )}
  //                                 </button>
  //                                 {isAcademicMilestone && (
  //                                   <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-xl border border-gray-700">
  //                                     🔒 Only linked institutes can update academic milestones
  //                                   </div>
  //                                 )}
  //                               </div>
  //                             </div>

  //                             {/* Desktop Layout */}
  //                             <div className="hidden md:flex items-start gap-4">
  //                               <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
  //                                 item.milestoneCompletionStatus 
  //                                   ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500/50" 
  //                                   : "bg-blue-500/30 text-blue-200 border-2 border-blue-500/50"
  //                               }`}>
  //                                 {item.milestoneCompletionStatus ? (
  //                                   <CheckCircle className="w-5 h-5" />
  //                                 ) : (
  //                                   index + 1
  //                                 )}
  //                               </div>
                                
  //                               <div className="flex-1">
  //                                 <h3 className="text-white text-base font-semibold mb-2 leading-relaxed">
  //                                   {item.milestoneDescription}
  //                                 </h3>
  //                               </div>

  //                               <div className="relative group/tooltip">
  //                                 <button
  //                                   onClick={() => !isAcademicMilestone && handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.name)}
  //                                   className={`flex-shrink-0 px-4 py-2.5 font-semibold text-sm text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg ${
  //                                     isAcademicMilestone 
  //                                       ? 'bg-gray-600 cursor-not-allowed opacity-60' 
  //                                       : item.milestoneCompletionStatus 
  //                                         ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:shadow-emerald-500/30 hover:scale-105' 
  //                                         : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 hover:scale-105'
  //                                   }`}
  //                                 >
  //                                   {isAcademicMilestone ? (
  //                                     <>
  //                                       <div className="w-4 h-4">🔒</div>
  //                                       Institute Only
  //                                     </>
  //                                   ) : item.milestoneCompletionStatus ? (
  //                                     <>
  //                                       <CheckCircle className="w-4 h-4" />
  //                                       {t('buttons.completed')}
  //                                     </>
  //                                   ) : (
  //                                     <>
  //                                       <div className="w-4 h-4 border-2 border-white/60 rounded-full"></div>
  //                                       {t('buttons.complete')}
  //                                     </>
  //                                   )}
  //                                 </button>
  //                                 {isAcademicMilestone && (
  //                                   <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-xl border border-gray-700">
  //                                     🔒 Only linked institutes can update academic milestones
  //                                   </div>
  //                                 )}
  //                               </div>
  //                             </div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     ))
  //                   ) : (
  //                     <div className="text-center py-8 md:py-16">
  //                       <div className="text-4xl md:text-6xl mb-4">📚</div>
  //                       <p className="text-gray-400 text-base md:text-lg">{LoadMessage}</p>
  //                     </div>
  //                   )
  //                 ) : (
  //                   milestones[activeTab]?.length > 0 ? (
  //                     milestones[activeTab]?.map((item, index) => (
  //                       <div key={item.milestoneId} className="group relative">
  //                         <div className="relative overflow-hidden rounded-xl transition-all duration-300 md:group-hover:scale-[1.02]">
  //                           <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 via-gray-700/10 to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
  //                           <div className={`relative backdrop-blur-sm border-2 rounded-xl p-3 md:p-6 shadow-lg transition-all duration-300 ${
  //                             item.milestoneCompletionStatus 
  //                               ? "bg-gradient-to-r from-emerald-600/30 to-green-600/30 border-emerald-500/40 shadow-emerald-500/20" 
  //                               : "bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-500/40 shadow-purple-500/20"
  //                           }`}>
                              
  //                             {/* Mobile Layout */}
  //                             <div className="flex flex-col space-y-3 md:hidden">
  //                               <div className="flex items-start gap-3">
  //                                 <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
  //                                   item.milestoneCompletionStatus 
  //                                     ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500/50" 
  //                                     : "bg-purple-500/30 text-purple-200 border-2 border-purple-500/50"
  //                                 }`}>
  //                                   {item.milestoneCompletionStatus ? (
  //                                     <CheckCircle className="w-4 h-4" />
  //                                   ) : (
  //                                     index + 1
  //                                   )}
  //                                 </div>
  //                                 <h3 className="text-white text-sm font-semibold leading-relaxed flex-1">
  //                                   {item.milestoneDescription}
  //                                 </h3>
  //                               </div>
  //                               <button
  //                                 onClick={() => handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.name)}
  //                                 className={`w-full px-3 py-2 font-semibold text-xs text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
  //                                   item.milestoneCompletionStatus 
  //                                     ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' 
  //                                     : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
  //                                 }`}
  //                               >
  //                                 {item.milestoneCompletionStatus ? (
  //                                   <>
  //                                     <CheckCircle className="w-4 h-4" />
  //                                     {t('buttons.completed')}
  //                                   </>
  //                                 ) : (
  //                                   <>
  //                                     <div className="w-4 h-4 border-2 border-white/60 rounded-full"></div>
  //                                     {t('buttons.complete')}
  //                                   </>
  //                                 )}
  //                               </button>
  //                             </div>

  //                             {/* Desktop Layout */}
  //                             <div className="hidden md:flex items-start gap-4">
  //                               <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
  //                                 item.milestoneCompletionStatus 
  //                                   ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500/50" 
  //                                   : "bg-purple-500/30 text-purple-200 border-2 border-purple-500/50"
  //                               }`}>
  //                                 {item.milestoneCompletionStatus ? (
  //                                   <CheckCircle className="w-5 h-5" />
  //                                 ) : (
  //                                   index + 1
  //                                 )}
  //                               </div>
                                
  //                               <div className="flex-1">
  //                                 <h3 className="text-white text-base font-semibold mb-2 leading-relaxed">
  //                                   {item.milestoneDescription}
  //                                 </h3>
  //                               </div>

  //                               <button
  //                                 onClick={() => handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.name)}
  //                                 className={`flex-shrink-0 px-4 py-2.5 font-semibold text-sm text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:scale-105 ${
  //                                   item.milestoneCompletionStatus 
  //                                     ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:shadow-emerald-500/30' 
  //                                     : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/30'
  //                                 }`}
  //                               >
  //                                 {item.milestoneCompletionStatus ? (
  //                                   <>
  //                                     <CheckCircle className="w-4 h-4" />
  //                                     {t('buttons.completed')}
  //                                   </>
  //                                 ) : (
  //                                   <>
  //                                     <div className="w-4 h-4 border-2 border-white/60 rounded-full"></div>
  //                                     {t('buttons.complete')}
  //                                   </>
  //                                 )}
  //                               </button>
  //                             </div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     ))
  //                   ) : (
  //                     <div className="text-center py-8 md:py-16">
  //                       <div className="text-4xl md:text-6xl mb-4">🎯</div>
  //                       <p className="text-gray-400 text-base md:text-lg">{LoadMessage}</p>
  //                     </div>
  //                   )
  //                 )}
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </FeatureGuideWrapper>
  // );

  return (
  <FeatureGuideWrapper featureKey="roadmap">
    <div className="w-full mx-auto">

      <ContentGenerationLoading
        isOpen={isLoading}
        onClose={() => setIsLoading(false)}
        page="roadmap"
        showDelay={1000}
      />

      {showCommunityModal && (
        <SelectCommunity
          handleComplete={() => {
            setShowCommunityModal(false);
            saveMilestone(
              selectedMilestoneData.tab,
              selectedMilestoneData.milestoneId,
              selectedMilestoneData.description,
              selectedMilestoneData.careerName,
              selectedCommunities
            );
          }}
          handleCheckboxChange={handleCheckboxChange}
          selectedCommunities={selectedCommunities}
        />
      )}

      {milestones.length == 0 ? (
        <div className="w-full bg-gray-900 p-3 md:p-6 rounded-lg">
          <div className="flex items-center justify-center h-[250px] md:h-[300px]">
            <div className="text-center">
              <div className="text-4xl md:text-6xl mb-4">🗺️</div>
              <p className="text-gray-400 text-base md:text-lg">{LoadMessage}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-gray-900 p-3 md:p-6 rounded-lg">
          <div className="flex mb-4 md:mb-6 overflow-x-auto gap-1 md:gap-2 scrollbar-hide pb-2">
            {Object.keys(milestones).map((tab) => (
              <button
                key={tab}
                className={`flex-shrink-0 px-2 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-colors duration-300 whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-lg"></div>
            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 md:p-6 shadow-2xl min-h-[300px] md:min-h-[400px]">
              
              {activeTab === 'Physical Milestones' && (
                <div className="relative overflow-hidden rounded-xl mb-4 md:mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10"></div>
                  <div className="relative bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 md:p-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-400 rounded-full"></div>
                      </div>
                      <p className="text-blue-200 text-xs md:text-sm leading-relaxed">
                        Physical milestones are crucial for holistic personal development. 
                        Even in careers that may seem primarily mental or desk-bound, 
                        maintaining physical health can significantly impact your professional performance 
                        and overall well-being.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'Mental Milestones' && (
                <div className="relative overflow-hidden rounded-xl mb-4 md:mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"></div>
                  <div className="relative bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 md:p-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-400 rounded-full"></div>
                      </div>
                      <p className="text-purple-200 text-xs md:text-sm leading-relaxed">
                        Mental milestones focus on psychological resilience and personal growth. 
                        Regardless of your career path, developing emotional intelligence, 
                        stress management, and mental well-being are key to long-term success 
                        and personal satisfaction.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 md:space-y-4">
                {activeTab === 'Educational Milestones' ? (
                  milestones[activeTab]?.['Academic Milestones']?.length > 0 ? (
                    milestones[activeTab]['Academic Milestones']?.map((item, index) => (
                      <div key={item.milestoneId} className="group relative">
                        {/* Remove overflow-hidden from this parent div */}
                        <div className="relative rounded-xl transition-all duration-300 md:group-hover:scale-[1.02]">
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 via-gray-700/10 to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className={`relative backdrop-blur-sm border-2 rounded-xl p-3 md:p-6 shadow-lg transition-all duration-300 ${
                            item.milestoneCompletionStatus 
                              ? "bg-gradient-to-r from-emerald-600/30 to-green-600/30 border-emerald-500/40 shadow-emerald-500/20" 
                              : "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-blue-500/40 shadow-blue-500/20"
                          }`}>
                            
                            {/* Mobile Layout */}
                            <div className="flex flex-col space-y-3 md:hidden">
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  item.milestoneCompletionStatus 
                                    ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500/50" 
                                    : "bg-blue-500/30 text-blue-200 border-2 border-blue-500/50"
                                }`}>
                                  {item.milestoneCompletionStatus ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <h3 className="text-white text-sm font-semibold leading-relaxed flex-1">
                                  {item.milestoneDescription}
                                </h3>
                              </div>
                              
                              {/* Tooltip container outside the clipped area */}
                              <div className="relative">
                                <button
                                  onClick={() => !isAcademicMilestone && handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.name)}
                                  className={`w-full px-3 py-2 font-semibold text-xs text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
                                    isAcademicMilestone 
                                      ? 'bg-gray-600 cursor-not-allowed opacity-60' 
                                      : item.milestoneCompletionStatus 
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' 
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                  }`}
                                >
                                  {isAcademicMilestone ? (
                                    <>
                                      <div className="w-4 h-4">🔒</div>
                                      Institute Only
                                    </>
                                  ) : item.milestoneCompletionStatus ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      {t('buttons.completed')}
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/60 rounded-full"></div>
                                      {t('buttons.complete')}
                                    </>
                                  )}
                                </button>
                                {isAcademicMilestone && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-700">
                                    🔒 Only linked institutes can update academic milestones
                                    {/* Tooltip arrow */}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden md:flex items-start gap-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                item.milestoneCompletionStatus 
                                  ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500/50" 
                                  : "bg-blue-500/30 text-blue-200 border-2 border-blue-500/50"
                              }`}>
                                {item.milestoneCompletionStatus ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-white text-base font-semibold mb-2 leading-relaxed">
                                  {item.milestoneDescription}
                                </h3>
                              </div>

                              {/* Tooltip container outside the clipped area */}
                              <div className="relative">
                                <button
                                  onClick={() => !isAcademicMilestone && handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.name)}
                                  className={`flex-shrink-0 px-4 py-2.5 font-semibold text-sm text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg ${
                                    isAcademicMilestone 
                                      ? 'bg-gray-600 cursor-not-allowed opacity-60' 
                                      : item.milestoneCompletionStatus 
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:shadow-emerald-500/30 hover:scale-105' 
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 hover:scale-105'
                                  }`}
                                >
                                  {isAcademicMilestone ? (
                                    <>
                                      <div className="w-4 h-4">🔒</div>
                                      Institute Only
                                    </>
                                  ) : item.milestoneCompletionStatus ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      {t('buttons.completed')}
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/60 rounded-full"></div>
                                      {t('buttons.complete')}
                                    </>
                                  )}
                                </button>
                                {isAcademicMilestone && (
                                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-700">
                                    🔒 Only linked institutes can update academic milestones
                                    {/* Tooltip arrow */}
                                    <div className="absolute top-full right-4 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 md:py-16">
                      <div className="text-4xl md:text-6xl mb-4">📚</div>
                      <p className="text-gray-400 text-base md:text-lg">{LoadMessage}</p>
                    </div>
                  )
                ) : (
                  // ... rest of your code for other tabs remains the same
                  milestones[activeTab]?.length > 0 ? (
                    milestones[activeTab]?.map((item, index) => (
                      <div key={item.milestoneId} className="group relative">
                        <div className="relative rounded-xl transition-all duration-300 md:group-hover:scale-[1.02]">
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 via-gray-700/10 to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className={`relative backdrop-blur-sm border-2 rounded-xl p-3 md:p-6 shadow-lg transition-all duration-300 ${
                            item.milestoneCompletionStatus 
                              ? "bg-gradient-to-r from-emerald-600/30 to-green-600/30 border-emerald-500/40 shadow-emerald-500/20" 
                              : "bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-500/40 shadow-purple-500/20"
                          }`}>
                            
                            {/* Mobile Layout */}
                            <div className="flex flex-col space-y-3 md:hidden">
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  item.milestoneCompletionStatus 
                                    ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500/50" 
                                    : "bg-purple-500/30 text-purple-200 border-2 border-purple-500/50"
                                }`}>
                                  {item.milestoneCompletionStatus ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    index + 1
                                  )}
                                </div>
                                <h3 className="text-white text-sm font-semibold leading-relaxed flex-1">
                                  {item.milestoneDescription}
                                </h3>
                              </div>
                              <button
                                onClick={() => handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.name)}
                                className={`w-full px-3 py-2 font-semibold text-xs text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
                                  item.milestoneCompletionStatus 
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' 
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                }`}
                              >
                                {item.milestoneCompletionStatus ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    {t('buttons.completed')}
                                  </>
                                ) : (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/60 rounded-full"></div>
                                    {t('buttons.complete')}
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden md:flex items-start gap-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                item.milestoneCompletionStatus 
                                  ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-500/50" 
                                  : "bg-purple-500/30 text-purple-200 border-2 border-purple-500/50"
                              }`}>
                                {item.milestoneCompletionStatus ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-white text-base font-semibold mb-2 leading-relaxed">
                                  {item.milestoneDescription}
                                </h3>
                              </div>

                              <button
                                onClick={() => handleComplete(activeTab, item.milestoneId, item.milestoneDescription, selectedCareer.name)}
                                className={`flex-shrink-0 px-4 py-2.5 font-semibold text-sm text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:scale-105 ${
                                  item.milestoneCompletionStatus 
                                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:shadow-emerald-500/30' 
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/30'
                                }`}
                              >
                                {item.milestoneCompletionStatus ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    {t('buttons.completed')}
                                  </>
                                ) : (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/60 rounded-full"></div>
                                    {t('buttons.complete')}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 md:py-16">
                      <div className="text-4xl md:text-6xl mb-4">🎯</div>
                      <p className="text-gray-400 text-base md:text-lg">{LoadMessage}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </FeatureGuideWrapper>
);
}

export default RoadMap;
import GlobalApi from '@/app/_services/GlobalApi';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import SelectCommunity from '../SelectCommunityModal/SelectCommunity';
import { useRouter } from 'next/navigation';
import ContentGenerationLoading from '@/app/_components/ContentGenerationLoading';
import TestLevelModal from '../TestLevelModal/TestLevelModal';

function Certification({ selectedCareer }) {
  const [certificationData, setCertificationData] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState('');
  const t = useTranslations('RoadMap');
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState({
    global: false,
    countrySpecific: false
  });

  // state variables inside your component
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [currentCertificationId, setCurrentCertificationId] = useState(null);

  const router = useRouter();
  const [selectedMilestoneData, setSelectedMilestoneData] = useState(null);

  const language = localStorage.getItem('language') || 'en';
  const requestIdRef = useRef(0);

  const getCertifications = async () => {
    setIsLoading(true);
    setCertificationData([]);
    setCompletedTasks({});
    setLoadMessage("Fetching Certifications");

    const currentRequestId = ++requestIdRef.current;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const response = await GlobalApi.GetRoadMapData(selectedCareer.id, token, language);
      if (response.status === 200) {
        if (currentRequestId === requestIdRef.current) {
          const results = response.data;
          console.log(results);
          
          // Filter to only keep certification-related data
          const certificationItems = results.filter(
            item => item.milestoneSubcategoryName === "Certification Milestones"
          );
          
          setCertificationData(certificationItems);
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
    getCertifications();
  }, [selectedCareer]);

  const handleComplete = (milestoneId, description, careerName) => {
    setShowCommunityModal(true);
    setSelectedMilestoneData({
      milestoneId,
      description,
      careerName
    });
  };

  const saveMilestone = async (milestoneId, description, careerName, selectedCommunities) => {
    const isCompleted = !completedTasks[milestoneId];
    setCompletedTasks((prevState) => ({
      ...prevState,
      [milestoneId]: isCompleted,
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
      getCertifications();
    }
  };

  const handleCheckboxChange = (community, isChecked) => {
    if (community === 'global') {
      setSelectedCommunities((prevState) => ({ ...prevState, global: isChecked }));
    } else if (community === 'countrySpecific') {
      setSelectedCommunities((prevState) => ({ ...prevState, countrySpecific: isChecked }));
    }
  };

  const handleStartCertification = (certificationId) => {
    setCurrentCertificationId(certificationId);
    setShowLevelModal(true);
  };
  
  const handleSelectLevel = (level) => {
    router.push(`/certification-quiz/${currentCertificationId}?level=${level}`);
    setShowLevelModal(false);
  };

  return (
    <div className="p-2 md:p-4 bg-gray-900 text-gray-200">
      {/* Loading Modal */}
      <ContentGenerationLoading
        isOpen={isLoading}
        onClose={() => setIsLoading(false)}
        page="certification"
        showDelay={1000}
      />

      {/* Modal for community selection */}
      {showCommunityModal && (
        <SelectCommunity
          handleComplete={() => {
            setShowCommunityModal(false);
            saveMilestone(
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

      {/* Level Selection Modal */}
      <TestLevelModal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        onSelect={handleSelectLevel}
        testType="certification"
      />

      {/* Certifications Content */}
      <div className="bg-gray-800 p-3 p-4 md:p-6 shadow-lg min-h-[300px]">
        <h2 className="text-lg text-xl md:text-2xl font-bold text-white mb-4 mb-6">Certifications</h2>
        
        {certificationData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-400 text-sm md:text-base">{loadMessage}</p>
          </div>
        ) : (
          certificationData.map((item) => {
            const isPassed = item.certificationCompletedStatus === 'yes' || (Number(item.certificationScore) >= 70);
            const hasAttempted = item.certificationCompletedStatus === 'yes' || 
                                 (item.certificationScore !== null && item.certificationScore !== undefined) || 
                                 (item.certificationCompletedStatus === 'no' && item.certificationStatus === 'invalid');
            const attemptsUsed = item.certificationAttempts != null ? Number(item.certificationAttempts) : (hasAttempted ? 1 : 0);
            const remainingAttempts = Math.max(0, 3 - attemptsUsed);
            const isFailed = !isPassed && hasAttempted;
            const isExhausted = isFailed && attemptsUsed >= 3;
            const canRetry = isFailed && attemptsUsed < 3;

            return (
              <div 
                key={item.milestoneId} 
                className="mb-3 flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-gray-900/40 border border-gray-700/60 rounded-lg p-4 transition-colors hover:border-gray-600/70"
              >
                <div className="flex-1 sm:pr-4">
                  <span className="text-sm md:text-base font-normal text-gray-200 leading-snug break-words">
                    {item.milestoneDescription}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {isPassed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <button
                        onClick={() => router.push(`/certification-results/${item.certificationId}`)}
                        className="w-full sm:w-[210px] h-9 px-3.5 font-medium text-xs sm:text-sm text-white rounded-md flex items-center justify-center flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm whitespace-nowrap"
                      >
                        View Certificate
                      </button>
                    </>
                  ) : canRetry ? (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <button
                        onClick={() => handleStartCertification(item.certificationId)}
                        className="w-full sm:w-[210px] h-9 px-3.5 font-medium text-xs sm:text-sm text-white rounded-md flex items-center justify-center gap-1.5 flex-shrink-0 bg-amber-600 hover:bg-amber-500 transition-colors shadow-sm whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Retry ({remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} left)</span>
                      </button>
                    </>
                  ) : isExhausted ? (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400/60 flex-shrink-0" />
                      <button
                        disabled
                        className="w-full sm:w-[210px] h-9 px-3.5 font-medium text-xs sm:text-sm text-gray-400 rounded-md flex items-center justify-center flex-shrink-0 bg-gray-800 border border-gray-700/60 cursor-not-allowed whitespace-nowrap"
                      >
                        Attempts Exhausted
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 flex-shrink-0 hidden sm:block" />
                      <button
                        onClick={() => handleStartCertification(item.certificationId)}
                        className="w-full sm:w-[210px] h-9 px-3.5 font-medium text-xs sm:text-sm text-white rounded-md flex items-center justify-center flex-shrink-0 bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm whitespace-nowrap"
                      >
                        Get Certified
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Certification;

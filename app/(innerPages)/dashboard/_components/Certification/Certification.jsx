import GlobalApi from '@/app/_services/GlobalApi';
import { CheckCircle } from 'lucide-react';
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
          certificationData.map((item) => (
            <div key={item.milestoneId} className="mb-4 mb-6 flex flex-col sm:flex-row gap-2 gap-3 sm:gap-0 sm:items-start justify-between border border-gray-700 rounded-lg p-3 p-4">
              <div className="flex-1 sm:pr-4">
                <h3 className="font-bold text-base text-lg text-white">
                  <span className="font-normal break-words text-sm md:text-base">{item.milestoneDescription}</span>
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
              {item.certificationCompletedStatus === 'yes' ? (
                <button
                    onClick={() => router.push(`/certification-results/${item.certificationId}`)}
                    className="w-full sm:w-[150px] px-3  py-2 font-semibold text-xs text-sm text-white rounded-lg flex items-center justify-center flex-shrink-0 bg-green-500"
                >
                    View Certification
                </button>
                ) : (
                <button
                    onClick={() => handleStartCertification(item.certificationId)}
                    className="w-full sm:w-[150px] px-3 px-4 py-1.5 py-2 font-semibold text-xs text-sm text-white rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-500"
                >
                    Get Certified
                </button>
                )}

                {/* Commented course-related buttons
                {
                  item.courseStatus === 'in_progress' ? (
                  <button
                    onClick={() => router.push(`/certification-course/${item.certificationId}`)}
                    className="ml-4 px-4 py-2 font-semibold text-sm text-white rounded-lg flex items-center justify-center w-[150px] flex-shrink-0 bg-blue-500"
                  >
                    Continue Course
                  </button>
                ) : item.courseStatus === null ? (
                  <button
                    onClick={() => router.push(`/course-overview/${item.certificationId}`)}
                    className="ml-4 px-4 py-2 font-semibold text-sm text-white rounded-lg flex items-center justify-center w-[150px] flex-shrink-0 bg-blue-500"
                  >
                    Get Course
                  </button>
                ) : item.courseStatus === "completed" ? (
                  <button
                    disabled
                    className="ml-4 px-4 py-2 font-semibold text-sm text-white rounded-lg flex items-center justify-center w-[150px] flex-shrink-0 bg-gray-300"
                  >
                    Course Completed
                  </button>
                ) : null
              } */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Certification;
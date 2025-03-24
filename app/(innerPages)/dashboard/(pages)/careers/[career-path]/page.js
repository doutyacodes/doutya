"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { PlusIcon, LockIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AddCareer from "../../../_components/AddCareer/AddCareer";
import Challenge from "../../../_components/Challenges/page";
import Feedback from "../../../_components/FeedbackTab/Feedback";
import RoadMap from "../../../_components/RoadMapTab/RoadMap";
import { useTranslations } from "next-intl";
import Tests from "../../../_components/TestTab/Tests";
import Results2 from "../../../_components/Result2/page";
import CommunityList from "@/app/_components/CommunityList";
import FeatureRestrictionModal from "../../../_components/FeatureRestrictionModal/FeatureRestrictionModal";
import PricingCard from "@/app/_components/PricingCard";
import CareerOverView from "../../../_components/CareerOverview/CareerOverview";
import CareerGuideExplanation from "@/app/_components/CareerGuideExplanation";
import TestsNotCompltedWarning from "../../../_components/TestsNotCompltedWarning/TestsNotCompltedWarning";
import Certification from "../../../_components/Certification/Certification";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

function Page() {
  const [careerData, setCareerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCareer, setShowCareer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [careerName, setCareerName] = useState("");
  const [roadMapLoading, setRoadMapLoading] = useState(false);
  const [isTest2Completed, setIsTest2Completed] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [isRestricted, setIsRestricted] = useState(false);
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [isTestCompleted, setIsTestCompleted] = useState("");
  const [showTestWarningModal, setShowTestWarningModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSubject, setCompletedSubject] = useState('');
  

  const router = useRouter();
  const t = useTranslations("CareerPage");

  // Total number of boxes will be 5 (career stripe)
  const totalBoxes = 5;

  const [step, setStep] = useState(1); /* taken this formthe result 2  component we need theis state to show
   the career adding stripe or not based on the step  */

  const pathname = usePathname();
  const searchParams = useSearchParams();

  
  useEffect(() => {
    const getQuizData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);

        // Check if Test 2 is completed
        const test2 = resp.data.data.find((q) => q.quiz_id === 2);
        if (test2 && test2.isCompleted) {
          setIsTest2Completed(true);
        }
      } catch (error) {
        console.error("Error Fetching data:", error);
      } 
    };
    getQuizData();
  }, [setIsTest2Completed]);

  useEffect(() => {
    // Check if the URL has the testCompleted parameter
    const testCompleted = searchParams.get('testCompleted');
    const subjectName = searchParams.get('subjectName');
    
    if (testCompleted === 'true') {
      setCompletedSubject(subjectName || 'your test');
      setShowCompletionModal(true);
      
      // Clean up the URL to prevent the modal from showing on refresh
      // Create a new URL without the query parameters
      window.history.replaceState({}, document.title, pathname);
    }
  }, [searchParams, pathname]);

  useEffect(() => {
    const PathChange = () => {
      if (pathname == "/dashboard/careers/career-guide") {
        setShowCareer(true);
        setStep(2) /* setting to step 2 beacuse only step 2 will show th ecareer stripe, We ahve to implement do a better way for this , */
      } else {
        setShowCareer(false);
      }
    };
    PathChange();
  }, [pathname]);

  const tabs = [
    { key: "roadmap", label: t("roadmap") },
    { key: "assessment", label: t("assessment") },
    { key: "certification", label: "certifications" },
    { key: "feedback", label: t("feedback") },
    { key: "challenges", label: t("challenges") },
    { key: "community", label: "Community" },
  ];

  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    };
    authCheck();
  }, [router]);

  useEffect(() => {
    if (pathname == "/dashboard/careers/career-guide" && careerData.length > 0) {
      setSelectedCareer(careerData[0]);
    }
  }, [careerData]);

  const getCareers = async () => {
    setIsLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await GlobalApi.GetCarrerData(token);
      if (
        response.status === 201 &&
        response.data
      ) {
        if(response.data.carrerData.length > 0){
          setCareerData(response.data.carrerData);
        }
        setAge(response.data.age);
        setIsTestCompleted(response.data.quizStatus)
        if (response.data.age <= "9" || response.data.planType === "base"){
          setIsRestricted(true)
        }
      } 
      // else {
      //   toast.error("No career data available at the moment.");
      // }
    } catch (err) {
      toast.error("Failed to fetch career data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCareers();
  }, []);
  
  const handleAddCareerClick = () => {
    if (isTestCompleted === 'not_completed') { 
      setShowTestWarningModal(true);
    }
    else if (isRestricted) {
      setShowFeatureModal(true);
    } else {
      if (careerData.length >= 5) {
        toast.error("You can only add up to 5 careers.");
        return;
      }
      setShowDialogue(true);
    }
  };

  const handleSubmit = async () => {
    setRoadMapLoading(true);
    setShowDialogue(false);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.SaveInterestedCareer(token, careerName, country);
      if (response && response.status === 200) {
        setCareerName("");
        setCountry("");
        getCareers();
      } else if (response && response.status === 201)  {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to save career data. Please try again later.");
    } finally {
      setRoadMapLoading(false);
    }
  };

  const handleCareerClick = (career) => {
    setSelectedCareer(career);
    setActiveTab("roadmap");
    if (pathname !== "/dashboard/careers/career-guide") {
      router.push("/dashboard/careers/career-guide");
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleViewResults = () => {
    setShowCompletionModal(false);
    // Navigate to the results page
    setActiveTab("assessment")
  };
  
  const handleClose = () => {
    setShowCompletionModal(false);
  };


    // Render career or disabled box based on restriction
    const renderCareerBox = (career, index) => {
      if (isRestricted && index >= 2) {
        // Disabled boxes for restricted users
        return (
          <div
            key={`restricted-${index}`}
            className="w-28 h-28 sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg bg-gray-600 flex justify-center items-center opacity-50 cursor-not-allowed"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <LockIcon className="text-white h-6 w-6 sm:h-8 sm:w-8 mb-2" />
              <p className="text-xs sm:text-sm font-bold text-white">
                Pro Users Only
              </p>
            </div>
          </div>
        );
      }
      
      // Regular career boxes for selected careers
      if (career) {
        return (
          <div
            key={career.id}
            onClick={() => handleCareerClick(career)}
            className={`w-28 h-28 flex justify-center items-center sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg transition-transform transform hover:scale-105 cursor-pointer duration-150 ${
              selectedCareer?.id === career.id
                ? "bg-gray-700 border-2 border-blue-500"
                : "bg-gray-800"
            }`}
          >
            <p className="text-center text-xs sm:text-sm font-bold text-white">
              {career.career_name}
            </p>
          </div>
        );
      }
      
      // Plus button for adding new careers
      return (
        <div
          key={`plus-${index}`}
          className="w-28 h-28 sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg bg-gray-700 flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150"
          onClick={handleAddCareerClick}
        >
          <PlusIcon className="text-white h-6 w-6 sm:h-8 sm:w-8" />
        </div>
      );
    };


  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <LoadingOverlay loadText={"Loading..."} />
      </div>
    );
  }

  return (
    <div className="mx-auto bg-[#1f1f1f] text-white max-md:pb-7">
      <Toaster />
        {
          step === 2 && (
            <>
                {/* Add Career Dialog - Only show for unrestricted users */}
                {!isRestricted && (
                  <AddCareer
                    isOpen={showDialogue}
                    onClose={() => setShowDialogue(false)}
                    getCareers={getCareers}
                    setCareerName={setCareerName}
                    careerName={careerName}
                    setCountry={setCountry}
                    country={country}
                    handleSubmit={handleSubmit}
                    roadMapLoading={roadMapLoading}
                  />
                )}
      
                {/* Feature Restriction Modal */}
                <FeatureRestrictionModal
                  isOpen={showFeatureModal}
                  onClose={() => setShowFeatureModal(false)}
                  onViewPlans={() => {
                    setShowFeatureModal(false);
                    setShowPricingModal(true);
                  }}
                />

                {/* Feature Restriction Modal */}
                <TestsNotCompltedWarning
                  isOpen={showTestWarningModal}
                  onClose={() => setShowTestWarningModal(false)}
                />

                {/* Pricing Modal */}
                {showPricingModal && (
                  <PricingCard onClose={() => setShowPricingModal(false)} />
                )}
      
                {/* Mobile Heading */}
                <p className="text-center font-bold sm:hidden text-white text-2xl sm:text-4xl md:pl-5 max-sm:bg-[#1f1f1f]">
                  My Careers
                </p>
      
                {/* Career Selector for Desktop */}
                {/* <div className="flex flex-col pt-4 px-6 md:px-24 sm:flex-row justify-start sm:items-center items-start gap-4 text-white bg-[#2c2c2c] sm:p-10 mb-5 overflow-x-scroll">
                  <p className="text-center font-bold hidden sm:flex text-white text-2xl sm:text-4xl">
                    {t("careers")}
                  </p>
      
                  <div className="flex gap-4 justify-start items-center max-md:pl-4 w-fit pb-2">
                    {careerData.map((career, index) => (
                      <div
                        key={index}
                        onClick={() => handleCareerClick(career)}
                        className={`w-28 h-28 flex justify-center items-center sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg transition-transform transform hover:scale-105 cursor-pointer duration-150 ${
                          selectedCareer?.id === career.id
                            ? "bg-gray-700 border-2 border-blue-500"
                            : "bg-gray-800"
                        }`}
                      >
                        <p className="text-center text-xs sm:text-sm font-bold text-white">
                          {career.career_name}
                        </p>
                      </div>
                    ))}
      
                    <div
                      className="w-28 h-28 sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg bg-gray-700 flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150"
                      onClick={handleAddCareerClick}
                    >
                      <PlusIcon className="text-white h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  </div>
                </div> */}

              <div className="flex flex-col pt-4 px-6 md:px-24 sm:flex-row justify-start sm:items-center items-start gap-4 text-white bg-[#2c2c2c] sm:p-10 mb-5 overflow-x-scroll">
                <p className="text-center font-bold hidden sm:flex text-white text-3xl">
                  My Careers
                </p>
                
                <div className="flex gap-4 justify-start items-center max-md:pl-4 w-fit pb-2">
                  {/* Render 5 total boxes */}
                  {[...careerData, ...Array(totalBoxes - careerData.length)].slice(0, totalBoxes).map((career, index) => 
                    renderCareerBox(career, index)
                  )}
                </div>
              </div>
            </>
          )
        }

      {showCareer ? (
        <>

         {/* Completion Modal */}
          <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
            <DialogContent className="bg-gray-900 text-white border border-gray-700 sm:max-w-md">
              <DialogHeader>
                <div className="flex justify-center items-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <DialogTitle className="text-xl text-center">Test Completed Successfully!</DialogTitle>
                <DialogDescription className="text-gray-400 text-center mt-2">
                  You've successfully completed the {completedSubject} test.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <p className="text-center text-gray-300">
                  Your results have been saved and are ready to view. Check out your performance and get personalized insights.
                </p>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-center">
                <Button
                  onClick={handleViewResults}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
                >
                  View Results
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="border border-gray-600 hover:bg-gray-800 text-gray-300 px-4 py-2 rounded-lg w-full sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* CareerGuideExplanation  component*/}
          <CareerGuideExplanation />
          {/* Selected Career Content */}
          {selectedCareer && (
            <>
            <div className="bg-gray-600 mb-5 flex flex-col sm:flex-row sm:justify-between items-center px-4 py-3 sm:px-6 md:px-24 sm:py-4 gap-3 sm:gap-0">
              {/* Career Overview Button - Full width on mobile, normal on desktop */}
              <button
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-4 bg-[#2b2b2b] text-white font-bold rounded-xl text-sm flex items-center justify-center hover:bg-[#3a3a3a] focus:outline-none focus:ring-2 focus:ring-[#5a5a5a] focus:ring-offset-2 transition-colors duration-200 ${
                  activeTab === 'careerOverview' ? 'bg-[#3b3b3b]' : ''
                }`}
                onClick={() => handleTabClick('careerOverview')}
              >
                <span className="mr-2">Career Overview</span>
              </button>
              
              {/* Career Name - Centered on mobile */}
              <p className="text-white uppercase font-bold text-center text-lg md:text-xl order-first sm:order-none">
                {selectedCareer?.career_name}
              </p>
              
              {/* Year/Week Info - Side by side on mobile, stacked on desktop */}
              <div className="flex sm:flex-col gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <p className="flex-1 sm:flex-none p-2 bg-[#1f1f1f] text-white font-bold rounded-xl text-xs sm:text-sm text-center">
                  YEAR - {selectedCareer.weekData.yearsSinceJoined}
                </p>
                <p className="flex-1 sm:flex-none p-2 bg-[#1f1f1f] text-white font-bold rounded-xl text-xs sm:text-sm text-center">
                  WEEK - {selectedCareer.weekData.weekNumber}/52
                </p>
              </div>
            </div>

            <div className="flex flex-col px-2 md:px-20 gap-6 py-6 bg-[#2c2c2c]">
              <div className="bg-gray-900 flex flex-col items-center w-full md:w-auto p-4 rounded-lg">
                <div className="flex flex-row md:justify-center gap-4 text-xs md:text-base w-full overflow-x-auto scrollbar-hide pb-2">
                  {tabs.map((tab, index) => (
                    <React.Fragment key={tab.key}>
                      <button
                        className={`${
                          activeTab === tab.key
                            ? "text-orange-400 bg-gray-700"
                            : "text-gray-100 hover:bg-gray-700"
                        } whitespace-nowrap font-semibold py-2 px-3 flex-shrink-0`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label.toUpperCase()}
                      </button>
                      {index < tabs.length - 1 && (
                        <div className="h-10 px-[1px] bg-white flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-gray-800 p-2 md:p-6 rounded-lg">
                <div className="text-white font-bold text-center text-xl mb-4 uppercase">
                  {t(activeTab)}
                </div>
                {activeTab === "careerOverview" && (
                  <CareerOverView selectedCareer={selectedCareer} setMainTab={setActiveTab}/>
                )}
                {activeTab === "roadmap" && (
                  <RoadMap selectedCareer={selectedCareer} />
                )}
                {activeTab === "assessment" && (
                  <Tests selectedCareer={selectedCareer} />
                )}
                {activeTab === "certification" && (
                  <Certification selectedCareer={selectedCareer} />
                )}
                {activeTab === "feedback" && (
                  <Feedback selectedCareer={selectedCareer} />
                )}
                {activeTab === "challenges" && (
                  <Challenge selectedCareer={selectedCareer} />
                )}
                {activeTab === "community" && (
                  <CommunityList careerId={selectedCareer?.career_group_id} />
                )}
              </div>
            </div>
            </>
          )}
        </>
      ) : (
        <>
        {
          isTest2Completed && (<Results2 step={step} setStep={setStep} />)
        }
        </>
      )}
    </div>
  );
}

export default Page;

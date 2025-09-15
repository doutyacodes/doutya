"use client";

import { Suspense } from "react";
import CareerGuideExplanation from "@/app/_components/CareerGuideExplanation";
import CommunityList from "@/app/_components/CommunityList";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { LockIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CareerOverView from "../../../_components/CareerOverview/CareerOverview";
import Certification from "../../../_components/Certification/Certification";
import Challenge from "../../../_components/Challenges/page";
import Feedback from "../../../_components/FeedbackTab/Feedback";
import Results2 from "../../../_components/Result2/page";
import RoadMap from "../../../_components/RoadMapTab/RoadMap";
import Tests from "../../../_components/TestTab/Tests";

import CareerStripe from "@/app/_components/CareerStripe";
import { useTopbar } from "@/app/context/TopbarContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import Mentorship from "../../../_components/Mentorship/Mentorship";

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
  const [scopeType, setScopeType] = useState(null);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSubject, setCompletedSubject] = useState("");

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("CareerPage");

  const { refreshTopbar } = useTopbar();

  // Total number of boxes will be 5 (career stripe)
  const totalBoxes = 5;

  const [step, setStep] =
    useState(
      1
    ); /* taken this formthe result 2  component we need theis state to show
   the career adding stripe or not based on the step  */

  // Function to update URL with career and tab selection
  const updateURL = (careerId, tabKey) => {
    const params = new URLSearchParams(searchParams);
    if (careerId) {
      params.set('careerId', careerId.toString());
    } else {
      params.delete('careerId');
    }
    if (tabKey && tabKey !== 'roadmap') { // Only add tab if it's not the default
      params.set('tab', tabKey);
    } else {
      params.delete('tab');
    }
    
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState({}, '', newURL);
  };

  useEffect(() => {
    // Only refresh if refreshTopbar changes and initial load is complete
    if (refreshTopbar && initialLoadComplete) {
      getCareers(false);
    }
  }, [refreshTopbar, initialLoadComplete]);

  let i = 0;
  console.log(`main page loaded ${++i}`);
  console.log('istest2 completed', isTest2Completed)

  useEffect(() => {
    const getQuizData = async () => {
      try {
        setIsLoading(true);
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);

        setScopeType(resp.data.scopeType);

        // Check if Test 2 is completed
        const test2 = resp.data.data.find((q) => q.quiz_id === 2);
        if (test2 && test2.isCompleted) {
          setIsTest2Completed(true);
        }
      } catch (error) {
        console.error("Error Fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getQuizData();
  }, [setIsTest2Completed]);

  useEffect(() => {
    // Check if the URL has the testCompleted parameter
    const testCompleted = searchParams.get("testCompleted");
    const subjectName = searchParams.get("subjectName");

    if (testCompleted === "true") {
      setCompletedSubject(subjectName || "your test");
      setShowCompletionModal(true);

      // Clean up the URL to prevent the modal from showing on refresh
      const params = new URLSearchParams(searchParams);
      params.delete("testCompleted");
      params.delete("subjectName");
      const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      window.history.replaceState({}, document.title, newURL);
    }
  }, [searchParams, pathname]);

  useEffect(() => {
    const PathChange = () => {
      if (pathname == "/dashboard/careers/career-guide") {
        setShowCareer(true);
        setStep(2); /* setting to step 2 beacuse only step 2 will show the career stripe, We ahve to implement do a better way for this , */
      } else {
        setShowCareer(false);
      }
    };
    PathChange();
  }, [pathname]);

  const tabs = [
    // Career Overview: only for "career"
    { key: "roadmap", label: t("roadmap") },
    ...(scopeType === "career"
      ? [{ key: "careerOverview", label: "Career Overview" }]
      : []),
    { key: "assessment", label: t("assessment") },
    { key: "feedback", label: t("feedback") },
    { key: "challenges", label: t("challenges") },
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

  // Updated useEffect to handle career selection from URL parameters
  useEffect(() => {
    if (pathname == "/dashboard/careers/career-guide" && careerData.length > 0) {
      const urlCareerId = searchParams.get('careerId');
      const urlTab = searchParams.get('tab') || 'roadmap';
      
      if (urlCareerId) {
        // Try to find the career from URL parameter
        const careerFromURL = careerData.find(career => career.id.toString() === urlCareerId);
        if (careerFromURL && (!selectedCareer || selectedCareer.id.toString() !== urlCareerId)) {
          setSelectedCareer(careerFromURL);
          setActiveTab(urlTab);
          return;
        }
      }
      
      // Fallback: if no URL career found or no URL parameter, select first career
      if (!selectedCareer && careerData.length > 0) {
        setSelectedCareer(careerData[0]);
        setActiveTab('roadmap');
        // Update URL with the default selection
        updateURL(careerData[0].id, 'roadmap');
      }
    }
  }, [careerData, pathname, searchParams]);

  const getCareers = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await GlobalApi.GetCarrerData(token);
      if (response.status === 201 && response.data) {
        if (response.data.scopeData.length > 0) {
          setCareerData(response.data.scopeData);
        }
        setAge(response.data.age);
        setIsTestCompleted(response.data.quizStatus);
        if (response.data.age <= "9" || response.data.planType === "base") {
          setIsRestricted(true);
        }
        setInitialLoadComplete(true); // Add this line
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch career data. Please try again later.");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    getCareers();
  }, []);

  const handleAddCareerClick = () => {
    if (isTestCompleted === "not_completed") {
      setShowTestWarningModal(true);
    } else if (isRestricted) {
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
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.SaveInterestedCareer(
        token,
        careerName,
        country
      );
      if (response && response.status === 200) {
        setCareerName("");
        setCountry("");
        getCareers();
      } else if (response && response.status === 201) {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to save career data. Please try again later.");
    } finally {
      setRoadMapLoading(false);
    }
  };

  // Updated handleCareerClick to update URL parameters
  const handleCareerClick = (career) => {
    setSelectedCareer(career);
    const newActiveTab = "roadmap"; // Reset to roadmap when switching careers
    setActiveTab(newActiveTab);
    
    // Update URL with new selection
    updateURL(career.id, newActiveTab);
    
    if (pathname !== "/dashboard/careers/career-guide") {
      router.push("/dashboard/careers/career-guide");
    }
  };

  // Updated handleTabClick to update URL parameters
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    // Update URL with current career and new tab
    if (selectedCareer) {
      updateURL(selectedCareer.id, tab);
    }
  };

  const handleViewResults = () => {
    setShowCompletionModal(false);
    // Navigate to the results page
    const newTab = "assessment";
    setActiveTab(newTab);
    
    // Update URL with current career and assessment tab
    if (selectedCareer) {
      updateURL(selectedCareer.id, newTab);
    }
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
          className="group relative w-28 h-28 lg:w-32 lg:h-32 p-2 cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-600/40 to-gray-800/40 rounded-xl backdrop-blur-sm border border-gray-600/30"></div>
          <div className="relative h-full flex flex-col items-center justify-center text-center space-y-1 opacity-50">
            <div className="p-2 bg-gray-700/50 rounded-full">
              <LockIcon className="text-gray-400 h-5 w-5 lg:h-6 lg:w-6" />
            </div>
            <p className="text-xs font-semibold text-gray-400 leading-tight">
              Pro Users Only
            </p>
          </div>
        </div>
      );
    }

    // Regular career boxes for selected careers
    if (career) {
      const isSelected = selectedCareer?.id === career.id;
      return (
        <div
          key={career.id}
          onClick={() => handleCareerClick(career)}
          className="group relative w-28 h-28 lg:w-32 lg:h-32 p-2 cursor-pointer"
        >
          <div
            className={`absolute inset-0 rounded-xl transition-all duration-300 ${
              isSelected
                ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-400/60 shadow-lg shadow-blue-500/20"
                : "bg-gradient-to-br from-gray-700/60 to-gray-800/60 border border-gray-600/40 group-hover:from-gray-600/60 group-hover:to-gray-700/60 group-hover:border-gray-500/60 group-hover:shadow-lg"
            }`}
          ></div>

          <div className="relative h-full flex items-center justify-center p-1.5 transition-all duration-300 group-hover:scale-105">
            <p
              className={`text-center text-xs lg:text-sm font-bold leading-tight transition-colors duration-300 ${
                isSelected
                  ? "text-blue-200"
                  : "text-gray-200 group-hover:text-white"
              }`}
            >
              {career.career_name}
            </p>
          </div>

          {isSelected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    // Plus button for adding new careers
    return (
      <div
        key={`plus-${index}`}
        className="group relative w-28 h-28 lg:w-32 lg:h-32 p-2 cursor-pointer"
        onClick={handleAddCareerClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700/60 to-gray-800/60 border border-gray-600/40 rounded-xl transition-all duration-300 group-hover:from-green-600/20 group-hover:to-emerald-600/20 group-hover:border-green-500/50 group-hover:shadow-lg group-hover:shadow-green-500/20"></div>

        <div className="relative h-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
          <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
            <PlusIcon className="text-green-400 h-5 w-5 lg:h-6 lg:w-6 group-hover:text-green-300 transition-colors duration-300" />
          </div>
        </div>

        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <p className="text-xs text-gray-300 whitespace-nowrap">
              Add Career
            </p>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Toaster />
      {step === 2 && (
        <CareerStripe
          selectedItem={selectedCareer}
          setSelectedItem={(career) => {
            setSelectedCareer(career);
            updateURL(career?.id, activeTab);
          }}
        />
      )}

      {showCareer ? (
        <div className="relative">
          {/* Completion Modal */}
          <Dialog
            open={showCompletionModal}
            onOpenChange={setShowCompletionModal}
          >
            <DialogContent className="bg-gray-900/95 backdrop-blur-lg text-white border border-gray-700/50 sm:max-w-md shadow-2xl">
              <DialogHeader>
                <div className="flex justify-center items-center mb-4">
                  <div className="relative">
                    <CheckCircle className="h-12 w-12 text-emerald-500" />
                    <div className="absolute inset-0 h-12 w-12 text-emerald-500 animate-ping opacity-30">
                      <CheckCircle className="h-12 w-12" />
                    </div>
                  </div>
                </div>
                <DialogTitle className="text-xl text-center font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  Test Completed Successfully!
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-center mt-2">
                  You've successfully completed the {completedSubject} test.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <p className="text-center text-gray-300">
                  Your results have been saved and are ready to view. Check out
                  your performance and get personalized insights.
                </p>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-center">
                <Button
                  onClick={handleViewResults}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/20 w-full sm:w-auto"
                >
                  View Results
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="border border-gray-600/50 hover:bg-gray-800/50 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 w-full sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* CareerGuideExplanation component */}
          <CareerGuideExplanation />

          {/* Selected Career Content */}
          {selectedCareer && (
            <div className="space-y-3">
              {/* Career Header Section */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div className="relative backdrop-blur-sm bg-gray-800/30 border border-gray-700/50 rounded-lg mx-2 lg:mx-4 p-3 lg:p-4 shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                    {/* Career Name and Progress Stats */}
                    <div className="text-center flex-1">
                      <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wide">
                        {selectedCareer?.name}
                      </h1>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-2"></div>
                      
                      {/* Progress Stats Below Title */}
                      {selectedCareer?.weekData && (
                        <div className="flex gap-2 justify-center mt-3">
                          <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="relative px-3 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-lg text-center min-w-[70px] transition-all duration-300 hover:border-blue-500/50">
                              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Year</p>
                              <p className="text-base font-bold text-blue-400">{selectedCareer.weekData.yearsSinceJoined}</p>
                            </div>
                          </div>
                          <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="relative px-3 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 rounded-lg text-center min-w-[70px] transition-all duration-300 hover:border-purple-500/50">
                              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Week</p>
                              <p className="text-base font-bold text-purple-400">{selectedCareer.weekData.weekNumber}/52</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation & Content */}
              <div className="mx-2 lg:mx-4 space-y-2">
                {/* Modern Tab Navigation */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg"></div>
                  <div className="relative backdrop-blur-sm bg-gray-800/40 border border-gray-700/50 rounded-lg p-2 shadow-xl">
                    <div className="flex flex-wrap gap-3 lg:gap-1.5 justify-center">
                      {tabs.map((tab) => (
                        <button
                          key={tab.key}
                          className={`group relative px-2 lg:px-3 py-1.5 lg:py-2 rounded-md font-semibold text-xs transition-all duration-300 min-w-[80px] hover:scale-105 ${
                            activeTab === tab.key
                              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 border border-orange-400/50"
                              : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/60 hover:text-white border border-gray-600/30 hover:border-gray-500/50"
                          }`}
                          onClick={() => handleTabClick(tab.key)}
                        >
                          <span className="relative z-10">
                            {tab.label.toUpperCase()}
                          </span>
                          {activeTab === tab.key && (
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-md animate-pulse"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-lg"></div>
                  <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 lg:p-4 shadow-2xl min-h-[350px]">
                    <div className="text-center mb-3">
                      <h2 className="text-base lg:text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {activeTab === "careerOverview" ? "Career Overview" : t(activeTab)}
                      </h2>
                      <div className="w-10 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mt-1"></div>
                    </div>

                    <div className="relative">
                      {activeTab === "careerOverview" &&
                        scopeType === "career" && (
                          <CareerOverView
                            selectedCareer={selectedCareer}
                            setMainTab={setActiveTab}
                          />
                        )}
                      {activeTab === "roadmap" && (
                        <RoadMap selectedCareer={selectedCareer} />
                      )}
                      {activeTab === "assessment" && (
                        <Tests selectedCareer={selectedCareer} />
                      )}
                      {activeTab === "certification" &&
                        (scopeType === "cluster" || scopeType === "career") && (
                          <Certification selectedCareer={selectedCareer} />
                        )}
                      {activeTab === "feedback" && (
                        <Feedback selectedCareer={selectedCareer} />
                      )}
                      {activeTab === "challenges" && (
                        <Challenge selectedCareer={selectedCareer} />
                      )}
                      {activeTab === "mentor" && scopeType === "career" && (
                        <Mentorship selectedCareer={selectedCareer} />
                      )}
                      {activeTab === "community" && (
                        <CommunityList
                          careerId={selectedCareer?.scope_grp_id}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen">
          {isTest2Completed && <Results2 step={step} setStep={setStep} />}
        </div>
      )}
    </div>
  );
}

function PageWrapper() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-white">Loading...</div>}>
      <Page />
    </Suspense>
  );
}

export default PageWrapper;
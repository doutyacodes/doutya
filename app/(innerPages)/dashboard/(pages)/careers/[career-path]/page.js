"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { PlusIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AddCareer from "../../../_components/AddCareer/AddCareer";
import Contests from "../../../_components/ContestTab/Contests";
import Activity from "../../../_components/Activities/activity";
import Challenge from "../../../_components/Challenges/page";
import Feedback from "../../../_components/FeedbackTab/Feedback";
import RoadMap from "../../../_components/RoadMapTab/RoadMap";
import About from "../../../_components/About/page";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import CareerPath from "../../../_components/CareerPathTab/CareerPath";
import Tests from "../../../_components/TestTab/Tests";
import Results2 from "../../../_components/Result2/page";
import CommunityList from "@/app/_components/CommunityList";
import FeatureRestrictionModal from "../../../_components/FeatureRestrictionModal/FeatureRestrictionModal";
import PricingCard from "@/app/_components/PricingCard";

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
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const router = useRouter();
  const t = useTranslations("CareerPage");

  const pathname = usePathname();
  
  useEffect(() => {
    const getQuizData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);

        // Check if Test 2 is completed
        const test2 = resp.data.find((q) => q.quiz_id === 2);
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
    const PathChange = () => {
      if (pathname == "/dashboard/careers/career-guide") {
        setShowCareer(true);
      } else {
        setShowCareer(false);
      }
    };
    PathChange();
  }, [pathname]);

  const tabs = [
    { key: "roadmap", label: t("roadmap") },
    { key: "test", label: t("test") },
    { key: "careerPath", label: "Career Path" },
    { key: "feedback", label: t("feedback") },
    { key: "challenges", label: t("challenges") },
    { key: "careerOverview", label: "Career Overview" },
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
    if (isRestricted) {
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

      {/* Add Career Dialog */}
      {/* <AddCareer
        isOpen={showDialogue}
        onClose={() => setShowDialogue(false)}
        getCareers={getCareers}
        setCareerName={setCareerName}
        careerName={careerName}
        handleSubmit={handleAddCareerClick}
        roadMapLoading={roadMapLoading}
      /> */}

      
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

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingCard onClose={() => setShowPricingModal(false)} />
      )}

      {/* Mobile Heading */}
      <p className="text-center font-bold sm:hidden text-white text-2xl sm:text-4xl md:pl-5 max-sm:bg-[#1f1f1f]">
        {t("careers")}
      </p>

      {/* Career Selector for Desktop */}
      <div className="flex flex-col pt-4 sm:flex-row justify-start sm:items-center items-start gap-4 text-white bg-[#2c2c2c] sm:p-10 mb-5 overflow-x-scroll">
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
      </div>
      {showCareer ? (
        <>
          {/* Selected Career Content */}
          {selectedCareer && (
            <>
            <div className="bg-[#000000] min-h-20 mb-5 justify-between items-center flex p-3">
                <p className="p-2 bg-[#1f1f1f] text-white font-bold rounded-xl text-sm">Career Overview</p>
          <p className="text-white uppercase font-bold text-center md:text-xl">
          {selectedCareer?.career_name}
          {/* {console.log(selectedCareer.weekData.weekNumber)} */}
          </p>
          <div className="space-y-3">
            <p className="p-2 bg-[#1f1f1f] text-white font-bold rounded-xl text-sm text-center">YEAR-{selectedCareer.weekData.yearsSinceCreated+1}</p>
            <p className="p-2 bg-[#1f1f1f] text-white font-bold rounded-xl text-sm text-center">WEEK -{selectedCareer.weekData.weekNumber}/52</p>
          </div>
        </div>
            <div className="flex flex-col  px-4 md:px-20 gap-6 py-6 bg-[#2c2c2c]">
                
                
              <div className="bg-gray-900 flex flex-col items-center w-full md:w-auto p-4 rounded-lg">
                <div className="flex flex-row  gap-4 text-xs md:text-base min-w-20 mt-4 w-full overflow-x-scroll justify-center items-center">
                  {tabs.map((tab) => (
                    <>
                      <button
                        key={tab.key}
                        className={`${
                          activeTab === tab.key
                            ? "text-orange-600"
                            : "text-gray-800 hover:bg-gray-700"
                        } text-white font-semibold py-2 px-3 md:min-w-32`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label.toUpperCase()}
                      </button>
                      <div className="h-10 px-[1px] bg-white" />
                    </>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-gray-800 p-6 rounded-lg">
                <div className="text-white font-bold text-xl mb-4 uppercase">
                  {t(activeTab)}
                </div>
                {activeTab === "roadmap" && (
                  <RoadMap selectedCareer={selectedCareer} />
                )}
                {activeTab === "careerPath" && (
                  <CareerPath selectedCareer={selectedCareer} />
                )}
                {activeTab === "test" && (
                  <Tests selectedCareer={selectedCareer} />
                )}
                {activeTab === "feedback" && (
                  <Feedback selectedCareer={selectedCareer} />
                )}
                {activeTab === "challenges" && (
                  <Challenge selectedCareer={selectedCareer} />
                )}
                {activeTab === "careerOverview" && (
                  <About selectedCareer={selectedCareer} />
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
          isTest2Completed && (<Results2 />)
        }
        </>
      )}
    </div>
  );
}

export default Page;

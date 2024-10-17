"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AddCareer from "../../_components/AddCareer/AddCareer";
import Contests from "../../_components/ContestTab/Contests";
import Activity from "../../_components/Activities/activity";
import Challenge from "../../_components/Challenges/page";
import Feedback from "../../_components/FeedbackTab/Feedback";
import RoadMap from "../../_components/RoadMapTab/RoadMap";
import About from "../../_components/About/page";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import CareerPath from "../../_components/CareerPathTab/CareerPath";
import Tests from "../../_components/TestTab/Tests";
import ViewResult from "../../_components/ViewResult/ViewResult";

function Page() {
  const [careerData, setCareerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roadMapLoading, setRoadMapLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [careerName, setCareerName] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [showFinalRoadMap, setShowFinalRoadMap] = useState(true);
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const router = useRouter();
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showRoadMapDetails, setShowRoadMapDetails] = useState(false);
  const t = useTranslations("CareerPage");
  const tabs = [
    { key: "roadmap", label: t("roadmap") },
    { key: "test", label: t("test") },
    { key: "careerPath", label: "Career Path" },
    { key: "feedback", label: t("feedback") },
    { key: "challenges", label: t("challenges") },
    { key: "careerOverview",label:"Career Overview"},
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
    if (careerData.length > 0) {
      setSelectedCareer(careerData[0]);
    }
  }, [careerData]);

  const handleCareerClick = (career) => {
    setSelectedCareer(career);
    setActiveTab("roadmap");
  };

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
        response.data &&
        response.data.carrerData.length > 0
      ) {
        setCareerData(response.data.carrerData);
        setAge(response.data.age);
      } else {
        toast.error("No career data available at the moment.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch career data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCareers();
  }, []);

  const handleAddCareerClick = () => {
    if (careerData.length >= 5) {
      toast.error("You can only add up to 5 careers.");
      return;
    }
    setShowDialogue(true);
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

  const MobileNavigation = dynamic(
    () => import("../../_components/Navbar/button.jsx"),
    { ssr: false }
  );

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <LoadingOverlay loadText={"Loading..."} />
      </div>
    );
  }

  return (
    <div className="mx-auto bg-white max-md:pb-7">
  <Toaster />

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

  {/* Mobile heading (only visible on mobile) */}
  <p className="text-center font-bold sm:hidden text-black text-2xl sm:text-4xl md:pl-5 md:mr-10 lg:pl-16 lg:mr-24 max-sm:bg-white max-sm:w-full max-md:py-2">
    {t("careers")}
  </p>

  {/* Desktop heading (only visible on desktop) */}
  <div className="flex flex-col pt-4 sm:flex-row justify-start sm:items-center items-start gap-4 sm:gap-5 lg:gap-10 text-white bg-gradient-to-r from-teal-200 to-orange-200 md:p-4 max-md:pb-4 sm:p-10 mb-5 overflow-x-scroll">
    <p className="text-center font-bold hidden sm:flex text-black text-2xl sm:text-4xl md:pl-5 md:mr-10 lg:pl-16 lg:mr-24 max-sm:bg-white max-sm:w-full max-md:py-2">
      {t("careers")}
    </p>

    <div className="flex gap-4 justify-start items-center max-md:pl-4 w-fit">
      {careerData.map((career, index) => (
        <div
          key={index}
          onClick={() => handleCareerClick(career)}
          className={`w-28 h-28 sm:w-32 sm:h-32 p-1 sm:p-2 shadow-xl rounded-xl flex justify-center items-center transition-transform transform hover:scale-[1.02] cursor-pointer duration-150 active:scale-95 ${
            selectedCareer && selectedCareer.id === career.id
              ? "bg-blue-100 border-2 border-blue-500"
              : "bg-white"
          }`}
        >
          <p className="text-center text-xs sm:text-sm font-bold text-blue-900 break-words overflow-hidden line-clamp-3">
            {career.career_name}
          </p>
        </div>
      ))}

      {roadMapLoading && (
        <div className="w-28 h-28 sm:w-32 sm:h-32 p-2 bg-white shadow-xl rounded-xl flex justify-center items-center transition-transform transform hover:scale-[1.02] cursor-pointer duration-150 active:scale-95">
          <p className="text-center text-xs sm:text-sm font-bold text-blue-900">
            {t("careerAdding")}
          </p>
        </div>
      )}

      <div
        className="w-28 h-28 sm:w-32 sm:h-32 p-2 shadow-sm rounded-xl bg-white max-md:rounded-xl flex justify-center items-center transition-transform transform hover:scale-[1.02] cursor-pointer duration-150 active:scale-95"
        onClick={handleAddCareerClick}
      >
        <PlusIcon className="text-gray-600 font-thin h-6 w-6 sm:h-8 sm:w-8" />
      </div>
    </div>
  </div>
  
  {/* Rest of the content */}
  {selectedCareer && (
    <div className="flex flex-col lg:flex-row px-4 md:px-20 gap-6 md:gap-10 py-6 md:py-10 bg-gradient-to-r from-sky-200 to-green-200">
      <div className="bg-white flex flex-col items-center w-full md:w-auto">
        <div className="flex justify-center w-full items-center py-4 md:py-10 px-4 md:w-56">
          <div className="text-xl md:text-xl text-black font-bold text-center w-full">
            <p className="flex justify-center items-center h-full overflow-hidden">
              <span className="line-clamp-3 break-words">
                {selectedCareer.career_name}
              </span>
            </p>
          </div>
        </div>

            <div className="flex flex-row lg:flex-col justify-start md:justify-center gap-2 md:gap-4 text-xs md:text-base w-full mb-4 overflow-x-scroll md:overflow-x-visible max-md:px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`${
                    activeTab === tab.key ? "bg-green-400" : "bg-neutral-300"
                  } text-black font-semibold py-2 px-3 md:py-4 md:px-4 whitespace-nowrap sm:w-full max-md:rounded`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-full flex flex-col">
            <div className="uppercase text-center text-white font-bold text-xl md:text-2xl bg-orange-400 py-3 md:py-5 border-4 border-white">
              {t(activeTab)}
            </div>
            <div className="text-center text-black text-lg md:text-xl py-3 md:py-5 mx-4 md:mx-10">
              {t("age")} : {age} - {age + 0.5}
              <span className="font-bold"></span>
            </div>
            {activeTab === "roadmap" && (
              <RoadMap selectedCareer={selectedCareer} />
            )}
            {activeTab === "careerPath" && (
              <CareerPath selectedCareer={selectedCareer} />
            )}
            {activeTab === "contests" && (
              <Contests selectedCareer={selectedCareer} />
            )}
            {/* {activeTab === "test" && <Tests selectedCareer={selectedCareer} />} */}
            {activeTab === "test" && (
              <Tests selectedCareer={selectedCareer}/>
            )}
            {activeTab === "feedback" && (
              <Feedback selectedCareer={selectedCareer} />
            )}
            {activeTab === "activities" && (
              <Activity selectedCareer={selectedCareer} />
            )}
            {activeTab === "challenges" && (
              <Challenge selectedCareer={selectedCareer} />
            )}
            {activeTab === "careerOverview" && (
              <About selectedCareer={selectedCareer} />
            )}
          </div>
        </div>
      )}
      <MobileNavigation />
    </div>
  );
}

export default Page;

"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { PlusIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AddCareer from '../../_components/AddCareer/AddCareer';
import { Chip } from "@nextui-org/chip";
import Tests from '../../_components/TestTab/Tests';
import Contests from '../../_components/ContestTab/Contests';
import Activity from '../../_components/Activities/activity';
import Challenge from '../../_components/Challenges/page';
import Feedback from "../../_components/FeedbackTab/Feedback";
import RoadMap from "../../_components/RoadMapTab/RoadMap";

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
  const router = useRouter();
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showRoadMapDetails, setShowRoadMapDetails] = useState(false);

  const handleRoadmapClick = () => {
    setShowRoadmap(!showRoadmap);
    setShowFeedback(false);
  };

  const handleShowRoadMapDetails = () => {
    setShowRoadMapDetails(!showRoadMapDetails);
  };

  const handleFeedbackClick = () => {
    setShowFinalRoadMap(false);
    setShowFeedback(true);
  };

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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      console.log("checkinggggg");

      if (!token) {
        // If there's no token, it means the user hasn't done anything yet, so we just return early.
        setIsLoading(false);
        return;
      }
  
      const response = await GlobalApi.GetCarrerData(token);
      if (response.status === 201 && response.data && response.data.length > 0) {
        console.log(response.data);
        setCareerData(response.data);
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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.SaveInterestedCareer(token, careerName, country);
      if (response && response.status === 200) {
        setCareerName("");
        setCountry("");
        getCareers();
      } else if (response && response.status === 201)  {
        // toast.error("Failed to save career data. Please try again later.");
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to save career data. Please try again later.");
    } finally {
      setRoadMapLoading(false);
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
    <div className="w-4/5 mx-auto">
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

      <p className="text-center text-white text-3xl mb-8">Careers</p>
      <div className="flex justify-start gap-2 text-white bg-gradient-to-r from-teal-200 to-orange-200 p-5 sm:p-10 rounded-xl mb-10 overflow-x-auto">
        {careerData.map((career, index) => (
          <div
            key={index}
            onClick={() => handleCareerClick(career)}
            className={`w-32 h-32 sm:w-48 sm:h-48 p-1 sm:p-2 shadow-xl rounded-xl flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150 active:scale-95 ${
              selectedCareer && selectedCareer.id === career.id
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-white"
            }`}
            style={{ minWidth: "8rem", minHeight: "8rem" }}
          >
            <p className="text-center text-sm sm:text-lg font-bold text-blue-900 mb-2 sm:mb-4">
              {career.career_name}
            </p>
          </div>
        ))}

        {roadMapLoading && (
          <div className="w-48 h-48 p-2 bg-white shadow-xl rounded-xl flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150 active:scale-95">
            <p className="text-center text-sm font-bold text-blue-900 mb-4">
              Career is being added. Please wait...
            </p>
          </div>
        )}

        <div
          className="w-32 h-32 sm:w-48 sm:h-48 p-2 sm:p-5 shadow-sm bg-white rounded-xl flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150 active:scale-95"
          onClick={handleAddCareerClick}
          style={{ minWidth: "8rem", minHeight: "8rem" }}
        >
          <PlusIcon className="text-gray-600 font-thin h-10 w-10 sm:h-20 sm:w-20" />
        </div>
      </div>

      {selectedCareer && (
        <>
          <div className="bg-teal-400 flex justify-center items-center h-24 rounded-sm mb-4">
            <h2 className="text-2xl text-black font-bold">
              {selectedCareer.career_name}
            </h2>
          </div>

          <div className="flex justify-center flex-wrap gap-4 mb-4">
            {["roadmap", "contests", "tests", "feedback", "activities", "challenges", "community"].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                    : "bg-green-500"
                } text-white font-bold py-2 px-4 rounded-full w-32`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {activeTab === "roadmap" && (
            <RoadMap selectedCareer={selectedCareer} />
          )}
          {activeTab === "contests" && <Contests selectedCareer={selectedCareer} />}
          {activeTab === "tests" && <Tests selectedCareer={selectedCareer} />}
          {activeTab === "feedback" && <Feedback selectedCareer={selectedCareer} />}
          {activeTab === "activities" && <Activity selectedCareer={selectedCareer} />}
          {activeTab === "challenges" && <Challenge selectedCareer={selectedCareer} />}
        </>
      )}
    </div>
  );
}

export default Page;

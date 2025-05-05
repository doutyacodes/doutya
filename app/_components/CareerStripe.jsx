"use client"
import React, { useContext, useEffect, useState } from "react";
import AddCareer from '../(innerPages)/dashboard/_components/AddCareer/AddCareer'
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { PlusIcon, LockIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { useTranslations } from "next-intl";
import FeatureRestrictionModal from "../(innerPages)/dashboard/_components/FeatureRestrictionModal/FeatureRestrictionModal";
import PricingCard from "./PricingCard";
import TestsNotCompltedWarning from "../(innerPages)/dashboard/_components/TestsNotCompltedWarning/TestsNotCompltedWarning";
import { useTopbar } from "../context/TopbarContext";


const CareerStripe = ({selectedItem, setSelectedItem}) => {
    const [scopeData, setScopeData] = useState([]);
    const [scopeType, setScopeType] = useState("career");
    const [isLoading, setIsLoading] = useState(false);
    const [showCareer, setShowCareer] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    // const [selectedItem, setSelectedItem] = useState(null);
    const [showDialogue, setShowDialogue] = useState(false);
    const [careerName, setCareerName] = useState("");
    const [roadMapLoading, setRoadMapLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("roadmap");
    const [age, setAge] = useState("");
    const [isTestCompleted, setIsTestCompleted] = useState("");
    const [country, setCountry] = useState("");
    const [isRestricted, setIsRestricted] = useState(false);
    const [showTestWarningModal, setShowTestWarningModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const router = useRouter();
    const t = useTranslations("CareerPage");
  
    const { refreshTopbar } = useTopbar();

    // Total number of boxes will be 5
    const totalBoxes = 5;

    const pathname = usePathname();
  
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
        if (scopeData.length > 0) {
          setSelectedItem(scopeData[0]);
        }
      }, [scopeData]);
    
      const getScopeData = async () => {
        setIsLoading(true);
        try {
          const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;
          if (!token) {
            setIsLoading(false);
            return;
          }
    
          const response = await GlobalApi.GetCarrerData(token);

          if (response.status === 201 && response.data) {
            if(response.data.scopeData && response.data.scopeData.length > 0){
              setScopeData(response.data.scopeData);
            }
            setScopeType(response.data.type || "career");
            setAge(response.data.age);
            setIsTestCompleted(response.data.quizStatus)
            if (response.data.age <= "9" || response.data.planType === "base"){
              setIsRestricted(true)
            }
          }
        } catch (err) {
          toast.error(`Failed to fetch ${getScopeName()} data. Please try again later.`);
        } finally {
          setIsLoading(false);
        }
      };
    
      useEffect(() => {
        getScopeData();
      }, []);

      useEffect(() => {
        // Refresh data here
        getScopeData();
      }, [refreshTopbar]);

      // Helper function to get proper display name based on scope type
      const getScopeName = () => {
        switch(scopeType) {
          case "sector":
            return "Sectors";
          case "cluster":
            return "Clusters";
          case "career":
          default:
            return "Careers";
        }
      };

      // const handleAddItemClick = () => {
      //   if (isTestCompleted == "not_completed") {
      //     setShowTestWarningModal(true);
      //   }
      //   else if (isRestricted) {
      //     setShowFeatureModal(true);
      //   } else {
      //     if (scopeData.length >= 5) {
      //       toast.error(`You can only add up to 5 ${getScopeName().toLowerCase()}.`);
      //       return;
      //     }
      //     setShowDialogue(true);
      //   }
      // };
    
      const handleAddItemClick = () => {
        if (isTestCompleted == "not_completed") {
          setShowTestWarningModal(true);
        }
        else if (isRestricted) {
          setShowFeatureModal(true);
        } else {
          if (scopeData.length >= 5) {
            toast.error(`You can only add up to 5 ${getScopeName().toLowerCase()}.`);
            return;
          }
          
          // Navigate based on scopeType
          if (scopeType === "career") {
            setShowDialogue(true);
          } else if (scopeType === "sector") {
            router.push("/dashboard_kids/sector-suggestion");
          } else if (scopeType === "cluster") {
            router.push("/dashboard_junior/cluster-suggestion");
          }
        }
      };
      
      const handleItemClick = (item) => {
        setSelectedItem(item);
        setActiveTab("roadmap");
        if (pathname !== "/dashboard/careers/career-guide") {
          router.push("/dashboard/careers/career-guide");
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
            getScopeData();
          } else if (response && response.status === 201)  {
            toast.error(response.data.message);
          }
        } catch (error) {
          toast.error(`Failed to save ${getScopeName().toLowerCase()} data. Please try again later.`);
        } finally {
          setRoadMapLoading(false);
        }
      };


        // Render item or disabled box based on restriction
        const renderItemBox = (item, index) => {
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
          
          // Regular boxes for selected items
          if (item) {
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-28 h-28 flex justify-center items-center sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg transition-transform transform hover:scale-105 cursor-pointer duration-150 ${
                  selectedItem?.id === item.id
                    ? "bg-gray-700 border-2 border-blue-500"
                    : "bg-gray-800"
                }`}
              >
                <p className="text-center text-xs sm:text-sm font-bold text-white">
                  {item.name}
                </p>
              </div>
            );
          }
          
          // Plus button for adding new items
          return (
            <div
              key={`plus-${index}`}
              className="w-28 h-28 sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg bg-gray-700 flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150"
              onClick={handleAddItemClick}
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
    <div className="w-full">
      <Toaster />

      {!isRestricted && (
        <AddCareer
          isOpen={showDialogue}
          onClose={() => setShowDialogue(false)}
          getCareers={getScopeData}
          setCareerName={setCareerName}
          careerName={careerName}
          setCountry={setCountry}
          country={country}
          handleSubmit={handleSubmit}
          roadMapLoading={roadMapLoading}
          scopeType={scopeType}
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
        My {getScopeName()}
      </p>

      {/* Item Selector for Desktop */}
      <div className="flex flex-col pt-4 px-6 md:px-24 sm:flex-row justify-start sm:items-center items-start gap-4 text-white bg-[#2c2c2c] sm:p-10 mb-5 overflow-x-scroll">
        <p className="text-center font-bold hidden sm:flex text-white text-3xl">
          My {getScopeName()}
        </p>
      
      <div className="flex gap-4 justify-start items-center max-md:pl-4 w-fit pb-2">
        {/* Render 5 total boxes */}
        {Array(totalBoxes).fill(null).map((_, index) => 
          renderItemBox(scopeData && index < scopeData.length ? scopeData[index] : null, index)
        )}
      </div>
    </div>

    </div>
  )
}

export default CareerStripe
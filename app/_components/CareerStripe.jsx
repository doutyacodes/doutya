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
                className="group relative w-32 h-20 lg:w-36 lg:h-24 cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-600/40 to-gray-800/40 rounded-xl backdrop-blur-sm border border-gray-600/30"></div>
                <div className="relative h-full flex flex-col items-center justify-center text-center space-y-1 opacity-50">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <LockIcon className="text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 leading-tight px-1">
                    Pro Users Only
                  </p>
                </div>
              </div>
            );
          }
          
          // Regular boxes for selected items
          if (item) {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group relative w-32 h-20 lg:w-36 lg:h-24 cursor-pointer"
              >
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-400/60 shadow-lg shadow-blue-500/20' 
                    : 'bg-gradient-to-br from-gray-700/60 to-gray-800/60 border border-gray-600/40 group-hover:from-gray-600/60 group-hover:to-gray-700/60 group-hover:border-gray-500/60 group-hover:shadow-lg'
                }`}></div>
                
                <div className="relative h-full flex items-center justify-center p-2 transition-all duration-300 group-hover:scale-105 overflow-hidden">
                  <p className={`text-center text-xs lg:text-sm font-bold whitespace-nowrap transition-colors duration-300 px-1 overflow-x-auto scrollbar-hide max-w-full ${
                    isSelected 
                      ? 'text-blue-200' 
                      : 'text-gray-200 group-hover:text-white'
                  }`}>
                    {item.career_name || item.name}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
                
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </div>
            );
          }
          
          // Plus button for adding new items
          return (
            <div
              key={`plus-${index}`}
              className="group relative w-32 h-20 lg:w-36 lg:h-24 cursor-pointer"
              onClick={handleAddItemClick}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700/60 to-gray-800/60 border border-gray-600/40 rounded-xl transition-all duration-300 group-hover:from-green-600/20 group-hover:to-emerald-600/20 group-hover:border-green-500/50 group-hover:shadow-lg group-hover:shadow-green-500/20"></div>
              
              <div className="relative h-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <div className="p-2.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                  <PlusIcon className="text-green-400 h-5 w-5 lg:h-6 lg:w-6 group-hover:text-green-300 transition-colors duration-300" />
                </div>
              </div>
              
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-md whitespace-nowrap">
                  <p className="text-xs text-gray-300">Add {getScopeName().slice(0, -1)}</p>
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
    <div className="w-full relative">
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

      {/* Modern Career Stripe Container */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 via-gray-700/30 to-gray-800/50"></div>
        
        {/* Main container */}
        <div className="relative backdrop-blur-sm bg-gray-800/60 border-y border-gray-700/30 shadow-2xl">
          <div className="px-3 py-4 lg:px-6 lg:py-5">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
              <div className="text-center lg:text-left">
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  My {getScopeName()}
                </h2>
                <p className="text-xs lg:text-sm text-gray-400 mt-1">
                  Select or add your {getScopeName().toLowerCase()} to get started
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2 max-lg:hidden">
                <div className="flex gap-1">
                  {Array(totalBoxes).fill(null).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index < scopeData.length 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                          : 'bg-gray-600/50'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 ml-2">
                  {scopeData.length}/{totalBoxes}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:hidden justify-center mb-2">
                <div className="flex gap-1">
                  {Array(totalBoxes).fill(null).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index < scopeData.length 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                          : 'bg-gray-600/50'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 ml-2">
                  {scopeData.length}/{totalBoxes}
                </span>
              </div>

            {/* Career Items Container */}
            <div className="relative">
              <div className="flex gap-3 lg:gap-4 justify-start items-center overflow-x-auto scrollbar-hide pb-2">
                {/* Render 5 total boxes */}
                {Array(totalBoxes).fill(null).map((_, index) => 
                  renderItemBox(scopeData && index < scopeData.length ? scopeData[index] : null, index)
                )}
              </div>
              
              {/* Scroll indicators */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-800/60 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-800/60 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CareerStripe
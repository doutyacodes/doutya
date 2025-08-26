"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaCheck, FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import CareerStripe from "@/app/_components/CareerStripe";
import ActionButtons from "@/app/_components/ActionButtons";

export default function SectorSelectionPage() {
  const [user, setUser] = useState({
    personality_type: "",
    plan_type: "base"
  });
  const [sectors, setSectors] = useState([]);
  const [matchingSectors, setMatchingSectors] = useState([]);
  const [otherSectors, setOtherSectors] = useState([]);
  const [userSectors, setUserSectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingSector, setConfirmingSector] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const router = useRouter();
  
  // Get token from localStorage when component mounts
  const [token, setToken] = useState("");
  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);
  
  const maxSelections = user.plan_type === "base" ? 2 : 5;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user data in a single call
        const userDataResponse = await fetch("/api/sectors/career-data", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!userDataResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const userData = await userDataResponse.json();
        
        setUser({
          personality_type: userData.personality_type || "",
          plan_type: userData.plan_type || "base"
        });
        
        // Continue with sectors data fetching
        const sectorsResponse = await fetch("/api/sectors", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        
        const mbtiMappingResponse = await fetch(`/api/sectors/mbti-sectors/${userData.personality_type}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        
        const userSectorsResponse = await fetch("/api/sectors/user-sectors", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        
        if (!sectorsResponse.ok || !mbtiMappingResponse.ok || !userSectorsResponse.ok) {
          throw new Error("Failed to fetch data");
        }
        
        const sectorsData = await sectorsResponse.json();
        const mbtiMappingData = await mbtiMappingResponse.json();
        const userSectorsData = await userSectorsResponse.json();
        
        // Get matching sectors based on personality type
        const matchingSectorIds = [
          mbtiMappingData.sector_1_id,
          mbtiMappingData.sector_2_id,
          mbtiMappingData.sector_3_id
        ];
        
        const matchingSectorsList = sectorsData.filter(sector => 
          matchingSectorIds.includes(sector.id)
        );
        
        const otherSectorsList = sectorsData.filter(sector => 
          !matchingSectorIds.includes(sector.id)
        );
        
        setSectors(sectorsData);
        setMatchingSectors(matchingSectorsList);
        setOtherSectors(otherSectorsList);
        setUserSectors(userSectorsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load sectors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleAddSector = (sector) => {
    setConfirmingSector(sector);
  };

  const isSectorSelected = (sectorId) => {
    return userSectors.some(s => s.sector_id === sectorId);
  };

  
  const handleViewReportClick = () => {
    router.push('/user/results');
  };

  const handleCertificateClick = () => {
    // Add certificate logic later
    console.log('Get Certificate clicked');
  };


  const confirmAddSector = async () => {
    if (!confirmingSector) return;
  
    // Check if sector is already added
    if (userSectors.some(s => s.sector_id === confirmingSector.id)) {
      toast.error(`${confirmingSector.name} is already in your selected sectors.`)
      setConfirmingSector(null);
      return;
    }
  
    // Check if adding would exceed plan limits
    if (userSectors.length >= maxSelections) {
      toast.error(user.plan_type === "base" 
        ? "Base plan users can only select up to 2 sectors. Upgrade to Pro to select up to 5 sectors."
        : "You can select up to 5 sectors maximum.")
      setConfirmingSector(null);
      return;
    }
  
    try {
      const response = await fetch("/api/sectors/user-sectors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sectors: [{
            sector_id: confirmingSector.id,
            mbti_type: user.personality_type // Updated from mbti_type to personality_type
          }]
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save sector");
      }
  
      // Update local state
      setUserSectors([...userSectors, {
        sector_id: confirmingSector.id,
        mbti_type: user.personality_type, // Updated from mbti_type to personality_type
        name: confirmingSector.name
      }]);

      toast.success(`${confirmingSector.name} has been added to your career sectors.`)
  
      // If this is the first sector added, redirect to career guide page
      if (userSectors.length === 0) {
        router.push("/dashboard/careers/career-guide");
      }
    } catch (err) {
      console.error("Error saving sector:", err);
      toast.error(err.message || "Failed to save sector. Please try again.")
    } finally {
      setConfirmingSector(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a24]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7824f6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a24]">
        <div className="text-center p-6 bg-[#292931] rounded-lg">
          <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#7824f6] text-white rounded hover:bg-[#6620d0]"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CareerStripe selectedItem={selectedCareer} setSelectedItem={setSelectedCareer}/>
<div className="min-h-screen bg-[#1a1a24] text-gray-200 p-4 md:p-8">
  <div className="max-w-7xl mx-auto">
    <div className="mb-8">
      {/* Title and Buttons on Same Line */}
      <div className="relative flex items-center mb-4">
        {/* Left spacer for balance */}
        <div className="hidden sm:block flex-1"></div>
        
        {/* Centered Title */}
        <div className="flex-1 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Career Sector Selection</h1>
        </div>
        
        {/* Right side buttons */}
        <div className="flex-1 flex justify-center sm:justify-end">
          <ActionButtons
            onViewReportClick={handleViewReportClick}
            onCertificateClick={handleCertificateClick}
          />
        </div>
      </div>
      
      {/* Subtitle and Description - Centered */}
      <div className="text-center">
        <p className="text-lg text-gray-300 mb-2">
          Based on your personality assessment results
        </p>
        <p className="text-gray-400">
          Select sectors that interest you 
          {user.plan_type === "base" && (
            <span className="text-sm ml-1 text-yellow-400">
              (Base plan: up to 2 sectors | Pro plan: up to 5 sectors)
            </span>
          )}
        </p>
        <div className="mt-4 bg-[#292931] py-2 px-4 rounded-lg inline-block">
          <p className="text-sm">
            Selected: <span className="font-bold text-[#7824f6]">{userSectors.length}</span> / 
            <span className="font-bold">{maxSelections}</span>
          </p>
        </div>
      </div>
    </div>

          {/* Matching Sectors Section - Updated title */}
          <div className="mb-10">
              <div className="flex items-center mb-6">
                  <div className="h-px flex-1 bg-[#7824f6]"></div>
                  <h2 className="text-2xl font-bold mx-4 text-[#7824f6]">Recommended Sectors For You</h2>
                  <div className="h-px flex-1 bg-[#7824f6]"></div>
              </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingSectors.map((sector) => (
                  <SectorCard 
                      key={sector.id} 
                      sector={sector} 
                      isSelected={isSectorSelected(sector.id)}
                      onAddClick={() => handleAddSector(sector)}
                      recommended={true}
                      accentColor="#7824f6"
                  />
                  ))}
              </div>
          </div>

          {/* Other Sectors Section - With added explanation */}
          <div className="mb-10">
          <div className="flex items-center mb-6">
              <div className="h-px flex-1 bg-gray-700"></div>
              <h2 className="text-2xl font-bold mx-4 text-gray-400">Other Available Sectors</h2>
              <div className="h-px flex-1 bg-gray-700"></div>
          </div>
          
          <p className="text-gray-400 text-center mb-6">
              These sectors may not directly align with your personality assessment results, but you can still explore and add them if they interest you.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {otherSectors.map((sector) => (
              <SectorCard 
                  key={sector.id} 
                  sector={sector} 
                  isSelected={isSectorSelected(sector.id)}
                  onAddClick={() => handleAddSector(sector)}
                  recommended={false}
                  accentColor="#4a4a57"
              />
              ))}
          </div>
          </div>
        </div>

          {/* Confirmation Modal */}
          {confirmingSector && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#292931] rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Add Sector</h3>
              <p className="text-gray-300 mb-6">
                  Are you sure you want to add <span className="font-bold text-[#7824f6]">{confirmingSector.name}</span> to your selected sectors?
              </p>
              {user.plan_type === 'base' && userSectors.length >= 2 && (
                  <div className="mb-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-400 text-sm flex items-start">
                      <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
                      <span>Base plan users can only add up to 2 sectors. Upgrade to Pro to add up to 5 sectors.</span>
                  </p>
                  </div>
              )}
              <div className="flex gap-3 justify-end">
                  <button
                  onClick={() => setConfirmingSector(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                  >
                  Cancel
                  </button>
                  <button
                  onClick={confirmAddSector}
                  className="px-4 py-2 bg-[#7824f6] hover:bg-[#6620d0] text-white rounded-md transition-colors flex items-center gap-2"
                  >
                  <span>Confirm</span>
                  <FaCheck size={12} />
                  </button>
              </div>
              </div>
          </div>
          )}
      </div>
    </>
  );
}

function SectorCard({ sector, isSelected, onAddClick, recommended, accentColor }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Truncate description for compact view
    const shortDescription = sector.description 
      ? (sector.description.length > 60 
          ? sector.description.substring(0, 60) + "..." 
          : sector.description)
      : "Discover career opportunities, growth outlook, and required skills in this sector...";
    
    return (
      <div 
        className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-b-4 ${
          isSelected 
            ? "bg-[#292931] border-green-500" 
            : `bg-[#292931]`
        }`}
        style={{ borderColor: isSelected ? "#10b981" : accentColor }}
      >
        <div 
          className="h-20 flex items-center justify-center p-4 relative"
          style={{ backgroundColor: isSelected ? "#2a3a31" : "#35354a" }}
        >
          {recommended && !isSelected && (
            <div className="absolute top-0 right-0">
              <div 
                className="text-xs font-bold px-2 py-1 text-white"
                style={{ backgroundColor: accentColor }}
              >
                Recommended
              </div>
            </div>
          )}
          
          {isSelected && (
            <div className="absolute top-0 right-0">
              <div className="bg-green-500 text-xs font-bold px-2 py-1 text-white flex items-center gap-1">
                <FaCheck size={10} />
                <span>Selected</span>
              </div>
            </div>
          )}
          
          <h4 className="text-white text-lg font-bold text-center">
            {sector.name}
          </h4>
        </div>
        
        <div className="p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-b from-[#292931] to-[#232329]">
          <div className={`mb-3 ${isExpanded ? "h-auto" : "h-16"}`}>
            <p className="text-gray-300 text-sm mb-2">
              {isExpanded ? sector.description : shortDescription}
            </p>
            
            {sector.description && sector.description.length > 60 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-[#7824f6] hover:underline flex items-center"
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Read more</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="w-full flex justify-end mt-auto">
            {!isSelected ? (
              <button
                onClick={onAddClick}
                className="bg-[#7824f6] hover:bg-[#6620d0] rounded-md px-4 py-2 flex gap-2 items-center transition-all duration-200 shadow-md"
                style={{ backgroundColor: recommended ? "#7824f6" : "#4a4a57" }}
              >
                <p className="text-sm text-white font-medium">
                  Add to My Sectors
                </p>
                <FaChevronRight size={12} color="white" />
              </button>
            ) : (
              <div className="px-4 py-2 bg-green-900 bg-opacity-30 rounded-md flex gap-2 items-center">
                <p className="text-sm text-green-400 font-medium">
                  Added to Your Sectors
                </p>
                <FaCheck size={12} color="#10b981" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
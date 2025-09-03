"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaCheck, FaInfoCircle, FaStar, FaMedal, FaTrophy } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import CareerStripe from "@/app/_components/CareerStripe";
import ActionButtons from "@/app/_components/ActionButtons";

export default function SectorSelectionPage() {
  const [user, setUser] = useState({
    personality_type: "",
    plan_type: "base"
  });
  const [sectors, setSectors] = useState([]);
  const [sortedSectors, setSortedSectors] = useState([]);
  const [personalitySummary, setPersonalitySummary] = useState("");
  const [developmentNotes, setDevelopmentNotes] = useState("");
  const [userProfile, setUserProfile] = useState(null);
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
        
        // Fetch user data
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
        
        // Fetch AI-powered sorted sectors
        const sortedSectorsResponse = await fetch("/api/sectors/sorted-sectors", {
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
        
        if (!sortedSectorsResponse.ok || !userSectorsResponse.ok) {
          throw new Error("Failed to fetch sectors data");
        }
        
        const sortedSectorsData = await sortedSectorsResponse.json();
        const userSectorsData = await userSectorsResponse.json();
        
        // Set sorted sectors data
        setSortedSectors(sortedSectorsData.sorted_sectors || []);
        setPersonalitySummary(sortedSectorsData.personality_summary || "");
        setDevelopmentNotes(sortedSectorsData.development_notes || "");
        setUserProfile(sortedSectorsData.user_profile || null);
        setUserSectors(userSectorsData);
        
        // Extract all sectors for reference
        const allSectors = sortedSectorsData.sorted_sectors.map(s => s.sector_details).filter(Boolean);
        setSectors(allSectors);
        
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

  const handleAddSector = (sortedSector) => {
    setConfirmingSector(sortedSector);
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
  
    const sectorDetails = confirmingSector.sector_details;
    if (!sectorDetails) return;
  
    // Check if sector is already added
    if (userSectors.some(s => s.sector_id === sectorDetails.id)) {
      toast.error(`${sectorDetails.name} is already in your selected sectors.`)
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
            sector_id: sectorDetails.id,
            mbti_type: user.personality_type
          }]
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save sector");
      }
  
      // Update local state
      setUserSectors([...userSectors, {
        sector_id: sectorDetails.id,
        mbti_type: user.personality_type,
        name: sectorDetails.name
      }]);

      toast.success(`${sectorDetails.name} has been added to your career sectors.`)
  
      // If this is the first sector added, redirect to career guide page
      if (userSectors.length === 0) {
        router.push("/dashboard_kids");
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
<div className="min-h-screen bg-gradient-to-br from-[#1a1a24] via-[#1e1e2e] to-[#1a1a24] text-gray-200 p-4 md:p-8 relative overflow-hidden">
  {/* Animated background elements */}
  <div className="fixed inset-0 pointer-events-none">
    <motion.div
      className="absolute top-20 left-10 w-72 h-72 bg-[#7824f6]/5 rounded-full blur-3xl"
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
        scale: [1, 1.2, 1]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute bottom-20 right-10 w-96 h-96 bg-[#06ffa5]/5 rounded-full blur-3xl"
      animate={{
        x: [0, -80, 0],
        y: [0, -60, 0],
        scale: [1.2, 1, 1.2]
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#ff6b6b]/5 rounded-full blur-3xl"
      animate={{
        x: [-50, 50, -50],
        y: [-30, 30, -30],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </div>
  
  <div className="max-w-7xl mx-auto relative z-10">
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title and Buttons on Same Line */}
      <div className="relative flex items-center mb-4">
        {/* Left spacer for balance */}
        <div className="hidden sm:block flex-1"></div>
        
        {/* Centered Title */}
        <div className="flex-1 text-center">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            AI-Powered Career Sector Selection
          </motion.h1>
        </div>
        
        {/* Right side buttons */}
        <motion.div 
          className="flex-1 flex justify-center sm:justify-end"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ActionButtons
            onViewReportClick={handleViewReportClick}
            onCertificateClick={handleCertificateClick}
          />
        </motion.div>
      </div>
      
      {/* Subtitle and Description - Centered */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.p 
          className="text-lg text-gray-300 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Intelligently sorted based on your personality assessment results
        </motion.p>
        {userProfile && (
          <motion.div 
            className="mb-2 text-sm text-gray-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span className="text-[#7824f6] font-bold">Personality Assessment Completed</span> • 
            <span className="text-[#7824f6] font-bold ml-1">Interest Assessment Completed</span> • 
            Class <span className="text-[#7824f6] font-bold">{userProfile.class_level}</span>
          </motion.div>
        )}
        <motion.p 
          className="text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Select sectors that interest you 
          {user.plan_type === "base" && (
            <span className="text-sm ml-1 text-yellow-400">
              (Base plan: up to 2 sectors | Pro plan: up to 5 sectors)
            </span>
          )}
        </motion.p>
        <motion.div 
          className="mt-4 bg-gradient-to-r from-[#292931] to-[#2d2d3a] py-2 px-4 rounded-xl inline-block border border-gray-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-sm">
            Selected: <span className="font-bold text-[#7824f6]">{userSectors.length}</span> / 
            <span className="font-bold">{maxSelections}</span>
          </p>
        </motion.div>
        
        {/* Personality Summary */}
        {personalitySummary && (
          <motion.div 
            className="mt-6 bg-gradient-to-r from-[#292931] to-[#2d2d3a] p-4 rounded-xl max-w-2xl mx-auto border border-gray-800 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.h3 
              className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7824f6] to-[#9d4edd] mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              Your Personality Profile
            </motion.h3>
            <motion.p 
              className="text-sm text-gray-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              {personalitySummary}
            </motion.p>
          </motion.div>
        )}
        
        {/* Development Notes */}
        {developmentNotes && (
          <motion.div 
            className="mt-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/50 p-4 rounded-xl max-w-2xl mx-auto backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaInfoCircle className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
              </motion.div>
              <div>
                <motion.h4 
                  className="text-blue-400 font-bold text-sm mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  Age-Appropriate Guidance
                </motion.h4>
                <motion.p 
                  className="text-xs text-blue-300"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  {developmentNotes}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>

          {/* AI-Sorted Sectors Section */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                  <div className="relative inline-block">
                      <motion.h2 
                        className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7824f6] via-[#9d4edd] to-[#c77dff] mb-2"
                        animate={{ 
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        style={{
                          backgroundSize: "200% 200%"
                        }}
                      >
                        Top 3 Recommended Sectors
                      </motion.h2>
                      <motion.div
                        className="absolute -inset-4 bg-gradient-to-r from-[#7824f6]/20 to-[#c77dff]/20 rounded-lg blur-xl"
                        animate={{ 
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                  </div>
                  <motion.p 
                    className="text-gray-300 text-lg mt-4 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                      Your personalized career sectors, ranked by compatibility with your unique personality profile
                  </motion.p>
              </motion.div>
          
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  <AnimatePresence>
                      {sortedSectors.slice(0, 3).map((sortedSector, index) => (
                      <motion.div
                        key={sortedSector.sector_details?.id || index}
                        initial={{ opacity: 0, y: 50, rotateY: 10 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        exit={{ opacity: 0, y: -50, rotateY: -10 }}
                        transition={{ 
                          duration: 0.7, 
                          delay: index * 0.2,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          y: -10,
                          transition: { duration: 0.2 }
                        }}
                      >
                          <ModernSectorCard 
                              sortedSector={sortedSector}
                              sector={sortedSector.sector_details} 
                              isSelected={isSectorSelected(sortedSector.sector_details?.id)}
                              onAddClick={() => handleAddSector(sortedSector)}
                              rank={sortedSector.rank}
                              suitabilityScore={sortedSector.suitability_score}
                              reasoning={sortedSector.reasoning}
                              index={index}
                          />
                      </motion.div>
                      ))}
                  </AnimatePresence>
              </div>
          </motion.div>
        </div>

          {/* Confirmation Modal */}
          {confirmingSector && confirmingSector.sector_details && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#292931] rounded-xl p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-white mb-4">Add Sector</h3>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#7824f6] text-white text-xs font-bold px-2 py-1 rounded">
                    Rank #{confirmingSector.rank}
                  </span>
                  <span className="bg-green-900 bg-opacity-50 text-green-400 text-xs font-bold px-2 py-1 rounded">
                    {confirmingSector.suitability_score}% Match
                  </span>
                </div>
                <p className="text-gray-300 mb-3">
                    Are you sure you want to add <span className="font-bold text-[#7824f6]">{confirmingSector.sector_details.name}</span> to your selected sectors?
                </p>
                <div className="bg-[#1a1a24] p-3 rounded-lg">
                  <h4 className="text-sm font-bold text-[#7824f6] mb-1">Why this fits you:</h4>
                  <p className="text-xs text-gray-400">{confirmingSector.reasoning}</p>
                </div>
              </div>
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

function SectorCard({ 
  sector, 
  sortedSector,
  isSelected, 
  onAddClick, 
  recommended, 
  accentColor,
  rank,
  suitabilityScore,
  reasoning 
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!sector) return null;
    
    // Use comprehensive description from new data
    const fullDescription = sector.description || sector.brief_overview || "Discover career opportunities, growth outlook, and required skills in this sector...";
    const shortDescription = fullDescription.length > 80 
      ? fullDescription.substring(0, 80) + "..." 
      : fullDescription;
    
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
          className="h-24 flex items-center justify-center p-4 relative"
          style={{ backgroundColor: isSelected ? "#2a3a31" : "#35354a" }}
        >
          {/* Rank Badge */}
          {rank && (
            <div className="absolute top-0 left-0">
              <div 
                className="text-xs font-bold px-2 py-1 text-white rounded-br"
                style={{ backgroundColor: recommended ? "#7824f6" : "#4a4a57" }}
              >
                #{rank}
              </div>
            </div>
          )}
          
          {/* Suitability Score */}
          {suitabilityScore && !isSelected && (
            <div className="absolute top-0 right-0">
              <div className="bg-green-900 bg-opacity-70 text-green-400 text-xs font-bold px-2 py-1 text-white rounded-bl">
                {suitabilityScore}% Match
              </div>
            </div>
          )}
          
          {isSelected && (
            <div className="absolute top-0 right-0">
              <div className="bg-green-500 text-xs font-bold px-2 py-1 text-white flex items-center gap-1 rounded-bl">
                <FaCheck size={10} />
                <span>Selected</span>
              </div>
            </div>
          )}
          
          <h4 className="text-white text-lg font-bold text-center">
            {sector.name}
          </h4>
        </div>
        
        <div className="p-5 flex flex-col justify-between min-h-[180px] bg-gradient-to-b from-[#292931] to-[#232329]">
          <div className={`mb-3 ${isExpanded ? "h-auto" : "h-20"}`}>
            <p className="text-gray-300 text-sm mb-2">
              {isExpanded ? fullDescription : shortDescription}
            </p>
            
            {reasoning && isExpanded && (
              <div className="mt-3 p-2 bg-[#1a1a24] rounded text-xs">
                <span className="font-bold text-[#7824f6]">Why this fits you: </span>
                <span className="text-gray-400">{reasoning}</span>
              </div>
            )}
            
            {fullDescription.length > 80 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-[#7824f6] hover:underline flex items-center mt-1"
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
                    <span>Learn more</span>
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
                className="hover:bg-opacity-80 rounded-md px-4 py-2 flex gap-2 items-center transition-all duration-200 shadow-md"
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

function ModernSectorCard({ 
  sector, 
  sortedSector,
  isSelected, 
  onAddClick, 
  rank,
  suitabilityScore,
  reasoning,
  index
}) {
    if (!sector) return null;
    
    // Define unique colors and icons for each position
    const cardConfigs = [
        {
            gradient: "from-[#7824f6] to-[#9d4edd]",
            bgGradient: "from-[#7824f6]/10 to-[#9d4edd]/10",
            borderGlow: "shadow-[0_0_30px_rgba(120,36,246,0.3)]",
            icon: FaTrophy,
            badge: "BEST MATCH",
            badgeColor: "bg-gradient-to-r from-[#7824f6] to-[#9d4edd]"
        },
        {
            gradient: "from-[#06ffa5] to-[#00d4aa]",
            bgGradient: "from-[#06ffa5]/10 to-[#00d4aa]/10",
            borderGlow: "shadow-[0_0_30px_rgba(6,255,165,0.3)]",
            icon: FaMedal,
            badge: "EXCELLENT",
            badgeColor: "bg-gradient-to-r from-[#06ffa5] to-[#00d4aa]"
        },
        {
            gradient: "from-[#ff6b6b] to-[#ffa726]",
            bgGradient: "from-[#ff6b6b]/10 to-[#ffa726]/10",
            borderGlow: "shadow-[0_0_30px_rgba(255,107,107,0.3)]",
            icon: FaStar,
            badge: "GREAT FIT",
            badgeColor: "bg-gradient-to-r from-[#ff6b6b] to-[#ffa726]"
        }
    ];
    
    const config = cardConfigs[index] || cardConfigs[0];
    const IconComponent = config.icon;
    
    const fullDescription = sector.description || sector.brief_overview || "Discover career opportunities, growth outlook, and required skills in this sector...";
    
    return (
      <motion.div 
        className={`relative group cursor-pointer ${config.borderGlow}`}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated border */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${config.gradient} p-[2px] opacity-0 group-hover:opacity-100`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isSelected ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full h-full rounded-2xl bg-[#1a1a24]" />
        </motion.div>
        
        {/* Main card */}
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm border border-gray-800 group-hover:border-gray-700 transition-all duration-300`}>
          {/* Header with rank and icon */}
          <div className="relative h-32 flex items-center justify-center overflow-hidden">
            {/* Background pattern */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "200% 200%" }}
            />
            
            {/* Rank badge */}
            <motion.div 
              className={`absolute top-4 left-4 ${config.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.1 + 0.5,
                type: "spring",
                stiffness: 200
              }}
            >
              <IconComponent size={10} />
              <span>{config.badge}</span>
            </motion.div>
            
            {/* Match percentage */}
            {suitabilityScore && (
              <motion.div 
                className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.7 }}
              >
                {suitabilityScore}%
              </motion.div>
            )}
            
            {/* Sector name */}
            <motion.h3 
              className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${config.gradient} text-center px-4`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {sector.name}
            </motion.h3>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Complete Sector Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.9 }}
              className="space-y-4"
            >
              {/* About This Sector */}
              <div>
                <h4 className={`text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                  About This Sector:
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {fullDescription}
                </p>
              </div>

              {/* Additional sector details if available */}
              {sector.overview && sector.overview !== fullDescription && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                    Overview:
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {sector.overview}
                  </p>
                </div>
              )}

              {/* Key areas or specializations */}
              {sector.key_areas && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                    Key Areas:
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {Array.isArray(sector.key_areas) ? sector.key_areas.join(', ') : sector.key_areas}
                  </p>
                </div>
              )}

              {/* Career opportunities */}
              {sector.career_opportunities && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                    Career Opportunities:
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {sector.career_opportunities}
                  </p>
                </div>
              )}

              {/* Growth outlook */}
              {sector.growth_outlook && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                    Growth Outlook:
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {sector.growth_outlook}
                  </p>
                </div>
              )}
            </motion.div>
            
            {/* Why this fits section */}
            {reasoning && (
              <motion.div 
                className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 1.1 }}
              >
                <h4 className={`text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                  Why this fits you perfectly:
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {reasoning}
                </p>
              </motion.div>
            )}
            
            {/* Action button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 1.3 }}
            >
              {!isSelected ? (
                <motion.button
                  onClick={onAddClick}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg hover:shadow-${config.gradient}/25 transition-all duration-300 flex items-center justify-center gap-2 group`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Add to My Sectors</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <FaChevronRight size={14} />
                  </motion.div>
                </motion.button>
              ) : (
                <div className="w-full py-3 px-4 rounded-xl font-semibold text-green-400 bg-green-500/10 border border-green-500/30 flex items-center justify-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <FaCheck size={14} />
                  </motion.div>
                  <span>Added to Your Sectors</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }
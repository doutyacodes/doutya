"use client";
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
  
  const maxSelections = 3;

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
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardUrl", "/dashboard_kids/sector-suggestion");
    }
    router.push('/user/results');
  };

  const confirmAddSector = async () => {
    if (!confirmingSector) return;
  
    const sectorDetails = confirmingSector.sector_details;
    if (!sectorDetails) return;
  
    // Check if sector is already added
    if (userSectors.some(s => s.sector_id === sectorDetails.id)) {
      toast.error(`${sectorDetails.name} is already in your selected sectors.`);
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

      toast.success(`${sectorDetails.name} has been added to your career sectors.`);
  
      // If this is the first sector added, redirect to career guide page
      if (userSectors.length === 0) {
        router.push("/dashboard_kids");
      }
    } catch (err) {
      console.error("Error saving sector:", err);
      toast.error(err.message || "Failed to save sector. Please try again.");
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
          {/* Header Row: Title, Metadata, Counter & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Career Sector Recommendations
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-medium">
                  AI Assessed
                </span>
                {userProfile?.class_level && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 font-medium">
                    Class {userProfile.class_level}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Personalized sectors ranked by compatibility with your personality & interest profile
              </p>
            </div>

            {/* Right: Counter Badge + View Report Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="bg-[#20202c] border border-gray-700/80 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-gray-400">Selected: </span>
                <span className="font-bold text-[#7824f6]">{userSectors.length}</span>
                <span className="text-gray-400"> / {maxSelections}</span>
              </div>
              <ActionButtons
                buttonSize="small"
                onViewReportClick={handleViewReportClick}
              />
            </div>
          </div>

          {/* Compact Profile Insights (Personality & Age Guidance) */}
          {(personalitySummary || developmentNotes) && (
            <div className="bg-[#1f1f2b]/80 border border-gray-800 rounded-xl p-3 mb-4 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                {personalitySummary && (
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[#a855f7] shrink-0 mt-0.5">
                      <FaStar size={12} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-0.5">
                        Your Personality Profile
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {personalitySummary}
                      </p>
                    </div>
                  </div>
                )}

                {developmentNotes && (
                  <div className="flex items-start gap-2.5 md:pl-3 pt-2.5 md:pt-0">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                      <FaInfoCircle size={12} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-0.5">
                        Age-Appropriate Guidance
                      </h3>
                      <p className="text-xs text-blue-200/90 leading-relaxed">
                        {developmentNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI-Sorted Sectors Section */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7824f6]"></span>
              <h2 className="text-sm md:text-base font-bold text-white tracking-wide">
                Top 3 Recommended Sectors
              </h2>
              <span className="text-xs text-gray-400 font-normal">
                (Select the sectors that interest you)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
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
                </div>
                <p className="text-gray-300 mb-3">
                    Are you sure you want to add <span className="font-bold text-[#7824f6]">{confirmingSector.sector_details.name}</span> to your selected sectors?
                </p>
                {confirmingSector.reasoning && (
                  <div className="bg-[#1a1a24] p-3 rounded-lg">
                    <h4 className="text-sm font-bold text-[#7824f6] mb-1">Why this fits you:</h4>
                    <p className="text-xs text-gray-400">{confirmingSector.reasoning}</p>
                  </div>
                )}
              </div>
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

function ModernSectorCard({ 
  sector, 
  sortedSector,
  isSelected, 
  onAddClick, 
  rank,
  reasoning,
  index
}) {
  if (!sector) return null;
  
  // Define unique colors and icons for each position (original vibrant palette)
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
    },
    {
      gradient: "from-[#ffd93d] to-[#ff8c42]",
      bgGradient: "from-[#ffd93d]/10 to-[#ff8c42]/10",
      borderGlow: "shadow-[0_0_30px_rgba(255,217,61,0.3)]",
      icon: FaStar,
      badge: "GOOD MATCH",
      badgeColor: "bg-gradient-to-r from-[#ffd93d] to-[#ff8c42]"
    },
    {
      gradient: "from-[#a8edea] to-[#fed6e3]",
      bgGradient: "from-[#a8edea]/10 to-[#fed6e3]/10",
      borderGlow: "shadow-[0_0_30px_rgba(168,237,234,0.3)]",
      icon: FaStar,
      badge: "POTENTIAL",
      badgeColor: "bg-gradient-to-r from-[#a8edea] to-[#fed6e3]"
    },
    {
      gradient: "from-[#667eea] to-[#764ba2]",
      bgGradient: "from-[#667eea]/10 to-[#764ba2]/10",
      borderGlow: "shadow-[0_0_30px_rgba(102,126,234,0.3)]",
      icon: FaStar,
      badge: "EXPLORE",
      badgeColor: "bg-gradient-to-r from-[#667eea] to-[#764ba2]"
    }
  ];
  
  const config = cardConfigs[index] || cardConfigs[0];
  const IconComponent = config.icon;
  
  const fullDescription = sector.description || sector.brief_overview || "Discover career opportunities, growth outlook, and required skills in this sector...";
  
  // Extract primary purpose and what it includes cleanly
  let purposeText = sector.primary_purpose || sector.brief_overview || "";
  let includesRaw = sector.what_it_includes || "";

  if (!purposeText && sector.description) {
    if (sector.description.includes("Includes:")) {
      const parts = sector.description.split("Includes:");
      purposeText = parts[0].trim();
      if (!includesRaw) includesRaw = parts[1].trim();
    } else {
      purposeText = sector.description;
    }
  } else if (
    sector.description &&
    sector.description.includes("Includes:") &&
    !includesRaw
  ) {
    const parts = sector.description.split("Includes:");
    includesRaw = parts[1].trim();
  }

  if (!purposeText) {
    purposeText = fullDescription.replace(/\s*Includes:[\s\S]*$/i, "").trim();
  }

  const includesList = includesRaw
    ? includesRaw
        .replace(/\.$/, "")
        .split(/,\s*(?:and\s+)?|\s+and\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    : [];

  return (
    <motion.div 
      className={`relative group cursor-pointer ${config.borderGlow} h-full`}
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
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm border border-gray-800 group-hover:border-gray-700 transition-all duration-300 h-full flex flex-col justify-between`}>
        <div>
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
            
            {/* Selected badge if selected */}
            {isSelected && (
              <motion.div 
                className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <FaCheck size={10} />
                <span>Selected</span>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.9 }}
              className="space-y-4"
            >
              {/* About This Sector */}
              <div>
                <h4 className={`text-sm font-semibold mb-1 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                  About This Sector:
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {purposeText}
                </p>
              </div>

              {/* What It Includes displayed neatly */}
              {includesList.length > 0 && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                    What It Includes:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {includesList.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10 backdrop-blur-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
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
          </div>
        </div>

        {/* Action button */}
        <div className="p-6 pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 1.3 }}
          >
            {!isSelected ? (
              <motion.button
                onClick={onAddClick}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group`}
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

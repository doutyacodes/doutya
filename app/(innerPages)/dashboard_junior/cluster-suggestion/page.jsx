"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaCheck, FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import CareerStripe from "@/app/_components/CareerStripe";
import ActionButtons from "@/app/_components/ActionButtons";

export default function ClusterSelectionPage() {
  const [user, setUser] = useState({
    personality_type: "",
    riasec_code: "",
    age: 0,
    current_age_week: 0,
    plan_type: "base"
  });
  const [clusters, setClusters] = useState([]);
  const [userClusters, setUserClusters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingCluster, setConfirmingCluster] = useState(null);
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
        
        // Single call to fetch user clusters data which will either:
        // 1. Return existing clusters if user has them
        // 2. Generate and save new clusters based on user's MBTI and RIASEC if none exist
        const userClustersResponse = await fetch("/api/clusters/user-clusters", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!userClustersResponse.ok) {
          throw new Error("Failed to fetch clusters data");
        }
        
        const data = await userClustersResponse.json();
        
        // Set user data
        setUser({
          personality_type: data.userData.personality_type || "",
          riasec_code: data.userData.riasec_code || "",
          age: data.userData.age || 0,
          current_age_week: data.userData.current_age_week || 0,
          plan_type: data.userData.plan_type || "base"
        });
        
        // Set clusters and user clusters
        setClusters(data.clusters || []);
        setUserClusters(data.userClusters || []);
      } catch (err) {
        console.error("Error fetching clusters data:", err);
        setError("Failed to load clusters. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleAddCluster = (cluster) => {
    setConfirmingCluster(cluster);
  };

  const handleViewReportClick = () => {
    router.push('/user/results');
  };

  const handleCertificateClick = () => {
    // Add certificate logic later
    console.log('Get Certificate clicked');
  };

  const isClusterSelected = (clusterId) => {
    return userClusters.some(c => c.cluster_id === clusterId && c.selected === true);
  };

  const confirmAddCluster = async () => {
    if (!confirmingCluster) return;
  
    // Check if adding would exceed plan limits
    const selectedClusters = userClusters.filter(c => c.selected === true);
    if (selectedClusters.length >= maxSelections) {
      toast.error(user.plan_type === "base" 
        ? "Base plan users can only select up to 2 clusters. Upgrade to Pro to select up to 5 clusters."
        : "You can select up to 5 clusters maximum.")
      setConfirmingCluster(null);
      return;
    }
  
    try {
      const response = await fetch("/api/clusters/user-clusters/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cluster_id: confirmingCluster.id
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save cluster");
      }

      const responseData = await response.json();
  
      // Update local state
      setUserClusters(userClusters.map(cluster => {
        if (cluster.cluster_id === confirmingCluster.id) {
          return { ...cluster, selected: true };
        }
        return cluster;
      }));

      toast.success(`${confirmingCluster.name} has been added to your selected clusters.`);
  
    } catch (err) {
      console.error("Error saving cluster:", err);
      toast.error(err.message || "Failed to save cluster. Please try again.");
    } finally {
      setConfirmingCluster(null);
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

  const selectedClusters = userClusters.filter(c => c.selected === true);

  return (
    <>
      <CareerStripe selectedItem={selectedCareer}  setSelectedItem={setSelectedCareer}/>
      <div className="min-h-screen bg-[#1a1a24] text-gray-200 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section with Action Buttons */}
          <div className="mb-8">
            {/* Top Section with Buttons */}
              <div className="mb-6">
                {/* Title Section - Always Centered */}
                <div className="text-center mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">Career Cluster Suggestion</h1>
                </div>
                
                {/* Action Buttons - Top Right */}
                <div className="flex justify-center sm:justify-end">
                  <ActionButtons
                    onViewReportClick={handleViewReportClick}
                    onCertificateClick={handleCertificateClick}
                  />
                </div>
              </div>
            
            {/* Subtitle and Description */}
            <div className="text-center">
              <p className="text-lg text-gray-300 mb-2">
                Based on your personality assessment and interest profile
              </p>
              <p className="text-gray-400">
                Select clusters that interest you 
                {user.plan_type === "base" && (
                  <span className="text-sm ml-1 text-yellow-400">
                    (Base plan: up to 2 clusters | Pro plan: up to 5 clusters)
                  </span>
                )}
              </p>
              <div className="mt-4 bg-[#292931] py-2 px-4 rounded-lg inline-block">
                <p className="text-sm">
                  Selected: <span className="font-bold text-[#7824f6]">{selectedClusters.length}</span> / 
                  <span className="font-bold">{maxSelections}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Clusters Grid */}
          <div className="mb-10">
            <div className="flex items-center mb-6">
              <div className="h-px flex-1 bg-[#7824f6]"></div>
              <h2 className="text-2xl font-bold mx-4 text-[#7824f6]">Career Clusters For You</h2>
              <div className="h-px flex-1 bg-[#7824f6]"></div>
            </div>
            
            <p className="text-gray-400 text-center mb-6">
              These clusters are generated specifically for you based on your Personality and Career interests
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clusters.map((cluster) => (
                <ClusterCard 
                  key={cluster.id} 
                  cluster={cluster} 
                  isSelected={isClusterSelected(cluster.id)}
                  onAddClick={() => handleAddCluster(cluster)}
                  accentColor="#7824f6"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmingCluster && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#292931] rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-4">Add Cluster</h3>
                <p className="text-gray-300 mb-6">
                Are you sure you want to add <span className="font-bold text-[#7824f6]">{confirmingCluster.name}</span> to your selected clusters?
                </p>
                {user.plan_type === 'base' && selectedClusters.length >= 2 && (
                <div className="mb-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-400 text-sm flex items-start">
                    <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
                    <span>Base plan users can only add up to 2 clusters. Upgrade to Pro to add up to 5 clusters.</span>
                    </p>
                </div>
                )}
                <div className="flex gap-3 justify-end">
                <button
                    onClick={() => setConfirmingCluster(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={confirmAddCluster}
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

function ClusterCard({ cluster, isSelected, onAddClick, accentColor }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  
  // Parse related jobs if it's a string
  const relatedJobs = typeof cluster.related_jobs === 'string' 
    ? JSON.parse(cluster.related_jobs) 
    : cluster.related_jobs || [];
  
  // Truncate description for compact view
  const shortDescription = cluster.description 
    ? (cluster.description.length > 80 
        ? cluster.description.substring(0, 80) + "..." 
        : cluster.description)
    : "Explore this career cluster and its related job opportunities...";
  
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
        {isSelected && (
          <div className="absolute top-0 right-0">
            <div className="bg-green-500 text-xs font-bold px-2 py-1 text-white flex items-center gap-1">
              <FaCheck size={10} />
              <span>Selected</span>
            </div>
          </div>
        )}
        
        <h4 className="text-white text-lg font-bold text-center">
          {cluster.name}
        </h4>
      </div>
      
      <div className="p-5 flex flex-col justify-between bg-gradient-to-b from-[#292931] to-[#232329]">
        <div className={`mb-3 ${isExpanded ? "h-auto" : "h-20"}`}>
            <p className="text-gray-300 text-sm mb-2">
            {isExpanded ? cluster.description : shortDescription}
            </p>
            
            {/* Related Jobs Section - now integrated into the expanded view */}
            {isExpanded && (
            <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">Related Career Paths:</h5>
                <div className="flex flex-wrap gap-2">
                {relatedJobs.slice(0, 10).map((job, idx) => (
                    <span 
                    key={idx} 
                    className="text-xs text-gray-300 bg-[#2a2a36] px-3 py-1.5 rounded-full"
                    >
                    {job}
                    </span>
                ))}
                </div>
            </div>
            )}
            
            {cluster.description && cluster.description.length > 80 && (
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-[#7824f6] hover:underline flex items-center mt-2"
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
            >
                <p className="text-sm text-white font-medium">
                Add to My Clusters
                </p>
                <FaChevronRight size={12} color="white" />
            </button>
            ) : (
            <div className="px-4 py-2 bg-green-900 bg-opacity-30 rounded-md flex gap-2 items-center">
                <p className="text-sm text-green-400 font-medium">
                Added to Your Clusters
                </p>
                <FaCheck size={12} color="#10b981" />
            </div>
            )}
        </div>
        </div>
    </div>
  );
}
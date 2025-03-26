"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronRight } from "react-icons/fa";
import { ArrowLeft, Newspaper } from "lucide-react"; // Add the missing import
import GlobalApi from "../_services/GlobalApi";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";
import PostCreation from "../(innerPages)/dashboard/_components/(Community)/PostCreation/PostCreation";
import PostsCard from "../(innerPages)/dashboard/_components/(Community)/PostsCard/PostsCard";
import FeatureGuideWrapper from "./FeatureGuideWrapper";
import CareerNews from "./CareerNews";

const CommunityList = ({ careerId }) => {
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [showAddPost, setShowAddPost] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(false);
  const [communityId, setCommunityId] = useState(null);
  const [showCareerNews, setShowCareerNews] = useState(false);
  console.log("careerId", careerId);

  useEffect(() => {
    if (careerId) {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        toast.error("Token is missing. Please log in.");
        return;
      }

      const fetchCommunityData = async () => {
        try {
          setLoading(true);
          const resp = await GlobalApi.GetAllCareerCommunity(careerId, token);

          if (resp.status !== 200) {
            throw new Error("Failed to fetch community data");
          }

          const data = resp.data; // Axios response data
          console.log(data);
          setCommunityData(data.communities); // Adjusted to get the array of communities
        } catch (error) {
          console.error("Error fetching community data:", error.message);
          toast.error(
            "There was an error fetching community details. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchCommunityData();
    }
  }, [careerId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!communityData || communityData.length === 0) {
    return <p>No community data found.</p>;
  }

  const getCommunityPosts = async (communityId) => {
    console.log("communityId idff", communityId)
    if (communityId) {

    setIsLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await GlobalApi.GetCommunityPosts(token, communityId);
      if (
        response.status === 201 &&
        response.data &&
        response.data.posts.length > 0
      ) {
        setCommunityPosts(response.data.posts);
        console.log(response.data.posts);
      } else {
        toast.error("No Posts data available at the moment.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to retrieve posts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
    }
  };

  const handleButtonClick = () => {
    if (showCareerNews) {
        getCommunityPosts(communityId);  // Show community posts
    } else {
        setCommunityPosts([]);           // Clear community posts
    }
    setShowCareerNews((prev) => !prev);  // Toggle the state
};

  return (
    <FeatureGuideWrapper featureKey="community">
        <div className="w-full ">
          {communityId ? (
            <div className="min-h-screen bg-[#1f1f1f]">
                <Toaster />
                <div className="container mx-auto p-4 md:px-8 lg:px-16 xl:px-24">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 px-4 sm:px-0">
                        <div className="flex items-center w-full justify-between sm:justify-start">
                            <button
                                onClick={() => setCommunityId(null)}
                                className="flex items-center text-blue-500 hover:text-blue-600 md:me-5" 
                            >
                                <ArrowLeft className="mr-2" size={24} />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                            
                            <h1 className="text-xl sm:text-2xl font-bold text-white text-center flex-grow sm:flex-grow-0">
                                Community Feeds
                            </h1>
                            
                            <div className="sm:hidden">
                                {/* Placeholder for mobile menu or empty space */}
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                            <div className="flex justify-between w-full sm:w-auto space-x-3">
                                {communityPosts.length > 0 && (
                                    <button
                                        onClick={() => setShowAddPost(true)}
                                        className="flex-1 sm:flex-none flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                    >
                                        <PlusCircle className="mr-2" size={20} />
                                        <span className="text-sm sm:text-base">Add Post</span>
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleButtonClick}
                                    className="flex-1 sm:flex-none flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
                                >
                                    <Newspaper className="mr-2" size={20} />
                                    <span className="text-sm sm:text-base">
                                        {showCareerNews ? "Community Posts" : "Career News"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
            
                    {showCareerNews && (
                        <CareerNews 
                        communityId={communityId} 
                        onClose={() => setShowCareerNews(false)} 
                        />
                    )}
            
                    {showAddPost && 
                        <PostCreation
                        communityId={communityId}
                        onClose={() => setShowAddPost(false)}
                        />
                    }
            
                    <div className="space-y-6">
                        {communityPosts.length > 0 &&
                        communityPosts.map((post) => (
                            <PostsCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {communityData.map((community) => {
                return (
                  <div
                    className="pt-8 poppins-regular bg-[#2a2b27] px-3 relative pb-3 rounded-md shadow-md hover:scale-105 transition-all ease-in-out duration-150 space-y-3  "
                    key={community.id} // Use community.id instead of index
                  >
                    <h3
                      className={`py-1 px-3 ${
                        community.country ? "bg-blue-500" : "bg-red-500"
                      } text-white font-semibold w-fit text-[10px] top-2 right-2 rounded-full absolute`}
                    >
                      {community.country ? community.country : "Global"}
                    </h3>
                    <div className="">
                      <h4 className="text-[#F0394F] text-wrap font-bold">
                        {community.career}
                      </h4>
                    </div>
                    <div className="text-xs text-white">
                      Traditional careers have stood the test of time and are more
                      structured with established career paths. These are often
                      linked to fields with consistent demand and clear educational
                      requirements.
                    </div>
                    <div className="w-full flex justify-between items-center">
                      {community.already_in ? (
                        <div className="w-fit border border-white/70 text-xs rounded-full px-3 p-2 text-white/70">
                          Joined
                        </div>
                      ) : (
                        <button className="w-fit bg-[#f09566] text-xs rounded-full px-3 p-2 text-white">
                          Join Now
                        </button>
                      )}
                      <div
                        
                      >
                        <button onClick={()=>{
                            setCommunityId(community.id)
                            getCommunityPosts(community.id)
                        }} className="w-fit bg-[#7824f6] rounded-full px-3 py-2 flex gap-2 items-center">
                          <p className="text-xs text-white">Go to Community</p>
                          <FaChevronRight size={10} color="white" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </FeatureGuideWrapper>

  );
};

export default CommunityList;

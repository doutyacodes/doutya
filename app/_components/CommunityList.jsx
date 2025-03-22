"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronRight } from "react-icons/fa";
import { ArrowLeft } from "lucide-react"; // Add the missing import
import GlobalApi from "../_services/GlobalApi";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";
import PostCreation from "../(innerPages)/dashboard/_components/(Community)/PostCreation/PostCreation";
import PostsCard from "../(innerPages)/dashboard/_components/(Community)/PostsCard/PostsCard";
import FeatureGuideWrapper from "./FeatureGuideWrapper";

const CommunityList = ({ careerId }) => {
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [showAddPost, setShowAddPost] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(false);
  const [communityId, setCommunityId] = useState(null);
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

  const getCommunityPosts = async ({communityId}) => {
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

 

  return (
    <FeatureGuideWrapper featureKey="community">
        <div className="w-full ">
          {communityId ? (
            <div className="min-h-screen bg-[#1f1f1f]">
              <Toaster />
              <div className="container mx-auto p-4 md:px-8 lg:px-16 xl:px-24">
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => setCommunityId(null)}
                    className="flex items-center text-blue-500 hover:text-blue-600"
                  >
                    <ArrowLeft className="mr-2" size={24} />
                    Back
                  </button>
                  <h1 className="text-2xl font-bold text-white">Community Feeds</h1>
                  <button
                    onClick={() => setShowAddPost(true)}
                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    <PlusCircle className="mr-2" size={20} />
                    Add Post
                  </button>
                </div>

                {showAddPost && <PostCreation />}

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

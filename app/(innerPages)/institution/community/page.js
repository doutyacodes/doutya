"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Toaster } from "@/components/ui/toaster";
import { PlusCircle } from "lucide-react";
import PostCreation from "./_components/PostCreation/PostCreation";
import GlobalApi from "@/app/_services/GlobalApi";
import CommunityPosts from "./_components/CommunityPosts/CommunityPosts";


const page = () => {
  const [communityData, setCommunityData] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [showAddPost, setShowAddPost] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleOnClose = () => {
    setShowAddPost(false); // This will hide the PostCreation component
    getCommunityPosts()
  };

  const getCommunityPosts = async () => {

    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.GetInstitueCommunityPosts(token);
      if (
        response.status === 200 &&
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
  };

 useEffect(()=>{
  getCommunityPosts()
 }, [])

  return (
    <div className="w-full ">
        <div className="min-h-screen bg-[#1f1f1f]">
          <Toaster />
          <div className="container mx-auto p-4 md:px-8 lg:px-16 xl:px-24">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Community Feeds</h1>
              <button
                onClick={() => setShowAddPost(true)}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                <PlusCircle className="mr-2" size={20} />
                Add Post
              </button>
            </div>

            {showAddPost && <PostCreation onClose={handleOnClose} />}

            <div className="space-y-6">

                {communityPosts.length > 0 &&
                  <CommunityPosts communityPosts={communityPosts} />
                }
            </div>


          </div>
      
          { 
            communityPosts.length > 0 ? (
            <div className="space-y-6">
                
            </div>
            )
             :
             (
             <div className="flex justify-center items-center w-full py-16">  
               <h2 className="text-xl font-semibold text-gray-600">
                 No Posts Available
               </h2>
               <p className="text-gray-500">
                 It looks like there are no Posts to display at the moment.
               </p>
             </div>
             )
          }
        </div>
    </div>
  );
};

export default page;

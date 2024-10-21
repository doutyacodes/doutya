"use client";
import GlobalApi from "@/app/_services/GlobalApi";
import Link from "next/link";
import { useParams } from "next/navigation"; // correct hook
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronRight } from "react-icons/fa";

const CommunityPage = () => {
  const { careerId } = useParams(); // directly access `careerId` from params
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

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

  return (
    <div className="w-full ">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {communityData.map((community, index) => {
          // console.log(community)
          return (
            <div
              className="pt-8 poppins-regular bg-white px-3 relative pb-3 rounded-md shadow-md hover:scale-105 transition-all ease-in-out duration-150 space-y-3  "
              key={index}
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
              <div className="text-xs">
                Traditional careers have stood the test of time and are more
                structured with established career paths. These are often linked
                to fields with consistent demand and clear educational
                requirements.
              </div>
              <div className="w-full flex justify-between items-center">
                {community.already_in ? (
                  <div className="w-fit border border-slate-500 text-xs rounded-full px-3 p-2 text-slate-600">
                    Joined
                  </div>
                ) : (
                  <button className="w-fit bg-[#f09566] text-xs rounded-full px-3 p-2 text-white">
                    Join Now
                  </button>
                )}{" "}
                <Link
                  href={{
                    pathname: `/communityFeeds/${community.id}`,
                  }}
                >
                  <button className="w-fit bg-[#7824f6] rounded-full px-3 py-2 flex gap-2 items-center">
                    <p className="text-xs text-white">Go to Community</p>
                    <FaChevronRight size={10} color="white" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityPage;

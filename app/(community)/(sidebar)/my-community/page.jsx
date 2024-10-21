"use client";
import GlobalApi from "@/app/_services/GlobalApi";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { encryptText } from "@/utils/encryption";

const Page = () => {
  const [progressLoading, setProgressLoading] = useState(false);
  const [careers, setCareers] = useState([]); // Store fetched careers

  const CareerList = async () => {
    try {
      setProgressLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        throw new Error("Token is missing.");
      }

      const resp = await GlobalApi.GetUserCommunity(token);

      if (resp.status !== 200) {
        throw new Error("Failed to fetch careers");
      }

      const data = resp.data;
      setCareers(data); // Store the careers in state
    } catch (error) {
      console.error("Error fetching career data:", error.message);
      toast.error(
        "There was an error fetching your career list. Please try again later."
      );
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    CareerList();
  }, []);

  return (
    <div className="poppins-regular text-white">
      <h1 className="mb-5">Career List</h1>
      {progressLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {careers.length > 0 ? (
            careers.map((career, index) => {
                console.log("career",career)
              return (
                <div
                  className="pt-8 bg-[#2a2b27] px-3 relative pb-3 rounded-md shadow-md hover:scale-105 transition-all ease-in-out duration-150 space-y-3  "
                  key={index}
                >
                  <h3 className="py-1 px-3 bg-blue-500 text-white font-semibold w-fit text-[10px] top-2 right-2 rounded-full absolute">
                    {career.country}
                  </h3>
                  <div className="">
                    <h4 className="text-[#F0394F] text-wrap font-bold">
                      {career.careerName}
                    </h4>
                  </div>
                  <div className="text-xs">
                    Traditional careers have stood the test of time and are more
                    structured with established career paths. These are often
                    linked to fields with consistent demand and clear
                    educational requirements.{career.careerId}
                  </div>
                  <div className="w-full flex justify-end items-end">
                    {/* Encrypt the careerId before passing it in the link */}
                    <Link
                      href={`community-list/${career.careerId}`}
                    >
                      <button className="w-fit bg-[#7824f6] rounded-full px-3 py-2 flex gap-2 items-center">
                        <p className="text-xs text-white">Go to Community</p>
                        <FaChevronRight size={10} color="white" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No careers found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;

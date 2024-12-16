"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import moment from "moment";

const ChallengeDetails = () => {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchChallengesOne({
        slug,
        show: true,
      });
      if (response.data.challenge) {
        setChallenge(response.data.challenge);
      } else {
        setChallenge(null); // If no challenge is found, set to null
      }
    } catch (error) {
      setChallenge(null); // In case of error, set to null
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    if (challenge.isCompleted) {
      toast.success("You have already completed this challenge!");
      return;
    }
    if (challenge.challenge_type === "upload") {
      router.push(`/challenges/upload-challenge/${slug}`);
    }
    if (challenge.challenge_type === "quiz") {
      router.push(`/challenges/quiz-section/${slug}`);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const formatDate = (date) => {
    return moment(date).format("DD-MM-YYYY HH:mm:ss"); // Format the date and time
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!challenge) {
    return (
      <div className="min-h-screen p-6 flex justify-center items-center bg-[#2a2b27]">
        <motion.div
          className="bg-white rounded-lg shadow-md w-full max-w-2xl overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Challenge Expired or No Longer Available
            </h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but this challenge is no longer available. Please
              check out other challenges or try again later.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex justify-center items-center bg-[#2a2b27]">
      <motion.div
        className="bg-white rounded-lg shadow-md w-full max-w-2xl overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Image */}
        <motion.img
          src={`https://wowfy.in/testusr/images/${challenge.image}`}
          alt={challenge.title}
          className="w-full h-64 object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {challenge.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-6">{challenge.description}</p>

          {/* Details */}
          
          <div className="mb-6">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>📅 Start Date:</span>
              <span>{formatDate(challenge.show_date)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>📅 End Date:</span>
              <span>{formatDate(challenge.end_date)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>💰 Reward Points:</span>
              <span>
                {challenge.points} Points
              </span>
            </div>
          </div>

          {/* Conditional Rendering for Challenge Type */}
          {challenge.challenge_type === "pedometer" ? (
            <div
              className="bg-[#845EC2] border-l-4 border-[#845EC2] text-white p-4"
              role="alert"
            >
              <p className="font-bold">Mobile App Required</p>
              <p>
                This challenge is only available on our mobile app. Please
                download the app to participate.
              </p>
              <div className="flex justify-center mt-4">
                <a
                  href="https://play.google.com/store/apps/details?id=YOUR_ANDROID_APP_ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#845EC2] hover:bg-[#6A3D9E] text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Download Mobile App
                </a>
              </div>
            </div>
          ) : (
            <motion.button
              className="bg-[#845EC2] hover:bg-[#6A3D9E] text-white font-bold py-2 px-4 rounded-md w-full transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={
                challenge.entry_type !== "points"
                  ? handleStart
                  : () => {
                      if (challenge.permission) {
                        handleStart();
                      } else {
                        toast.error(
                          "Sorry. You don't have enough points to start the challenge!"
                        );
                      }
                    }
              }
            >
              Start Challenge
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChallengeDetails;

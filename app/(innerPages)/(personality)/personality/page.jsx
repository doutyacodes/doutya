"use client"

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  User,
  Target,
  MessageCircle,
  Heart,
  Briefcase,
  Sparkles,
  Brain,
  Zap,
  AlertCircle,
} from "lucide-react";
import personality from "@/data/personality.json";
import { useRouter } from "next/navigation";

const PersonalityDisplay = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [personalityData, setPersonalityData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [personalityType, setPersonalityType] = useState(null);

  const router = useRouter()

  const handleContinueClick = () => {
    const url = typeof window !== "undefined" ? localStorage.getItem("dashboardUrl") : null;
    if (url) {
      router.push(url);
    } else {
      router.push("/dashboard"); // fallback URL
    }
  };

  useEffect(() => {
    const fetchPersonalityData = async () => {
      try {
        setIsLoading(true);

        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("Authentication required");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/user/personality-status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch personality data");
        }

        const data = await response.json();

        setIsTestCompleted(data.isPersonalityTestCompleted);
        setUserInfo(data.userInfo);
        setPersonalityType(data.personalityType);

        if (data.isPersonalityTestCompleted && data.personalityType) {
          // Find personality data from local JSON file
          const personalityInfo = personality.find(
            (p) => p.id === data.personalityType
          );
          if (personalityInfo) {
            setPersonalityData(personalityInfo);
          } else {
            // Fallback to ENTP if type not found
            const fallbackPersonality = personality.find(
              (p) => p.id === "ENTP"
            );
            setPersonalityData(fallbackPersonality);
          }
        } else {
          // Use ENTP as fallback for demonstration
        //   const fallbackPersonality = personality.find((p) => p.id === "ENTP");
        //   setPersonalityData(fallbackPersonality);
        //   setIsTestCompleted(true); // For demo purposes
        const url = typeof window !== "undefined" ? localStorage.getItem("dashboardUrl") : null;
        router.replace(url);
        // router.replace("/dashboard")
        }

        // Simulate loading delay for better UX
        setTimeout(() => {
          setIsLoading(false);
          setShowContent(true);
        }, 2000);
      } catch (error) {
        console.error("Error fetching personality data:", error);
        setError(error.message);
        // Use ENTP as fallback on error
        const fallbackPersonality = personality.find((p) => p.id === "ENTP");
        setPersonalityData(fallbackPersonality);
        setIsTestCompleted(true); // For demo purposes
        setTimeout(() => {
          setIsLoading(false);
          setShowContent(true);
        }, 2000);
      }
    };

    fetchPersonalityData();
  }, []);

  useEffect(() => {
    if (showContent && !isLoading) {
      // Staggered animation for content sections
      const timer1 = setTimeout(() => {
        setAnimationStep(1);
      }, 300);

      const timer2 = setTimeout(() => {
        setAnimationStep(2);
      }, 500);

      const timer3 = setTimeout(() => {
        setAnimationStep(3);
      }, 700);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [showContent, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-l-purple-500 border-t-purple-500 animate-spin"></div>
              {/* Inner spinning ring */}
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-r-blue-400 border-b-blue-400 animate-spin" 
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }}>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">
              Analyzing Your Personality
            </h3>
            <p className="text-gray-400 text-sm">
              Fetching your assessment details...
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if test not completed
  if (!isTestCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-6">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Assessment Not Completed
          </h2>
          <p className="text-gray-400 mb-6">
            Complete your personality assessment to unlock personalized insights
            about your strengths, career paths, and growth opportunities.
          </p>
          <button
            onClick={() => (window.location.href = "/assessment")} // Adjust URL as needed
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !personalityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Unable to Load Data
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const StrengthCard = ({ strength, index }) => (
    <div
      className={`group p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 ${
        animationStep >= 1
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-gray-200 text-sm leading-relaxed group-hover:text-white transition-colors">
          {strength}
        </p>
      </div>
    </div>
  );

  const WeaknessCard = ({ weakness, index }) => (
    <div
      className={`group p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 hover:scale-105 ${
        animationStep >= 2
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <Brain className="w-5 h-5 text-orange-400" />
        </div>
        <p className="text-gray-200 text-sm leading-relaxed group-hover:text-white transition-colors">
          {weakness}
        </p>
      </div>
    </div>
  );

  const ValueBadge = ({ value, index }) => (
    <div
      className={`px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 hover:border-purple-300/50 transition-all duration-300 hover:scale-105 ${
        animationStep >= 3
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <span className="text-purple-200 text-sm font-medium">{value}</span>
    </div>
  );

  const CareerBadge = ({ career, index }) => (
    <div
      className={`px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 hover:scale-105 ${
        animationStep >= 3
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100 + 200}ms` }}
    >
      <span className="text-blue-200 text-sm font-medium">{career}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div
          className={`text-center mb-12 ${
            showContent
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          } transition-all duration-700`}
        >
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-medium">
              Personality Assessment Results
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            {"Your Personality Profile"}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Uncover your unique qualities, strengths, and the directions that
            truly suit you.{" "}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strengths Section */}
          <div className="space-y-6">
            <div
              className={`${
                animationStep >= 1
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              } transition-all duration-500`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Your Strengths
                </h2>
              </div>
              <div className="space-y-4">
                {personalityData.strengths.map((strength, index) => (
                  <StrengthCard key={index} strength={strength} index={index} />
                ))}
              </div>
            </div>

            {/* Communication Style */}
            <div
              className={`${
                animationStep >= 2
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              } transition-all duration-500 delay-200`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Communication Style
                </h2>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <p className="text-gray-200 leading-relaxed">
                  {personalityData.communication_style}
                </p>
              </div>
            </div>
          </div>

          {/* Growth Areas & Relationships */}
          <div className="space-y-6">
            {/* Growth Areas */}
            <div
              className={`${
                animationStep >= 2
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              } transition-all duration-500`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Growth Areas</h2>
              </div>
              <div className="space-y-4">
                {personalityData.weaknesses.map((weakness, index) => (
                  <WeaknessCard key={index} weakness={weakness} index={index} />
                ))}
              </div>
            </div>

            {/* Relationships */}
            <div
              className={`${
                animationStep >= 3
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              } transition-all duration-500 delay-100`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Relationships</h2>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
                <p className="text-gray-200 leading-relaxed">
                  {personalityData.relationships}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values and Careers Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Core Values */}
          <div
            className={`${
              animationStep >= 3
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            } transition-all duration-500`}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Core Values</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {personalityData.values.map((value, index) => (
                <ValueBadge key={index} value={value} index={index} />
              ))}
            </div>
          </div>

          {/* Ideal Careers */}
          {/* <div className={`${animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500 delay-100`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Briefcase className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Ideal Careers</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {personalityData.ideal_careers.map((career, index) => (
                <CareerBadge key={index} career={career} index={index} />
              ))}
            </div>
          </div> */}
        </div>

        {/* Call to Action */}
        <div
          className={`mt-16 text-center ${
            animationStep >= 3
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          } transition-all duration-500 delay-300`}
        >
          <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Explore Your Potential?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Use these insights to guide your career decisions, improve
              relationships, and unlock your full potential.
            </p>
            <button 
              onClick={handleContinueClick}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Continue Your Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityDisplay;

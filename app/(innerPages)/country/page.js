"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import toast, { Toaster } from "react-hot-toast";
import { calculateAge } from "@/lib/ageCalculate";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { Lock } from 'lucide-react';
import PricingCard from "@/app/_components/PricingCard";

function SelectCountry() {
  const [educationCountry, setEducationCountry] = useState(null);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [userData, setUserData] = useState(null); 
  const [userAge, setUserAge] = useState(null);
  const [userPlanType, setUserPlanType] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();
  const t = useTranslations("countryPage");

  // Check authentication and completion status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        setIsAuthenticated(true);
        return token;
      }
      router.replace("/login"); // Redirect to login if no token
      return null;
    };
    
    const getProfileStatus = async () => {
      setLoading(true);
      try {
        const token = checkAuth();
        if (!token) return;
        
        const resp = await GlobalApi.GetDashboarCheck(token);
        const scopeType = resp.data.scopeType || "career";
        
        // Check if country is already selected and redirect accordingly
        if (resp.data.countryAdded) {
          // Country already selected, redirect based on scopeType
          if (scopeType === "career") {
            router.replace("/dashboard/careers/career-suggestions");
          } else if (scopeType === "sector") {
            router.replace("/dashboard_kids/sector-suggestion");
          } else if (scopeType === "cluster") {
            router.replace("/dashboard_junior/cluster-suggestion");
          }
        } else {
          // Country not selected yet, check if previous steps are complete
          if (!resp.data.educationStageExists) {
            // Education stage not set yet
            router.replace("/user/education-profile");
          } else if (!resp.data.isEducationCompleted && !resp.data.institutionDetailsAdded) {
            // User is in school/college and institution details not provided
            router.replace("/education-details");
          }
          // If all previous steps complete but country not added, we stay on this page
        }
      } catch (error) {
        console.error("Error fetching profile status:", error);
        toast.error("Error loading profile status. Please try again.");
      } finally {
        loading(false);
      }
    };
    
    getProfileStatus();
  }, [router]);

    // Fetch User Data
    const getUserData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetUserData(token);
        // setUserData(resp.data);
        if (resp.status === 201) {
          const birth_date = resp.data.birth_date;
          const age = calculateAge(birth_date);
          setUserAge(age)
          setUserPlanType(resp.data.plan_type)
        }
      } catch (error) {
        toast.error("Error Fetching UserData:", error)
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    getUserData();
  }, []);

// Updated useEffect that doesn't visually set the education country
useEffect(()=>{
  // We're removing the visual setting of educationCountry here
  // The actual value will be sent in handleSubmit
}, [currentCountry])
  
  const handleEducationCountryClick = () => {
    if (userAge <= 9 || userPlanType === 'base') {
      setShowPricing(true);
    }
  };

  const countryOptions = countryList().getData();

  const handleSubmit = async (e) => {
    e.preventDefault();

  if (!currentCountry) {
    toast.error(t("pleaseSelectCurrentCountry"));
    return;
  }
  
  // Only validate educationCountry for pro users (not base plan and not young users)
  if (!(userAge <= 9 || userPlanType === 'base') && !educationCountry) {
    toast.error(t("pleaseSelectEducationCountry"));
    return;
  }
  
  // For users <= 9 or base plan, only submit current country for both
  const data = {
    currentCountry: currentCountry.label,
    // Use educationCountry from state only if not restricted, otherwise use currentCountry
    educationCountry: (userAge <= 9 || userPlanType === 'base') 
      ? currentCountry.label 
      : educationCountry.label
  };

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.setCountries(data, token);

      if (response.status === 201) {
        toast.success("Country details saved successfully!");
        
        // Get scopeType before redirecting
        const dashboardCheck = await GlobalApi.GetDashboarCheck(token);
        const scopeType = dashboardCheck.data.scopeType || "career";
        
        // Redirect based on scopeType
        if (scopeType === "career") {
          router.replace("/dashboard/careers/career-suggestions");
        } else if (scopeType === "sector") {
          router.replace("/dashboard_kids/sector-suggestion");
        } else if (scopeType === "cluster") {
          router.replace("/dashboard_junior/cluster-suggestion");
        }
      } else {
        toast.error("Failed to save country details.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while saving data.");
    }
  };

  // Loading or Authentication State
  if (loading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={'Loading...'} />
          </div>
        </div>
      </div>
    );
  }

  console.log("Currentcountry", currentCountry)

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Toaster />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t("selectYourCountries")}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="currentCountry" className="block text-sm font-medium text-gray-700">
              {t("selectCurrentCountry")}
            </label>
            <Select
              options={countryOptions}
              value={currentCountry}
              onChange={setCurrentCountry}
              className="mt-1 block w-full"
            />
            <p className="text-xs mt-1">
              Select a country to explore regional career opportunities
            </p>
          </div>

          <div className="mb-4 relative">
            <div className="flex items-center justify-between">
              <label htmlFor="educationCountry" className="block text-sm font-medium text-gray-700">
                {/* {t("selectEducationCountry")} */}
                Select the country where you want to explore career opportunities.
              </label>
              {(userAge <= 9 || userPlanType === 'base') && (
                <div className="flex items-center text-sm text-blue-600">
                  <Lock size={16} className="mr-1" />
                  Pro Feature
                </div>
              )}
            </div>
            <div onClick={handleEducationCountryClick}>
              <Select
                options={countryOptions}
                value={educationCountry}
                onChange={setEducationCountry}
                isDisabled={userAge <= 9 || userPlanType === 'base'}
                className="mt-1 block w-full"
              />
            </div>
            <p className="text-xs mt-1">
              Choose a country to explore career options
            </p>
          </div>

          <div className="mb-4">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors"
            >
              {t("submit")}
            </button>
          </div>
        </form>
      </div>

      {showPricing && (
        <PricingCard onClose={() => setShowPricing(false)} />
      )}
    </div>
  );
}

export default SelectCountry;

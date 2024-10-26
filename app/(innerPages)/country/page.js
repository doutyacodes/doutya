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

  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    };
    authCheck();
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

  useEffect(()=>{
    if(currentCountry){
      if(userAge <= 9 || userPlanType === 'base'){
        setEducationCountry(currentCountry)
      }
    }
  }, [currentCountry])
  
  const handleEducationCountryClick = () => {
    if (userAge <= 9 || userPlanType === 'base') {
      setShowPricing(true);
    }
  };

  const countryOptions = countryList().getData();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!educationCountry || !currentCountry) {
      toast.error(t("pleaseSelectBoth"));
      return;
    }
    // For users <= 9, only submit current country
    const data = userAge <= 9 || userPlanType === 'base' ? {
      currentCountry: currentCountry.label,
      educationCountry: currentCountry.label // Set same as current country for young users
    } : {
      currentCountry: currentCountry.label,
      educationCountry: educationCountry?.label
    };
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.setCountries(data, token);

      if (response.status === 201) {
        toast.success("Country details saved successfully!");
        const birth_date = response.data.birthDate;
        const age = calculateAge(birth_date);
        if (age <= 9) {
          localStorage.setItem("dashboardUrl", "/dashboard_kids");
          router.push("/dashboard_kids");
        } else if (age <= 13) {
          localStorage.setItem("dashboardUrl", "/dashboard_junior");
          router.push("/dashboard_junior");
        } else {
          localStorage.setItem("dashboardUrl", "/dashboard");
          router.push("/dashboard");
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
                {t("selectEducationCountry")}
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
              Choose your highest education country
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

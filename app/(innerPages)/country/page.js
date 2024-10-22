"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import toast, { Toaster } from "react-hot-toast";
import GlobalApi from "../_services/GlobalApi";
import { calculateAge } from "@/lib/ageCalculate";

function SelectCountry() {
  const [educationCountry, setEducationCountry] = useState(null);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const countryOptions = countryList().getData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!educationCountry || !currentCountry) {
      toast.error(t("pleaseSelectBoth"));
      return;
    }
    const data = {
      educationCountry: educationCountry.label,
      currentCountry: currentCountry.label,
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

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Toaster />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t("selectYourCountries")}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="currentCountry"
              className="block text-sm font-medium text-gray-700"
            >
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

          <div className="mb-4">
            <label
              htmlFor="educationCountry"
              className="block text-sm font-medium text-gray-700"
            >
              {t("selectEducationCountry")}
            </label>
            <Select
              options={countryOptions}
              value={educationCountry}
              onChange={setEducationCountry}
              className="mt-1 block w-full"
            />
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
    </div>
  );
}

export default SelectCountry;

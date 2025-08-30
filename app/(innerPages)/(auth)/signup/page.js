"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { encryptText } from "@/utils/encryption";
import GlobalApi from "@/app/_services/GlobalApi";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculateAge } from "@/lib/ageCalculate";
import countryList from "react-select-country-list";
import Select from "react-select";
import { useTranslations } from "next-intl";

const languageMapping = {
  en: "English",
  hi: "Hindi",
  mar: "Marathi",
  ur: "Urdu",
  sp: "Spanish",
  ben: "Bengali",
  assa: "Assamese",
  ge: "German",
  tam: "Tamil",
  mal: "Malayalam",
};

function SignUp() {
  const getSixYearsAgo = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 6);
    return date.toISOString().split("T")[0]; // Format it as YYYY-MM-DD
  };

  const [selectedDOB, setSelectedDOB] = useState(null);
  const [step, setStep] = useState("eligibility_info");
  const [isCollegeStudent, setIsCollegeStudent] = useState(false);
  const [countryOptions] = useState(countryList().getData());
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [educationLevel, setEducationLevel] = useState(0);
  const [reason, setReason] = useState(0);
  const [dobError, setDobError] = useState("");
  const [ageCategory, setAgeCategory] = useState(""); // New state for age category
  const [selectedClass, setSelectedClass] = useState("");

  // const [institutions, setInstitutions] = useState([]);
  // const [childClassOptions, setChildClassOptions] = useState([]);
  // const [childDivisionOptions, setChildDivisionOptions] = useState([]);

  const router = useRouter();
  const t = useTranslations("SignupPage");
  // useEffect(() => {
  //   const authCheck = () => {
  //     if (typeof window !== "undefined") {
  //       const token = localStorage.getItem("token");
  //       if (token) {
  //         // router.push("/dashboard");
  //         const url = typeof window !== "undefined" ? localStorage.getItem("navigateUrl") : null;
  //         router.replace(url);
  //       } 
  //     }
  //   };
  //   authCheck();
  // }, [router]);

  // const classMapping = {
  //   "6": "6th",
  //   "7": "7th", 
  //   "8": "8th",
  //   "9": "9th",
  //   "10": "10th",
  //   "11": "11th",
  //   "12": "12th",
  //   "college": "College"
  // };
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    setValue,
  } = useForm();

  const educationLevelMapping = {
    0: "School",
    1: "College",
    2: "Completed Education",
  };

  const reasonMapping = {
    0: "New Job",
    1: "Career Change",
  };

  // useEffect(() => {
  //   router.push("/login");
  // });

  useEffect(() => {
    localStorage.setItem("language", selectedLanguage);
    document.cookie = `locale=${selectedLanguage}; path=/`;
    console.log("document.cookie", document.cookie);
    router.refresh();
  }, [selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    console.log("newLanguage", newLanguage);
    setSelectedLanguage(newLanguage);
  };

  // // Fetch institutes on component mount
  // useEffect(() => {
  //   const fetchInstitutes = async () => {
  //     try {
  //       const response = await GlobalApi.GetAllInstitutes();
  //       if (response.status === 200) {
  //         console.log("before");
  //         setInstitutions(response.data.institutions);
  //         console.log("after");
  //       }
  //     } catch (error) {
  //       toast.error("Failed to fetch institutes");
  //     }
  //   };

  //   fetchInstitutes();
  // }, []);

  // // Function to fetch classes for a specific child
  // const fetchClassesForChild = async (instituteId) => {
  //   try {
  //     const response = await GlobalApi.GetClassesByInstitute(instituteId);
  //     if (response.status === 200) {
  //       console.log("before");
  //       setChildClassOptions(response.data.classes);
  //       console.log("after 1");
  //       // Reset dependent fields
  //       setValue(`classId`, '');
  //       setValue(`divisionId`, '');

  //       // Reset division options for this child
  //       setChildDivisionOptions([]);
  //       console.log("after 3");

  //     }
  //   } catch (error) {
  //     toast.error("Failed to fetch classes");
  //   }
  // };

  // // Function to fetch divisions for a specific child
  // const fetchDivisionsForChild = async (classId) => {
  //   try {
  //     const response = await GlobalApi.GetDivisionsByClass(classId);
  //     if (response.status === 200) {
  //       setChildDivisionOptions(response.data.divisions);
        
  //       // Reset division field
  //       setValue(`divisionId`, '');
  //     }
  //   } catch (error) {
  //     toast.error("Failed to fetch divisions");
  //   }
  // };

  console.log("setLanguageSelected", selectedLanguage);
  console.log("selectedDOB", selectedDOB);

  const handleDOBChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    const minAllowedDate = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    );

    if (selectedDate > minAllowedDate) {
      setDobError(t("dobValidation"));
      setSelectedDOB("");
      setAgeCategory(""); // Reset age category if DOB is invalid
    } else {
      setDobError("");
      setSelectedDOB(e.target.value);

      // Calculate age and set age category
      const age = calculateAge(e.target.value);
      if (age <= 9) {
        setAgeCategory("kids");
      } else if (age <= 13) {
        setAgeCategory("junior");
      } else {
        setAgeCategory("senior");
      }
    }
  };

  // const handleNext = () => {
  //   if (step === "language") {
  //     setStep("dob");
  //   } else if (step === "dob") {
  //     setStep("education_level");
  //   } else if (step === "education_level") {
  //     if (educationLevel == 2) {
  //       setStep("reason");
  //     } else {
  //       setStep("signup");
  //     }
  //   } else if (step === "reason") {
  //     setStep("additional_info");
  //   } else if (step === "additional_info") {
  //     setStep("signup");
  //   }
  // };

  const handleNext = () => {
    if (step === "eligibility_info") {
      setStep("dob");
    } else if (step === "language") {
      setStep("dob");
    } else if (step === "dob") {
      setStep("signup");
    }
  };

  const onSubmit = async (data) => {
    
    if (!data.gender) {
      setError("gender", {
        type: "manual",
        message: t("genderRequired"),
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: t("passwordMismatch"),
      });
      return;
    }
    if (!selectedClass) {
      toast.error("Please select your class/grade");
      return;
    }
    const encryptedPassword = encryptText(data.password);
    data.password = encryptedPassword;

    data.dob = selectedDOB;

    data.language = languageMapping[selectedLanguage] || selectedLanguage;

    if (isCollegeStudent && data.college && data.university) {
      data.college = encryptText(data.college);
      data.university = encryptText(data.university);
    }
    data.country = selectedCountry?.label;
    data.educationLevel = educationLevelMapping[educationLevel];
    data.class = selectedClass;
    try {
      const response = await GlobalApi.CreateNewUser(data);

      if (response.status === 201) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);
        reset();

        toast.success(t("successMessage"));
        
        // Route based on class selection
        if (["5", "6", "7"].includes(selectedClass)) {
          localStorage.setItem('dashboardUrl', '/dashboard_junior');
          localStorage.setItem('navigateUrl', '/dashboard_junior');
          response.data.quizCompleted ? router.push('/dashboard/careers') : router.push('/dashboard_junior');
        } else {
          localStorage.setItem('dashboardUrl', '/dashboard');
          localStorage.setItem('navigateUrl', '/dashboard');
          response.data.quizCompleted ? router.push('/dashboard/careers') : router.push('/dashboard');
        }
      } else {
        const errorMessage = response.data?.message || t("defaultErrorMessage");
        toast.error(`Error: ${errorMessage}`);
      }
      } catch (err) {
      console.error("Error:", err);

      if (err.response?.status === 400 && err.response?.data?.message) {
        const errorMsg = err.response.data.message;
        if (errorMsg.includes("Username")) {
          setError("username", {
            type: "manual",
            message: t("usernameExists"),
          });
        } else if (errorMsg.includes("Phone number")) {
          setError("mobile", {
            type: "manual",
            message: t("phoneExists"),
          });
        } else {
          toast.error(`Error: ${errorMsg}`);
        }
      } else {
        toast.error(`Error: ${err.message}`);
      }
    }
  };

  const handleQuickSignup = () => {
    router.push('/quick-signup');
  };

  const collegeStudent = watch("student");
  // Language Step
  if (step === "language") {
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center pt-8 pb-8 px-4">
      <Toaster />
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Choose Your Language
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">
              You won't be able to modify it later, so choose wisely.
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <select
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mar">Marathi</option>
                <option value="ur">Urdu</option>
                <option value="sp">Spanish</option>
                <option value="ben">Bengali</option>
                <option value="assa">Assamese</option>
                <option value="ge">German</option>
                <option value="tam">Tamil</option>
                <option value="mal">Malayalam</option>
              </select>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

  // Eligibility Info Step
  if (step === "eligibility_info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center pt-8 pb-8 px-4">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-6">
                {t("eligibilityTitle") || "Welcome to Xortcut"}
              </h1>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl blur-xl"></div>
                <div className="relative p-4">
                  <img 
                    src={"/assets/images/logo-full.png"}
                    alt="Xortcut Logo" 
                    className="w-32 md:w-48 h-auto mx-auto object-contain filter drop-shadow-2xl"
                  />
                </div>
              </div>
              
              <p className="text-gray-200 mb-4 leading-relaxed">
                {t("eligibilityInfo") || "Xortcut is designed for college students and working professionals."}
              </p>
              
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                {t("eligibilityDetails") || "By continuing, you confirm that you are a college student or a working professional."}
              </p>
            </div>
            
            <button
              onClick={handleNext}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              {t("continue") || "Continue"}
            </button>
            <button
                onClick={handleQuickSignup}
                className="w-full py-2 px-6 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600/50 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500/50 mt-3"
              >
                Quick Signup (Testing)
              </button>
          </div>
        </div>
      </div>
    );
  }

 // DOB Step
 if (step === "dob") {
  // Calculate age if selectedDOB exists
  const age = selectedDOB ? calculateAge(selectedDOB) : null;
  // const showCollegeConfirmation = age !== null && age <= 16;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center pt-8 pb-8 px-4">
      <Toaster />
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Enter Your Date of Birth
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">
              You won't be able to modify it later, so enter carefully.
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <input
                type="date"
                value={selectedDOB}
                placeholder="Enter your Date of Birth"
                onChange={handleDOBChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                required
              />
              {dobError && (
                <p className="mt-2 text-sm text-red-400">{dobError}</p>
              )}
            </div>
        
        {/* College confirmation for users 16 or younger */}
        {/* {showCollegeConfirmation && (
          <div className="mt-4 mb-6 p-4 border border-yellow-500 bg-yellow-900 bg-opacity-20 rounded-md">
            <p className="text-yellow-300 font-medium mb-2">Confirmation Required</p>
            <p className="text-gray-300 text-sm mb-3">
              Xortcut is primarily for college students and professionals. Are you a college student or working professional?
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setIsCollegeStudent(true)}
                className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
                  isCollegeStudent 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-800 text-gray-300 border border-gray-700"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 py-2 px-3 rounded-md text-sm bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                Exit Sign Up
              </button>
            </div>
          </div>
        )}
         */}
            <button
              onClick={handleNext}
              className={`w-full py-3 px-6 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                !selectedDOB || dobError
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/25 hover:scale-[1.02]'
              }`}
              disabled={!selectedDOB || dobError }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

 // Education Level Step
  if (step === "education_level") {
    return (
    <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3 bg-black bg-opacity-90">
      <Toaster />
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-xl font-bold mb-4 text-center text-white">
          Choose Your Education Level
        </h1>
        <p className="text-center mb-4 text-gray-300">
          You won't be able to modify it later, so choose wisely.
        </p>
        <div className="mb-4">
          <label
            htmlFor="educationLevelSlider"
            className="block text-sm font-medium text-gray-300"
          >
            Education Level
          </label>
          <input
            type="range"
            id="educationLevelSlider"
            min="0"
            max="2"
            step="1"
            value={educationLevel}
            onChange={(e) => {
              if (e.target.value == 1) {
                setIsCollegeStudent(true);
              } else {
                setIsCollegeStudent(false);
              }
              setEducationLevel(e.target.value);
            }}
            className="w-full mt-2 accent-blue-600"
          />
          <div className="flex justify-between mt-2 gap-1">
            <span
              className={
                educationLevel == 0
                  ? "font-bold text-wrap w-1/3 text-left text-white"
                  : "text-wrap w-1/3 text-left text-gray-400"
              }
            >
              School
            </span>
            <span
              className={
                educationLevel == 1
                  ? "font-bold text-wrap w-1/3 text-center text-white"
                  : "text-wrap w-1/3 text-center text-gray-400"
              }
            >
              College
            </span>
            <span
              className={
                educationLevel == 2
                  ? "font-bold text-wrap w-1/3 text-end text-white"
                  : "text-wrap w-1/3 text-end text-gray-400"
              }
            >
              Completed Education
            </span>
          </div>
        </div>
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )}

  if (step === "reason") {
    return (
    <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3 bg-black bg-opacity-90">
      <Toaster />
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-xl font-bold mb-4 text-center text-white">
          Why are you here?
        </h1>
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="1"
            step="1"
            value={reason}
            onChange={(e) => setReason(parseInt(e.target.value))}
            className="w-full mt-2 accent-blue-600"
          />
          <div className="flex justify-between mt-2 gap-1">
            <span
              className={
                reason == 0
                  ? "font-bold text-wrap w-1/2 text-left text-white"
                  : "text-wrap w-1/2 text-left text-gray-400"
              }
            >
              New Job
            </span>
            <span
              className={
                reason == 1
                  ? "font-bold text-wrap w-1/2 text-end text-white"
                  : "text-wrap w-1/2 text-end text-gray-400"
              }
            >
              Career Change
            </span>
          </div>
        </div>
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )}

  if (step === "additional_info") {
    return (
    <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3 bg-black bg-opacity-90">
      <Toaster />
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-xl font-bold mb-4 text-center text-white">
          Additional Information
        </h1>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Education Qualification</label>
            <input
              {...register("educationQualification", { required: true })}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">University</label>
            <input
              {...register("university", { required: true })}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          {reason === 1 && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Experience (Years)</label>
                <input
                  type="number"
                  {...register("experience", { required: true, min: 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Current Job</label>
                <input
                  {...register("currentJob", { required: true })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </>
          )}
          <button
            type="submit"
            onClick={handleNext}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )}

   return (
    // Main Signup Form
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center pt-8 pb-8 px-4">
      <Toaster />
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t("title")}</h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
          </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              {t("name")}
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              {t("username")}
            </label>
            <input
              type="text"
              {...register("username")}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
              placeholder="Choose a username"
              required
            />
          </div>
          {errors.username && (
            <p className="text-red-400 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              {t("password")}
            </label>
            <input
              type="password"
              {...register("password", {
                required: t("passwordRequired"),
                minLength: {
                  value: 6,
                  message: t("passwordMinLength"),
                },
                pattern: {
                  value: /(?=.*[!@#$%^&*])/,
                  message: t("passwordPattern"),
                },
              })}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
              placeholder="Create a password"
              required
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-200 mb-2"
            >
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
            <div className="md:text-sm text-xs text-gray-400 mt-2">{t("passWord")}</div>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-300"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                {...register("gender", { required: t("genderRequired") })}
              >
                <option value="">{t("gender")}</option>
                <option value="Mr">{t("genderOptions.mr")}</option>
                <option value="Miss">{t("genderOptions.miss")}</option>
                <option value="Mrs">{t("genderOptions.mrs")}</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
              )}
            </div>

            <div className="flex-1">
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-300"
              >
                {t("mobile")}
              </label>
              <input
                type="tel" 
                {...register("mobile", {
                  minLength: {
                    value: 10,
                    message: t("mobileMinLength"),
                  },
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mobile.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="class"
              className="block text-sm font-medium text-gray-300"
            >
              {t("class")}
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Class/Grade</option>
              <option value="5">5th</option>
              <option value="6">6th</option>
              <option value="7">7th</option>
              <option value="8">8th</option>
              <option value="9">9th</option>
              <option value="10">10th</option>
              <option value="11">11th</option>
              <option value="12">12th</option>
              <option value="college">College</option>
            </select>
          </div>

          {/* <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Institute</label>
            <select
              {...register("instituteId", { 
                required: "Institute is required",
                onChange: (e) => {
                  const instituteId = e.target.value;
                  fetchClassesForChild(instituteId);
                } 
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Institute</option>
              {institutions.map((institute) => (
                <option key={institute.id} value={institute.id}>
                  {institute.name}
                </option>
              ))}
            </select>
            {errors.childUsers?.institute && (
              <p className="mt-1 text-sm text-red-600">{errors.childUsers.institute.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">Class</label>
              <select
                {...register("classId", { 
                  required: "Class is required",
                  onChange: (e) => {
                    const classId = e.target.value;
                    fetchDivisionsForChild(classId);
                  }
                })}
                disabled={!childClassOptions || childClassOptions.length === 0}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
              >
                <option value="">Select Class</option>
                {childClassOptions?.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
              {errors.childUsers?.class && (
                <p className="mt-1 text-sm text-red-600">{errors.childUsers.class.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Division</label>
              <select
                {...register("divisionId", { required: "Division is required" })}
                disabled={!childDivisionOptions || childDivisionOptions.length === 0}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
              >
                <option value="">Select Division</option>
                {childDivisionOptions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
              {errors.childUsers?.division && (
                <p className="mt-1 text-sm text-red-600">{errors.childUsers.division.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Academic Year Start</label>
              <input
                type="month"
                {...register("academicYearStart", {
                  required: "Academic year start is required"
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.childUsers?.academicYearStart && (
                <p className="mt-1 text-sm text-red-600">{errors.childUsers.academicYearStart.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Academic Year End</label>
              <input
                type="month"
                {...register("academicYearEnd", {
                  required: "Academic year end is required"
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.childUsers?.academicYearEnd && (
                <p className="mt-1 text-sm text-red-600">{errors.childUsers.academicYearEnd.message}</p>
              )}
            </div>
          </div> */}

          {ageCategory !== "kids" && educationLevel!=0 && (
            <div className="mb-4">
              <label
                htmlFor="highestEducation"
                className="block text-sm font-medium text-gray-300"
              >
                {isCollegeStudent ? "Current Education" : "Highest Education"}
              </label>
              <select
                id="highestEducation"
                {...register("education", {
                  required:
                    ageCategory !== "kids" ? t("educationRequired") : false,
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required={ageCategory !== "kids"}
              >
                <option value="">
                  Select{" "}
                  {isCollegeStudent ? "Current Education" : "Highest Education"}
                </option>

                {ageCategory === "junior" && (
                  <>
                    <option value="10th Std">{t("10th Std")}</option>
                    <option value="12th Std">{t("12th Std")}</option>
                  </>
                )}

                <option value="Bachelor's Degree">
                  {t("bachelorsDegree")}
                </option>
                <option value="Associates Degree">
                  {t("associateDegree")}
                </option>
                <option value="Masters Degree">{t("mastersDegree")}</option>
              </select>
              {isCollegeStudent && (
                <>
                  <div className="my-4">
                    <label
                      htmlFor="college"
                      className="block text-sm font-medium text-gray-300"
                    >
                      {t("college")}
                    </label>
                    <input
                      type="text"
                      {...register("college")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="university"
                      className="block text-sm font-medium text-gray-300"
                    >
                      {t("university")}
                    </label>
                    <input
                      type="text"
                      {...register("university")}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
              {errors.education && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.education.message}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            {t("submit")}
          </button>
        </form>
        <div className="text-center mt-6">
          <span className="text-gray-300">{t("alreadyRegistered")} </span>
          <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200">
            {t("login")}
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
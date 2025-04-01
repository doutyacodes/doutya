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

  // const [institutions, setInstitutions] = useState([]);
  // const [childClassOptions, setChildClassOptions] = useState([]);
  // const [childDivisionOptions, setChildDivisionOptions] = useState([]);

  const router = useRouter();
  const t = useTranslations("SignupPage");
  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          // router.push("/dashboard");
          const url = typeof window !== "undefined" ? localStorage.getItem("navigateUrl") : null;
          router.replace(url);
        } 
      }
    };
    authCheck();
  }, [router]);
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
    try {
      const response = await GlobalApi.CreateNewUser(data);

      if (response.status === 201) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);
        reset();

        const age = calculateAge(data.dob);

        toast.success(t("successMessage"));
        if (age <= 9) {
          localStorage.setItem('dashboardUrl', '/dashboard_kids');
          localStorage.setItem('navigateUrl', '/dashboard_kids');
          router.push('/dashboard_kids');
        } 
        else if (age <= 13) {
          localStorage.setItem('dashboardUrl', '/dashboard_junior');
          localStorage.setItem('navigateUrl', '/dashboard_junior');
          response.data.quizCompleted ? router.push('/dashboard/careers'):router.push('/dashboard_junior');
        } 
        else {
          localStorage.setItem('dashboardUrl', '/dashboard');
          localStorage.setItem('navigateUrl', '/dashboard');
          response.data.quizCompleted ? router.push('/dashboard/careers'):router.push('/dashboard');
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

  const collegeStudent = watch("student");
  // Language Step
  if (step === "language") {
    return (
    <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3 bg-black bg-opacity-90">
      <Toaster />
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-xl font-bold mb-4 text-center text-white">
          Choose Your Language
        </h1>
        <p className="text-center mb-4 text-gray-300">
          You won't be able to modify it later, so choose wisely.
        </p>
        <div className="mb-4">
          <select
            className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

  // Eligibility Info Step
  if (step === "eligibility_info") {
    return (
      <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3 bg-black bg-opacity-90">
        <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">
            {t("eligibilityTitle") || "Welcome to Xortcut"}
          </h1>
          
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <img 
                src={"/assets/images/logo-full.png"}
                alt="Xortcut Logo" 
                className="w-32 md:w-48 h-auto mb-2 object-contain"
              />
            </div>
            
            <p className="text-gray-300 mb-4">
              {t("eligibilityInfo") || "Xortcut is designed for college students and working professionals."}
            </p>
            
            <p className="text-gray-400 text-sm mb-8">
              {t("eligibilityDetails") || "By continuing, you confirm that you are a college student or a working professional."}
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors"
            >
              {t("continue") || "Continue"}
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
  const showCollegeConfirmation = age !== null && age <= 16;
  
  return (
    <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3 bg-black bg-opacity-90">
      <Toaster />
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-xl font-bold mb-4 text-center text-white">
          Enter Your Date of Birth
        </h1>
        <p className="text-center mb-4 text-gray-300">
          You won't be able to modify it later, so enter carefully.
        </p>
        <div className="mb-4 w-full">
          <input
            type="date"
            value={selectedDOB}
            placeholder="Enter your Date of Birth"
            onChange={handleDOBChange}
            max={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full min-w-72 px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          {dobError && (
            <p className="mt-2 text-sm text-red-600">{dobError}</p>
          )}
        </div>
        
        {/* College confirmation for users 16 or younger */}
        {showCollegeConfirmation && (
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
        
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={!selectedDOB || dobError || (showCollegeConfirmation && !isCollegeStudent)}
        >
          Next
        </button>
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
    <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3 bg-black bg-opacity-90">
      <Toaster />
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">{t("title")}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                {t("name")}
              </label>
              <input
                type="text"
                {...register("name")}
                className="mt-1 block w-full px-3 py-[6.5px] border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              {t("username")}
            </label>
            <input
              type="text"
              {...register("username")}
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300"
            >
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
            <div className="md:text-sm text-xs text-gray-400">{t("passWord")}</div>
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

          <div className="mb-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow hover:bg-blue-700 transition-colors"
            >
              {t("submit")}
            </button>
          </div>
        </form>
        <div className="flex justify-between">
          <div className="flex justify-between gap-2">
            <span className="text-gray-400">{t("alreadyRegistered")}</span>
            <Link href="/login" className="text-blue-500 hover:text-blue-400">
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
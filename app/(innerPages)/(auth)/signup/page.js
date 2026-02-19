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

  // Add these new state variables after line 33
  const [institutionType, setInstitutionType] = useState(""); // "School" or "College"
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [streamOptions, setStreamOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedClassGrade, setSelectedClassGrade] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

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

  const [showStreamInput, setShowStreamInput] = useState(false);

  // const [institutions, setInstitutions] = useState([]);
  // const [childClassOptions, setChildClassOptions] = useState([]);
  // const [childDivisionOptions, setChildDivisionOptions] = useState([]);

  const router = useRouter();
  const t = useTranslations("SignupPage");

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

  // Fetch institutions when type is selected
  useEffect(() => {
    if (institutionType) {
      fetchInstitutions();
    }
  }, [institutionType]);

  // Filter institutions based on search
  useEffect(() => {
    if (institutionSearch) {
      const filtered = institutions.filter(inst =>
        inst.name.toLowerCase().includes(institutionSearch.toLowerCase())
      );
      setFilteredInstitutions(filtered);
    } else {
      setFilteredInstitutions(institutions);
    }
  }, [institutionSearch, institutions]);

  const fetchInstitutions = async () => {
    try {
      const response = await GlobalApi.GetInstitutionsByType(institutionType);
      if (response.status === 200) {
        setInstitutions(response.data.institutions);
        setFilteredInstitutions(response.data.institutions);
      }
    } catch (error) {
      toast.error("Failed to fetch institutions");
    }
  };

  const fetchClassesByInstitution = async (instituteId) => {
    try {
      const response = await GlobalApi.GetClassesByInstitute(instituteId);
      if (response.status === 200) {
        setClassOptions(response.data.classes);
        // Reset dependent fields
        setValue('classId', '');
        setValue('divisionId', '');
        setSelectedClassGrade("");
        setDivisionOptions([]);
        setStreamOptions([]);
        setCourseOptions([]);
      }
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };

  const fetchDivisionsByClass = async (classId) => {
    try {
      const response = await GlobalApi.GetDivisionsByClass(classId);
      if (response.status === 200) {
        setDivisionOptions(response.data.divisions);
        setValue('divisionId', '');
      }
    } catch (error) {
      toast.error("Failed to fetch divisions");
    }
  };

  const fetchStreamsByInstitution = async (instituteId) => {
    try {
      const response = await GlobalApi.GetStreamsByInstitution(instituteId);
      if (response.status === 200) {
        setStreamOptions(response.data.streams);
      }
    } catch (error) {
      toast.error("Failed to fetch streams");
    }
  };

  const fetchCoursesByInstitution = async (instituteId) => {
    try {
      const response = await GlobalApi.GetCoursesByInstitution(instituteId);
      if (response.status === 200) {
        setCourseOptions(response.data.courses);
      }
    } catch (error) {
      toast.error("Failed to fetch courses");
    }
  };

  const handleInstitutionChange = (instituteId) => {
    const institute = institutions.find(inst => inst.id === parseInt(instituteId));
    setSelectedInstitution(institute);
    fetchClassesByInstitution(instituteId);
  };

  const handleClassChange = (classId) => {
    const selectedClass = classOptions.find(cls => cls.id === parseInt(classId));
    if (selectedClass) {
      setSelectedClassGrade(selectedClass.standard_grade);
      
      // Fetch divisions
      fetchDivisionsByClass(classId);
      
      // If grade is 11 or 12, fetch streams
      if (["11", "12"].includes(selectedClass.standard_grade)) {
        fetchStreamsByInstitution(selectedInstitution.id);
      }
      
      // If grade is college, fetch courses
      if (selectedClass.standard_grade === "college") {
        fetchCoursesByInstitution(selectedInstitution.id);
      }
    }
  };

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

    if (!institutionType) {
      toast.error("Please select institution type (School/College)");
      return;
    }

    if (!data.instituteId) {
      toast.error("Please select your institution");
      return;
    }

    if (!data.classId) {
      toast.error("Please select your class");
      return;
    }

    if (!data.divisionId) {
      toast.error("Please select your division");
      return;
    }

    // Validate stream for grades 11, 12
    if (["11", "12"].includes(selectedClassGrade) && !selectedStream) {
      toast.error("Please select your stream");
      return;
    }

    // Validate course for college
    if (selectedClassGrade === "college" && !selectedCourse) {
      toast.error("Please select your course");
      return;
    }

    const encryptedPassword = encryptText(data.password);
    data.password = encryptedPassword;
    data.dob = selectedDOB;
    data.language = languageMapping[selectedLanguage] || selectedLanguage;
    data.classGrade = selectedClassGrade; // Add grade to data
    data.country = selectedCountry;
    // Add stream_id or course_id based on grade
    if (["11", "12"].includes(selectedClassGrade)) {
      data.streamId = parseInt(selectedStream);
    }
    if (selectedClassGrade === "college") {
      data.courseId = parseInt(selectedCourse);
      data.country = selectedCountry?.label;
      data.educationLevel = educationLevelMapping[educationLevel];
    }

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

const handleBackButton = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/login');
  }
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
            {/* <button
                onClick={handleQuickSignup}
                className="w-full py-2 px-6 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600/50 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500/50 mt-3"
              >
                Quick Signup (Testing)
              </button> */}

              <button
                onClick={handleBackButton}
                className="w-full py-2 px-6 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600/50 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500/50 mt-3"
              >
                Back
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

          {/* Institution Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Institution Type
            </label>
            <select
              value={institutionType}
              onChange={(e) => {
                setInstitutionType(e.target.value);
                setSelectedInstitution(null);
                setInstitutions([]);
                setFilteredInstitutions([]);
                setInstitutionSearch("");
                setValue('instituteId', '');
              }}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
              required
            >
              <option value="">Select Type</option>
              <option value="School">School</option>
              <option value="College">College</option>
            </select>
          </div>

          {/* Institution Selection with Search */}
          {institutionType && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search & Select Your Institution
              </label>
              <input
                type="text"
                placeholder="Search institution..."
                value={institutionSearch}
                onChange={(e) => setInstitutionSearch(e.target.value)}
                className="w-full px-4 py-3 mb-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
              />
              <select
                {...register("instituteId", { required: "Institution is required" })}
                onChange={(e) => handleInstitutionChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 max-h-48 overflow-y-auto"
                required
                size="5"
              >
                <option value="">Select Institution</option>
                {filteredInstitutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
              {errors.instituteId && (
                <p className="text-red-400 text-sm mt-1">{errors.instituteId.message}</p>
              )}
            </div>
          )}

          {/* Class Selection */}
          {selectedInstitution && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Class
              </label>
              <select
                {...register("classId", { 
                  required: "Class is required",
                  onChange: (e) => handleClassChange(e.target.value)
                })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                disabled={!classOptions || classOptions.length === 0}
                required
              >
                <option value="">Select Class</option>
                {classOptions.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} {classItem.standard_grade && `(Grade ${classItem.standard_grade})`}
                  </option>
                ))}
              </select>
              {errors.classId && (
                <p className="text-red-400 text-sm mt-1">{errors.classId.message}</p>
              )}
            </div>
          )}

          {/* Division Selection */}
          {selectedClassGrade && divisionOptions.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Division
              </label>
              <select
                {...register("divisionId", { required: "Division is required" })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                required
              >
                <option value="">Select Division</option>
                {divisionOptions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
              {errors.divisionId && (
                <p className="text-red-400 text-sm mt-1">{errors.divisionId.message}</p>
              )}
            </div>
          )}

          {/* Stream Selection for Grades 11, 12 */}
          {["11", "12"].includes(selectedClassGrade) && streamOptions.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stream
              </label>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                required
              >
                <option value="">Select Stream</option>
                {streamOptions.map((stream) => (
                  <option key={stream.id} value={stream.id}>
                    {stream.name}
                    {stream.description && ` - ${stream.description}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Course Selection for College */}
          {selectedClassGrade === "college" && courseOptions.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                required
              >
                <option value="">Select Course</option>
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                    {course.duration_years && ` (${course.duration_years} years)`}
                    {course.description && ` - ${course.description}`}
                  </option>
                ))}
              </select>
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
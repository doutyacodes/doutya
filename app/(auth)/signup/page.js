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
  const [step, setStep] = useState("dob");
  const [isCollegeStudent, setIsCollegeStudent] = useState(false);
  const [countryOptions] = useState(countryList().getData());
  const [selectedCountry, setSelectedCountry] = useState("India");
  // const [languageSelected, setLanguageSelected] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [educationLevel, setEducationLevel] = useState(0);
  const [dobError, setDobError] = useState("");
  const [ageCategory, setAgeCategory] = useState(""); // New state for age category

  const router = useRouter();
  const t = useTranslations("SignupPage");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
  } = useForm();

  const educationLevelMapping = {
    0: "School",
    1: "College",
    2: "Completed Education",
  };

  // useEffect(() => {
  //     const storedLanguage = localStorage.getItem('language');
  //     if (storedLanguage) {
  //         // setSelectedLanguage(storedLanguage);
  //         setLanguageSelected(true);
  //     }
  // }, []);

  // useEffect(() => {
  //     const savedLanguage = localStorage.getItem('language');
  //     if(savedLanguage){
  //         setSelectedLanguage(savedLanguage);
  //         setLanguageSelected(true);
  //     }
  // }, []);

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

  console.log("setLanguageSelected", selectedLanguage);
  console.log("selectedDOB", selectedDOB);

  // const handleLanguageChange = (e) => {
  //     const newLanguage = e.target.value;
  //     console.log('newLanguage', newLanguage)
  //     setSelectedLanguage(newLanguage);
  //     localStorage.setItem('language', newLanguage);
  //     document.cookie = `locale=${newLanguage}; path=/`;
  //     console.log(document.cookie)
  //     router.refresh();
  //     // setLanguageSelected(true);
  //   };

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
    if (step === "language") {
      setStep("dob");
    } else if (step === "dob") {
      setStep("education_level");
    } else if (step === "education_level") {
      setStep("signup");
    }
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: t("passwordMismatch"),
      });
      return;
    }
    const encryptedPassword = encryptText(data.password);
    data.password = encryptedPassword;

    data.dob = selectedDOB; /* Adding the previously got date to the data */

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

        toast.success(t("successMessage")); // Use translation
        router.push("/country");
        // if (age <= 9) {
        //     localStorage.setItem('dashboardUrl', '/dashboard_kids');
        //     router.push('/dashboard_kids');
        // } else if (age <= 13) {
        //     localStorage.setItem('dashboardUrl', '/dashboard_junior');
        //     router.push('/dashboard_junior');
        // } else {
        //     localStorage.setItem('dashboardUrl', '/dashboard');
        //     router.push('/dashboard');
        // }
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

  // if (!languageSelected) {
  if (step === "language") {
    return (
      <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3">
        <Toaster />
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-xl font-bold mb-4 text-center">
            Choose Your Language
          </h1>
          <p className="text-center mb-4">
            You won't be able to modify it later, so choose wisely.
          </p>
          <div className="mb-4">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            // onClick={() => setLanguageSelected(true)}
            onClick={handleNext}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  if (step === "dob") {
    return (
      <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3">
        <Toaster />
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-xl font-bold mb-4 text-center">
            Enter Your Date of Birth
          </h1>
          <p className="text-center mb-4">
            You won't be able to modify it later, so enter carefully.
          </p>
          <div className="mb-4 w-full">
            <input
              type="date"
              value={selectedDOB}
              placeholder="Enter your Date of Birth"
              onChange={handleDOBChange}
              max={new Date().toISOString().split("T")[0]}
              className="mt-1 block w-full min-w-72 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            {dobError && (
              <p className="mt-2 text-sm text-red-600">{dobError}</p>
            )}
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!selectedDOB || dobError}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  if (step === "education_level") {
    return (
      <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3">
        <Toaster />
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-xl font-bold mb-4 text-center">
            Choose Your Education Level
          </h1>
          <p className="text-center mb-4">
            You won't be able to modify it later, so choose wisely.
          </p>
          <div className="mb-4">
            <label
              htmlFor="educationLevelSlider"
              className="block text-sm font-medium text-gray-700"
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
              className="w-full mt-2"
            />
            <div className="flex justify-between mt-2 gap-1">
              <span
                className={
                  educationLevel == 0
                    ? "font-bold text-wrap w-1/3 text-left"
                    : " text-wrap w-1/3 text-left"
                }
              >
                School
              </span>
              <span
                className={
                  educationLevel == 1
                    ? "font-bold text-wrap w-1/3 text-center"
                    : " text-wrap w-1/3 text-center"
                }
              >
                College
              </span>
              <span
                className={
                  educationLevel == 2
                    ? "font-bold text-wrap w-1/3 text-end"
                    : " text-wrap w-1/3 text-end"
                }
              >
                Completed Education
              </span>
            </div>
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen pt-8 pb-8 px-3">
      <Toaster />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("title")}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <select
                id="honorific"
                name="honorific"
                className="mt-6 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                {...register("gender")}
              >
                <option value="">{t("gender")}</option>
                <option value="Mr">{t("genderOptions.mr")}</option>
                <option value="Miss">{t("genderOptions.miss")}</option>
                <option value="Mrs">{t("genderOptions.mrs")}</option>
              </select>
            </div>
            <div className="flex-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {t("name")}
              </label>
              <input
                type="text"
                {...register("name")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              {t("username")}
            </label>
            <input
              type="text"
              {...register("username")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="block text-sm font-medium text-gray-700"
            >
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
            <div className="md:text-sm text-xs">{t("passWord")}</div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-gray-700"
            >
              {t("mobile")}
            </label>
            <input
              type="number"
              {...register("mobile", {
                minLength: {
                  value: 10,
                  message: t("mobileMinLength"),
                },
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mobile.message}
              </p>
            )}
          </div>

          {/* <div className="mb-4">
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              {t("country")}
            </label>
            <Select
              options={countryOptions}
              value={selectedCountry}
              onChange={setSelectedCountry}
              className="mt-1 block w-full"
            />
          </div> */}

          {/* <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">{t('dob')}</label>
                        <input
                            type="date"
                            {...register("dob", {
                                required: t('dobRequired'),
                                validate: {
                                    notTooYoung: (value) => {
                                        const today = new Date();
                                        const selectedDate = new Date(value);
                                        const minAllowedDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
                                        return selectedDate <= minAllowedDate || t('dobValidation');
                                    }
                                }
                            })}
                            max={new Date().toISOString().split("T")[0]}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.dob && <p className="mt-2 text-sm text-red-600">{errors.dob.message}</p>}
                    </div> */}
          <br />
          <div className="mb-4 flex items-center">
            <label
              htmlFor="collegeStudent"
              className="block text-sm font-medium text-gray-700 mr-4"
            >
              {t("collegeStudent")}
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  {...register("student")}
                  value="no"
                  checked={!isCollegeStudent}
                  onChange={() => setIsCollegeStudent(false)}
                  className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 mr-5">
                  {t("studentOptions.no")}
                </span>
                <input
                  type="radio"
                  checked={isCollegeStudent}
                  {...register("student")}
                  value="yes"
                  onChange={() => setIsCollegeStudent(true)}
                  className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">
                  {t("studentOptions.yes")}
                </span>
              </label>
            </div>
          </div>

          {isCollegeStudent && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="college"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("college")}
                </label>
                <input
                  type="text"
                  {...register("college")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="university"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("university")}
                </label>
                <input
                  type="text"
                  {...register("university")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}

          {/* Conditional "Highest Education" Field for Junior and Senior Users */}
          {ageCategory !== "kids" && educationLevel!==0 && !isCollegeStudent && (
            <div className="mb-4">
              <label
                htmlFor="highestEducation"
                className="block text-sm font-medium text-gray-700"
              >
                {isCollegeStudent ? "Current Education" : "Highest Education"}
              </label>
              <select
                id="highestEducation"
                {...register("education", {
                  required:
                    ageCategory !== "kids" ? t("educationRequired") : false,
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required={ageCategory !== "kids"}
              >
                <option value="">
                  Select{" "}
                  {isCollegeStudent ? "Current Education" : "Highest Education"}
                </option>

                {/* Options for Junior Users */}
                {ageCategory === "junior" && (
                  <>
                    <option value="10th Std">{t("10th Std")}</option>
                    <option value="12th Std">{t("12th Std")}</option>
                  </>
                )}

                {/* Common Options for Junior and Senior */}
                <option value="Bachelor's Degree">
                  {" "}
                  {t("bachelorsDegree")}{" "}
                </option>
                <option value="Associates Degree">
                  {" "}
                  {t("associateDegree")}{" "}
                </option>
                <option value="Masters Degree"> {t("mastersDegree")} </option>
              </select>
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
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors"
            >
              {t("submit")}
            </button>
          </div>
        </form>
        <div className="flex justify-between">
          <div className="flex justify-between gap-2">
            <span className="text-slate-400">{t("alreadyRegistered")}</span>
            <Link href="/login" className="text-blue-500 hover:text-blue-600">
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
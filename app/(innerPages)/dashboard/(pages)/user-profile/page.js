"use client";

import { X, Edit3, Save, KeyRound } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import GlobalApi from "@/app/_services/GlobalApi";
import { encryptText } from "@/utils/encryption";
import toast, { Toaster } from "react-hot-toast";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { calculateAge } from "@/lib/ageCalculate"; // Ensure this utility exists and works correctly
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import CareerStripe from "@/app/_components/CareerStripe.jsx";
import ProfileKeySection from "../../_components/ProfileKeySection/ProfileKeySection.jsx";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Smartphone, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function Page() {
  const [isCollegeStudent, setIsCollegeStudent] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null); // Initialized as null for better type handling
  const [isSubmit, setIsSubmit] = useState(false);
  const [dashboardType, setDashboardType] = useState(''); // Possible values: 'kids', 'junior', 'senior'
  const [showKey, setShowKey] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const t = useTranslations('ProfilePage');
  

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Authentication Check
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm();

  // Fetch User Data
  const getUserData = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.GetUserData(token);
      setUserData(resp.data);
    } catch (error) {
      console.error("Error Fetching UserData:", error);
      toast.error(t('errorFetchingData'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  // Determine Dashboard Type and Initialize Form
  useEffect(() => {
    if (userData) {
      // Calculate age using birth_date
      const age = calculateAge(userData.birth_date);
      let url = '/dashboard';
      let type = 'senior';

      if (age <= 9) {
        url = '/dashboard_kids';
        type = 'kids';
      } else if (age <= 13) {
        url = '/dashboard_junior';
        type = 'junior';
      }

      localStorage.setItem('dashboardUrl', url);
      setDashboardType(type);

      // Initialize form fields (excluding birth_date)
      const yearMonth =
        userData.yearOfPassing && userData.monthOfPassing
          ? `${userData.yearOfPassing}-${userData.monthOfPassing.padStart(2, "0")}`
          : "";
      reset({
        name: userData.name,
        gender: userData.gender,
        mobile: userData.mobile,
        password: userData.password,
        confirmPassword: userData.password,
        username: userData.username,
        education: userData.education,
        student: userData.student,
        college: userData.college,
        university: userData.university,
        yearMonthOfPassing: yearMonth,
      });
    }
  }, [reset, userData, t]);

  // Form Submission Handler
  const onSubmit = async (data) => {
    setIsSubmit(true);
    
    // Validate Passwords
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: t('passwordsDoNotMatch'),
      });
      setIsSubmit(false);
      return;
    }

    // Encrypt Password
    const encryptedPassword = encryptText(data.password);
    data.password = encryptedPassword;

    // Encrypt College and University if provided
    if (data.college !== "" && data.university !== "") {
      const encryptedCollege = encryptText(data.college);
      const encryptedUniversity = encryptText(data.university);
      data.college = encryptedCollege;
      data.university = encryptedUniversity;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.UpdateUser(data, token);

      if (response.status === 200 || response.status === 201) {
        toast.success(t('userDataUpdated'));
        getUserData();
      } else {
        const errorMessage = response.data?.message || t('unexpectedError');
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      // Handle API Errors
      if (err && err.response) {
        const { response } = err;
        if (response.status === 409) {
          const errorMessage = response.data?.message || t('usernameExists');
          console.log("Error message:", errorMessage);
          setError("username", {
            type: "manual",
            message: errorMessage,
          });
          toast.error(errorMessage);
        } else {
          const errorMessage = response.data?.message || t('unexpectedError');
          toast.error(`Error: ${errorMessage}`);
        }
      } else {
        // Handle Unexpected Errors
        toast.error(t('unexpectedError'));
      }
    } finally {
      setIsSubmit(false);
    }
  };

  // Loading or Authentication State
  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={t('loading')} />
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Import for Mobile Navigation
  const MobileNavigation = dynamic(() => import('../../_components/Navbar/button.jsx'), { ssr: false });

  return (
    <div className="min-h-screen max-md:pb-24 px-4 py-10 md:py-0 md:px-0">
      <CareerStripe selectedItem={selectedCareer}  setSelectedItem={setSelectedCareer}/>
      <Toaster position="top-center" reverseOrder={false} />
        {/* <Link href={typeof window !== 'undefined' ? localStorage.getItem('dashboardUrl') : '/login'}>
          <button className="text-white bg-green-600 -mt-20 mb-7 ml-20 p-3 rounded-xl">
            {t('backToDashboard')}
          </button>
        </Link> */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="md:flex bg-gradient-to-br from-purple-50 to-indigo-50">
          {/* User Profile Section */}
          <div className="md:flex-shrink-0 bg-gradient-to-b from-purple-600 to-indigo-700 p-8 text-white">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/assets/images/avatardef.png"
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h2 className="text-2xl font-bold">{userData?.name || `${t('loading')}...`}</h2>
              <p className="text-indigo-200">{userData?.username || "Username"}</p>
              <div className="flex items-center mt-2 text-sm">
                {/* <span className="bg-green-500 rounded-full w-3 h-3 mr-2"></span>
                {t('verifiedProfile')} */}
              </div>
              <div className="mt-2">
              <Button
                  onClick={() => setShowKey(!showKey)}
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    showKey 
                      ? 'bg-rose-600 text-white hover:bg-rose-700' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <KeyRound className="h-5 w-5 text-white" />
                  {showKey ? 'View Profile' : 'Generate Parent Key'}
                </Button>
              </div>
            </div>
          </div>
          {
          showKey ? 
          <ProfileKeySection userKey={userData.userKey}/> :
          <>
            {/* Profile Form Section */}
            <div className="p-8 w-full">
              <div className="flex justify-between items-center mb-6">
                {/* <h1 className="text-3xl font-bold text-gray-900">{t('myProfile')}</h1> */}
                <h3 className="text-2xl font-semibold text-indigo-900">
                  {showKey ? 'Generate Parent Key' : 'Profile Information'}
                </h3>
                <button
                  onClick={() => setIsEditable(!isEditable)}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isEditable
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-indigo-500 hover:bg-indigo-600"
                  }`}
                >
                  {isEditable ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <Edit3 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
  
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  {/* Gender Field */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      {t('gender')}
                    </label>
                    <select
                      {...register("gender")}
                      disabled={!isEditable}
                      id="gender"
                      name="gender"
                      autoComplete="gender"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                      <option value="">{t('select')}</option>
                      <option value="Mr">{t('male')}</option>
                      <option value="Miss">{t('female')}</option>
                      <option value="Mrs">{t('mrs')}</option>
                    </select>
                  </div>
  
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      {t('name')}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      {...register("name", { required: `${t('name')} ${t('isRequired')}` })}
                      disabled={!isEditable}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
                  </div>
  
                  {/* Username Field */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      {t('username')}
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      {...register("username", { required: `${t('username')} ${t('isRequired')}` })}
                      disabled={!isEditable}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                    {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>}
                  </div>
  
                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      {t('password')}
                    </label>
                    <input
                      type="password"
                      {...register("password", {
                        minLength: {
                          value: 6,
                          message: t('passwordRequired'),
                        },
                        pattern: {
                          value: /(?=.*[!@#$%^&*])/,
                          message: t('passwordSpecial'),
                        },
                      })}
                      disabled={!isEditable}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                  </div>
  
                  {/* Mobile Number Field */}
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                      {t('mobileNumber')}
                    </label>
                    <input
                      type="tel"
                      {...register("mobile", {
                        required: `${t('mobileNumber')} ${t('isRequired')}`,
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: t('mobileValidation'),
                        },
                      })}
                      disabled={!isEditable}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                    {errors.mobile && <p className="mt-2 text-sm text-red-600">{errors.mobile.message}</p>}
                  </div>
  
                  {/* Student Status Field */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">{t('student')}</label>
                    <div className="mt-2 space-x-6">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          {...register("student")}
                          value="no"
                          onChange={() => setIsCollegeStudent(false)}
                          disabled={!isEditable}
                          className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2">{t('no')}</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          {...register("student")}
                          value="yes"
                          onChange={() => setIsCollegeStudent(true)}
                          disabled={!isEditable}
                          className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2">{t('yes')}</span>
                      </label>
                    </div>
                  </div>
  
                  {/* Conditional Fields for College Students */}
                  {isCollegeStudent && (
                    <>
                      {/* College Field */}
                      <div>
                        <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                          {t('college')}
                        </label>
                        <input
                          type="text"
                          {...register("college")}
                          disabled={!isEditable}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
  
                      {/* University Field */}
                      <div>
                        <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                          {t('university')}
                        </label>
                        <input
                          type="text"
                          {...register("university")}
                          disabled={!isEditable}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
  
                      {/* Year and Month of Passing Field */}
                      <div>
                        <label htmlFor="yearMonthOfPassing" className="block text-sm font-medium text-gray-700">
                          {t('yearAndMonthOfPassing')}
                        </label>
                        <input
                          id="yearMonthOfPassing"
                          name="yearMonthOfPassing"
                          type="month"
                          {...register("yearMonthOfPassing")}
                          disabled={!isEditable}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                      </div>
  
                      {/* Current Enrollment Field */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="currentEnrollment"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          {t('currentEnrollment')}
                        </label>
                        <div className="mt-2 w-1/2">
                          <select
                            disabled={!isEditable}
                            id="currentEnrollment"
                            name="currentEnrollment"
                            autoComplete="education"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            {...register("education")}
                          >
                            <option value="">{t('select')}</option>
                            <option>High School</option>
                            <option>Associate Degree</option>
                            <option>Bachelor's Degree</option>
                            <option>Master's Degree</option>
                            <option>Doctorate</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
  
                  {/* Conditional "Highest Degree" Field for Non-Kids Dashboards */}
                  {!isCollegeStudent && dashboardType !== 'kids' && (
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="highestDegree"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        {t('highestDegree')}
                      </label>
                      <div className="mt-2 w-1/2">
                        <select
                          disabled={!isEditable}
                          id="highestDegree"
                          name="highestDegree"
                          autoComplete="education"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          {...register("education")}
                        >
                          <option value="">{t('select')}</option>
                          <option>High School</option>
                          <option>Associate Degree</option>
                          <option>Bachelor's Degree</option>
                          <option>Master's Degree</option>
                          <option>Doctorate</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
  
                {/* Submit Button for Editable Forms (Excluded for Kids Dashboard) */}
                {isEditable && dashboardType !== 'kids' && (
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmit}
                      className="mt-6 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                    >
                      <Save className="mr-2 h-5 w-5" />
                      {t('saveChanges')}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </>
          }
        </div>
      </div>
      {/* <MobileNavigation /> */}
    </div>
  );
}

export default Page;

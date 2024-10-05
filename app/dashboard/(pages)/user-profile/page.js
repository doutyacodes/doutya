"use client";

import { X, Edit3, Save, User, HelpCircle } from "lucide-react";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { FiEdit3 } from "react-icons/fi";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Edit } from "lucide-react";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import GlobalApi from "@/app/_services/GlobalApi";
import { encryptText } from "@/utils/encryption";
import toast, { Toaster } from "react-hot-toast";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { calculateAge } from "@/lib/ageCalculate";
import { useTranslations } from 'next-intl';

function page() {
  const [isCollegeStudent, setIsCollegeStudent] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserdata] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isEditing, setisEditing] = useState(false);
  const t = useTranslations('ProfilePage');

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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
    watch,
    formState: { errors },
    reset,
    setError,
  } = useForm();

  // useEffect(() => {
  //     const subscription = watch((value, { name, type }) => {
  //         console.log("Form values:", value); // Log all form data
  //         console.log("Changed field:", name, "Type of change:", type); // Log which field changed
  //     });
  //     return () => subscription.unsubscribe(); // Cleanup the subscription
  // }, [watch]);

  useEffect(() => {
    if (userData) {
      const age = calculateAge(userData.birth_date);
      if (age <= 9) {
        localStorage.setItem('dashboardUrl', '/dashboard_kids');
      }
      else if (age <= 13) {
        localStorage.setItem('dashboardUrl', '/dashboard_junior');
      }
      else {
        localStorage.setItem('dashboardUrl', '/dashboard');
      }
    }
  }, [userData]);

  const getUserData = async () => {
    setIsLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.GetUserData(token);
      setUserdata(resp.data);
    } catch (error) {
      console.error("Error Fetching GetQuizData data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);


  useEffect(() => {
    const yearMonth =
      userData.yearOfPassing && userData.monthOfPassing
        ? `${userData.yearOfPassing}-${userData.monthOfPassing.padStart(
          2,
          "0"
        )}`
        : "";
    reset({
      name: userData.name,
      gender: userData.gender,
      mobile: userData.mobile,
      birth_date: userData.birth_date
        ? new Date(userData.birth_date).toISOString().split("T")[0]
        : "",
      password: userData.password,
      confirmPassword: userData.password,
      username: userData.username,
      education: userData.education,
      student: userData.student,
      college: userData.college,
      university: userData.university,
      yearMonthOfPassing: yearMonth,
    });
  }, [reset, userData]);

  const onSubmit = async (data) => {
    setIsSubmit(true);

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: t('passwordRequired'),
      });
      return;
    }
    const encryptedPassword = encryptText(data.password);
    data.password = encryptedPassword;
    if (data.college != "" && data.university != "") {
      const encryptedCollege = encryptText(data.college);
      const encryptedUniversity = encryptText(data.university);
      data.college = encryptedCollege;
      data.university = encryptedUniversity;
    }
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.UpdateUser(data, token);

      if (response.status === 201) {
        toast.success(t('userDataUpdated'));
        getUserData();
      } else {

        const errorMessage = response.data?.message || t('unexpectedError');
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      // Handle any errors that occurred during the API call
      if (err && err.response) {
        const { response } = err;
        if (response.status === 409) {
          const errorMessage =
            response.data?.message || t('usernameExists');
          console.log("Error message:", errorMessage);
          setError("username", {
            type: "manual",
            message: errorMessage,
          });
          toast.error(errorMessage); // Display toast error message
        } else {
          const errorMessage = response.data?.message || t('unexpectedError');;
          toast.error(`Error: ${errorMessage}`);
        }
      } else {
        // Handle unexpected errors
        toast.error(t('unexpectedError'));
      }
    } finally {
      setIsSubmit(false);
    }
  };

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

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" reverseOrder={false} />
      <Link href={typeof window !== 'undefined' ? localStorage.getItem('dashboardUrl') : '/login'}>
        <button className="text-white bg-green-600 -mt-20 mb-7 ml-20 p-3 rounded-xl">
          {t('backToDashboard')}
        </button>
      </Link>
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 bg-gradient-to-b from-purple-600 to-indigo-700 p-8 text-white">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                {userData.profilePicture ? (
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
              <h2 className="text-2xl font-bold">{userData.name || t('loading...')}</h2>
              <p className="text-indigo-200">{userData.username || "Username"}</p>
              <div className="flex items-center mt-2 text-sm">
                <span className="bg-green-500 rounded-full w-3 h-3 mr-2"></span>
                {t('verifiedProfile')}
              </div>
            </div>
          </div>
          <div className="p-8 w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{t('myProfile')}</h1>
              <button
                onClick={() => setIsEditable(!isEditable)}
                className={`p-2 rounded-full transition-colors duration-200 ${isEditable
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
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('name')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    {...register("name", { required: t('name') + " is required" })}
                    disabled={!isEditable}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    {t('username')}
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    {...register("username", { required: t('username') + " is required" })}
                    disabled={!isEditable}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                  {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('password')}
                  </label>
                  <input
                    type="password"
                    {...register("password", {
                      minLength: {
                        value: 6,
                        message: t('passwordRequired')
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
                {/* <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    disabled={!isEditable}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div> */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    {t('mobileNumber')}
                  </label>
                  <input
                    type="tel"
                    {...register("mobile", {
                      required: t('mobileNumber') + " is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit mobile number",
                      },
                    })}
                    disabled={!isEditable}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                  {errors.mobile && <p className="mt-2 text-sm text-red-600">{errors.mobile.message}</p>}
                </div>
                <div>
                  <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                    {t('dob')}
                  </label>
                  <input
                    type="date"
                    {...register("birth_date", {
                      required: t('dob') + " is required",
                      validate: {
                        notTooYoung: (value) => {
                          const today = new Date();
                          const selectedDate = new Date(value);
                          const minAllowedDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
                          return selectedDate <= minAllowedDate || t('ageValidation');
                        }
                      }
                    })}
                    max={new Date().toISOString().split("T")[0]}
                    disabled={!isEditable}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                  {errors.birth_date && <p className="mt-2 text-sm text-red-600">{errors.birth_date.message}</p>}
                </div>
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
                {isCollegeStudent ? (
                  <>
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
                ) : (
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

              {isEditable && (
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
        </div>
      </div>
    </div>
  );
}

export default page;

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import GlobalApi from "@/app/_services/GlobalApi";
import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/phoneAuth";
import { encryptText } from "@/utils/encryption";

// Feature flag to control Phone OTP verification on signup
const ENABLE_SIGNUP_OTP = false; // Set to true to re-enable OTP on signup

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
  } = useForm();

  // Invite & Institution state
  const [inviteToken, setInviteToken] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [streams, setStreams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoadingSchool, setIsLoadingSchool] = useState(true);
  const [inviteError, setInviteError] = useState(null);

  // Form selections
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClassGrade, setSelectedClassGrade] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedDOB, setSelectedDOB] = useState("");
  const [dobError, setDobError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendSignupOtp = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      toast.error("Please enter a valid 10-digit mobile phone number");
      return;
    }
    setIsSendingOtp(true);
    try {
      const { confirmation } = await requestPhoneOtp(phoneNumber, "signup-recaptcha-container");
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      setOtpCountdown(30);
      toast.success("Verification code sent to your phone");
    } catch (err) {
      console.error("Signup OTP error:", err);
      toast.error(err.message || "Failed to send OTP. Please check the number.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifySignupOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await verifyPhoneOtp(confirmationResult, otpCode);
      setIsPhoneVerified(true);
      setValue("mobile", phoneNumber.trim());
      toast.success("Mobile number verified successfully!");
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 1. Extract invite token from URL or sessionStorage
  useEffect(() => {
    let token = searchParams ? searchParams.get("invite") : null;
    if (!token && typeof window !== "undefined") {
      token = new URLSearchParams(window.location.search).get("invite");
    }

    if (token) {
      setInviteToken(token);
      try {
        sessionStorage.setItem("school_invite_token", token);
      } catch (e) {
        console.error(e);
      }
    } else if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("school_invite_token");
      if (stored) {
        setInviteToken(stored);
      } else {
        setIsLoadingSchool(false);
      }
    }
  }, [searchParams]);

  // 2. Fetch institution and classes using invite token
  useEffect(() => {
    if (!inviteToken) return;

    const fetchSchoolInfo = async () => {
      setIsLoadingSchool(true);
      setInviteError(null);
      try {
        const res = await GlobalApi.GetInstitutionInfoByInvite(inviteToken);
        if (res.data?.success && res.data?.institution) {
          setInstitution(res.data.institution);
          setClasses(res.data.classes || []);
          setValue("instituteId", res.data.institution.id);
        } else {
          setInviteError("Invalid or expired school invitation link.");
        }
      } catch (err) {
        console.error("Error loading institution:", err);
        setInviteError("Could not verify school invitation link.");
      } finally {
        setIsLoadingSchool(false);
      }
    };

    fetchSchoolInfo();
  }, [inviteToken, setValue]);

  // 3. Handle class selection
  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    setValue("classId", classId);
    setSelectedDivisionId("");
    setValue("divisionId", "");
    setDivisions([]);
    setStreams([]);
    setCourses([]);

    if (!classId) return;

    const chosenClass = classes.find((c) => c.id.toString() === classId.toString());
    const grade = chosenClass?.standard_grade || "";
    setSelectedClassGrade(grade);
    setValue("classGrade", grade);

    try {
      const divRes = await GlobalApi.GetDivisionsByClass(classId);
      if (divRes.status === 200) {
        setDivisions(divRes.data.divisions || []);
      }
    } catch (err) {
      console.error("Failed to load divisions:", err);
    }

    if (["11", "12"].includes(grade) && institution?.id) {
      try {
        const strRes = await GlobalApi.GetStreamsByInstitution(institution.id);
        if (strRes.status === 200) {
          setStreams(strRes.data.streams || []);
        }
      } catch (err) {
        console.error("Failed to load streams:", err);
      }
    }

    if (grade === "college" && institution?.id) {
      try {
        const crsRes = await GlobalApi.GetCoursesByInstitution(institution.id);
        if (crsRes.status === 200) {
          setCourses(crsRes.data.courses || []);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    }
  };

  // 4. DOB Validation
  const handleDOBChange = (e) => {
    const dateVal = e.target.value;
    setSelectedDOB(dateVal);
    if (!dateVal) {
      setDobError("Date of birth is required");
      return;
    }

    const selectedDate = new Date(dateVal);
    const today = new Date();
    const minAllowedDate = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());

    if (selectedDate > minAllowedDate) {
      setDobError("Please enter a valid birth date");
    } else {
      setDobError("");
    }
  };

  // 5. Submit Registration
  const onSubmit = async (data) => {
    if (!institution?.id) {
      toast.error("Registration requires a valid school invite link.");
      return;
    }

    if (!data.name || !data.name.trim()) {
      setError("name", { type: "manual", message: "Student name is required" });
      return;
    }

    if (!data.parentName || !data.parentName.trim()) {
      setError("parentName", { type: "manual", message: "Parent / Guardian name is required" });
      return;
    }

    if (!selectedGender) {
      setError("gender", { type: "manual", message: "Please select gender" });
      return;
    }

    if (!selectedDOB || dobError) {
      setDobError("Please provide a valid date of birth");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      return;
    }

    if (data.password.length < 6) {
      setError("password", { type: "manual", message: "Password must be at least 6 characters" });
      return;
    }

    if (!selectedClassId) {
      toast.error("Please select your class / grade.");
      return;
    }

    if (!selectedDivisionId) {
      toast.error("Please select your section / division.");
      return;
    }

    if (["11", "12"].includes(selectedClassGrade) && !selectedStreamId) {
      toast.error("Please select your stream");
      return;
    }

    if (selectedClassGrade === "college" && !selectedCourseId) {
      toast.error("Please select your degree course");
      return;
    }

    if (ENABLE_SIGNUP_OTP && !isPhoneVerified) {
      toast.error("Please verify your mobile phone number with OTP before completing registration.");
      return;
    }

    setIsSubmitting(true);

    const encryptedPassword = encryptText(data.password);

    const payload = {
      name: data.name.trim(),
      parentName: data.parentName.trim(),
      username: data.username.trim(),
      password: encryptedPassword,
      gender: selectedGender,
      dob: selectedDOB,
      mobile: phoneNumber.trim(),
      instituteId: institution.id,
      classId: parseInt(selectedClassId),
      divisionId: parseInt(selectedDivisionId),
      classGrade: selectedClassGrade,
      streamId: selectedStreamId ? parseInt(selectedStreamId) : null,
      courseId: selectedCourseId ? parseInt(selectedCourseId) : null,
      country: institution.country || "India",
      language: "English",
      inviteToken: inviteToken,
    };

    try {
      const response = await GlobalApi.CreateNewUser(payload);

      if (response.status === 201) {
        const { token } = response.data.data;
        if (token) {
          localStorage.setItem("token", token);
        }

        try {
          localStorage.setItem("user_institution", JSON.stringify(institution));
        } catch (e) {
          console.error(e);
        }

        toast.success("Account created successfully");
        reset();

        const sectorGrades = ["LKG", "UKG", "lkg", "ukg", "1", "2", "3", "4", "5", "6", "7"];
        const clusterGrades = ["8", "9", "10"];
        const normalizedSelectedGrade = selectedClassGrade ? String(selectedClassGrade).trim() : "";

        if (sectorGrades.includes(normalizedSelectedGrade)) {
          localStorage.setItem("dashboardUrl", "/dashboard_kids");
          localStorage.setItem("navigateUrl", "/dashboard_kids/sector-suggestion");
          router.push("/dashboard_kids/sector-suggestion");
        } else if (clusterGrades.includes(normalizedSelectedGrade)) {
          localStorage.setItem("dashboardUrl", "/dashboard_junior");
          localStorage.setItem("navigateUrl", "/dashboard_junior/cluster-suggestion");
          router.push("/dashboard_junior/cluster-suggestion");
        } else {
          localStorage.setItem("dashboardUrl", "/dashboard");
          localStorage.setItem("navigateUrl", "/dashboard/careers/career-suggestions");
          router.push("/dashboard");
        }
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Registration failed";
      if (msg.includes("Username") || msg.includes("email")) {
        setError("username", { type: "manual", message: "This email or username is already registered." });
      } else if (msg.includes("Mobile") || msg.includes("phone")) {
        setError("mobile", { type: "manual", message: "This phone number is already registered." });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------
  // SCENARIO 1: Loading
  // ----------------------------------------------------------------------
  if (isLoadingSchool) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-300 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-400">Loading registration page...</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // SCENARIO 2: No Invite Link or Verification Error
  // ----------------------------------------------------------------------
  if (!inviteToken || inviteError || !institution) {
    const isError = Boolean(inviteError);
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4 sm:p-6">
        <Toaster position="top-center" />
        <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-white">
              {isError ? "Unable to Verify Registration Link" : "Registration Link Required"}
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              {isError
                ? (inviteError || "The registration link provided is invalid or expired.")
                : "Student registration on this platform is accessible only through an invite link provided by your school or college."}
            </p>
            <p className="text-xs text-gray-400 pt-1">
              Please contact your school teacher or administrator to receive an invitation link.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {isError && (
              <button
                type="button"
                onClick={() => {
                  if (inviteToken) {
                    setIsLoadingSchool(true);
                    setInviteError(null);
                    GlobalApi.GetInstitutionInfoByInvite(inviteToken)
                      .then((res) => {
                        if (res.data?.success && res.data?.institution) {
                          setInstitution(res.data.institution);
                          setClasses(res.data.classes || []);
                          setValue("instituteId", res.data.institution.id);
                        } else {
                          setInviteError("Invalid or expired school invitation link.");
                        }
                      })
                      .catch((err) => {
                        console.error(err);
                        setInviteError("Could not verify school invitation link.");
                      })
                      .finally(() => setIsLoadingSchool(false));
                  }
                }}
                className="w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl text-xs transition-colors"
              >
                Try Again
              </button>
            )}
            <Link
              href="/login"
              className="block w-full text-center py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // SCENARIO 3: Clean, Unified School Registration Form
  // ----------------------------------------------------------------------
  const schoolLogo = institution?.logo;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 sm:px-6 flex items-center justify-center">
      <Toaster position="top-center" />

      <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-10 shadow-xl my-6">

        {/* ======================================================== */}
        {/* HERO: School Logo (Main thing at top) & School Name      */}
        {/* ======================================================== */}
        <div className="text-center mb-8">
          {schoolLogo && (
            <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl p-3 shadow-md flex items-center justify-center mb-4">
              <img
                src={schoolLogo}
                alt={institution.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {institution.name}
          </h1>

          <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto my-3" />

          <p className="text-sm text-gray-400">
            Student Account Registration
          </p>
        </div>

        {/* ======================================================== */}
        {/* FORM: Section 1 (Student Details), Section 2 (Class/Div) */}
        {/* ======================================================== */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ────────────────────────────────────────────────────── */}
          {/* SECTION 1: Student Account Details (FIRST)             */}
          {/* ────────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Student Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Student Full Name <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Student name is required" })}
                  placeholder="e.g. Alex Johnson"
                  className={`w-full px-3.5 py-2.5 bg-gray-900/60 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Parent Name */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Parent / Guardian Name <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("parentName", { required: "Parent name is required" })}
                  placeholder="e.g. Robert Johnson"
                  className={`w-full px-3.5 py-2.5 bg-gray-900/60 border ${errors.parentName ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm`}
                />
                {errors.parentName && <p className="text-red-400 text-xs mt-1">{errors.parentName.message}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Gender <span className="text-orange-400">*</span>
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-gray-900/60 border ${errors.gender ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm`}
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-400">-- Select Gender --</option>
                  <option value="Male" className="bg-gray-800 text-white">Male</option>
                  <option value="Female" className="bg-gray-800 text-white">Female</option>
                  <option value="Other" className="bg-gray-800 text-white">Other</option>
                </select>
                {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender.message}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Date of Birth <span className="text-orange-400">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDOB}
                  onChange={handleDOBChange}
                  className={`w-full px-3.5 py-2.5 bg-gray-900/60 border ${dobError ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm`}
                  required
                />
                {dobError && <p className="text-red-400 text-xs mt-1">{dobError}</p>}
              </div>

              {/* Username or Email */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Username or Email <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("username", { required: "Username or email is required" })}
                  placeholder="alex.johnson or alex@email.com"
                  className={`w-full px-3.5 py-2.5 bg-gray-900/60 border ${errors.username ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm`}
                />
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
              </div>

              {/* Mobile Phone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Mobile Phone {ENABLE_SIGNUP_OTP && <span className="text-orange-400">*</span>}
                  </label>
                  {ENABLE_SIGNUP_OTP && isPhoneVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                {ENABLE_SIGNUP_OTP ? (
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      disabled={isPhoneVerified}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (isPhoneVerified) setIsPhoneVerified(false);
                      }}
                      placeholder="e.g. 98765 43210"
                      className={`flex-1 px-3.5 py-2.5 bg-gray-900/60 border ${
                        isPhoneVerified
                          ? "border-emerald-500/50 text-emerald-300"
                          : "border-gray-600 text-white"
                      } rounded-lg placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm`}
                    />

                    {!isPhoneVerified && (
                      <button
                        type="button"
                        onClick={handleSendSignupOtp}
                        disabled={isSendingOtp || otpCountdown > 0}
                        className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center shrink-0 min-w-[90px]"
                      >
                        {isSendingOtp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : otpCountdown > 0 ? (
                          `${otpCountdown}s`
                        ) : isOtpSent ? (
                          "Resend"
                        ) : (
                          "Get OTP"
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setValue("mobile", e.target.value);
                    }}
                    placeholder="e.g. 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm transition-all"
                  />
                )}

                {/* OTP Input section (Enabled when ENABLE_SIGNUP_OTP = true) */}
                {ENABLE_SIGNUP_OTP && isOtpSent && !isPhoneVerified && (
                  <div className="mt-2.5 p-3 rounded-lg bg-gray-900/80 border border-gray-700 space-y-2">
                    <p className="text-xs text-gray-400">
                      Enter 6-digit OTP code sent to your phone:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 6-digit OTP"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white tracking-widest text-center text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifySignupOtp}
                        disabled={isVerifyingOtp || otpCode.length !== 6}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center shrink-0 min-w-[95px]"
                      >
                        {isVerifyingOtp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Verify OTP"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div id="signup-recaptcha-container"></div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Password <span className="text-orange-400">*</span>
                </label>
                <input
                  type="password"
                  {...register("password", { required: "Password is required" })}
                  placeholder="At least 6 characters"
                  className={`w-full px-3.5 py-2.5 bg-gray-900/60 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm`}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Confirm Password <span className="text-orange-400">*</span>
                </label>
                <input
                  type="password"
                  {...register("confirmPassword", { required: "Confirm password is required" })}
                  placeholder="Re-enter password"
                  className={`w-full px-3.5 py-2.5 bg-gray-900/60 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm`}
                />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────── */}
          {/* SECTION 2: Academic Placement (SECOND)                 */}
          {/* ────────────────────────────────────────────────────── */}
          <div className="pt-6 border-t border-gray-700">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Academic Placement
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Class Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Class / Grade <span className="text-orange-400">*</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={handleClassChange}
                  className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-400">-- Select Class / Grade --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id} className="bg-gray-800 text-white">
                      {cls.name} {cls.standard_grade ? (["LKG", "UKG"].includes(String(cls.standard_grade).toUpperCase()) ? `(${cls.standard_grade})` : `(Grade ${cls.standard_grade})`) : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section / Division */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Section / Division <span className="text-orange-400">*</span>
                </label>
                <select
                  value={selectedDivisionId}
                  onChange={(e) => {
                    setSelectedDivisionId(e.target.value);
                    setValue("divisionId", e.target.value);
                  }}
                  disabled={!selectedClassId || divisions.length === 0}
                  className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-400">
                    {!selectedClassId 
                      ? "-- Select Class First --" 
                      : divisions.length === 0 
                      ? "No sections available" 
                      : "-- Select Section --"}
                  </option>
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id} className="bg-gray-800 text-white">
                      Section {div.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Streams for Grades 11 and 12 */}
              {["11", "12"].includes(selectedClassGrade) && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Academic Stream <span className="text-orange-400">*</span>
                  </label>
                  <select
                    value={selectedStreamId}
                    onChange={(e) => {
                      setSelectedStreamId(e.target.value);
                      setValue("streamId", e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="" className="bg-gray-800 text-gray-400">-- Select Stream --</option>
                    {streams.map((str) => (
                      <option key={str.id} value={str.id} className="bg-gray-800 text-white">
                        {str.stream_name} {str.description ? `- ${str.description}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Courses for College */}
              {selectedClassGrade === "college" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Degree Course <span className="text-orange-400">*</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setValue("courseId", e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="" className="bg-gray-800 text-gray-400">-- Select Degree Course --</option>
                    {courses.map((crs) => (
                      <option key={crs.id} value={crs.id} className="bg-gray-800 text-white">
                        {crs.course_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ────────────────────────────────────────────────────── */}
          {/* SUBMIT BUTTON                                          */}
          {/* ────────────────────────────────────────────────────── */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-gray-400">Already registered with your school? </span>
            <Link
              href={`/login?invite=${encodeURIComponent(inviteToken || "")}`}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Subtle Powered by Xortlist */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-5 mt-5 border-t border-gray-700/60">
            <span>Powered by</span>
            <Image
              src="/assets/images/xortlist-icon-small.png"
              width={14}
              height={14}
              alt="Xortlist"
              className="h-3 w-auto opacity-70"
            />
            <span className="font-medium text-gray-400">Xortlist</span>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 text-gray-400 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}

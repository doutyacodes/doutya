"use client";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { encryptText } from "@/utils/encryption";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleAuthButton from "@/components/GoogleAuthButton";

// ─── Constants ───────────────────────────────────────────────────────────────

const SCHOOL_GRADES = ["5", "6", "7", "8", "9", "10", "11", "12"];

const STREAM_SUGGESTIONS = [
  "Science (PCM) – Physics, Chemistry, Maths",
  "Science (PCB) – Physics, Chemistry, Biology",
  "Science (PCMB) – Physics, Chemistry, Maths, Biology",
  "Commerce with Maths",
  "Commerce without Maths",
  "Arts / Humanities",
  "Vocational Studies",
  "Computer Science",
  "Information Technology",
  "Agriculture",
  "Home Science",
  "Fine Arts",
  "Music",
  "Physical Education",
];

const COURSE_SUGGESTIONS = [
  "B.E. Computer Science & Engineering",
  "B.E. Mechanical Engineering",
  "B.E. Civil Engineering",
  "B.E. Electronics & Communication Engineering",
  "B.E. Electrical Engineering",
  "B.E. Chemical Engineering",
  "B.E. Aerospace Engineering",
  "B.E. Biotechnology",
  "B.Tech Information Technology",
  "B.Tech Artificial Intelligence & Machine Learning",
  "B.Tech Data Science",
  "B.Tech Cyber Security",
  "B.Tech Computer Science (IoT)",
  "B.Tech Robotics & Automation",
  "B.Sc Computer Science",
  "B.Sc Data Science",
  "B.Sc Physics",
  "B.Sc Chemistry",
  "B.Sc Mathematics",
  "B.Sc Statistics",
  "B.Sc Biotechnology",
  "B.Sc Microbiology",
  "B.Sc Nursing",
  "B.Sc Agriculture",
  "B.Sc Forestry",
  "B.Sc Environmental Science",
  "B.Com",
  "B.Com (Accounting & Finance)",
  "B.Com (Computer Applications)",
  "BBA",
  "BBA (Aviation)",
  "BBA (Logistics)",
  "BCA",
  "BA English",
  "BA Economics",
  "BA Psychology",
  "BA Sociology",
  "BA Political Science",
  "BA History",
  "BA Geography",
  "BA Journalism & Mass Communication",
  "BA Fine Arts",
  "BA Social Work",
  "MBBS",
  "BDS (Dentistry)",
  "BAMS (Ayurveda)",
  "BHMS (Homeopathy)",
  "B.Pharmacy",
  "D.Pharmacy",
  "B.Sc Medical Lab Technology",
  "B.Sc Radiology & Imaging",
  "B.Sc Physiotherapy",
  "B.Sc Optometry",
  "BA LLB (5 Year Integrated)",
  "B.Com LLB",
  "LLB (3 Year)",
  "B.Arch",
  "B.Design",
  "B.Des Fashion Design",
  "B.Des Interior Design",
  "B.Des Graphic Design",
  "BFA (Bachelor of Fine Arts)",
  "Diploma in Engineering",
  "Diploma in Computer Applications",
  "ITI",
  "Polytechnic",
  "Integrated M.Sc",
  "Integrated MBA",
  "Other",
];

const inputCls =
  "w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200";

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-10">
      <Toaster />
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur-xl pointer-events-none" />
        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 p-8 rounded-2xl shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

function Heading({ title, sub }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4" />
      {sub && <p className="text-gray-300 text-sm">{sub}</p>}
    </div>
  );
}

function PrimaryBtn({ onClick, type = "button", disabled, children }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-6 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer ${
        disabled
          ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/25 hover:scale-[1.02]"
      }`}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2 px-6 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600/50 transition-all duration-200 mt-3 cursor-pointer"
    >
      {children}
    </button>
  );
}

function AutocompleteInput({ value, onChange, suggestions, placeholder, maxLength = 120, label, hint }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isSelectingRef = useRef(false);

  const filtered =
    value.length > 0
      ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      : suggestions;

  const handleSelect = (suggestion) => {
    isSelectingRef.current = false;
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">{label}</label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          if (!isSelectingRef.current) setShowSuggestions(false);
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputCls}
        autoComplete="off"
        required
      />
      <div className="flex justify-between mt-1">
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
        <p className="text-xs text-gray-500 ml-auto">{value.length}/{maxLength}</p>
      </div>
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600/50 rounded-xl overflow-hidden shadow-2xl max-h-52 overflow-y-auto">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { isSelectingRef.current = true; }}
              onMouseUp={() => handleSelect(s)}
              onTouchStart={() => { isSelectingRef.current = true; }}
              onTouchEnd={() => handleSelect(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-orange-500/20 hover:text-white transition-colors border-b border-gray-700/30 last:border-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IndividualSignup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
  } = useForm();

  const [step, setStep] = useState("eligibility");
  const [selectedDOB, setSelectedDOB] = useState("");
  const [dobError, setDobError] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [streamInput, setStreamInput] = useState("");
  const [courseInput, setCourseInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const router = useRouter();

  // If user came from Google signup flow
  useEffect(() => {
    try {
      const googleData = sessionStorage.getItem("googleAuthProfile");
      if (googleData) {
        const profile = JSON.parse(googleData);
        sessionStorage.removeItem("googleAuthProfile");
        setIsGoogleUser(true);
        if (profile?.name) setValue("name", profile.name);
        if (profile?.email) setValue("username", profile.email);
        const randomPass = "G@" + Math.random().toString(36).slice(-8) + "!9A";
        setValue("password", randomPass);
        setValue("confirmPassword", randomPass);
        setIsGoogleUser(true);
        setStep("dob");
      }
    } catch (e) {
      console.error(e);
    }
  }, [setValue]);

  const showStreamInput = ["11", "12"].includes(selectedGrade);

  const handleDOBChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const minAllowedDate = new Date();
    minAllowedDate.setFullYear(minAllowedDate.getFullYear() - 5);
    if (selectedDate > minAllowedDate) {
      setDobError("You must be at least 5 years old.");
      setSelectedDOB("");
    } else {
      setDobError("");
      setSelectedDOB(e.target.value);
    }
  };

  const handleNext = () => {
    if (step === "eligibility") setStep("dob");
    else if (step === "dob") setStep("signup");
  };

  const handleBack = () => {
    if (step === "dob") setStep("eligibility");
    else if (step === "signup") setStep("dob");
    else router.push("/login");
  };

  const getScopeType = () => {
    if (institutionType === "School") {
      if (["5", "6", "7"].includes(selectedGrade)) return "sector";
      if (["8", "9", "10"].includes(selectedGrade)) return "cluster";
    }
    return "career";
  };

  const onSubmit = async (data) => {
    const isGoogleAuth = isGoogleUser || (typeof window !== "undefined" && sessionStorage.getItem("isGoogleAuth") === "true");
    if (!isGoogleAuth && data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      return;
    }
    if (!institutionType) { toast.error("Please select your institution type"); return; }
    if (institutionType === "School" && !selectedGrade) { toast.error("Please select your grade/class"); return; }
    if (showStreamInput && !streamInput.trim()) { toast.error("Please enter your stream"); return; }
    if (institutionType === "College" && !courseInput.trim()) { toast.error("Please enter your course"); return; }

    setIsSubmitting(true);

    const payload = {
      name: data.name,
      username: data.username,
      password: encryptText(data.password || ("G@" + Math.random().toString(36).slice(-8) + "!9A")),
      gender: data.gender,
      mobile: data.mobile,
      dob: selectedDOB,
      institutionType,
      instituteName: data.instituteName || null,
      country: "India",
      grade: institutionType === "School" ? selectedGrade : null,
      stream: showStreamInput ? streamInput.trim() : null,
      course: institutionType === "College" ? courseInput.trim() : null,
      scopeType: getScopeType(),
    };

    try {
      const response = await fetch("/api/open-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.status === 201) {
        localStorage.setItem("token", result.data.token);
        toast.success("Account created successfully!");
        reset();
        if (["5", "6", "7"].includes(selectedGrade)) {
          localStorage.setItem("dashboardUrl", "/dashboard_junior");
          router.push("/dashboard_junior");
        } else {
          localStorage.setItem("dashboardUrl", "/dashboard");
          router.push("/dashboard");
        }
      } else {
        const msg = result.message || "Registration failed";
        if (msg.includes("Username")) {
          setError("username", { type: "manual", message: "This username is already taken" });
        } else if (msg.includes("Phone")) {
          setError("mobile", { type: "manual", message: "This phone number is already registered" });
        } else {
          toast.error(msg);
        }
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setIsSubmittingGoogle(true);
    try {
      const res = await fetch("/api/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google authentication failed");
      }

      if (data.status === "LOGGED_IN") {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        const isJunior = ["5", "6", "7"].includes(data.class);
        const targetUrl = data.navigateUrl || (isJunior ? "/dashboard_junior" : "/dashboard");
        localStorage.setItem("dashboardUrl", isJunior ? "/dashboard_junior" : "/dashboard");
        localStorage.setItem("navigateUrl", targetUrl);
        toast.success("Logged in successfully!");
        router.push(targetUrl);
      } else if (data.status === "NEW_USER") {
        sessionStorage.setItem("isGoogleAuth", "true");
        setIsGoogleUser(true);
        if (data.googleProfile?.name) setValue("name", data.googleProfile.name);
        if (data.googleProfile?.email) setValue("username", data.googleProfile.email);
        const randomPass = "G@" + Math.random().toString(36).slice(-8) + "!9A";
        setValue("password", randomPass);
        setValue("confirmPassword", randomPass);
        setStep("dob");
      }
    } catch (err) {
      toast.error(err.message || "Google registration failed");
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  // ── Step: Eligibility ──────────────────────────────────────────────────────
  if (step === "eligibility") {
    return (
      <Shell>
        <div className="text-center mb-6">
          <img
            src="/assets/images/logo-full.png"
            alt="Xortcut"
            className="w-36 h-auto mx-auto mb-6 object-contain drop-shadow-2xl"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Xortcut</h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-200 mb-3 leading-relaxed">
            Discover your career path with personalised guidance built for students and professionals.
          </p>
        </div>

        {/* Google 1-Click Sign Up */}
        <div className="mb-4">
          <GoogleAuthButton
            text="Sign up with Google"
            onSuccess={handleGoogleSuccess}
            onError={(err) => toast.error(err)}
            disabled={isSubmittingGoogle}
          />
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-700/80" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            or start manually
          </span>
          <div className="flex-1 h-px bg-gray-700/80" />
        </div>

        <PrimaryBtn onClick={handleNext}>Get Started</PrimaryBtn>
        <SecondaryBtn onClick={() => router.push("/login")}>Back to Login</SecondaryBtn>
      </Shell>
    );
  }

  // ── Step: DOB ──────────────────────────────────────────────────────────────
  if (step === "dob") {
    return (
      <Shell>
        <Heading title="Date of Birth" sub="You won't be able to change this later – enter carefully." />
        <div className="space-y-6">
          <div>
            <input
              type="date"
              value={selectedDOB}
              onChange={handleDOBChange}
              max={new Date().toISOString().split("T")[0]}
              className={inputCls}
            />
            {dobError && <p className="text-red-400 text-sm mt-2">{dobError}</p>}
          </div>
          <PrimaryBtn onClick={handleNext} disabled={!selectedDOB || !!dobError}>Next</PrimaryBtn>
          <SecondaryBtn onClick={handleBack}>Back</SecondaryBtn>
        </div>
      </Shell>
    );
  }

  // ── Step: Signup Form ──────────────────────────────────────────────────────
  return (
    <Shell>
      <Heading title="Create Account" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Full Name</label>
          <input type="text" {...register("name", { required: "Name is required" })} placeholder="Enter your full name" className={inputCls} />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {(isGoogleUser || (watch("username") && watch("username").includes("@"))) ? (
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Google Account</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-700/30 border border-gray-600/40 rounded-xl text-gray-200">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="text-sm font-medium text-white break-all">{watch("username")}</span>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Username / Email</label>
              <input type="text" {...register("username", { required: "Username is required" })} placeholder="Choose a username or email" className={inputCls} />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                  pattern: { value: /(?=.*[!@#$%^&*])/, message: "Include at least one special character (!@#$%^&*)" },
                })}
                placeholder="Create a password"
                className={inputCls}
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Confirm Password</label>
              <input type="password" {...register("confirmPassword", { required: "Please confirm your password" })} placeholder="Re-enter your password" className={inputCls} />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
              <p className="text-xs text-gray-400 mt-1">Must be 6+ characters with at least one special character.</p>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-200 mb-2">Gender</label>
            <select {...register("gender", { required: "Required" })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200" required>
              <option value="">Select</option>
              <option value="Mr">Mr</option>
              <option value="Miss">Miss</option>
              <option value="Mrs">Mrs</option>
            </select>
            {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-200 mb-2">Mobile Number</label>
            <input type="tel" {...register("mobile", { required: "Mobile number is required", minLength: { value: 10, message: "Enter a valid 10-digit number" } })} placeholder="10-digit mobile number" className={inputCls} required />
            {errors.mobile && <p className="text-red-400 text-sm mt-1">{errors.mobile.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">I am currently in</label>
          <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} className={inputCls} required>
            <option value="">Select option</option>
            <option value="School">School (Class 5–12)</option>
            <option value="College">College / University</option>
            <option value="Other">Completed Education / Working</option>
          </select>
        </div>

        {institutionType === "School" && (
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Grade / Class</label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className={inputCls} required>
              <option value="">Select grade</option>
              {SCHOOL_GRADES.map((g) => (
                <option key={g} value={g}>Class {g}</option>
              ))}
            </select>
          </div>
        )}

        {showStreamInput && (
          <AutocompleteInput
            label="Stream"
            value={streamInput}
            onChange={setStreamInput}
            suggestions={STREAM_SUGGESTIONS}
            placeholder="e.g. Science (PCM) or start typing..."
            hint="Select from suggestions or type your own"
          />
        )}

        {institutionType === "College" && (
          <AutocompleteInput
            label="Course / Degree"
            value={courseInput}
            onChange={setCourseInput}
            suggestions={COURSE_SUGGESTIONS}
            placeholder="e.g. B.Tech Computer Science or start typing..."
            hint="Select from suggestions or type your own"
          />
        )}

        <PrimaryBtn type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Complete Registration"}
        </PrimaryBtn>
        <SecondaryBtn onClick={handleBack}>Back</SecondaryBtn>
      </form>
    </Shell>
  );
}

export default IndividualSignup;

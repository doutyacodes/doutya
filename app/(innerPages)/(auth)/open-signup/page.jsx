"use client";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { encryptText } from "@/utils/encryption";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── All sub-components defined at MODULE level (not inside any other function)
// This is critical — defining components inside another component causes React
// to treat them as new component types on every render, unmounting/remounting
// them and causing the input to lose focus after every keystroke.

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
      className={`w-full py-3 px-6 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
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
      className="w-full py-2 px-6 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600/50 transition-all duration-200 mt-3"
    >
      {children}
    </button>
  );
}

function AutocompleteInput({ value, onChange, suggestions, placeholder, maxLength = 120, label, hint }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Ref to track if the user is mid-click on a suggestion so we don't
  // close the dropdown prematurely when the input fires onBlur
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

// ─── Main Page Component ──────────────────────────────────────────────────────

function IndividualSignup() {
  const [step, setStep] = useState("eligibility");
  const [selectedDOB, setSelectedDOB] = useState("");
  const [dobError, setDobError] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [streamInput, setStreamInput] = useState("");
  const [courseInput, setCourseInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm();

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
    if (data.password !== data.confirmPassword) {
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
      password: encryptText(data.password),
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

  // ── Step: Eligibility ──────────────────────────────────────────────────────
  if (step === "eligibility") {
    return (
      <Shell>
        <div className="text-center mb-8">
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
          <p className="text-gray-400 text-sm leading-relaxed">
            By continuing, you confirm you are ready to explore your future with Xortcut.
          </p>
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
        <Heading title="Date of Birth" sub="You won't be able to change this later — enter carefully." />
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

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Username</label>
          <input type="text" {...register("username", { required: "Username is required" })} placeholder="Choose a username" className={inputCls} />
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

        <div className="flex gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Gender</label>
            <select {...register("gender", { required: "Required" })} className="px-3 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200">
              <option value="">Gender</option>
              <option value="Mr">Mr</option>
              <option value="Miss">Miss</option>
              <option value="Mrs">Mrs</option>
            </select>
            {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender.message}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-200 mb-2">Mobile Number</label>
            <input type="tel" {...register("mobile", { required: "Mobile number is required", minLength: { value: 10, message: "Enter a valid 10-digit number" } })} placeholder="Mobile number" className={inputCls} />
            {errors.mobile && <p className="text-red-400 text-sm mt-1">{errors.mobile.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Institution Type</label>
          <select
            value={institutionType}
            onChange={(e) => {
              setInstitutionType(e.target.value);
              setSelectedGrade("");
              setCourseInput("");
              setStreamInput("");
            }}
            className={inputCls}
            required
          >
            <option value="">Select type</option>
            <option value="School">School</option>
            <option value="College">College / University</option>
          </select>
        </div>

        {institutionType && (
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Institution Name <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              {...register("instituteName")}
              placeholder={institutionType === "School" ? "e.g. Delhi Public School" : "e.g. St. Xavier's College"}
              maxLength={200}
              className={inputCls}
            />
          </div>
        )}

        {institutionType === "School" && (
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Class / Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => { setSelectedGrade(e.target.value); setStreamInput(""); }}
              className={inputCls}
              required
            >
              <option value="">Select your class</option>
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
            placeholder="e.g. Science (PCM), Commerce..."
            maxLength={100}
            hint="Type to search or enter your own."
          />
        )}

        {institutionType === "College" && (
          <AutocompleteInput
            label="Course"
            value={courseInput}
            onChange={setCourseInput}
            suggestions={COURSE_SUGGESTIONS}
            placeholder="e.g. B.E. Computer Science & Engineering"
            maxLength={120}
            hint="Type to search or enter your own course name."
          />
        )}

        <PrimaryBtn type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </PrimaryBtn>
      </form>

      <div className="text-center mt-6">
        <span className="text-gray-300 text-sm">Already have an account? </span>
        <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors">
          Log in
        </Link>
      </div>
      <div className="text-center mt-2">
        <button onClick={handleBack} className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
          ← Back
        </button>
      </div>
    </Shell>
  );
}

export default IndividualSignup;
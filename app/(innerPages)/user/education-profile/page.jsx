"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import { Target, School, GraduationCap, CheckCircle, AlertCircle } from "lucide-react";

const PREFERENCE_OPTIONS = {
  school_higher: [
    { value: "subject_based",    label: "Based on my stream and subjects",       desc: "Suggestions aligned with your current stream" },
    { value: "personality_based", label: "Based on my personality and interests", desc: "Explore careers that match who you are, regardless of stream" },
    { value: "mixed",            label: "Mix of both",                            desc: "Balance your stream with your personality and interests" },
  ],
  school_lower: [
    { value: "personality_based", label: "Based on my personality and interests", desc: "Explore careers that match who you are" },
  ],
  college: [
    { value: "education_based",   label: "Based on my current education",         desc: "Suggestions aligned with your course and field" },
    { value: "personality_based", label: "Based on my personality and interests", desc: "Explore careers beyond your current course" },
    { value: "mixed",             label: "Mix of both",                            desc: "Balance your education with your interests" },
  ],
};

// ── Skeleton shown while context is loading ───────────────────────────────────
function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* icon + title */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gray-700/60" />
        <div className="h-7 w-48 rounded-lg bg-gray-700/60" />
        <div className="h-4 w-64 rounded bg-gray-700/40" />
      </div>
      {/* context badge */}
      <div className="flex justify-center mb-6">
        <div className="h-8 w-56 rounded-full bg-gray-700/50" />
      </div>
      {/* preference card */}
      <div className="bg-gray-800/60 rounded-2xl p-6 space-y-3">
        <div className="h-3 w-40 rounded bg-gray-700/60" />
        <div className="h-16 rounded-xl bg-gray-700/40" />
        <div className="h-16 rounded-xl bg-gray-700/40" />
        <div className="h-16 rounded-xl bg-gray-700/40" />
      </div>
      {/* description card */}
      <div className="bg-gray-800/60 rounded-2xl p-6 space-y-3">
        <div className="h-3 w-32 rounded bg-gray-700/60" />
        <div className="h-24 rounded-xl bg-gray-700/40" />
      </div>
      {/* button */}
      <div className="h-14 rounded-2xl bg-gray-700/50" />
    </div>
  );
}

// ── Submit button with all states ─────────────────────────────────────────────
function SubmitButton({ status }) {
  if (status === "submitting") {
    return (
      <button
        disabled
        className="w-full py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 text-white font-semibold rounded-2xl cursor-not-allowed"
      >
        <svg className="animate-spin w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Saving your preferences…
      </button>
    );
  }

  if (status === "success") {
    return (
      <button
        disabled
        className="w-full py-4 flex items-center justify-center gap-3 bg-emerald-600 text-white font-semibold rounded-2xl cursor-not-allowed"
      >
        <CheckCircle className="w-5 h-5" />
        Saved! Redirecting you…
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
    >
      Save and continue →
    </button>
  );
}

export default function CareerPreferencePage() {
  const router = useRouter();

  // "loading" | "ready" | "submitting" | "success" | "error"
  const [pageStatus, setPageStatus] = useState("loading");
  const [context, setContext] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm({ defaultValues: { preference: "", description: "" } });

  const selectedPref = watch("preference");

  // ── initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.replace("/login"); return; }

      try {
        // redirect if already completed
        const dashResp = await GlobalApi.GetDashboarCheck(token);
        if (dashResp.data.educationStageExists) {
          const { scopeType } = dashResp.data;
          router.replace(
            scopeType === "career"  ? "/dashboard/careers/career-suggestions" :
            scopeType === "sector"  ? "/dashboard_kids/sector-suggestion" :
                                      "/dashboard_junior/cluster-suggestion"
          );
          return;
        }

        // fetch context
        const ctxResp = await axios.get("/api/user/career-preference-context", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContext(ctxResp.data);

        // pre-fill existing preference if any
        const existing = ctxResp.data.existingPreference;
        if (existing) {
          const pref =
            existing.schoolPref || existing.collegePref ||
            existing.completedPref || existing.noJobPref || "";
          if (pref) setValue("preference", pref);
        }

        setPageStatus("ready");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your profile. Please refresh.");
        setPageStatus("ready"); // still show form so user isn't stuck
      }
    };

    init();
  }, [router, setValue]);

  // ── submit ────────────────────────────────────────────────────────────────
  const onSubmit = async ({ preference, description }) => {
    setSubmitError("");
    setPageStatus("submitting");

    const token = localStorage.getItem("token");
    try {
      const resp = await axios.post(
        "/api/user/education-profile",
        { preference, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (resp.data.success) {
        setPageStatus("success");

        // small delay so user sees the success state before redirect
        const dashResp = await GlobalApi.GetDashboarCheck(token);
        const { scopeType } = dashResp.data;
        setTimeout(() => {
          router.replace(
            scopeType === "career"  ? "/dashboard/careers/career-suggestions" :
            scopeType === "sector"  ? "/dashboard_kids/sector-suggestion" :
                                      "/dashboard_junior/cluster-suggestion"
          );
        }, 800);
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again.");
      setPageStatus("error");
    }
  };

  // ── derived values ────────────────────────────────────────────────────────
  const prefOptions =
    !context ? [] :
    context.educationStage === "college"   ? PREFERENCE_OPTIONS.college :
    context.isHigherSecondary              ? PREFERENCE_OPTIONS.school_higher :
                                             PREFERENCE_OPTIONS.school_lower;

  const contextParts = [
    context?.institutionName,
    context?.className,
    context?.streamName,
  ].filter(Boolean);

  const StageIcon = context?.educationStage === "college" ? GraduationCap : School;
  const isFormFrozen = pageStatus === "submitting" || pageStatus === "success";

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      {/* background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4">

        {pageStatus === "loading" ? (
          <PageSkeleton />
        ) : (
          <div className="animate-[fadeIn_0.35s_ease_forwards]">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl border border-blue-500/30 mb-4">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Career Preferences
              </h1>
              <p className="text-gray-400 text-sm">
                Tell us how you'd like us to suggest careers for you.
              </p>
            </div>

            {/* Context badge */}
            {contextParts.length > 0 && (
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-800/60 border border-gray-700/40 rounded-full px-4 py-2">
                  <StageIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>{contextParts.join(" · ")}</span>
                </div>
              </div>
            )}

            {/* Error banner */}
            {pageStatus === "error" && submitError && (
              <div className="flex items-center gap-3 p-4 mb-5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Preference picker */}
              <fieldset
                disabled={isFormFrozen}
                className={`backdrop-blur-sm bg-gray-800/60 border border-gray-700/30 rounded-2xl p-6 transition-opacity duration-300 ${isFormFrozen ? "opacity-50" : ""}`}
              >
                <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  How should we suggest careers?
                </legend>

                <div className="space-y-2">
                  {prefOptions.map((opt) => {
                    const isSelected = selectedPref === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "border-blue-500/60 bg-blue-500/10"
                            : "border-gray-700/40 bg-gray-900/30 hover:bg-gray-700/30"
                        }`}
                      >
                        <input
                          type="radio"
                          {...register("preference", {
                            required: "Please select a preference",
                          })}
                          value={opt.value}
                          className="mt-1 accent-blue-500 flex-shrink-0"
                        />
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? "text-blue-200" : "text-gray-200"}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {errors.preference && (
                  <p className="text-red-400 text-xs mt-3 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.preference.message}
                  </p>
                )}
              </fieldset>

              {/* Description */}
              <fieldset
                disabled={isFormFrozen}
                className={`backdrop-blur-sm bg-gray-800/60 border border-gray-700/30 rounded-2xl p-6 transition-opacity duration-300 ${isFormFrozen ? "opacity-50" : ""}`}
              >
                <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  Anything else we should know?{" "}
                  <span className="font-normal normal-case text-gray-600">optional</span>
                </legend>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm resize-none disabled:opacity-50"
                  placeholder="Share your interests, hobbies, or anything that might help us suggest the right careers…"
                />
              </fieldset>

              <SubmitButton status={pageStatus} />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { CareerDataCollectionGuide } from "@/app/_components/StepCompletionNotifications";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import {
  ChevronDown,
  Plus,
  X,
  GraduationCap,
  Briefcase,
  BookOpen,
  User,
} from "lucide-react";

export default function ModernEducationProfileForm() {
  // Main form state with comprehensive default values including junior's new structure
  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      educationStage: "",
      // School
      isHigherSecondary: false,
      mainSubject: "",
      schoolDescription: "",
      schoolPreference: "",
      // College
      degrees: [{ degree: "", field: "", yearOfStudy: 1, isCompleted: false }],
      collegeDescription: "",
      collegePreference: "",
      // Completed Education - Junior's new structure
      completedEntries: [
        {
          type: "education", // or "work"
          // Education fields
          degree: "",
          field: "",
          institution: "",
          startDate: "",
          endDate: "",
          isCurrentlyStudying: false,
          // Work fields
          jobTitle: "",
          company: "",
          isCurrentlyWorking: false,
          skills: "",
        },
      ],
      completedDescription: "",
      completedPreference: "",
      noJobPreference: "",
    },
  });

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Watch values for conditional rendering
  const educationStage = watch("educationStage");
  const isHigherSecondary = watch("isHigherSecondary");
  const completedEntries = watch("completedEntries") || [];

  // State to manage dynamic arrays
  const [degrees, setDegrees] = useState([
    { degree: "", field: "", yearOfStudy: 1, isCompleted: false },
  ]);

  const router = useRouter();

  // Check authentication and completion status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        setIsAuthenticated(true);
        return token;
      }
      router.replace("/login");
      return null;
    };

    const getProfileStatus = async () => {
      setIsLoading(true);
      try {
        const token = checkAuth();
        if (!token) return;

        const resp = await GlobalApi.GetDashboarCheck(token);
        const scopeType = resp.data.scopeType;

        if (resp.data.educationStageExists) {
          if (resp.data.isEducationCompleted) {
            if (scopeType === "career") {
              router.replace("/dashboard/careers/career-suggestions");
            } else if (scopeType === "sector") {
              router.replace("/dashboard_kids/sector-suggestion");
            } else if (scopeType === "cluster") {
              router.replace("/dashboard_junior/cluster-suggestion");
            }
          } else {
            if (!resp.data.institutionDetailsAdded) {
              router.replace("/education-details");
            } else {
              if (scopeType === "career") {
                router.replace("/dashboard/careers/career-suggestions");
              } else if (scopeType === "sector") {
                router.replace("/dashboard_kids/sector-suggestion");
              } else if (scopeType === "cluster") {
                router.replace("/dashboard_junior/cluster-suggestion");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile status:", error);
        toast.error("Error loading profile status. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    getProfileStatus();
  }, [router]);

  // Handle form submission with proper payload mapping
  const onSubmit = async (data) => {
    try {
      let payload = {
        educationStage: data.educationStage,
        schoolEducation:
          data.educationStage === "school"
            ? {
                isHigherSecondary: data.isHigherSecondary,
                mainSubject: data.isHigherSecondary
                  ? data.mainSubject || null
                  : null,
                description: data.schoolDescription || null,
              }
            : null,
        collegeEducation:
          data.educationStage === "college"
            ? data.degrees.map((deg, index) => ({
                degree: deg.degree,
                field: deg.field,
                yearOfStudy: parseInt(deg.yearOfStudy),
                isCompleted: deg.isCompleted || false,
                description: index === 0 ? data.collegeDescription : null,
              }))
            : null,
        careerPreferences: {
          schoolPref:
            data.educationStage === "school"
              ? data.isHigherSecondary
                ? data.schoolPreference
                : "personality_based"
              : null,
          collegePref:
            data.educationStage === "college" ? data.collegePreference : null,
          completedPref: null,
          noJobPref: null,
        },
      };

      // Handle completed education with new structure
      if (data.educationStage === "completed_education") {
        const educationEntries = data.completedEntries.filter(
          (entry) => entry.type === "education"
        );
        const workEntries = data.completedEntries.filter(
          (entry) => entry.type === "work"
        );

        payload.completedEducation =
          educationEntries.length > 0
            ? educationEntries.map((entry, index) => ({
                degree: entry.degree,
                field: entry.field,
                institution: entry.institution || null,
                startDate: entry.startDate || null,
                endDate: entry.isCurrentlyStudying
                  ? null
                  : entry.endDate || null,
                isCurrentlyStudying: entry.isCurrentlyStudying || false,
                description: index === 0 ? data.completedDescription : null,
              }))
            : null;

        payload.workExperience =
          workEntries.length > 0
            ? workEntries.map((entry) => ({
                jobTitle: entry.jobTitle,
                company: entry.company || null,
                startDate: entry.startDate || null,
                endDate: entry.isCurrentlyWorking
                  ? null
                  : entry.endDate || null,
                isCurrentlyWorking: entry.isCurrentlyWorking || false,
                skills: entry.skills || null,
              }))
            : null;

        // Set career preferences based on whether user is working or not
        const hasWorkExperience = workEntries.some(
          (entry) => entry.isCurrentlyWorking
        );
        if (hasWorkExperience) {
          payload.careerPreferences.completedPref = data.completedPreference;
        } else {
          payload.careerPreferences.noJobPref = data.noJobPreference;
        }
      }

      console.log("Submitting data:", payload);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        "/api/user/education-profile",
        payload,
        { headers }
      );

      if (response.status === 200 && response.data.success) {
        console.log("Response:", response.data);
        toast.success("Education profile updated successfully!");
        router.replace("/education-details");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error updating profile. Please try again.");
    }
  };

  // Dynamic field handlers for college degrees
  const addDegree = () => {
    const currentDegrees = getValues("degrees");
    const updatedDegrees = [
      ...currentDegrees,
      { degree: "", field: "", yearOfStudy: 1, isCompleted: false },
    ];
    setValue("degrees", updatedDegrees, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setDegrees(updatedDegrees);
  };

  const removeDegree = (index) => {
    const currentDegrees = getValues("degrees");
    const updatedDegrees = currentDegrees.filter((_, i) => i !== index);
    setValue("degrees", updatedDegrees, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setDegrees(updatedDegrees);
  };

  // Dynamic completed entries handlers (Junior's new structure)
  const addCompletedEntry = () => {
    const current = getValues("completedEntries");
    setValue("completedEntries", [
      ...current,
      {
        type: "education",
        degree: "",
        field: "",
        institution: "",
        startDate: "",
        endDate: "",
        isCurrentlyStudying: false,
        jobTitle: "",
        company: "",
        isCurrentlyWorking: false,
        skills: "",
      },
    ]);
  };

  const removeCompletedEntry = (index) => {
    const current = getValues("completedEntries");
    setValue(
      "completedEntries",
      current.filter((_, i) => i !== index)
    );
  };

  const updateEntryType = (index, type) => {
    const current = getValues("completedEntries");
    const updated = [...current];
    updated[index] = {
      ...updated[index],
      type,
      // Reset fields when changing type
      degree: "",
      field: "",
      institution: "",
      startDate: "",
      endDate: "",
      isCurrentlyStudying: false,
      jobTitle: "",
      company: "",
      isCurrentlyWorking: false,
      skills: "",
    };
    setValue("completedEntries", updated);
  };

  // Show loading overlay while checking status
  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <LoadingOverlay loadText={"Loading..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <CareerDataCollectionGuide />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-blue-500/30 mb-6">
            <GraduationCap className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Education Profile
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tell us about your educational journey to get personalized career
            recommendations
          </p>
        </div>

        {/* Main Form Container */}
        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden">
          {/* Animated border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-50 animate-pulse"></div>

          <div className="relative p-8 lg:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Education Stage Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Your Education Stage
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: "school", label: "School", icon: BookOpen },
                    { value: "college", label: "College", icon: GraduationCap },
                    {
                      value: "completed_education",
                      label: "Completed Education",
                      icon: Briefcase,
                    },
                  ].map((stage, index) => {
                    const Icon = stage.icon;
                    const isSelected = educationStage === stage.value;
                    return (
                      <label
                        key={stage.value}
                        className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-400/60 shadow-lg shadow-blue-500/20"
                            : "bg-gradient-to-br from-gray-700/60 to-gray-800/60 border border-gray-600/40 hover:from-gray-600/60 hover:to-gray-700/60"
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <input
                          type="radio"
                          {...register("educationStage", {
                            required: "Please select your education stage",
                          })}
                          value={stage.value}
                          className="sr-only"
                        />
                        <div className="p-6 text-center">
                          <div
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-all duration-300 ${
                              isSelected
                                ? "bg-gradient-to-br from-blue-400/30 to-purple-400/30"
                                : "bg-gray-700/50 group-hover:bg-gray-600/50"
                            }`}
                          >
                            <Icon
                              className={`w-6 h-6 transition-colors duration-300 ${
                                isSelected
                                  ? "text-blue-300"
                                  : "text-gray-400 group-hover:text-gray-300"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-lg font-semibold transition-colors duration-300 ${
                              isSelected
                                ? "text-blue-200"
                                : "text-gray-200 group-hover:text-white"
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </label>
                    );
                  })}
                </div>
                {errors.educationStage && (
                  <p className="text-red-400 text-sm mt-2 animate-fade-in">
                    {errors.educationStage.message}
                  </p>
                )}
              </div>

              {/* School Section */}
              {educationStage === "school" && (
                <div className="space-y-6 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      School Details
                    </h3>
                  </div>

                  {/* Higher Secondary Toggle */}
                  <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
                    <label className="block text-gray-300 font-medium mb-4">
                      Are you in higher secondary (11th-12th grade)?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: true, label: "Yes" },
                        { value: false, label: "No" },
                      ].map((option) => (
                        <label
                          key={option.value.toString()}
                          className={`flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                            isHigherSecondary === option.value
                              ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-blue-400/60 text-blue-200"
                              : "bg-gray-800/60 border-gray-600/40 text-gray-300 hover:bg-gray-700/60"
                          }`}
                        >
                          <input
                            type="radio"
                            name="isHigherSecondary"
                            value={option.value.toString()}
                            checked={isHigherSecondary === option.value}
                            onChange={(e) =>
                              setValue(
                                "isHigherSecondary",
                                e.target.value === "true"
                              )
                            }
                            className="sr-only"
                          />
                          <span className="font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Main Subject (conditional) */}
                  {isHigherSecondary && (
                    <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
                      <label className="block text-gray-300 font-medium mb-4">
                        Main Subject/Stream
                      </label>
                      <input
                        type="text"
                        {...register("mainSubject", {
                          required:
                            isHigherSecondary &&
                            "Please enter your main subject",
                        })}
                        className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        placeholder="e.g., Computer Science, Science, Arts, Commerce"
                      />
                      {errors.mainSubject && (
                        <p className="text-red-400 text-sm mt-2">
                          {errors.mainSubject.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Career Preferences */}
                  <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
                    <label className="block text-gray-300 font-medium mb-4">
                      Career Suggestion Preference
                    </label>
                    <div className="space-y-3">
                      {(isHigherSecondary
                        ? [
                            {
                              value: "subject_based",
                              label: "Based on my current subject/stream",
                            },
                            {
                              value: "personality_based",
                              label:
                                "Based only on my personality and career interests",
                            },
                            { value: "mixed", label: "Mix of both" },
                          ]
                        : [
                            {
                              value: "personality_based",
                              label:
                                "Based on personality and career interests",
                            },
                          ]
                      ).map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start p-4 rounded-lg border border-gray-700/30 bg-gray-800/30 hover:bg-gray-700/30 cursor-pointer transition-all duration-300 group"
                        >
                          <input
                            type="radio"
                            {...register("schoolPreference", {
                              required:
                                isHigherSecondary &&
                                "Please select a preference",
                            })}
                            value={option.value}
                            className="mt-1 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-200 group-hover:text-white transition-colors duration-300">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.schoolPreference && isHigherSecondary && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.schoolPreference.message}
                      </p>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
                    <label className="block text-gray-300 font-medium mb-4">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      {...register("schoolDescription")}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                      placeholder="Share any additional information about your interests, hobbies, or experiences..."
                    />
                  </div>
                </div>
              )}

              {/* College Section */}
              {educationStage === "college" && (
                <div className="space-y-6 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      College Education
                    </h3>
                  </div>

                  {/* Dynamic College Degrees */}
                  <div className="space-y-4">
                    <label className="block text-md font-medium text-gray-200">
                      Your Degree(s)
                    </label>

                    {watch("degrees")?.map((degree, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30 space-y-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-white font-medium">
                            Degree {index + 1}
                          </h4>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeDegree(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 font-medium mb-2">
                              Degree/Diploma
                            </label>
                            <input
                              type="text"
                              {...register(`degrees[${index}].degree`, {
                                required: "Degree is required",
                              })}
                              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="e.g., Bachelor's, Master's, Diploma"
                            />
                            {errors.degrees?.[index]?.degree && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.degrees[index].degree.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-gray-300 font-medium mb-2">
                              Field/Subject
                            </label>
                            <input
                              type="text"
                              {...register(`degrees[${index}].field`, {
                                required: "Field is required",
                              })}
                              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="e.g., Computer Science, Engineering"
                            />
                            {errors.degrees?.[index]?.field && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.degrees[index].field.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 font-medium mb-2">
                              Year of Study
                            </label>
                            <div className="relative">
                              <select
                                {...register(`degrees[${index}].yearOfStudy`, {
                                  required: "Year is required",
                                })}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                                  <option key={year} value={year}>
                                    Year {year}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-300 font-medium mb-2">
                              Status
                            </label>
                            <div className="flex items-center h-12 mt-1">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  {...register(`degrees[${index}].isCompleted`)}
                                  className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-200">
                                  Completed
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addDegree}
                      className="w-full p-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      Add Another Degree
                    </button>
                  </div>

                  {/* College Preference Selection */}
                  <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
                    <label className="block text-gray-300 font-medium mb-4">
                      Career Suggestion Preference
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          value: "education_based",
                          label: "Based on my current education",
                        },
                        {
                          value: "personality_based",
                          label:
                            "Based only on my personality and career interests",
                        },
                        { value: "mixed", label: "Mix of both" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start p-4 rounded-lg border border-gray-700/30 bg-gray-800/30 hover:bg-gray-700/30 cursor-pointer transition-all duration-300 group"
                        >
                          <input
                            type="radio"
                            {...register("collegePreference", {
                              required: "Please select a preference",
                            })}
                            value={option.value}
                            className="mt-1 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-200 group-hover:text-white transition-colors duration-300">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.collegePreference && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.collegePreference.message}
                      </p>
                    )}
                  </div>

                  {/* Additional Details */}
                  <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
                    <label className="block text-gray-300 font-medium mb-4">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      {...register("collegeDescription")}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                      placeholder="Share any additional information about your interests, hobbies, or experiences..."
                    />
                  </div>
                </div>
              )}

              {/* Completed Education Section - Junior's Enhanced Design */}
              {educationStage === "completed_education" && (
                <div className="space-y-6 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Education & Work Experience
                    </h3>
                  </div>

                  {/* Dynamic Completed Entries */}
                  <div className="space-y-4">
                    {completedEntries.map((entry, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30 space-y-4 relative group"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-white font-medium">
                            Entry {index + 1}
                          </h4>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeCompletedEntry(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Entry Type Dropdown */}
                        <div className="mb-4">
                          <label className="block text-gray-300 font-medium mb-2">
                            Type
                          </label>
                          <div className="relative">
                            <select
                              value={entry.type}
                              onChange={(e) =>
                                updateEntryType(index, e.target.value)
                              }
                              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                            >
                              <option value="education">Education</option>
                              <option value="work">Work Experience</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Education Fields */}
                        {entry.type === "education" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                Degree/Diploma
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `completedEntries[${index}].degree`,
                                  { required: "Degree is required" }
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="e.g., Bachelor's, Master's"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                Field of Study
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `completedEntries[${index}].field`,
                                  { required: "Field is required" }
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="e.g., Computer Science"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                Institution
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `completedEntries[${index}].institution`
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="e.g., University Name"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                Start Date
                              </label>
                              <input
                                type="month"
                                {...register(
                                  `completedEntries[${index}].startDate`
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                End Date
                              </label>
                              <input
                                type="month"
                                {...register(
                                  `completedEntries[${index}].endDate`
                                )}
                                disabled={watch(
                                  `completedEntries[${index}].isCurrentlyStudying`
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                              />
                            </div>
                            <div className="flex items-center">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  {...register(
                                    `completedEntries[${index}].isCurrentlyStudying`
                                  )}
                                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-300">
                                  Currently studying
                                </span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Work Fields */}
                        {entry.type === "work" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                Job Title
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `completedEntries[${index}].jobTitle`,
                                  { required: "Job title is required" }
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="e.g., Software Engineer"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                Company
                              </label>
                              <input
                                type="text"
                                {...register(
                                  `completedEntries[${index}].company`
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="e.g., Company Name"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                Start Date
                              </label>
                              <input
                                type="month"
                                {...register(
                                  `completedEntries[${index}].startDate`
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-300 font-medium mb-2">
                                End Date
                              </label>
                              <input
                                type="month"
                                {...register(
                                  `completedEntries[${index}].endDate`
                                )}
                                disabled={watch(
                                  `completedEntries[${index}].isCurrentlyWorking`
                                )}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-gray-300 font-medium mb-2">
                                Skills
                              </label>
                              <textarea
                                {...register(
                                  `completedEntries[${index}].skills`
                                )}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                placeholder="e.g., JavaScript, Project Management, Data Analysis"
                              />
                            </div>
                            <div className="flex items-center">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  {...register(
                                    `completedEntries[${index}].isCurrentlyWorking`
                                  )}
                                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-300">
                                  Currently working
                                </span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addCompletedEntry}
                      className="w-full p-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      Add Another Entry
                    </button>
                  </div>

                  {/* Career Preferences for Completed Education */}
                  <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
                    <label className="block text-gray-300 font-medium mb-4">
                      Career Suggestion Preference
                    </label>
                    <div className="space-y-3">
                      {/* Check if user has work experience */}
                      {completedEntries.some(
                        (entry) =>
                          entry.type === "work" && entry.isCurrentlyWorking
                      )
                        ? // Show options for users with work experience
                          [
                            {
                              value: "education_based",
                              label: "Based on my education",
                            },
                            {
                              value: "job_based",
                              label: "Based on my current job and skills",
                            },
                            {
                              value: "personality_based",
                              label:
                                "Based only on my personality and career interests",
                            },
                            { value: "mixed_all", label: "Mix of all" },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-start p-4 rounded-lg border border-gray-700/30 bg-gray-800/30 hover:bg-gray-700/30 cursor-pointer transition-all duration-300 group"
                            >
                              <input
                                type="radio"
                                {...register("completedPreference", {
                                  required: "Please select a preference",
                                })}
                                value={option.value}
                                className="mt-1 text-blue-500 focus:ring-blue-500"
                              />
                              <span className="ml-3 text-gray-200 group-hover:text-white transition-colors duration-300">
                                {option.label}
                              </span>
                            </label>
                          ))
                        : // Show options for users without work experience
                          [
                            {
                              value: "education_based",
                              label: "Based on my education",
                            },
                            {
                              value: "personality_based",
                              label:
                                "Based only on my personality and career interests",
                            },
                            { value: "mixed", label: "Mix of both" },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className="flex items-start p-4 rounded-lg border border-gray-700/30 bg-gray-800/30 hover:bg-gray-700/30 cursor-pointer transition-all duration-300 group"
                            >
                              <input
                                type="radio"
                                {...register("noJobPreference", {
                                  required: "Please select a preference",
                                })}
                                value={option.value}
                                className="mt-1 text-blue-500 focus:ring-blue-500"
                              />
                              <span className="ml-3 text-gray-200 group-hover:text-white transition-colors duration-300">
                                {option.label}
                              </span>
                            </label>
                          ))}
                    </div>
                    {errors.completedPreference &&
                      completedEntries.some(
                        (entry) =>
                          entry.type === "work" && entry.isCurrentlyWorking
                      ) && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.completedPreference.message}
                        </p>
                      )}
                    {errors.noJobPreference &&
                      !completedEntries.some(
                        (entry) =>
                          entry.type === "work" && entry.isCurrentlyWorking
                      ) && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.noJobPreference.message}
                        </p>
                      )}
                  </div>

                  {/* Additional Details */}
                  <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
                    <label className="block text-gray-300 font-medium mb-4">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      {...register("completedDescription")}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                      placeholder="Share any additional information about your interests, hobbies, or experiences..."
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {educationStage && (
                <div className="pt-8">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                  >
                    Save Education Profile
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

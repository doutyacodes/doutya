"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { CareerDataCollectionGuide } from "@/app/_components/StepCompletionNotifications";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";

export default function EducationProfileForm() {
  // Main form state
  const { register, handleSubmit, control, watch, getValues, setValue, trigger, formState: { errors } } = useForm({
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
      // Completed Education
      completedDegrees: [{ degree: "", field: "" }],
      isCurrentlyWorking: false,
      jobs: [{ jobTitle: "", yearsOfExperience: 0 }],
      skills: [{ skillName: "" }],
      completedDescription: "",
      completedPreference: "",
      noJobPreference: ""
    }
  });
  const [isLoading, setisLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  // Watch values for conditional rendering
  const educationStage = watch("educationStage");
  const isHigherSecondary = watch("isHigherSecondary");
  const isCurrentlyWorking = watch("isCurrentlyWorking");

  // State to manage dynamic arrays
  const [degrees, setDegrees] = useState([{ degree: "", field: "", yearOfStudy: 1, isCompleted: false }]);
  const [completedDegrees, setCompletedDegrees] = useState([{ degree: "", field: "" }]);
  const [jobs, setJobs] = useState([{ jobTitle: "", yearsOfExperience: 0 }]);
  const [skills, setSkills] = useState([{ skillName: "" }]);

  const router = useRouter();


  // Check authentication and completion status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        setIsAuthenticated(true);
        return token;
      }
      router.replace("/login"); // Redirect to login if no token
      return null;
    };
    
    const getProfileStatus = async () => {
      setisLoading(true);
      try {
        const token = checkAuth();
        if (!token) return;
        
        const resp = await GlobalApi.GetDashboarCheck(token);

        // Check if education profile is already completed and redirect accordingly
        if (resp.data.educationStageExists) {
          // Education profile already exists, redirect based on next incomplete step
          if (!resp.data.institutionDetailsAdded) {
            router.replace("/education-details");
          } else if (!resp.data.countryAdded) {
            router.replace("/country");
          } else {
            router.replace("/dashboard/careers/career-suggestions");
          }
        }
        // If education stage doesn't exist, we stay on this page
      } catch (error) {
        console.error("Error fetching profile status:", error);
        toast.error("Error loading profile status. Please try again.");
      } finally {
        setisLoading(false);
      }
    };
    
    getProfileStatus();
  }, [router]);
  
// Handle form submission
const onSubmit = async (data) => {
    try {
      // Map form data to your API structure
      const payload = {
        educationStage: data.educationStage,
        schoolEducation: data.educationStage === "school" ? {
          isHigherSecondary: data.isHigherSecondary,
          mainSubject: data.isHigherSecondary ? data.mainSubject || null : null,
          description: data.schoolDescription || null
        } : null,
        collegeEducation: data.educationStage === "college" ? 
          data.degrees.map((deg, index) => ({
            degree: deg.degree,
            field: deg.field,
            yearOfStudy: parseInt(deg.yearOfStudy),
            isCompleted: deg.isCompleted || false,
            description: index === 0 ? data.collegeDescription : null // Only save description once
          })) : null,
        completedEducation: data.educationStage === "completed_education" ? 
          data.completedDegrees.map((deg, index) => ({
            degree: deg.degree,
            field: deg.field,
            description: index === 0 ? data.completedDescription : null // Only save description once
          })) : null,
        workExperience: data.educationStage === "completed_education" && data.isCurrentlyWorking ? 
          data.jobs.map(job => ({
            jobTitle: job.jobTitle,
            yearsOfExperience: parseInt(job.yearsOfExperience)
          })) : null,
        skills: data.educationStage === "completed_education" && data.isCurrentlyWorking && data.skills ? 
          data.skills.map(skill => ({
            skillName: skill.skillName
          })) : null,
        careerPreferences: {
          schoolPref: data.educationStage === "school" ? (data.isHigherSecondary ? data.schoolPreference : "personality_based") : null,
          collegePref: data.educationStage === "college" ? data.collegePreference : null,
          completedPref: data.educationStage === "completed_education" && data.isCurrentlyWorking ? data.completedPreference : null,
          noJobPref: data.educationStage === "completed_education" && !data.isCurrentlyWorking ? data.noJobPreference : null
        }
      };

    //   setSubmitting(true);
      console.log("Submitting data:", payload);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
       // Ensure token exists before making the request
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Make API call
        const response = await axios.post("/api/user/education-profile", payload, { headers });

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
    } finally {
    //   setSubmitting(false);
    }
  };


  // Dynamic field handlers
  const addDegree = () => {
    const currentDegrees = getValues("degrees"); // Retrieve current degrees from react-hook-form
    const updatedDegrees = [...currentDegrees, { degree: "", field: "", yearOfStudy: 1, isCompleted: false }];
    setValue("degrees", updatedDegrees, { shouldValidate: true, shouldDirty: true });
    setDegrees(updatedDegrees); // Sync local state
  };
  
  const removeDegree = (index) => {
    const currentDegrees = getValues("degrees"); // Retrieve current degrees from react-hook-form
    const updatedDegrees = currentDegrees.filter((_, i) => i !== index);
    setValue("degrees", updatedDegrees, { shouldValidate: true, shouldDirty: true });
    setDegrees(updatedDegrees); // Sync local state
  };
  
  const addCompletedDegree = () => {
    const currentCompletedDegrees = getValues("completedDegrees"); // Retrieve current completed degrees
    const updatedDegrees = [...currentCompletedDegrees, { degree: "", field: "" }];
    setValue("completedDegrees", updatedDegrees, { shouldValidate: true, shouldDirty: true });
    setCompletedDegrees(updatedDegrees); // Sync local state
  };
  
  const removeCompletedDegree = (index) => {
    const currentCompletedDegrees = getValues("completedDegrees"); // Retrieve current completed degrees
    const updatedDegrees = currentCompletedDegrees.filter((_, i) => i !== index);
    setValue("completedDegrees", updatedDegrees, { shouldValidate: true, shouldDirty: true });
    setCompletedDegrees(updatedDegrees); // Sync local state
  };
  const addJob = () => {
    const currentJobs = getValues("jobs"); // Retrieve current jobs
    const updatedJobs = [...currentJobs, { jobTitle: "", yearsOfExperience: 0 }];
    setValue("jobs", updatedJobs, { shouldValidate: true, shouldDirty: true });
    // Ensure isCurrentlyWorking remains true
    setValue("isCurrentlyWorking", true, { shouldValidate: true });
    setJobs(updatedJobs); // Sync local state
  };
  
  const removeJob = (index) => {
    const currentJobs = getValues("jobs"); // Retrieve current jobs
    const updatedJobs = currentJobs.filter((_, i) => i !== index);
    setValue("jobs", updatedJobs, { shouldValidate: true, shouldDirty: true });
    // Ensure isCurrentlyWorking remains true
    setValue("isCurrentlyWorking", true, { shouldValidate: true });
    setJobs(updatedJobs); // Sync local state
  };
  
  const addSkill = () => {
    const currentSkills = getValues("skills"); // Retrieve current skills
    const updatedSkills = [...currentSkills, { skillName: "" }];
    setValue("skills", updatedSkills, { shouldValidate: true, shouldDirty: true });
    // Ensure isCurrentlyWorking remains true
    setValue("isCurrentlyWorking", true, { shouldValidate: true });
    setSkills(updatedSkills); // Sync local state
  };
  
  const removeSkill = (index) => {
    const currentSkills = getValues("skills"); // Retrieve current skills
    const updatedSkills = currentSkills.filter((_, i) => i !== index);
    setValue("skills", updatedSkills, { shouldValidate: true, shouldDirty: true });
    // Ensure isCurrentlyWorking remains true
    setValue("isCurrentlyWorking", true, { shouldValidate: true });
    setSkills(updatedSkills); // Sync local state
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
    <div className="min-h-screen bg-gray-950 py-12 flex flex-col items-center">
      <CareerDataCollectionGuide />
      {/* Page heading section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Education Profile</h1>
        <p className="text-gray-400 mt-2">Please provide your educational information to get personalized career suggestions</p>
      </div>

      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Education Stage Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Your Education Stage</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {["school", "college", "completed_education"].map((stage) => (
                <label 
                  key={stage} 
                  className={`flex items-center justify-center p-4 rounded-lg border ${
                    watch("educationStage") === stage 
                      ? "bg-blue-600 border-blue-500 text-white" 
                      : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                  } cursor-pointer transition-colors`}
                >
                  <input
                    type="radio"
                    {...register("educationStage", { required: "Please select your education stage" })}
                    value={stage}
                    className="sr-only"
                  />
                  <span className="capitalize">{stage.replace("_", " ")}</span>
                </label>
              ))}
            </div>
            {errors.educationStage && (
              <p className="mt-2 text-sm text-red-500">{errors.educationStage.message}</p>
            )}
          </div>

          {/* School Section */}
          {educationStage === "school" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">School Details</h2>

              {/* Higher Secondary Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Are you in higher secondary (11th-12th grade)?</label>
                <div className="flex gap-4">
                  <label className={`flex items-center justify-center p-3 rounded-lg border ${
                    watch("isHigherSecondary") === true
                      ? "bg-blue-600 border-blue-500 text-white" 
                      : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                  } cursor-pointer transition-colors`}>
                    <input
                      type="radio"
                      {...register("isHigherSecondary")}
                      value="true"
                      onChange={() => setValue("isHigherSecondary", true, { shouldValidate: true, shouldDirty: true })}
                      className="sr-only"
                    />
                    <span>Yes</span>
                  </label>
                  <label className={`flex items-center justify-center p-3 rounded-lg border ${
                    watch("isHigherSecondary") === false
                      ? "bg-blue-600 border-blue-500 text-white" 
                      : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                  } cursor-pointer transition-colors`}>
                    <input
                      type="radio"
                      {...register("isHigherSecondary")}
                      value="false"
                      onChange={() => setValue("isHigherSecondary", false, { shouldValidate: true, shouldDirty: true })}
                      className="sr-only"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Main Subject (only for higher secondary) */}
              {isHigherSecondary && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Main Subject/Stream</label>
                  <input
                    type="text"
                    {...register("mainSubject", { required: isHigherSecondary && "Please enter your main subject" })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Computer Science, Science, Arts, Commerce"
                  />
                  {errors.mainSubject && (
                    <p className="mt-1 text-sm text-red-500">{errors.mainSubject.message}</p>
                  )}
                </div>
              )}

              {/* School Preference Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Career Suggestion Preference</label>
                <div className="space-y-2">
                  {isHigherSecondary ? (
                    <>
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("schoolPreference", { required: "Please select a preference" })}
                          value="subject_based"
                          className="mr-2"
                        />
                        <span className="text-gray-200">Based on my current subject/stream</span>
                      </label>
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("schoolPreference")}
                          value="personality_based" 
                          className="mr-2"
                        />
                        <span className="text-gray-200">Based only on my personality and career interests</span>
                      </label>
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("schoolPreference")}
                          value="mixed"
                          className="mr-2"
                        />
                        <span className="text-gray-200">Mix of both</span>
                      </label>
                    </>
                  ) : (
                    <p className="text-gray-400">You will receive career suggestions based on your personality and career interests.</p>
                  )}
                </div>
                {errors.schoolPreference && isHigherSecondary && (
                  <p className="mt-1 text-sm text-red-500">{errors.schoolPreference.message}</p>
                )}
              </div>

              {/* Additional Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional Information (Optional)</label>
                <textarea
                  {...register("schoolDescription")}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Share any additional information about your interests, hobbies, or experiences that might help with career suggestions"
                />
              </div>
            </div>
          )}

          {/* College Section */}
          {educationStage === "college" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">College Education</h2>

              {/* Dynamic College Degrees */}
              <div className="space-y-4">
                <label className="block text-md font-medium text-gray-200">Your Degree(s)</label>
                
                {degrees.map((degree, index) => (
                  <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-800 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-medium">Degree {index + 1}</h4>
                      {index > 0 && (
                        <button 
                          type="button" 
                          onClick={() => removeDegree(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Degree/Diploma</label>
                        <input
                          type="text"
                          {...register(`degrees[${index}].degree`, { required: "Degree is required" })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g., Bachelor's, Master's, Diploma"
                        />
                        {errors.degrees?.[index]?.degree && (
                          <p className="mt-1 text-sm text-red-500">{errors.degrees[index].degree.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Field/Subject</label>
                        <input
                          type="text"
                          {...register(`degrees[${index}].field`, { required: "Field is required" })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g., Computer Science, Engineering, Psychology"
                        />
                        {errors.degrees?.[index]?.field && (
                          <p className="mt-1 text-sm text-red-500">{errors.degrees[index].field.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Year of Study</label>
                        <select
                          {...register(`degrees[${index}].yearOfStudy`, { required: "Year is required" })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                            <option key={year} value={year}>Year {year}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                        <div className="flex items-center h-10 mt-1">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              {...register(`degrees[${index}].isCompleted`)}
                              className="rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-200">Completed</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addDegree}
                  className="mt-2 px-4 py-2 border border-gray-700 bg-gray-800 text-blue-400 rounded-md hover:bg-gray-700 transition-colors"
                >
                  + Add Another Degree
                </button>
              </div>

              {/* College Preference Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Career Suggestion Preference</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      {...register("collegePreference", { required: "Please select a preference" })}
                      value="education_based"
                      className="mr-2"
                    />
                    <span className="text-gray-200">Based on my current education</span>
                  </label>
                  <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      {...register("collegePreference")}
                      value="personality_based" 
                      className="mr-2"
                    />
                    <span className="text-gray-200">Based only on my personality and career interests</span>
                  </label>
                  <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      {...register("collegePreference")}
                      value="mixed"
                      className="mr-2"
                    />
                    <span className="text-gray-200">Mix of both</span>
                  </label>
                </div>
                {errors.collegePreference && (
                  <p className="mt-1 text-sm text-red-500">{errors.collegePreference.message}</p>
                )}
              </div>

              {/* Additional Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Additional Information (Optional)</label>
                <textarea
                  {...register("collegeDescription")}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Share any additional information about your interests, hobbies, or experiences that might help with career suggestions"
                />
              </div>
            </div>
          )}

          {/* Completed Education Section */}
          {educationStage === "completed_education" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Completed Education</h2>

              {/* Dynamic Completed Degrees */}
              <div className="space-y-4">
                <label className="block text-md font-medium text-gray-200">Your Degree(s)</label>
                
                {completedDegrees.map((degree, index) => (
                  <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-800 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-medium">Degree {index + 1}</h4>
                      {index > 0 && (
                        <button 
                          type="button" 
                          onClick={() => removeCompletedDegree(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Degree/Diploma</label>
                        <input
                          type="text"
                          {...register(`completedDegrees[${index}].degree`, { required: "Degree is required" })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g., Bachelor's, Master's, Diploma"
                        />
                        {errors.completedDegrees?.[index]?.degree && (
                          <p className="mt-1 text-sm text-red-500">{errors.completedDegrees[index].degree.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Field/Subject</label>
                        <input
                          type="text"
                          {...register(`completedDegrees[${index}].field`, { required: "Field is required" })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g., Computer Science, Engineering, Psychology"
                        />
                        {errors.completedDegrees?.[index]?.field && (
                          <p className="mt-1 text-sm text-red-500">{errors.completedDegrees[index].field.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addCompletedDegree}
                  className="mt-2 px-4 py-2 border border-gray-700 bg-gray-800 text-blue-400 rounded-md hover:bg-gray-700 transition-colors"
                >
                  + Add Another Degree
                </button>
              </div>

              {/* Working Status */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Are you currently working?</label>
                <div className="flex gap-4">
                <label 
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                    watch("isCurrentlyWorking") === true
                        ? "bg-blue-600 border-blue-500 text-white" 
                        : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                    } cursor-pointer transition-colors`}
                >
                    <input
                    type="radio"
                    {...register("isCurrentlyWorking")}
                    value="true"
                    onChange={() => setValue("isCurrentlyWorking", true, { shouldValidate: true, shouldDirty: true })}
                    className="sr-only"
                    />
                    <span>Yes</span>
                </label>
                <label 
                    className={`flex items-center justify-center p-3 rounded-lg border ${
                    watch("isCurrentlyWorking") === false
                        ? "bg-blue-600 border-blue-500 text-white" 
                        : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                    } cursor-pointer transition-colors`}
                >
                    <input
                    type="radio"
                    {...register("isCurrentlyWorking")}
                    value="false"
                    onChange={() => setValue("isCurrentlyWorking", false, { shouldValidate: true, shouldDirty: true })}
                    className="sr-only"
                    />
                    <span>No</span>
                </label>
                </div>
            </div>

              {/* Jobs and Skills (only if working) */}
              {isCurrentlyWorking && (
                <>
                  {/* Dynamic Jobs */}
                  <div className="mt-6 space-y-4">
                    <label className="block text-md font-medium text-gray-200">Your Current Job(s)</label>
                    
                    {jobs.map((job, index) => (
                      <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-800 space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-white font-medium">Job {index + 1}</h4>
                          {index > 0 && (
                            <button 
                              type="button" 
                              onClick={() => removeJob(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
                            <input
                              type="text"
                              {...register(`jobs[${index}].jobTitle`, { required: "Job title is required" })}
                              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., Software Engineer, Accountant"
                            />
                            {errors.jobs?.[index]?.jobTitle && (
                              <p className="mt-1 text-sm text-red-500">{errors.jobs[index].jobTitle.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Years of Experience</label>
                            <input
                              type="number"
                              {...register(`jobs[${index}].yearsOfExperience`, { 
                                required: "Years is required",
                                min: { value: 0, message: "Must be 0 or more" },
                                valueAsNumber: true
                              })}
                              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., 2"
                              min="0"
                            />
                            {errors.jobs?.[index]?.yearsOfExperience && (
                              <p className="mt-1 text-sm text-red-500">{errors.jobs[index].yearsOfExperience.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addJob}
                      className="mt-2 px-4 py-2 border border-gray-700 bg-gray-800 text-blue-400 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      + Add Another Job
                    </button>
                  </div>

                  {/* Dynamic Skills */}
                  <div className="mt-6 space-y-4">
                    <label className="block text-md font-medium text-gray-200">Your Skills</label>
                    
                    {skills.map((skill, index) => (
                      <div key={index} className="p-4 border border-gray-700 rounded-lg bg-gray-800 space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-white font-medium">Skill {index + 1}</h4>
                          {index > 0 && (
                            <button 
                              type="button" 
                              onClick={() => removeSkill(index)}
                              className="text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Skill Name</label>
                            <input
                              type="text"
                              {...register(`skills[${index}].skillName`, { required: "Skill name is required" })}
                              className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="e.g., Programming, Project Management, Data Analysis"
                            />
                            {errors.skills?.[index]?.skillName && (
                              <p className="mt-1 text-sm text-red-500">{errors.skills[index].skillName.message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addSkill}
                        className="mt-2 px-4 py-2 border border-gray-700 bg-gray-800 text-blue-400 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        + Add Another Skill
                      </button>
                    </div>
                  </>
                )}
  
                {/* Career Preference Selection - Working */}
                {isCurrentlyWorking && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Career Suggestion Preference</label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("completedPreference", { required: "Please select a preference" })}
                          value="education_based"
                          className="mr-2"
                        />
                        <span className="text-gray-200">Based on my education</span>
                      </label>
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("completedPreference")}
                          value="job_based" 
                          className="mr-2"
                        />
                        <span className="text-gray-200">Based on my current job and skills</span>
                      </label>
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("completedPreference")}
                          value="personality_based"
                          className="mr-2"
                        />
                        <span className="text-gray-200">Based only on my personality and career interests</span>
                      </label>
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("completedPreference")}
                          value="mixed_all"
                          className="mr-2"
                        />
                        <span className="text-gray-200">Mix of all</span>
                      </label>
                    </div>
                    {errors.completedPreference && isCurrentlyWorking && (
                      <p className="mt-1 text-sm text-red-500">{errors.completedPreference.message}</p>
                    )}
                  </div>
                )}
  
                {/* Career Preference Selection - Not Working */}
                {educationStage === "completed_education" && isCurrentlyWorking === false && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Career Suggestion Preference</label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("noJobPreference", { required: "Please select a preference" })}
                          value="education_based"
                          className="mr-2"
                        />
                        <span className="text-gray-200">Based on my education</span>
                      </label>
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("noJobPreference")}
                          value="personality_based" 
                          className="mr-2"
                        />
                        <span className="text-gray-200">Based only on my personality and career interests</span>
                      </label>
                      <label className="flex items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          {...register("noJobPreference")}
                          value="mixed"
                          className="mr-2"
                        />
                        <span className="text-gray-200">Mix of both</span>
                      </label>
                    </div>
                    {errors.noJobPreference && isCurrentlyWorking === false && (
                      <p className="mt-1 text-sm text-red-500">{errors.noJobPreference.message}</p>
                    )}
                  </div>
                )}
  
                {/* Additional Details */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Additional Information (Optional)</label>
                  <textarea
                    {...register("completedDescription")}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Share any additional information about your interests, hobbies, or experiences that might help with career suggestions"
                  />
                </div>
              </div>
            )}
  
            {/* Submit Button - Only show if education stage is selected */}
            {educationStage && (
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save Profile
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
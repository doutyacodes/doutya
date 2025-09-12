"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculateAge } from "@/lib/ageCalculate";
import GlobalApi from "@/app/_services/GlobalApi";

function QuickSignUp() {
  const [selectedDOB, setSelectedDOB] = useState(() => {
    // Set default date to 15 years ago
    const date = new Date();
    date.setFullYear(date.getFullYear() - 15);
    return date.toISOString().split("T")[0];
  });

  const [selectedClass, setSelectedClass] = useState("9");
  const [dobError, setDobError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState("");
  const [showStreamInput, setShowStreamInput] = useState(false);
  const [subjects, setSubjects] = useState([""]);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const streamOptions = [
    "Science",
    "Commerce",
    "Arts/Humanities",
    "Biology",
    "Mathematics",
    "Computer Science",
    "Economics",
    "Literature",
    "Other",
  ];

  const handleDOBChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    const minAllowedDate = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    );

    if (selectedDate > minAllowedDate) {
      setDobError("You must be at least 5 years old");
      setSelectedDOB("");
    } else {
      setDobError("");
      setSelectedDOB(e.target.value);
    }
  };

  const handleClassChange = (e) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);

    // Reset subjects when class changes
    if (!["11", "12"].includes(newClass)) {
      setSubjects([""]);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, ""]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
    }
  };

  const updateSubject = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const onSubmit = async (data) => {
    if (!selectedDOB || dobError) {
      toast.error("Please select a valid date of birth");
      return;
    }

    if (!selectedClass) {
      toast.error("Please select your class/grade");
      return;
    }

    // Add this after the class validation check:
    if (["11", "12"].includes(selectedClass) && !selectedStream) {
      toast.error("Please select your stream");
      return;
    }

    // Validate subjects for class 11 and 12
    if (["11", "12"].includes(selectedClass)) {
      const validSubjects = subjects.filter((subject) => subject.trim() !== "");
      if (validSubjects.length === 0) {
        toast.error("Please add at least one subject");
        return;
      }
    }

    setIsLoading(true);

    // Prepare quick signup data
    const quickSignupData = {
      username: data.username,
      dob: selectedDOB,
      class: selectedClass,
      ...(["11", "12"].includes(selectedClass) && {
        stream: selectedStream,
        subjects: subjects.filter((subject) => subject.trim() !== ""),
      }),
    };

    try {
      const response = await GlobalApi.QuickCreateUser(quickSignupData);

      if (response.status === 201) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);

        toast.success("Quick signup successful!");

        // Route based on class selection
        if (["5", "6", "7"].includes(selectedClass)) {
          localStorage.setItem("dashboardUrl", "/dashboard_junior");
          localStorage.setItem("navigateUrl", "/dashboard_junior");
          router.push("/dashboard_junior");
        } else {
          localStorage.setItem("dashboardUrl", "/dashboard");
          localStorage.setItem("navigateUrl", "/dashboard");
          router.push("/dashboard");
        }
      } else {
        const errorMessage = response.data?.message || "Quick signup failed";
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Error:", err);

      if (err.response?.status === 400 && err.response?.data?.message) {
        const errorMsg = err.response.data.message;
        if (errorMsg.includes("Username")) {
          setError("username", {
            type: "manual",
            message: "Username already exists",
          });
        } else {
          toast.error(`Error: ${errorMsg}`);
        }
      } else {
        toast.error(`Error: ${err.message || "Something went wrong"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center pt-8 pb-8 px-4">
      <Toaster />
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Quick Signup</h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300 text-sm">For testing purposes only</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                placeholder="Enter username"
                required
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Date of Birth
              </label>
              <input
                type="date"
                value={selectedDOB}
                onChange={handleDOBChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                required
              />
              {dobError && (
                <p className="mt-2 text-sm text-red-400">{dobError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Class/Grade
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                required
              >
                <option value="">Select Class/Grade</option>
                <option value="5">5th</option>
                <option value="6">6th</option>
                <option value="7">7th</option>
                <option value="8">8th</option>
                <option value="9">9th</option>
                <option value="10">10th</option>
                <option value="11">11th</option>
                <option value="12">12th</option>
                <option value="college">College</option>
              </select>
            </div>

            {["11", "12"].includes(selectedClass) && (
              <div>
                <label
                  htmlFor="stream"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Stream
                </label>
                {!showStreamInput ? (
                  <div className="space-y-2">
                    <select
                      id="stream"
                      value={selectedStream}
                      onChange={(e) => {
                        if (e.target.value === "Other") {
                          setShowStreamInput(true);
                          setSelectedStream("");
                        } else {
                          setSelectedStream(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Stream</option>
                      {streamOptions.map((stream) => (
                        <option key={stream} value={stream}>
                          {stream}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={selectedStream}
                      onChange={(e) => setSelectedStream(e.target.value)}
                      placeholder="Enter your stream"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowStreamInput(false);
                        setSelectedStream("");
                      }}
                      className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    >
                      ← Back to dropdown
                    </button>
                  </div>
                )}
              </div>
            )}

            {["11", "12"].includes(selectedClass) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Subjects
                  </label>
                  <button
                    type="button"
                    onClick={addSubject}
                    className="flex items-center space-x-1 text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
                  >
                    <span className="text-lg">+</span>
                    <span>Add Subject</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => updateSubject(index, e.target.value)}
                        placeholder={`Subject ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                      />
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubject(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        >
                          <span className="text-lg">×</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 font-semibold rounded-xl shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                isLoading
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/25 hover:scale-[1.02]"
              }`}
            >
              {isLoading ? "Creating Account..." : "Quick Signup"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link
              href="/signup"
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors duration-200"
            >
              ← Back to Regular Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickSignUp;

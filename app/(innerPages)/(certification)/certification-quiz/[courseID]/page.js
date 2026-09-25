"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import QuizProgressAlert from "@/app/_components/QuizProgressAlert";
import GlobalApi from "@/app/_services/GlobalApi";
// import { Toaster } from '@/components/ui/toaster';
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast, { LoaderIcon, Toaster } from "react-hot-toast";
import 'react-circular-progressbar/dist/styles.css'; // Make sure to import the CSS
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Award, BookOpen, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContentGenerationLoading from "@/app/_components/ContentGenerationLoading";

function Page({ params }) {
  const searchParams = useSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  
  // New state variables for certification overview
  const [certificationInfo, setCertificationInfo] = useState(null);
  const [showOverview, setShowOverview] = useState(true);
  const [isIneligible, setIsIneligible] = useState(false);
  const [ineligibleMessage, setIneligibleMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingQuiz, setIsFetchingQuiz] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const courseID = params.courseID;
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const t = useTranslations('QuizPage');
  const level = searchParams.get("level"); 

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
  
  useEffect(() => {
    const getQuizData = async () => {
      setIsFetchingQuiz(true)
      setIsLoading(true)
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
          console.log("test Id courseID", courseID);
          
          const resp = await GlobalApi.GetCertificationTest(courseID, token, level);

        if (resp.data.isCompleted){
          setQuizCompleted(true);
          return
        }
        console.log(resp.data.questions);
        // Store questions data
        setQuestions(resp.data.questions);
        
        // Store certification info
        if (resp.data.certificationOverview) {
          setCertificationInfo(resp.data.certificationOverview);
        }

        // Check if there's quiz progress
        if (resp.data.quizProgress > 0) {
          setCurrentQuestionIndex(resp.data.quizProgress);
          setShowAlert(true); // Set showAlert to true when resuming the quiz
          setShowOverview(false); // Skip overview if resuming quiz
        }
      } catch (error) {
        console.error("Error Fetching GetQuizData data:", error);
      } finally {
        setIsFetchingQuiz(false);
        setIsLoading(false)
      }
    };
    getQuizData();
  }, [courseID, level]);

  useEffect(() => {
    if(questions?.length > 0 && !showOverview){
        const choices = questions[currentQuestionIndex].options
        setShuffledChoices(choices.sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, questions, showOverview]);

  useEffect(() => {
    if (quizCompleted) {
      // setIsLoading(true)
      const interval = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);

      const timer = setTimeout(() => {
        router.push(`/certification-results/${courseID}`)
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [quizCompleted, router]);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  const handleNext = async () => {
    
    if (selectedChoice) {
      const answer = {
        questionId: questions[currentQuestionIndex].id,
        optionId: selectedChoice.id,
        isAnswer: selectedChoice.is_answer,
        certificationId: courseID
      };
      await quizProgressSubmit(answer);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoice(null);
    } else {
      setQuizCompleted(true);
      quizSubmit();
    }
  };

  const quizProgressSubmit = async (data) => {
    setProgressLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.CertificationTestProgress(data, token);

      if (resp && resp.status === 201) {
        console.log("Response");
        // handleNext()
      } else {
        console.error("Failed to save progress. Status code:", resp.status);
        toast.error(
          "There was a problem saving your progress. Please check your internet connection."
        );
      }
    } catch (error) {
      console.error("Error submitting progress:", error.message);
      toast.error(
        "There was an error saving your progress. Please try again later."
      );
    } finally {
      setProgressLoading(false);
    }
  };

  const quizSubmit = async () => {
    setIsLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const resp = await GlobalApi.UpdateCertificationTest(token, courseID, level);
      if (resp && resp.status === 201) {
        toast.success("Quiz Completed successfully!");
      } else {
        toast.error("Failed to submit quiz.");
        // alert('Failed Submitted results');
      }
    } catch (error) {
      console.error("Error submitting quiz", error);
      // toast.error('Error: Failed to create Challenge.');
      toast.error("Error Error: Failed to submit quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  // Function to start the quiz from overview page
  const handleStartTest = () => {
    setShowOverview(false);
  };
  
  if (isLoading || !isAuthenticated || isFetchingQuiz) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={"Loading..."} />
            {/* Loading Modal */}
            <ContentGenerationLoading
              isOpen={isFetchingQuiz}
              onClose={() => setIsFetchingQuiz(false)}
              page="certificationTest" // Change this based on your current page
              showDelay={1000} // Only show if loading takes more than 1 second
              // Optional: auto close after 30 seconds
              // autoCloseDelay={30000}
            />
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-center">
        <div>
          <div className="text-4xl font-semibold">
            Certification Test Completed successfully
          </div>

          <p className="mt-4">
            Navigating to the Certification Results in {secondsRemaining} seconds
          </p>
        </div>
      </div>
    );
  }
  
  // Show certification overview
  if (isIneligible) {
    return (
      <div className="min-h-full py-8 px-4 sm:px-8 max-w-4xl mx-auto text-gray-100">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <div className="bg-gray-800/60 border border-rose-500/30 rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-2">Certification Ineligible</h2>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">
            {ineligibleMessage || "You have reached the maximum number of attempts (3) and are permanently ineligible to retake this certification."}
          </p>
          <button
            onClick={() => router.replace("/dashboard/careers/career-guide")}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Return to Career Guide
          </button>
        </div>
      </div>
    );
  }

  if (showOverview && certificationInfo) {
    const scopeLabel = 
      certificationInfo.scopeType === 'cluster' ? 'Cluster' : 
      certificationInfo.scopeType === 'sector' ? 'Sector' : 'Career';
    const displayName = certificationInfo.scopeName || certificationInfo.careerName || "";
    const currentAttempt = certificationInfo.attempts || 1;
    const remainingAttempts = certificationInfo.remainingAttempts != null 
      ? certificationInfo.remainingAttempts 
      : Math.max(0, 3 - currentAttempt);

    return (
      <div className="min-h-full py-6 px-4 sm:px-8 max-w-5xl mx-auto text-gray-100">
        <Toaster position="top-center" reverseOrder={false} />
        
        {/* Navigation */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Certification: {certificationInfo.certificationName}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {scopeLabel}: <span className="text-gray-200 font-medium">{displayName || "General"}</span>
            <span className="mx-2 text-gray-600">•</span>
            Level: <span className="capitalize text-gray-200 font-medium">{level || "beginner"}</span>
          </p>
        </div>

        {/* Two-Column Integrated Layout (Fits comfortably above the fold) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Star Criteria, Rules & Topics */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Star Rating Criteria */}
            <div className="rounded-lg bg-gray-800/40 border border-gray-700/60 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Star Rating Criteria
              </h2>
              <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
                <div className="p-2.5 rounded bg-gray-900/60 border border-gray-700/40">
                  <div className="text-yellow-400 text-xs font-semibold tracking-wide">★★★ 3 Stars</div>
                  <div className="text-white text-sm font-bold mt-0.5">90% – 100%</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">Distinction</div>
                </div>
                <div className="p-2.5 rounded bg-gray-900/60 border border-gray-700/40">
                  <div className="text-yellow-400 text-xs font-semibold tracking-wide">★★☆ 2 Stars</div>
                  <div className="text-white text-sm font-bold mt-0.5">70% – 89%</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">Passing Standard</div>
                </div>
                <div className="p-2.5 rounded bg-gray-900/60 border border-gray-700/40">
                  <div className="text-gray-400 text-xs font-semibold tracking-wide">☆☆☆ 0 Stars</div>
                  <div className="text-rose-400 text-sm font-bold mt-0.5">Below 70%</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">Did Not Pass</div>
                </div>
              </div>
            </div>

            {/* Attempt Rules */}
            <div className="rounded-lg bg-gray-800/40 border border-gray-700/60 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                Attempt Rules & Guidelines
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 font-bold select-none">•</span>
                  <span><strong className="text-white">Maximum 3 Attempts:</strong> You are allowed up to 3 total attempts to pass this certification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 font-bold select-none">•</span>
                  <span><strong className="text-white">Passing Standard:</strong> A minimum score of <strong className="text-white">70%</strong> is strictly required to earn the certificate.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 font-bold select-none">•</span>
                  <span><strong className="text-white">Permanent Ineligibility:</strong> If you fail all 3 attempts (under 70% each), you become permanently <strong className="text-rose-400">ineligible</strong> to retake.</span>
                </li>
              </ul>
            </div>

            {/* Topics Covered */}
            {certificationInfo.topics && certificationInfo.topics.length > 0 && (
              <div className="rounded-lg bg-gray-800/40 border border-gray-700/60 p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                  Assessed Topics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-300">
                  {certificationInfo.topics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <span className="text-gray-500 font-mono text-xs select-none shrink-0 pt-0.5">
                        {(index + 1).toString().padStart(2, '0')}.
                      </span>
                      <span className="text-gray-200 leading-snug break-words">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Summary & Action Panel (Always Visible Without Scrolling) */}
          <div className="lg:col-span-4">
            <div className="rounded-lg bg-gray-800/70 border border-gray-700/80 p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Exam Details
              </h2>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50">
                  <span className="text-gray-400">Passing Score</span>
                  <span className="font-semibold text-white">70%</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50">
                  <span className="text-gray-400">Total Questions</span>
                  <span className="font-semibold text-white">{questions.length > 0 ? questions.length : 18} Questions</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-700/50">
                  <span className="text-gray-400">Current Attempt</span>
                  <span className="font-semibold text-white">Attempt {currentAttempt} of 3</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-400">Retries Remaining</span>
                  <span className={`font-semibold ${remainingAttempts === 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} left
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleStartTest}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm text-center"
                >
                  Start Certification Test
                </button>
                <button
                  type="button"
                  onClick={() => router.replace("/dashboard/careers/career-guide")}
                  className="w-full py-1 text-center text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Return to Career Guide
                </button>
              </div>

              <div className="pt-1 border-t border-gray-700/40 text-[11px] text-gray-500 text-center">
                Single session • Answers submitted upon completion
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // Completed state
  if (quizCompleted) {
    return (
      <div className="min-h-full py-12 px-4 flex items-center justify-center text-white text-center">
        <div className="max-w-md w-full bg-gray-800/60 border border-gray-700/60 rounded-xl p-8 shadow-2xl">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Award className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Certification Test Completed
          </h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Your answers have been submitted. Calculating score and generating results...
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gray-900/60 border border-gray-700/50 rounded-full text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            Redirecting to results in {secondsRemaining}s
          </div>
        </div>
      </div>
    );
  }

  // Show the quiz (Human-designed, anti-AI-slop, clean aesthetic)
  return (
    <div className="min-h-full py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-gray-100">
      <Toaster position="top-center" reverseOrder={false} />

      {showAlert && <QuizProgressAlert />}

      {questions.length > 0 && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Certification Examination
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {certificationInfo?.certificationName || "Certification Assessment"}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold text-gray-300 bg-gray-900/60 border border-gray-700/50 px-3 py-1.5 rounded-md">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-900/80 h-1.5 rounded-full overflow-hidden mt-4">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question & Choices Card */}
          <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-2xl font-medium text-white leading-relaxed">
                {removeHtmlTags(questions[currentQuestionIndex].question)}
              </h2>
            </div>

            {/* Choices */}
            <div className="space-y-3">
              {shuffledChoices.map((choice, index) => {
                const isSelected = selectedChoice?.id === choice.id;
                const letter = String.fromCharCode(65 + index);
                return (
                  <button
                    key={choice.id || index}
                    type="button"
                    disabled={progressLoading}
                    onClick={() => handleChoiceSelect(choice)}
                    className={`w-full flex items-start gap-3.5 p-4 rounded-lg text-left transition-all duration-150 border ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50"
                        : "bg-gray-900/40 border-gray-700/60 text-gray-300 hover:bg-gray-800/70 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-base leading-snug pt-0.5">
                      {removeHtmlTags(choice.text)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer / Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-700/60 mt-8">
              <span className="text-xs text-gray-400">
                {selectedChoice
                  ? "Choice selected. Proceed to next question."
                  : "Please select an answer to continue."}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedChoice || progressLoading}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm ${
                  selectedChoice && !progressLoading
                    ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                    : "bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed"
                }`}
              >
                {progressLoading ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin text-white" />
                    <span>Saving answer...</span>
                  </>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <span>Submit Certification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;

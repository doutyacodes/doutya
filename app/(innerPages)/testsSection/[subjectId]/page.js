"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import QuizProgressAlert from "@/app/_components/QuizProgressAlert";
import GlobalApi from "@/app/_services/GlobalApi";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import { Clock, CheckCircle, ArrowRight } from "lucide-react";

function Page({ params }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerValue, setTimerValue] = useState(null)
  const [subjectName, setSubjectName] = useState(null)
  const [challengeId, setChallengeId] = useState(null);
  const [progressSubmitted, setProgressSubmitted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const subjectId = params.subjectId;
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

  useEffect(() => {
    const getQuizData = async () => {
      setIsLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
          console.log("subjectId Id froionmsection", subjectId);
          
        const resp = await GlobalApi.GetTestsData(subjectId, token);
        setQuestions(resp.data.questions);
        setTimer(resp.data.timer * 1000);
        setTimerValue(resp.data.timer);
        setSubjectName(resp.data.subjectName)

        if (resp.data.quizProgress > 0) {
          setShowAlert(true);
        }
      } catch (error) {
        console.error("Error Fetching GetQuizData data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getQuizData();
  }, []);

  useEffect(() => {
    if(questions?.length > 0){
        const choices = questions[currentQuestionIndex].answers
        setShuffledChoices(choices.sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, questions]);

useEffect(() => {
  if (quizCompleted) {
    const interval = setInterval(() => {
      setSecondsRemaining((prevSeconds) => prevSeconds - 1);
    }, 1000);

    const timer = setTimeout(() => {
      router.replace("/dashboard/careers/career-guide?testCompleted=true&subjectName=" + encodeURIComponent(subjectName));
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }
}, [quizCompleted, router]);

  const handleChoiceSelect = (choice) => {
  
    if (selectedChoice || progressSubmitted || timeExpired) return;

    setSelectedChoice(choice);
    let earnedMarks = 0;
    if (choice.isCorrect == 'yes') {
      const maxMarks = 1000;
      const marks = (maxMarks / (timerValue * 1000)) * timer;
      earnedMarks = Math.max(0, marks.toFixed(3));
    }

    const answer = {
      questionId: questions[currentQuestionIndex].id,
      answerId: choice.id,
      isAnswer: choice.isCorrect,
      marks: earnedMarks,
      testId: questions[currentQuestionIndex].testId,
    };
    quizProgressSubmit(answer);
    setProgressSubmitted(true);
    console.log("answer", answer);
  };

  console.log("questions", questions);
  const handleNext = () => {

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedChoice(null);
        setProgressSubmitted(false);
        setTimeExpired(false);
        setTimer(timerValue * 1000);
      }, 3000);
    } else {
      setQuizCompleted(true);
      quizSubmit();
    }
  };

  const quizProgressSubmit = async (data) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.SaveTestProgress(data, token);

      if (resp && resp.status === 201) {
        console.log("Response");
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
    }
  };

  const quizSubmit = async () => {
    setIsLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const resp = await GlobalApi.UpdateTestData(token, questions[currentQuestionIndex].testId);
      if (resp && resp.status === 201) {
        toast.success("Quiz Completed successfully!");
      } else {
        toast.error("Failed to submit quiz.");
      }
    } catch (error) {
      console.error("Error submitting quiz", error);
      toast.error("Error Error: Failed to submit quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeOut = async () => {
    setTimeExpired(true);
    
    if (progressSubmitted) {
      handleNext();
      return;
    }
  
    const answer = {
      questionId: questions[currentQuestionIndex].id,
      answerId: selectedChoice ? selectedChoice.id : 0,
      testId: questions[currentQuestionIndex].testId,
      isAnswer: "no",
      marks: 0,
    };
    quizProgressSubmit(answer);
    handleNext();
  };

  useEffect(() => {
    if (!timer) return;

    setTimeExpired(false);
  
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        const newTime = Math.max(prevTimer - 100, 0);
        if (newTime === 0) {
          handleTimeOut();
          clearInterval(intervalId);
        }
        return newTime;
      });
    }, 100);
  
    return () => clearInterval(intervalId);
  }, [timer, currentQuestionIndex]);
  
  const removeHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center text-white text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-500/10 rounded-2xl"></div>
          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
            </div>
            <div className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Quiz Completed Successfully!
            </div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-6"></div>
            <p className="text-lg text-gray-300 mb-4">
              Navigating to the dashboard in <span className="text-orange-400 font-semibold">{secondsRemaining}</span> seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Toaster position="top-center" reverseOrder={false} />

      {showAlert && <QuizProgressAlert />}

      {questions.length > 0 && (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-4xl">
            {/* Header Section */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-2xl"></div>
              <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full p-3">
                      <Clock className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-white">{subjectName || 'Test'}</h1>
                      <p className="text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>
                  </div>
                  
                  {/* Timer */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Time Remaining</p>
                      <p className="text-lg font-bold text-orange-400">{(timer / 1000).toFixed(1)}s</p>
                    </div>
                    <div className="w-16 h-16">
                      <CircularProgressbar
                        styles={buildStyles({
                          textSize: "16px",
                          pathColor: "#f97316",
                          textColor: "#f97316",
                          trailColor: "#374151",
                          backgroundColor: "#1f2937",
                        })}
                        value={timer}
                        maxValue={timerValue * 1000}
                        circleRatio={1}
                        text={`${(timer / 1000).toFixed(0)}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Section */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-2xl"></div>
              <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 lg:p-8 shadow-2xl">
                <div className="text-center">
                  <h2 className="text-xl lg:text-3xl font-bold text-white leading-relaxed mb-6">
                    {removeHtmlTags(questions[currentQuestionIndex].question)}
                  </h2>
                </div>

                {/* Answer Choices */}
                <div className="grid gap-4 max-w-3xl mx-auto">
                  {shuffledChoices.map((choice, index) => {
                    const isSelected = selectedChoice?.id === choice.id;
                    const isCorrect = choice.isCorrect === 'yes';
                    const showCorrectAnswer = timeExpired || progressSubmitted;
                    
                    return (
                      <button
                        key={index}
                        className={`group relative pl-14 pr-4 py-4 lg:py-6 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                          isSelected && isCorrect
                            ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-2 border-green-500/60 shadow-lg shadow-green-500/20' 
                            : isSelected && !isCorrect
                            ? 'bg-gradient-to-r from-red-600/30 to-red-700/30 border-2 border-red-500/60 shadow-lg shadow-red-500/20'
                            : showCorrectAnswer && isCorrect
                            ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500/40'
                            : timeExpired
                            ? 'bg-gray-700/50 border border-gray-600/30 cursor-not-allowed opacity-70'
                            : 'bg-gray-800/60 border border-gray-700/50 hover:border-orange-500/50 hover:bg-gray-700/60'
                        }`}
                        onClick={() => handleChoiceSelect(choice)}
                        disabled={selectedChoice !== null || progressSubmitted || timeExpired}
                      >
                        {/* Choice indicator */}
                        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-300">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm lg:text-lg text-gray-200 group-hover:text-white transition-colors">
                            {removeHtmlTags(choice.text)}
                          </span>
                          {((showCorrectAnswer && isCorrect) || (isSelected && isCorrect)) && (
                            <CheckCircle className="w-6 h-6 text-green-400 ml-4 flex-shrink-0" />
                          )}
                          {isSelected && !isCorrect && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
                              <span className="text-white text-sm">✗</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Progress indicator */}
                {progressSubmitted && currentQuestionIndex < questions.length - 1 && (
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-gray-700/50 rounded-full px-4 py-2">
                      <ArrowRight className="w-4 h-4 text-orange-400 animate-pulse" />
                      <span className="text-sm text-gray-300">Moving to next question...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
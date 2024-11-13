"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import QuizProgressAlert from "@/app/_components/QuizProgressAlert";
import GlobalApi from "@/app/_services/GlobalApi";
// import { Toaster } from '@/components/ui/toaster';
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast, { LoaderIcon, Toaster } from "react-hot-toast";
import 'react-circular-progressbar/dist/styles.css'; // Make sure to import the CSS
import { useTranslations } from "next-intl";

function Page({ params }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const courseID = params.courseID;
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const t = useTranslations('QuizPage');

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
          console.log("test Id courseID", courseID);
          
        const resp = await GlobalApi.GetCertificationTest(courseID, token);
        console.log(resp.data.questions);
        setQuestions(resp.data.questions);

        setCurrentQuestionIndex(resp.data.quizProgress);
        if (resp.data.quizProgress > 0) {
          setShowAlert(true); // Set showAlert to true when resuming the quiz
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
        const choices = questions[currentQuestionIndex].options
        setShuffledChoices(choices.sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (quizCompleted) {
      // setIsLoading(true)
      const interval = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);

      const timer = setTimeout(() => {
        router.replace("/dashboard/careers/career-guide");
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
      const resp = await GlobalApi.UpdateCertificationTest(token, courseID);
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
  
  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
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
      <div className="h-screen flex items-center justify-center text-white text-center">
        <div>
          <div className="text-4xl font-semibold">
            Quiz Completed successfully
          </div>

          <p className="mt-4">
            Navigating to the Career page in {secondsRemaining} seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      {showAlert && <QuizProgressAlert />}

      {questions.length > 0 && (
        <div className="mt-4 pt-5 flex w-4/5 flex-col gap-8 justify-center items-center mx-auto py-4  text-white rounded-2xl">
          {
            progressLoading ? (
              <div className="inset-0 flex items-center my-16 justify-center z-50">
                <div className="flex items-center space-x-2">
                  <LoaderIcon className="w-10 h-10 text-white text-4xl animate-spin" />
                  <span className="text-white">{t('loading')}</span>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font">{currentQuestionIndex + 1}/{questions.length}</p>
                </div>
                
                <div>
                  <p className="font-bold p-2 text-xl md:text-3xl">
                    {removeHtmlTags(questions[currentQuestionIndex].question)}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 w-full text-white">
                  {shuffledChoices.map((choice, index) => (
                    <button
                      key={index}
                      className={`py-2 px-4 rounded-md hover:cursor-pointer
                        hover:bg-purple-300 hover:text-black transition duration-300 ease-in-out ${
                          selectedChoice?.id === choice.id
                            ? "bg-green-500"
                            : "bg-slate-400"
                        }`}
                      onClick={() => handleChoiceSelect(choice)}
                    >
                      {removeHtmlTags(choice.text)}
                    </button>
                  ))}
                </div>
      
                <div>
                  <button
                    className={`bg-green-600 py-2 px-5 rounded-lg text-white ${
                      selectedChoice ? "" : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={handleNext}
                    disabled={!selectedChoice || progressLoading}
                  >
                    Next
                  </button>
                </div>
              </>
            )
          }

        </div>
      )}
    </div>
  );
}

export default Page;
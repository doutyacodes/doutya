"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import QuizProgressAlert from "@/app/_components/QuizProgressAlert";
import GlobalApi from "@/app/_services/GlobalApi";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import GreenSlider from "@/app/dashboard/_components/GreenSlider";

function Page({ params }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const quizId = params.taskId;
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
        const resp = await GlobalApi.GetCareerQuiz(quizId, token);
        setQuestions(resp.data.questions);
        setChoices(resp.data.choices);
        setCurrentQuestionIndex(resp.data.quizProgress);

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
    if (quizCompleted) {
      const interval = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);

      const timer = setTimeout(() => {
        router.replace("/dashboard");
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

  const handleNext = () => {
    const answer = {
      questionId: questions[currentQuestionIndex].questionId,
      optionId: selectedChoice.choiceId,
      optionText: selectedChoice.choiceText,
      personaTypeId: questions[currentQuestionIndex].personaTypeId,
    };
    quizProgressSubmit(answer);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoice(null);
    } else {
      setQuizCompleted(true);
      quizSubmit();
    }
  };

  const quizProgressSubmit = async (data) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.SaveCarrierQuizProgress(data, token, quizId);

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
      const resp = await GlobalApi.SaveCareerQuizResult(token);
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
            Navigating to the Home page in {secondsRemaining} seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-[#009be8] h-20 my-4 justify-center items-center flex">
        <p className="text-white uppercase font-bold text-center">
          Interest Recognition Test
        </p>
      </div>
      {showAlert && <QuizProgressAlert />}
      <div className="justify-center flex items-center px-4">
        {questions.length > 0 && (
          <div className="mt-4 pt-7 flex flex-col gap-8 justify-center items-center mx-auto   text-white rounded-2xl p-[1px] bg-[#0097b2]">
            <div className="">
              <p className="font-extrabold text-center">
                {" "}
                {currentQuestionIndex + 1}/30
              </p>
            </div>
            <div className="bg-[#1b143a] p-3 rounded-2xl">
              <div>
                <p className="font-bold p-2 text-xl text-center">
                  {questions[currentQuestionIndex].questionText}
                </p>
              </div>

              <div className="sm:w-full px-10 justify-center items-center flex">
              <div className="flex flex-col gap-2 w-full text-white mt-16">
                <GreenSlider
                  key={currentQuestionIndex}
                  choices={choices}
                  selectedChoice={selectedChoice}
                  onChange={handleChoiceSelect}
                />
              </div>
            </div>

              <div className="w-full justify-center items-center flex my-5">
                <button
                  className={`bg-[#7824f6] py-2 px-10 rounded-full text-white ${
                    selectedChoice ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={handleNext}
                  disabled={!selectedChoice}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;

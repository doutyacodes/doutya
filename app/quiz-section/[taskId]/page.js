"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

function Page({ params }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const quizId = params.taskId;

  useEffect(() => {
    const getQuizData = async () => {
      setIsLoading(true);
      try {
        const resp = await GlobalApi.GetQuizData(quizId, "token");
        console.log("Response: of  GetQuizData", resp.data);
        setQuestions(resp.data.questions);
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
      // setIsLoading(true)
      const interval = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);

      const timer = setTimeout(() => {
        router.replace("/dashboard");
        console.log("Route");
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [quizCompleted, router]);

  useEffect(() => {
    // setIsLoading(true)
    if (questions?.length > 0) {
      // Shuffle choices when the component mounts or when the question changes
      // const choices = questions[currentQuestionIndex].answers.map(answer => answer.text);
      const choices = questions[currentQuestionIndex].answers;
      setShuffledChoices(choices.sort(() => Math.random() - 0.5));
    }

    // setIsLoading(false)
  }, [currentQuestionIndex, questions]);

  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
  };

  const handleNext = () => {
    const updatedAnswers = [
      ...answers,
      {
        questionId: questions[currentQuestionIndex].id,
        optionId: selectedChoice.id,
        optionText: selectedChoice.text,
        analyticId: selectedChoice.analyticId,
      },
    ];

    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedChoice(null); // Resetting selected choice for the next question
    } else {
      setQuizCompleted(true);
      quizSubmit(updatedAnswers); // Quiz finished, send data to API
    }
  };

  const quizSubmit = async (data) => {
    setIsLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const resp = await GlobalApi.SaveQuizResult(data, token, quizId);

      if (resp && resp.status === 201) {
        // toast.success('Challenge created Challenge!');
        console.log("Response:", resp.data);
        alert("Submitted results");
      } else {
        // toast.error('Failed to create Challenge.');
        alert("Failed Submitted results");
      }
    } catch (error) {
      console.error("Error creating Submitting:", error);
      console.error("Error creating Submiting:", error.message);
      // toast.error('Error: Failed to create Challenge.');
      alert("Error Error: Failed Submitted results");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={"Loading..."} />;
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
    <div className="h-screen ">
      {questions.length > 0 && (
        <div className="mt-4 pt-5 flex w-4/5 flex-col gap-8 justify-center items-center mx-auto py-4  text-white rounded-2xl">
          <div>
            <p className="font">{currentQuestionIndex + 1}/12</p>
          </div>
          <div>
            <p className="font-bold p-2 text-xl md:text-3xl">
              {questions[currentQuestionIndex].question}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full text-white">
            {shuffledChoices.map((choice, index) => (
              <button
                key={index}
                className={`py-2 px-4 rounded-md hover:cursor-pointer
                  hover:bg-purple-300 hover:text-black transition duration-300 ease-in-ou ${
                    selectedChoice?.id === choice.id
                      ? "bg-green-500"
                      : "bg-slate-400"
                  }`}
                onClick={() => handleChoiceSelect(choice)}
              >
                {choice.text}
              </button>
            ))}
          </div>

          <div>
            <button
              className={`bg-green-600 py-2 px-5 rounded-lg text-white ${
                selectedChoice ? "" : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleNext}
              disabled={!selectedChoice}
            >
              Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;

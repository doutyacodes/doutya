"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";

const QuizSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const router = useRouter();
  const params = useParams();
  const { slug } = params;

  const maxMarks = 1000; // Maximum marks per question
  const [totalTime, setTotalTime] = useState(0);

  // Fetch challenge and quiz details
  const fetchChallengeDetails = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchChallengesOne({
        slug,
      });

      const { challenge, remainingQuestions } = response.data;
      setChallenge(challenge);
      setQuizQuestions(remainingQuestions);

      if (challenge.isCompleted) {
        toast.success("Challenge already completed!");
        router.push("/my-companies");
      }
    } catch (error) {
      console.error("Error fetching challenge details:", error);
      toast.error("Failed to fetch challenge details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengeDetails();
  }, []);

  // Initialize timer for each question
  useEffect(() => {
    if (quizQuestions.length > 0) {
      const questionTime = quizQuestions[currentQuestionIndex]?.timer || 30; // Default time per question is 30 seconds
      setTotalTime(questionTime * 1000); // Total time in milliseconds
      setTimeLeft(questionTime * 1000);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            handleNext(false); // Proceed to next question on timeout
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(timer); // Cleanup on question change
    }
  }, [currentQuestionIndex, quizQuestions]);

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    if (answers[quizQuestions[currentQuestionIndex]?.id]) return; // Prevent multiple selections
    setAnswers((prev) => ({
      ...prev,
      [quizQuestions[currentQuestionIndex].id]: optionId,
    }));

    const selectedOption = quizQuestions[currentQuestionIndex].options.find(
      (option) => option.id === optionId
    );
    console.log(selectedOption);

    if (selectedOption?.is_answer) {
      const remainingTime = timeLeft / 1000; // Convert milliseconds to seconds
      const score = (remainingTime / (totalTime / 1000)) * maxMarks;
      setTotalScore(Math.max(0, score)); // Add score
    } else {
      setTotalScore(0);
    }
  };

  // Submit the current answer
  const handleFinalSubmit = async (isCompleted = false) => {
    const isFirstQuestion = currentQuestionIndex === 0; // Check if it's the first question
    console.log(totalScore);
    try {
      setQuizLoading(true);
      const currentQuestion = quizQuestions[currentQuestionIndex];
      const response = await GlobalApi.submitQuizAnswer({
        challengeId: challenge.id,
        questionId: currentQuestion.id,
        optionId: answers[currentQuestion.id],
        marks: totalScore,
        isCompleted,
        isFirstQuestion,
      });

      if (response.data.success) {
        toast.success("Answer submitted successfully!");
        if (isCompleted) {
          setIsQuizCompleted(true);
          toast.success(
            `Quiz Completed! Total Score: ${totalScore.toFixed(2)}`
          );
          router.push("/my-companies");
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit the answer. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  };

  // Handle Next Question
  const handleNext = (manualSubmit = true) => {
    if (manualSubmit) handleFinalSubmit(false);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinalSubmit(true); // Final submission
    }
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-[#2a2b27] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#3a3b37] rounded-lg p-6 shadow-lg relative">
        {/* Timer */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold">Time Left:</div>
          <div className="w-16 h-16">
            <CircularProgressbar
              value={timeLeft / 1000}
              maxValue={totalTime / 1000}
              text={`${Math.floor(timeLeft / 1000)}s`}
              styles={{
                path: { stroke: `#f00`, strokeLinecap: "round" },
                text: { fill: "#f00", fontSize: "16px", fontWeight: "bold" },
              }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">
            {quizQuestions[currentQuestionIndex]?.question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {quizQuestions[currentQuestionIndex]?.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`w-full p-3 text-left rounded-lg transition-all border shadow-md font-medium ${
                  answers[quizQuestions[currentQuestionIndex]?.id] === option.id
                    ? "bg-purple-600 text-white"
                    : "bg-[#4a4b47] hover:bg-purple-500 hover:text-white"
                }`}
              >
                {option.option}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Next Button */}
        <button
          onClick={() => handleNext(true)}
          className="w-full mt-6 py-3 bg-blue-600 rounded-lg font-medium"
          disabled={quizLoading}
        >
          {quizLoading
            ? "Submitting..."
            : currentQuestionIndex === quizQuestions.length - 1
            ? "Submit Quiz"
            : "Next Question"}
        </button>
      </div>
    </div>
  );
};

export default QuizSection;

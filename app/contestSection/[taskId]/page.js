"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import QuizProgressAlert from "@/app/_components/QuizProgressAlert";
import GlobalApi from "@/app/_services/GlobalApi";
// import { Toaster } from '@/components/ui/toaster';
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css'; // Make sure to import the CSS


function Page({ params }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [timerValue, setTimerValue] = useState(null)
  const [challengeId, setChallengeId] = useState(null);
  const [progressSubmitted, setProgressSubmitted] = useState(false);

  // const [marks, setMarks] = useState(0)

  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const contestId = params.taskId;
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
        const resp = await GlobalApi.GetContestData(contestId, token);
        setQuestions(resp.data.questions);
        setTimer(resp.data.timer * 1000);
        setTimerValue(resp.data.timer); /* This wont change */
        setChallengeId(resp.data.challengeId);


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
    // setIsLoading(true)
    if(questions?.length > 0){
        // Shuffle choices when the component mounts or when the question changes
        // const choices = questions[currentQuestionIndex].answers.map(answer => answer.text);
        const choices = questions[currentQuestionIndex].answers
        setShuffledChoices(choices.sort(() => Math.random() - 0.5));
    }
    // setIsLoading(false)
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (quizCompleted) {
      // setIsLoading(true)
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
  
    if (selectedChoice || progressSubmitted) return;

    setSelectedChoice(choice);
    console.log("choice", choice)
    console.log("timerValue", timerValue);  
    console.log("timer", timer);
    let earnedMarks = 0;
    if (choice.isCorrect == 'yes') {
      const maxMarks = 1000;
      const marks = (maxMarks / (timerValue * 1000)) * timer;
      earnedMarks = Math.max(0, marks.toFixed(3));
    }

    // await submitMarks(earnedMarks, answer_ids, question_ids);
    const answer = {
      questionId: questions[currentQuestionIndex].id,
      answerId: choice.id,
      marks: earnedMarks,
      taskId: contestId,
      challengeId: challengeId
    };
    quizProgressSubmit(answer);
    setProgressSubmitted(true);
    console.log("answer", answer);
  };

  const handleNext = () => {

 
    if (currentQuestionIndex < questions.length - 1) {
      // Add a delay before advancing to the next question
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedChoice(null); // Reset selected choice for the next question
        setProgressSubmitted(false); // Reset progress submission 
        setTimer(timerValue * 1000); // Reset timer for the new question
      }, 3000); // Delay for 3 seconds
    } else {
      setQuizCompleted(true);
      quizSubmit(); // Quiz finished, send data to API
    }
  };

  const quizProgressSubmit = async (data) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.SaveContestProgress(data, token, contestId);

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
    }
  };

  const quizSubmit = async () => {
    setIsLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const resp = await GlobalApi.UpdateContestData(token, contestId);
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


  const handleTimeOut = async () => {
    // Do not submit if progress for the current question has already been submitted
    if (progressSubmitted) {
      handleNext();
      return;
    }

    // Proceed with submitting marks: 0 if no choice was selected
    const answer = {
      questionId: questions[currentQuestionIndex].id,
      answerId: selectedChoice ? selectedChoice.id : 0,
      taskId: contestId,
      marks: 0,
      challengeId: challengeId
    };
    quizProgressSubmit(answer);
    handleNext();
  };

  // useEffect(() => {
  //   if (!timer) return; // Exit early if timer is not set
  
  //   let startTime = Date.now(); // Record the start time
  //   let timerId;
  
  //   const tick = () => {
  //     const elapsedTime = Date.now() - startTime; // Calculate elapsed time
  //     const remainingTime = Math.max(timer - elapsedTime, 0); // Calculate remaining time
  
  //     setTimer(remainingTime); // Update the timer state with remaining time
  
  //     if (remainingTime > 0) {
  //       timerId = requestAnimationFrame(tick); // Schedule the next tick
  //     } else {
  //       handleTimeOut(); // Call the timeout handler function when timer reaches 0
  //     }
  //   };
  
  //   timerId = requestAnimationFrame(tick); // Start the timer
  
  //   return () => cancelAnimationFrame(timerId); // Cleanup function to clear the timer on component unmount or timer change
  // }, [timer, currentQuestionIndex]);

  useEffect(() => {
    if (!timer) return; // Exit early if the timer is not set
  
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        const newTime = Math.max(prevTimer - 100, 0); // Reduce by 100ms at a time
        if (newTime === 0) {
          handleTimeOut(); // Call the timeout handler when the timer hits 0
          clearInterval(intervalId); // Clear the interval when time is up
        }
        return newTime;
      });
    }, 100); // Update every 100ms for a smoother progress bar
  
    return () => clearInterval(intervalId); // Cleanup on component unmount or timer change
  }, [timer, currentQuestionIndex]);
  
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
            Navigating to the Home page in {secondsRemaining} seconds
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
          <div>
            <p className="font">{currentQuestionIndex + 1}/{questions.length}</p>
          </div>

          <div
              style={{ position: "relative", marginBottom: "20px" }}
              className="w-16 h-16"
            >
              <CircularProgressbar
                styles={buildStyles({
                  textSize: "20px",
                  pathColor: "#0b6ebf",
                  textColor: "#ffffff",
                  trailColor: "#d6d6d6",
                  backgroundColor: "#3e98c7",
                })}
                value={timer}
                maxValue={timerValue * 1000} // Adjust to milliseconds
                circleRatio={1}
                text={`${(timer / 1000).toFixed(2)}s`} // Display in seconds
              />
          </div>
          
          <div>
            <p className="font-bold p-2 text-xl md:text-3xl">
              {removeHtmlTags(questions[currentQuestionIndex].question)}
            </p>
          </div>

          {/* <div className='flex flex-col gap-2 w-full text-white'>
          {questions[currentQuestionIndex]?.choices.map((choice, index) => (
            <button
              key={index}
              className={`py-2 px-4 ${selectedChoice?.choiceId === choice.choiceId ? 'bg-green-500' : 'bg-slate-400'}`}
              onClick={() => handleChoiceSelect(choice)}
            >
              {choice.choiceText}
            </button>
          ))}
        </div> */}

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

          {/* <div>
            <button
              className={`bg-green-600 py-2 px-5 rounded-lg text-white ${
                selectedChoice ? "" : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleNext}
              disabled={!selectedChoice}
            >
              Next
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default Page;

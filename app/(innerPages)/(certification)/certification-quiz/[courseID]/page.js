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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Award, BookOpen, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// function Page({ params }) {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedChoice, setSelectedChoice] = useState(null);
//   const [quizCompleted, setQuizCompleted] = useState(false);
//   const [secondsRemaining, setSecondsRemaining] = useState(5);
//   const [shuffledChoices, setShuffledChoices] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [progressLoading, setProgressLoading] = useState(false)
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const router = useRouter();
//   const courseID = params.courseID;
//   const [isAuthenticated, setIsAuthenticated] = useState(true);
//   const t = useTranslations('QuizPage');

//   useEffect(() => {
//     const authCheck = () => {
//       if (typeof window !== "undefined") {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           router.push("/login");
//           setIsAuthenticated(false);
//         } else {
//           setIsAuthenticated(true);
//         }
//       }
//     };
//     authCheck();
//   }, [router]);

//   useEffect(() => {
//     const getQuizData = async () => {
//       setIsLoading(true);
//       try {
//         const token =
//           typeof window !== "undefined" ? localStorage.getItem("token") : null;
//           console.log("test Id courseID", courseID);
          
//         const resp = await GlobalApi.GetCertificationTest(courseID, token);
//         console.log(resp.data.questions);
//         setQuestions(resp.data.questions);

//         setCurrentQuestionIndex(resp.data.quizProgress);
//         if (resp.data.quizProgress > 0) {
//           setShowAlert(true); // Set showAlert to true when resuming the quiz
//         }
//       } catch (error) {
//         console.error("Error Fetching GetQuizData data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     getQuizData();
//   }, []);

//   useEffect(() => {
//     if(questions?.length > 0){
//         const choices = questions[currentQuestionIndex].options
//         setShuffledChoices(choices.sort(() => Math.random() - 0.5));
//     }
//   }, [currentQuestionIndex, questions]);

//   useEffect(() => {
//     if (quizCompleted) {
//       // setIsLoading(true)
//       const interval = setInterval(() => {
//         setSecondsRemaining((prevSeconds) => prevSeconds - 1);
//       }, 1000);

//       const timer = setTimeout(() => {
//         router.replace("/dashboard/careers/career-guide");
//       }, 5000);

//       return () => {
//         clearInterval(interval);
//         clearTimeout(timer);
//       };
//     }
//   }, [quizCompleted, router]);

//   const handleChoiceSelect = (choice) => {
//     setSelectedChoice(choice);
//   };

//   const handleNext = async () => {
    
//     if (selectedChoice) {
//       const answer = {
//         questionId: questions[currentQuestionIndex].id,
//         optionId: selectedChoice.id,
//         isAnswer: selectedChoice.is_answer,
//         certificationId: courseID
//       };
//       await quizProgressSubmit(answer);
//     }

//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setSelectedChoice(null);
//     } else {
//       setQuizCompleted(true);
//       quizSubmit();
//     }
//   };

//   const quizProgressSubmit = async (data) => {
//     setProgressLoading(true);
//     try {
//       const token =
//         typeof window !== "undefined" ? localStorage.getItem("token") : null;
//       const resp = await GlobalApi.CertificationTestProgress(data, token);

//       if (resp && resp.status === 201) {
//         console.log("Response");
//         // handleNext()
//       } else {
//         console.error("Failed to save progress. Status code:", resp.status);
//         toast.error(
//           "There was a problem saving your progress. Please check your internet connection."
//         );
//       }
//     } catch (error) {
//       console.error("Error submitting progress:", error.message);
//       toast.error(
//         "There was an error saving your progress. Please try again later."
//       );
//     } finally {
//       setProgressLoading(false);
//     }
//   };

//   const quizSubmit = async () => {
//     setIsLoading(true);
//     const token =
//       typeof window !== "undefined" ? localStorage.getItem("token") : null;
//     try {
//       const resp = await GlobalApi.UpdateCertificationTest(token, courseID);
//       if (resp && resp.status === 201) {
//         toast.success("Quiz Completed successfully!");
//       } else {
//         toast.error("Failed to submit quiz.");
//         // alert('Failed Submitted results');
//       }
//     } catch (error) {
//       console.error("Error submitting quiz", error);
//       // toast.error('Error: Failed to create Challenge.');
//       toast.error("Error Error: Failed to submit quiz.");
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   const removeHtmlTags = (html) => {
//     const doc = new DOMParser().parseFromString(html, 'text/html');
//     return doc.body.textContent || "";
//   };
  
//   if (isLoading || !isAuthenticated) {
//     return (
//       <div className="h-screen flex items-center justify-center text-white">
//         <div>
//           <div className="font-semibold">
//             <LoadingOverlay loadText={"Loading..."} />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (quizCompleted) {
//     return (
//       <div className="h-screen flex items-center justify-center text-white text-center">
//         <div>
//           <div className="text-4xl font-semibold">
//             Quiz Completed successfully
//           </div>

//           <p className="mt-4">
//             Navigating to the Career page in {secondsRemaining} seconds
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen">
//       <Toaster position="top-center" reverseOrder={false} />

//       {showAlert && <QuizProgressAlert />}

//       {questions.length > 0 && (
//         <div className="mt-4 pt-5 flex w-4/5 flex-col gap-8 justify-center items-center mx-auto py-4  text-white rounded-2xl">
//           {
//             progressLoading ? (
//               <div className="inset-0 flex items-center my-16 justify-center z-50">
//                 <div className="flex items-center space-x-2">
//                   <LoaderIcon className="w-10 h-10 text-white text-4xl animate-spin" />
//                   <span className="text-white">{t('loading')}</span>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div>
//                   <p className="font">{currentQuestionIndex + 1}/{questions.length}</p>
//                 </div>
                
//                 <div>
//                   <p className="font-bold p-2 text-xl md:text-3xl">
//                     {removeHtmlTags(questions[currentQuestionIndex].question)}
//                   </p>
//                 </div>
                
//                 <div className="flex flex-col gap-2 w-full text-white">
//                   {shuffledChoices.map((choice, index) => (
//                     <button
//                       key={index}
//                       className={`py-2 px-4 rounded-md hover:cursor-pointer
//                         hover:bg-purple-300 hover:text-black transition duration-300 ease-in-out ${
//                           selectedChoice?.id === choice.id
//                             ? "bg-green-500"
//                             : "bg-slate-400"
//                         }`}
//                       onClick={() => handleChoiceSelect(choice)}
//                     >
//                       {removeHtmlTags(choice.text)}
//                     </button>
//                   ))}
//                 </div>
      
//                 <div>
//                   <button
//                     className={`bg-green-600 py-2 px-5 rounded-lg text-white ${
//                       selectedChoice ? "" : "opacity-50 cursor-not-allowed"
//                     }`}
//                     onClick={handleNext}
//                     disabled={!selectedChoice || progressLoading}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </>
//             )
//           }

//         </div>
//       )}
//     </div>
//   );
// }

function Page({ params }) {
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
        setIsLoading(false);
      }
    };
    getQuizData();
  }, []);

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
  
  // Function to start the quiz from overview page
  const handleStartTest = () => {
    setShowOverview(false);
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
            Certification Quiz Completed successfully
          </div>

          <p className="mt-4">
            Navigating to the Career page in {secondsRemaining} seconds
          </p>
        </div>
      </div>
    );
  }
  
  // Show certification overview
  if (showOverview && certificationInfo) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">{certificationInfo.certificationName}</h1>
            <p className="text-lg text-gray-300">Validate your skills and boost your career prospects as a {certificationInfo.careerName}</p>
          </div>

          {/* Main Info Card */}
          <Card className="shadow-lg bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">About This Certification</CardTitle>
              <CardDescription className="text-gray-300">
                Please review the information below before starting the test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span>Passing Score: 70%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span>{questions.length} Questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span>Career: {certificationInfo.careerName}</span>
                </div>
              </div>

              {/* Topics Covered */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-white">Topics Covered:</h3>
                <div className="flex flex-wrap gap-2">
                  {certificationInfo.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-900 text-blue-100 hover:bg-blue-800">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-white">Important Notes:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                  <li>Ensure you have a stable internet connection</li>
                  <li>You cannot pause the test once started</li>
                  <li>All questions must be attempted</li>
                  <li>Results will be shown immediately after completion</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={handleStartTest}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" 
                size="lg">
                Start Certification Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Show the quiz
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
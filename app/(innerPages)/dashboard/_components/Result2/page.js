import ActionButtons from "@/app/_components/ActionButtons";
import ContentGenerationLoading from "@/app/_components/ContentGenerationLoading";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { CareerSelectionComplete, IndustrySelectionComplete, InterestTestComplete } from "@/app/_components/StepCompletionNotifications";
import GlobalApi from "@/app/_services/GlobalApi";
import { useTopbar } from "@/app/context/TopbarContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ChevronsLeft, Sparkles, TrendingUp, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { LoaderIcon, Toaster } from "react-hot-toast";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AddIndustry from "./AddIndustry";
import AlertDialogue from "./AlertDialogue";
import LocationDetailsModal from "@/app/_components/LocationDetailsModal";

export default function Results2({step, setStep}) {
  const [resultData, setResultData] = useState(null);
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [prevSelectCount, setPrevSelectCount] = useState(null);
  const [displayResults, setDisplayResults] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [singleCareer, setSingleCareer] = useState(null);
  const [careerIndex, setCareerIndex] = useState(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingIndustry, setFetchingIndustry] = useState(false);
  const [fetchingCareer, setFetchingCareer] = useState(false);
  const [user_feedback, setUserFeedback] = useState("");
  const [industries, setIndustries] = useState([]);
  const [saveResultloading, setSaveResultLoading] = useState(false);

  const [showDialogue, setShowDialogue] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCareerSelectionComplete, setShowCareerSelectionComplete] = useState(false);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pendingCareerData, setPendingCareerData] = useState(null);
  
  const { triggerTopbarRefresh } = useTopbar();

  const [activeTab, setActiveTab] = useState('trending');

  const t = useTranslations("Result2");

  const router = useRouter();
  const resultsRef = useRef();
  const maxSelections = 5;

  const language = localStorage.getItem("language") || "en";

  useEffect(() => {
    const storedCareers =
      JSON.parse(localStorage.getItem("selectedCareers")) || [];
    setSelectedCareers(storedCareers);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedCareers", JSON.stringify(selectedCareers));
  }, [selectedCareers]);

  const handleSelect = (index) => {
    if (prevSelectCount < maxSelections) {
      if (selectedCareers.includes(index)) {
        setSelectedCareers(
          selectedCareers.filter((careerIndex) => careerIndex !== index)
        );
      } else if (selectedCareers.length < maxSelections - prevSelectCount) {
        setSelectedCareers([...selectedCareers, index]);
      } else {
        toast.error(
          `You can only select up to ${
            maxSelections - prevSelectCount
          } careers.`
        );
      }
    }
  };

  
  const handleViewReportClick = () => {
    router.push('/user/results');
  };

  const handleCertificateClick = () => {
    console.log('Get Certificate clicked');
  };


  const getColorByIndex = (index) => {
    const colorCodes = [
      "#f97316", // orange-500
      "#ef4444", // red-500
      "#eab308", // yellow-500
      "#22c55e", // green-500
      "#3b82f6", // blue-500
      "#a855f7", // purple-500
      "#ec4899", // pink-500
      "#f59e0b", // amber-500
      "#06b6d4", // cyan-500
    ];
    return colorCodes[index] || "#f97316";
  };

  const handleOptionSelect = async (e) => {
    const selectedIndustry = e.target.innerText;
    fetchResults(selectedIndustry);
  };

  useEffect(() => {
    fetchResults("");
  }, []);

  useEffect(() => {
    if (resultData) {
      // console.log("Updated resultData:", resultData);
    }
  }, [resultData]);

/* -------------------------------------------------------------- */

useEffect(() => {
  const activeTabElement = document.querySelector(`button[class*="bg-gradient-to-r from-orange-500"]`);
  if (activeTabElement) {
    activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}, [activeTab]);

// Function to navigate to next or previous category
const handleCategoryNavigation = (direction) => {
  const categories = [
    "trending",
    "offbeat",
    "traditional",
    "futuristic",
    "ai-proof",
    "entrepreneurial",
    "hybrid",
    "creative",
    "sustainable and green",
    "social impact",
    "tech-driven",
    "experiential",
    "digital and online"
  ].filter(category => resultData.some(c => c.type === category));
  
  const currentIndex = categories.indexOf(activeTab);
  let newIndex;
  
  if (direction === 'next') {
    newIndex = currentIndex + 1 >= categories.length ? 0 : currentIndex + 1;
  } else {
    newIndex = currentIndex - 1 < 0 ? categories.length - 1 : currentIndex - 1;
  }
  
  setActiveTab(categories[newIndex]);
};

// Helper functions to get next and previous category names
const getNextCategory = () => {
  const categories = [
    "trending",
    "offbeat",
    "traditional",
    "futuristic",
    "ai-proof",
    "entrepreneurial",
    "hybrid",
    "creative",
    "sustainable and green",
    "social impact",
    "tech-driven",
    "experiential",
    "digital and online"
  ].filter(category => resultData && Array.isArray(resultData) && resultData.some(c => c.type === category));
  
  if (categories.length === 0) return "";
  
  const currentIndex = categories.indexOf(activeTab);
  const nextIndex = currentIndex + 1 >= categories.length ? 0 : currentIndex + 1;
  return categories[nextIndex];
};

const getPrevCategory = () => {
  const categories = [
    "trending",
    "offbeat",
    "traditional",
    "futuristic",
    "ai-proof",
    "entrepreneurial",
    "hybrid",
    "creative",
    "sustainable and green",
    "social impact",
    "tech-driven",
    "experiential",
    "digital and online"
  ].filter(category => resultData && Array.isArray(resultData) && resultData.some(c => c.type === category));
  
  if (categories.length === 0) return "";
  
  const currentIndex = categories.indexOf(activeTab);
  const prevIndex = currentIndex - 1 < 0 ? categories.length - 1 : currentIndex - 1;
  return categories[prevIndex];
};

/* -------------------------------------------------------------- */

  const fetchResults = async (selectedIndustry) => {
    setFetchingCareer(true)
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const industryParam = selectedIndustry ? selectedIndustry : "";
      const response = await GlobalApi.GetResult2(
        token,
        industryParam,
        language
      );
      if (response.status === 200) {
        const parsedResult = JSON.parse(response.data.result);
        setResultData(parsedResult);
        setDisplayResults(true);
        setStep(2);
      } else if (response.status === 204) {
        setStep(1);
        fetchIndustry();
      }
      const userStatusData = await GlobalApi.CheckFeedback(token);
      setFeedbackGiven(userStatusData.data.exists);
      setPrevSelectCount(userStatusData.data.savedCareerCount);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setFetchingCareer(false)
    }
  };

  const fetchCareer = async (career_name) => {
    setLoading(true);
    try {
      if (!career_name || typeof career_name !== "string") {
        throw new Error("Invalid career name provided.");
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await GlobalApi.getResult2Career(
        token,
        career_name,
        language
      );

      if (response.status === 200) {
        const result = response.data.result;

        if (Array.isArray(result) && result.length > 0) {
          const parsedResult = result[0];
          setSingleCareer(parsedResult);
        } else {
          console.error("Unexpected result format:", result);
          throw new Error("Unexpected result format from API.");
        }
      } else {
        console.error(
          "Error fetching career data:",
          response.status,
          response.statusText
        );
        throw new Error(`API error: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Failed to fetch career results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await GlobalApi.SubmitFeedback(token, { rating, user_feedback });
      setFeedbackGiven(true);
      toast.success("Thank you for your feedback.");
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  const handleCareerClick = (index) => {
    if (prevSelectCount < 5) {
      if (selectedCareers.includes(index)) {
        setSelectedCareers(
          selectedCareers.filter((careerIndex) => careerIndex !== index)
        );
      } else if (selectedCareers.length < 5 - prevSelectCount) {
        setSelectedCareers([...selectedCareers, index]);
      } else {
        toast.error(
          `You can only select up to ${5 - prevSelectCount} careers.`
        );
      }
    }
  };
  const handleSaveResult = async (careerIndex, careerName) => {
    // Store the career data temporarily
    setPendingCareerData({
      careerIndex,
      careerName,
      selectedCareerObjects: [resultData[careerIndex]]
    });
    
    // Show the location modal
    setShowLocationModal(true);
  };
  // Add this new function to handle the actual saving after location data is collected
  const handleSaveWithLocationData = async (locationData) => {
    if (!pendingCareerData) return;

    setSaveResultLoading(true);
    const { selectedCareerObjects } = pendingCareerData;
    const payload = { 
      results: selectedCareerObjects,
      locationData: locationData // Include location data in payload
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.SaveCarrerData(token, payload);
      
      if (response.status === 200) {
        toast.success("Career Data Saved Successfully");
        if (response.data.isFirstTime) {
          router.push("/dashboard/careers/career-guide");
        }
        triggerTopbarRefresh(); 
        setShowCareerSelectionComplete(true);
        setShowLocationModal(false); // Close modal
        setPendingCareerData(null); // Reset pending data
      }
    } catch (err) {
      console.error("Failed to save career data:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`${err.response.data.message}`);
        setShowCareerSelectionComplete(true);
      } else {
        toast.error("Failed to save career data. Please try again later.");
      }
    } finally {
      setSaveResultLoading(false);
      if (pendingCareerData) {
        fetchCareer(pendingCareerData.careerName);
      }
    }
  };


  // const handleSaveResult = async (careerIndex, careerName) => {
  //   setSaveResultLoading(true);
  //   const selectedCareerObjects = [resultData[careerIndex]];
  //   const payload = { results: selectedCareerObjects };
  //   try {
  //     const token =
  //       typeof window !== "undefined" ? localStorage.getItem("token") : null;
  //     const response = await GlobalApi.SaveCarrerData(token, payload);
  //     if (response.status === 200) {
  //       toast.success("Career Data Saved Successfully");
  //       if (response.data.isFirstTime) {
  //         router.push("/dashboard/careers/career-guide");
  //       }
  //       triggerTopbarRefresh(); 
  //       setShowCareerSelectionComplete(true) 
  //     }
  //   } catch (err) {
  //     console.error("Failed to save career data:", err);
  //     if (err.response && err.response.data && err.response.data.message) {
  //       toast.error(`${err.response.data.message}`);
  //       setShowCareerSelectionComplete(true) 
  //     } else {
  //       toast.error("Failed to save career data. Please try again later.");
  //     }
  //   } finally {
  //     setSaveResultLoading(false);
  //     fetchCareer(careerName);
  //   }
  // };

  
  // Add this function to handle modal close
  
  const handleLocationModalClose = () => {
    setShowLocationModal(false);
    setPendingCareerData(null);
    setSaveResultLoading(false);
  };

  const downloadResultsAsImage = async () => {
    if (resultsRef.current) {
      try {
        const canvas = await html2canvas(resultsRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("results.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF. Please try again.");
      }
    }
  };

  const careerDescriptions = {
    trending:
      "Trending careers are currently in high demand due to new technologies, societal shifts, and market needs. These roles often evolve with emerging industries and innovation.",
    offbeat:
      "Offbeat careers offer unconventional paths that may not follow the traditional work environment or job roles. These often align with passion, creativity, and unique lifestyle preferences.",
    futuristic:
      "Futuristic careers focus on industries and technologies expected to grow in the next 10-30 years. These fields often push the boundaries of current knowledge and capabilities.",
    traditional:
      "Traditional careers have stood the test of time and are more structured with established career paths. These are often linked to fields with consistent demand and clear educational requirements.",
    hybrid:
      "Hybrid careers combine skills from multiple disciplines, often blending traditional fields with technological advancements.",
    creative:
      "Creative careers focus on innovation, self-expression, and new ideas, often linked to arts, design, or storytelling.",
    "sustainable and green":
      "These careers focus on environmental sustainability and renewable resources, becoming more relevant as the world shifts toward eco-friendly solutions.",
    "social impact":
      "These roles are aimed at creating a positive impact on society and contributing to societal well-being.",
    "tech-driven":
      "With rapid tech advances, many fields are heavily tech-focused, integrating AI, robotics, and automation.",
    experiential:
      "Experiential careers focus on creating unique experiences, often involving travel, entertainment, or hands-on work.",
    "digital and online":
      "In the digital age, many careers now revolve around technology and online platforms, offering flexible and remote opportunities.",
    entrepreneurial:
    "Entrepreneurial careers involve starting and managing businesses, requiring innovation, risk-taking, and strategic thinking. These roles offer independence and the potential for high rewards but also demand resilience and adaptability.",
    "ai-proof": 
    "AI-proof careers are roles that are less likely to be replaced by artificial intelligence or automation. They rely on human qualities like empathy, creativity, critical thinking, and hands-on skills, making them resilient in an increasingly automated world.",
  };

  const fetchIndustry = async () => {
    setFetchingIndustry(true)
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data = await GlobalApi.GetIndustry(token, language);
      const parsedResult = JSON.parse(data.data.result);
      setIndustries(parsedResult);
    } catch (err) {
      console.error("Failed to fetch industries:", err);
    } finally {
      setFetchingIndustry(false)
    }
  };

  const handleAddIndustryClick = () => {
    setShowDialogue(true);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white max-md:pb-7">
      <Toaster position="top-center" reverseOrder={false} />

        {
          fetchingIndustry && (
            <>
               <ContentGenerationLoading
              isOpen={fetchingIndustry}
              onClose={() => setFetchingIndustry(false)}
              page="industrySelection"
              showDelay={1000}
            />
            </> 
          )}
          {fetchingCareer && (
            <>
                  <ContentGenerationLoading
                  isOpen={fetchingCareer}
                  onClose={() => setFetchingCareer(false)}
                  page="careerSuggestions"
                  showDelay={1000}
                />  
              </>
            )
        }


      {step === 1 && industries.length > 0 && (
        <>
          <InterestTestComplete />
          <div className="relative mx-4 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-xl"></div>
            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <Sparkles className="w-8 h-8 text-orange-400" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  SELECT INDUSTRY
                </h1>
              </div>
              <div className="w-20 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mt-4"></div>
            </div>
          </div>
        </>
      )}

      {
        step === 2 && ( 
          showCareerSelectionComplete ? <CareerSelectionComplete /> : <IndustrySelectionComplete />
        )
      }

      {step === 2 && !singleCareer && (
        <>
          <div className="relative mx-4 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl"></div>
            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 lg:p-6 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      DISCOVER YOUR IDEAL CAREER PATH
                    </h1>
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto lg:mx-0"></div>
                </div>
                
                <div className="flex items-center justify-center">
                  <ActionButtons
                    buttonSize="small"
                    onViewReportClick={handleViewReportClick}
                    onCertificateClick={handleCertificateClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {singleCareer?.career_name && (
        <div className="relative mx-4 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 rounded-xl"></div>
          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 lg:p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <button
                onClick={() => {
                  setCareerIndex(null);
                  setSingleCareer(null);
                }}
                className="group flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-orange-500/50 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm w-fit"
              >
                <ChevronsLeft className="w-5 h-5 group-hover:text-orange-400 transition-colors" />
                <span className="font-semibold">BACK TO CAREERS</span>
              </button>
              
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {singleCareer.career_name.toUpperCase()}
                  </h1>
                </div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mt-2"></div>
              </div>
              
              <div className="w-fit opacity-0 pointer-events-none lg:block">
                <div className="flex items-center gap-2 py-2 px-4">
                  <ChevronsLeft className="w-5 h-5" />
                  <span className="font-semibold">BACK TO CAREERS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:px-6 lg:px-12 gap-6 w-full">
        {step === 1 && industries.length > 0 && (
          <div className="p-6 rounded-lg text-white mt-6 w-full max-sm:pb-24">
            <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
              {showAlert && (
                <AlertDialogue
                  fetchResults={fetchResults}
                  setShowAlert={setShowAlert}
                />
              )}
              
              {/* Industry Agnostic Button */}
              <div className="sm:col-span-6 md:col-span-6 col-span-12 group cursor-pointer" onClick={() => setShowAlert(true)}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl"></div>
                  <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-orange-500/50 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                        <Sparkles className="w-4 h-4" />
                        {t("industryAgnostic")}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                      <p className="text-gray-200 text-sm text-center leading-relaxed">
                        Explore career suggestions across various industries
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Industry Specific Button */}
              <div className="sm:col-span-6 md:col-span-6 col-span-12 group cursor-pointer" onClick={handleAddIndustryClick}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl"></div>
                  <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-green-500/50 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                        <TrendingUp className="w-4 h-4" />
                        {t("industrySpecific")}
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                      <p className="text-gray-200 text-sm text-center leading-relaxed">
                        Enter your preferred industry to discover tailored career options
                      </p>
                    </div>
                  </div>
                </div>

                <AddIndustry
                  isOpen={showDialogue}
                  onClose={() => setShowDialogue(false)}
                  fetchResults={fetchResults}
                />
              </div>

              <div className="col-span-12 text-center py-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                  {t("selectBelowIndustry")}
                </h2>
                <div className="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
              </div>

              {industries.map((industry, index) => {
                const color = getColorByIndex(index);
                return (
                  <div
                    key={index}
                    className="sm:col-span-6 md:col-span-4 col-span-6 group cursor-pointer"
                    onClick={handleOptionSelect}
                  >
                    <div className="relative">
                      <div 
                        className="absolute inset-0 opacity-20 rounded-2xl"
                        style={{ background: `linear-gradient(135deg, ${color}40, ${color}20)` }}
                      ></div>
                      <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-gray-600/50 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                        <div className="text-center mb-3">
                          <div 
                            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <div 
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-4 min-h-[100px] flex items-center justify-center">
                          <p className="text-gray-200 text-sm text-center font-medium leading-relaxed">
                            {industry.industry_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="max-md:w-screen">
            <div ref={resultsRef} className="mt-8">
              {resultData && !singleCareer ? (
                <>
                {/* Mobile Tabs */}
                <div className="md:hidden px-4 mb-6">
                  <div className="flex overflow-x-auto pb-2 gap-2">
                    {[
                      "trending",
                      "offbeat",
                      "traditional",
                      "futuristic",
                      "ai-proof",
                      "entrepreneurial",
                      "hybrid",
                      "creative",
                      "sustainable and green",
                      "social impact",
                      "tech-driven",
                      "experiential",
                      "digital and online"
                    ].map((category) => {
                      const hasCareers = resultData.some(c => c.type === category);
                      
                      return hasCareers ? (
                        <button
                          key={category}
                          onClick={() => setActiveTab(category)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap uppercase transition-all duration-200 ${
                            activeTab === category
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                              : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/50'
                          }`}
                        >
                          {category}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              
                {/* Floating navigation buttons for mobile */}
                <div className="md:hidden">
                  <button
                    onClick={() => handleCategoryNavigation('prev')}
                    className="fixed left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-3 py-2 shadow-lg z-50 transition-all duration-300 flex items-center border border-orange-400/50"
                    id="prevCategoryBtn"
                  >
                    <FaChevronLeft size={16} color="white" className="mr-2" />
                    <span className="text-white text-xs font-medium capitalize">
                      {getPrevCategory()}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleCategoryNavigation('next')}
                    className="fixed right-2 top-1/2  transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-3 py-2 shadow-lg z-50 transition-all duration-300 flex items-center border border-orange-400/50"
                    id="nextCategoryBtn"
                  >
                    <span className="text-white text-xs font-medium capitalize mr-2">
                      {getNextCategory()}
                    </span>
                    <FaChevronRight size={16} color="white" />
                  </button>
                </div>
              
                {/* Desktop Layout */}
                <div className="hidden md:block px-4">
                  {[
                    "trending",
                    "offbeat",
                    "traditional",
                    "futuristic",
                    "ai-proof",
                    "entrepreneurial",
                    "hybrid",
                    "creative",
                    "sustainable and green",
                    "social impact",
                    "tech-driven",
                    "experiential",
                    "digital and online"
                  ].map((category) => {
                    const careersInCategory = resultData
                      .map((career, originalIndex) => ({ career, originalIndex }))
                      .filter(({ career }) => career.type === category);
              
                    return (
                      careersInCategory.length > 0 && (
                        <div key={category} className="mb-12">
                          <div className="flex items-center mb-6">
                            <h2 className="text-2xl font-bold capitalize bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                              {category} Careers
                            </h2>
                            <div className="h-0.5 bg-gradient-to-r from-orange-500/50 to-red-500/50 flex-grow ml-4 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-300 mb-6 max-w-4xl leading-relaxed">
                            {careerDescriptions[category]}
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {careersInCategory.map(({ career, originalIndex }) => (
                              <div
                                key={originalIndex}
                                className="group relative"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl"></div>
                                <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-orange-500/50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden">
                                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 border-b border-gray-700/50">
                                    <h4 className="text-white text-lg font-bold text-center">
                                      {career.career_name}
                                    </h4>
                                  </div>
                                  <div className="p-6 flex flex-col justify-between min-h-[140px]">
                                    <p className="text-gray-300 text-sm mb-4 opacity-90 group-hover:opacity-100 transition-opacity leading-relaxed">
                                      Discover salary potential, growth outlook, and required skills...
                                    </p>
                                    <div className="w-full flex justify-end">
                                      <button
                                        onClick={() => {
                                          setCareerIndex(originalIndex);
                                          fetchCareer(career.career_name);
                                        }}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg px-4 py-2 flex gap-2 items-center transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                      >
                                        <span className="text-sm text-white">
                                          {t("readMore")}
                                        </span>
                                        <FaChevronRight size={12} color="white" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    );
                  })}
                </div>
              
                {/* Mobile Category Content */}
                <div className="md:hidden px-4">
                  {[
                    {category: "trending", color: "#f97316"},
                    {category: "offbeat", color: "#ef4444"},
                    {category: "traditional", color: "#3b82f6"},
                    {category: "futuristic", color: "#22c55e"},
                    {category: "ai-proof", color: "#f59e0b"},
                    {category: "entrepreneurial", color: "#10b981"},
                    {category: "hybrid", color: "#8b5cf6"},
                    {category: "creative", color: "#f97316"},
                    {category: "sustainable and green", color: "#22c55e"},
                    {category: "social impact", color: "#ef4444"},
                    {category: "tech-driven", color: "#3b82f6"},
                    {category: "experiential", color: "#06b6d4"},
                    {category: "digital and online", color: "#a855f7"}
                  ].map(({category, color}) => {
                    const careersInCategory = resultData
                      .map((career, originalIndex) => ({ career, originalIndex }))
                      .filter(({ career }) => career.type === category);
              
                    return (activeTab === category && careersInCategory.length > 0) && (
                      <div key={category} className="mb-12">
                        <div className="flex items-center mb-6">
                          <h2 className="text-2xl font-bold capitalize" style={{color: color}}>
                            {category} Careers
                          </h2>
                          <div className="h-0.5 bg-gray-600 flex-grow ml-4 rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-300 mb-6 max-w-4xl leading-relaxed">
                          {careerDescriptions[category]}
                        </p>
                        
                        <div className="grid grid-cols-1 gap-6">
                          {careersInCategory.map(({ career, originalIndex }) => (
                            <div
                              key={originalIndex}
                              className="group relative"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl"></div>
                              <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 hover:border-gray-600/50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden"
                                   style={{borderBottom: `4px solid ${color}`}}>
                                <div className="p-4 border-b border-gray-700/50" 
                                     style={{background: `linear-gradient(135deg, ${color}20, ${color}10)`}}>
                                  <h4 className="text-white text-lg font-bold text-center">
                                    {career.career_name}
                                  </h4>
                                </div>
                                <div className="p-6 flex flex-col justify-between min-h-[140px]">
                                  <p className="text-gray-300 text-sm mb-4 opacity-90 group-hover:opacity-100 transition-opacity leading-relaxed">
                                    Discover salary potential, growth outlook, and required skills...
                                  </p>
                                  <div className="w-full flex justify-end">
                                    <button
                                      onClick={() => {
                                        setCareerIndex(originalIndex);
                                        fetchCareer(career.career_name);
                                      }}
                                      className="rounded-lg px-4 py-2 flex gap-2 items-center transition-all duration-200 shadow-md font-medium text-white"
                                      style={{backgroundColor: color}}
                                    >
                                      <span className="text-sm">
                                        {t("readMore")}
                                      </span>
                                      <FaChevronRight size={12} color="white" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
              ) : singleCareer ? (
                <>
                  <div className="space-y-8 px-4 md:px-10">
                    <div className="grid grid-cols-12 gap-6">
                      {singleCareer?.reason_for_recommendation && (
                        <div className="col-span-12 relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 border-b border-gray-700/50 border-l-4 border-green-500">
                              <h3 className="text-white font-bold text-lg text-center">
                                {t("careerSuitability")}
                              </h3>
                            </div>
                            <div className="p-6">
                              <p className="text-gray-200 leading-relaxed">
                                {singleCareer?.reason_for_recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {singleCareer?.present_trends && (
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden">
                              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 p-3 border-b border-gray-700/50 border-l-4 border-orange-500">
                                <h3 className="text-white font-bold text-sm text-center">
                                  {t("presentTrends")}
                                </h3>
                              </div>
                              <div className="p-4 min-h-[180px] flex items-start">
                                <p className="text-gray-200 text-sm leading-relaxed">
                                  {singleCareer?.present_trends}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {singleCareer?.future_prospects && (
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden">
                              <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-3 border-b border-gray-700/50 border-l-4 border-purple-500">
                                <h3 className="text-white font-bold text-sm text-center">
                                  {t("futureProspects")} ({singleCareer?.currentYear} - {singleCareer?.tillYear})
                                </h3>
                              </div>
                              <div className="p-4 min-h-[180px] flex items-start">
                                <p className="text-gray-200 text-sm leading-relaxed">
                                  {singleCareer?.future_prospects}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {singleCareer?.beyond_prospects && (
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden">
                              <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 p-3 border-b border-gray-700/50 border-l-4 border-pink-500">
                                <h3 className="text-white font-bold text-sm text-center">
                                  {t("futureProspects")} ({singleCareer?.tillYear + 1} and beyond)
                                </h3>
                              </div>
                              <div className="p-4 min-h-[180px] flex items-start">
                                <p className="text-gray-200 text-sm leading-relaxed">
                                  {singleCareer?.beyond_prospects}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {singleCareer?.salary && (
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden">
                              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-3 border-b border-gray-700/50 border-l-4 border-cyan-500">
                                <h3 className="text-white font-bold text-sm text-center">
                                  Salary
                                </h3>
                              </div>
                              <div className="p-4 min-h-[180px] flex items-start">
                                <p className="text-gray-200 text-sm leading-relaxed">
                                  {singleCareer?.salary}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {singleCareer?.expenses && (
                        <div className="col-span-12 relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-rose-500/5 to-red-500/5 rounded-xl"></div>
                          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500/20 to-rose-500/20 p-4 border-b border-gray-700/50 border-l-4 border-red-500">
                              <h3 className="text-white font-bold text-lg text-center">
                                {t("expenses")}
                              </h3>
                            </div>
                            <div className="p-6">
                              <p className="text-gray-200 leading-relaxed">
                                {singleCareer?.expenses}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center items-center">
                      <button
                        className={`font-bold text-center py-3 px-6 text-sm lg:text-base uppercase rounded-xl shadow-lg transition-all duration-300 ${
                          saveResultloading || singleCareer?.isCareerMoved
                            ? "bg-gray-600/60 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transform hover:translate-y-[-2px] hover:shadow-xl"
                        }`}
                        onClick={() => {
                          handleSaveResult(
                            careerIndex,
                            singleCareer.career_name
                          );
                        }}
                        disabled={
                          saveResultloading || singleCareer?.isCareerMoved
                        }
                      >
                        {saveResultloading ? (
                          <div className="flex items-center">
                            <LoaderIcon className="w-5 h-5 text-white animate-spin mr-2" />
                            {t("saving")}
                          </div>
                        ) : (
                          <span>
                            {singleCareer?.isCareerMoved
                              ? t("alreadyMoved")
                              : t("moveCareer")}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>

    {/* Location Details Modal */}
    <LocationDetailsModal
      isOpen={showLocationModal}
      onClose={handleLocationModalClose}
      onSave={handleSaveWithLocationData}
      selectedCareers={singleCareer ? [singleCareer.career_name] : []}
      loading={saveResultloading}
    />
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import toast, { LoaderIcon, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { ChevronsLeft } from "lucide-react";
import jsPDF from "jspdf";
import PDFCareerPage from "./PDFCareerPage";
import { useTranslations } from "next-intl";
import AddIndustry from "./AddIndustry";
import AlertDialogue from "./AlertDialogue";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { CareerSelectionComplete, IndustrySelectionComplete, InterestTestComplete } from "@/app/_components/StepCompletionNotifications";
import ContentGenerationLoading from "@/app/_components/ContentGenerationLoading";
import { useTopbar } from "@/app/context/TopbarContext";

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
  // const [step, setStep] = useState(1);
  const [industries, setIndustries] = useState([]);
  const [saveResultloading, setSaveResultLoading] = useState(false);

  const [showDialogue, setShowDialogue] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCareerSelectionComplete, setShowCareerSelectionComplete] = useState(false);
  
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

  const getColorByIndex = (index) => {
    const colorCodes = [
      "#FFA500",
      "#800080",
      "#FFC0CB",
      "#00FF00",
      "#808080",
      "#FFFF00",
      "#00FFFF",
      "#FF4500",
      "#0000FF",
    ];
    return colorCodes[index] || undefined;
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
  // Find the active tab button and scroll it into view
  const activeTabElement = document.querySelector(`button[class*="bg-[#7824f6]"]`);
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
    // console.log("selectedIndustry", selectedIndustry);
    setFetchingCareer(true)
    // setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const industryParam = selectedIndustry ? selectedIndustry : "";
      const response = await GlobalApi.GetResult2(
        token,
        industryParam,
        language
      );
      // console.log(response.data);
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
      // setLoading(false);
      setFetchingCareer(false)
    }
  };

  const fetchCareer = async (career_name) => {
    // console.log("Fetching career information for:", career_name);

    setLoading(true);
    try {
      // Validate career_name
      if (!career_name || typeof career_name !== "string") {
        throw new Error("Invalid career name provided.");
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // Ensure language is passed and defined
      const response = await GlobalApi.getResult2Career(
        token,
        career_name,
        language
      );

      if (response.status === 200) {
        const result = response.data.result;

        // Check if result is defined and is an array
        if (Array.isArray(result) && result.length > 0) {
          const parsedResult = result[0]; // Access the first item in the array
          setSingleCareer(parsedResult);
          // console.log("Career data fetched successfully:", parsedResult);
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
    setSaveResultLoading(true);
    const selectedCareerObjects = [resultData[careerIndex]];
    const payload = { results: selectedCareerObjects };
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await GlobalApi.SaveCarrerData(token, payload);
      if (response.status === 200) {
        toast.success("Career Data Saved Successfully");
        if (response.data.isFirstTime) {
          // Navigate to the careers page
          router.push("/dashboard/careers/career-guide");
        }
        triggerTopbarRefresh(); 
        setShowCareerSelectionComplete(true) 
      }
    } catch (err) {
      console.error("Failed to save career data:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`${err.response.data.message}`);
        setShowCareerSelectionComplete(true) 
      } else {
        toast.error("Failed to save career data. Please try again later.");
      }
    } finally {
      setSaveResultLoading(false);
      fetchCareer(careerName);
    }
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

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
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
    // setLoading(true);
    setFetchingIndustry(true)
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data = await GlobalApi.GetIndustry(token, language);
      const parsedResult = JSON.parse(data.data.result);
      // console.log("parsedResult", parsedResult);
      setIndustries(parsedResult);
    } catch (err) {
      console.error("Failed to fetch industries:", err);
    } finally {
      // setLoading(false);
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
    <div className="mx-auto bg-[#1f1f1f] text-white max-md:pb-7">
      <Toaster position="top-center" reverseOrder={false} />

        {
          fetchingIndustry && (
            <>
               {/* Loading Modal */}
               <ContentGenerationLoading
              isOpen={fetchingIndustry}
              onClose={() => setFetchingIndustry(false)}
              page="industrySelection" // Change this based on your current page
              showDelay={1000} // Only show if loading takes more than 1 second
              // Optional: auto close after 30 seconds
              // autoCloseDelay={30000}
            />
            </> 
          )}
          {fetchingCareer && (
            <>
                {/* Loading Modal */}
                  <ContentGenerationLoading
                  isOpen={fetchingCareer}
                  onClose={() => setFetchingCareer(false)}
                  page="careerSuggestions" // Change this based on your current page
                  showDelay={1000} // Only show if loading takes more than 1 second
                  // Optional: auto close after 30 seconds
                  // autoCloseDelay={30000}
                />  
              </>
          )
        }


    {step === 1 && industries.length > 0 && (
        <>
          <InterestTestComplete />
          <div className="bg-[#2c2c2c] h-24 my-4 justify-center items-center flex rounded-md border-l-4 border-[#7824f6] shadow-md">
            <p className="text-white uppercase font-bold text-center text-xl">
              Select Industry
            </p>
          </div>
        </>
      )}

      {
        // popup modals
        step === 2 && ( 
          showCareerSelectionComplete ? <CareerSelectionComplete /> : <IndustrySelectionComplete />
        )
      }

      {step === 2 && !singleCareer && (
        <>
          <div className="bg-[#2c2c2c] h-24 mb-5 justify-center items-center flex rounded-md border-l-4 border-[#7824f6] shadow-md">
            <p className="text-white uppercase font-bold text-center text-xl md:text-2xl">
              Discover Your Ideal Career Path
            </p>
          </div>
        </>
      )}

      {singleCareer?.career_name && (
        <div className="bg-[#2c2c2c] md:py-5 md:mb-5 py-3 rounded-md border-l-4 border-[#7824f6] shadow-md">
          <div className="max-sm:relative flex md:justify-between justify-center items-center md:px-4 mx-auto h-full container">
            <div className="flex md:items-center gap-2 mb-2 md:mb-0 max-sm:absolute max-sm:top-0 max-sm:left-3">
              <button
                onClick={() => {
                  setCareerIndex(null);
                  setSingleCareer(null);
                }}
                className="text-white flex items-center hover:bg-[#3a3a3a] p-2 rounded-md transition-all duration-200"
              >
                <ChevronsLeft className="text-white md:text-lg" />
                <span className="uppercase font-bold md:flex hidden">
                  Back to Careers
                </span>
              </button>
            </div>
            <div className="text-center">
              <p className="text-white uppercase font-bold md:text-2xl md:mb-2">
                {singleCareer.career_name}
              </p>
            </div>
            <div>
              <div className="flex max-md:w-full opacity-0 md:items-center gap-4 mb-2 md:mb-0">
                <div className="text-white flex items-center">
                  <ChevronsLeft className="text-white md:text-lg" />
                  <span className="uppercase font-bold md:flex hidden">
                    Back to Careers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:px-6 lg:px-12 gap-6 w-full">
        {step === 1 && industries.length > 0 && (
          <div className="p-6 rounded-lg text-white mt-6 w-full max-sm:pb-24">
            <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-12 gap-6 max-w-4xl mx-auto">
              {showAlert && (
                <AlertDialogue
                  fetchResults={fetchResults}
                  setShowAlert={setShowAlert}
                />
              )}
              <button
                onClick={() => setShowAlert(true)}
                className="sm:col-span-6 md:col-span-6 col-span-12 text-[#341e44] p-[1px] rounded-lg hover:opacity-70"
                style={{ backgroundColor: "#FFA500" }}
              >
                <div className="flex flex-col items-center justify-center py-3 text-white">
                  {t("industryAgnostic")}
                </div>
                <div className="bg-[#1a1236] w-full p-3 h-28 flex justify-center items-center rounded-lg text-white">
                  Explore career suggestions across various industries
                </div>
              </button>

              <button
                onClick={handleAddIndustryClick}
                className="sm:col-span-6 md:col-span-6 col-span-12 text-[#341e44] p-[1px] rounded-lg hover:opacity-70"
                style={{ backgroundColor: "#008000" }}
              >
                <div className="flex flex-col items-center justify-center py-3 text-white">
                  {t("industrySpecific")}
                </div>
                <div className="bg-[#1a1236] w-full p-3 h-28 flex justify-center items-center rounded-lg text-white">
                  Enter your preferred industry to discover tailored career
                  options
                </div>

                <AddIndustry
                  isOpen={showDialogue}
                  onClose={() => setShowDialogue(false)}
                  fetchResults={fetchResults}
                />
              </button>

              <div className="col-span-12 h-20 my-4 justify-center items-center flex">
                <p className="text-white uppercase font-bold text-center">
                  {t("selectBelowIndustry")}
                </p>
              </div>

              {industries.map((industry, index) => {
                const color = getColorByIndex(index);
                return (
                  <button
                    key={index}
                    onClick={handleOptionSelect}
                    className="sm:col-span-6 md:col-span-4 max-w-72 col-span-6 text-[#341e44] p-[1px] md:pt-8 pt-4 rounded-lg hover:opacity-70 "
                    style={{ backgroundColor: color }}
                  >
                    <div className="bg-[#1a1236] w-full md:p-3 p-1 md:h-28 h-20 flex justify-center items-center rounded-lg text-white max-sm:text-sm flex-wrap">
                      {industry.industry_name}
                    </div>
                  </button>
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
                {/* Mobile Tabs with uppercase text */}
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
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap uppercase ${
                            activeTab === category
                              ? 'bg-[#7824f6] text-white'
                              : 'bg-[#2c2c2c] text-gray-300 hover:bg-[#3a3a3a]'
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
                  {/* Left navigation button */}
                  <button
                    onClick={() => handleCategoryNavigation('prev')}
                    // className="fixed left-2 top-1/2 transform -translate-y-1/2 bg-[#7824f6] bg-opacity-95 rounded-lg px-3 py-2 shadow-lg z-50 transition-opacity duration-300 flex items-center border border-[#9b4dff]"
                    className="fixed left-2 top-1/2 transform -translate-y-1/2 bg-[#7824f6] bg-opacity-95 rounded-lg px-3 py-2 shadow-lg z-50 transition-opacity duration-300 flex items-center border border-[#9b4dff]"
                    id="prevCategoryBtn"
                  >
                    <FaChevronLeft size={16} color="white" className="mr-2" />
                    <span className="text-white text-xs font-medium capitalize">
                      {getPrevCategory()}
                    </span>
                  </button>
                  
                  {/* Right navigation button */}
                  <button
                    onClick={() => handleCategoryNavigation('next')}
                    className="fixed right-2 top-1/2  transform -translate-y-1/2 bg-[#7824f6] bg-opacity-95 rounded-lg px-3 py-2 shadow-lg z-50 transition-opacity duration-300 flex items-center border border-[#9b4dff]"
                    // className="fixed right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-80 rounded-lg px-3 py-2 shadow-lg z-50 transition-opacity duration-300 flex items-center border border-gray-600"
                    id="nextCategoryBtn"
                  >
                    <span className="text-white text-xs font-medium capitalize mr-2">
                      {getNextCategory()}
                    </span>
                    <FaChevronRight size={16} color="white" />
                  </button>
                </div>
              
                {/* Desktop Layout - unchanged */}
                <div className="hidden md:block px-4">
                  {/* Desktop content remains the same */}
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
                          <div className="flex items-center mb-3">
                            <h2 className="text-2xl font-bold capitalize text-[#7824f6]">
                              {category} Careers
                            </h2>
                            <div className="h-0.5 bg-[#3a3a3a] flex-grow ml-4 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-300 mb-6 max-w-3xl">
                            {careerDescriptions[category]}
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {careersInCategory.map(({ career, originalIndex }) => (
                              <div
                                key={originalIndex}
                                className="bg-[#292931] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border-b-4 border-[#7824f6] hover:translate-y-[-3px]"
                              >
                                <div className="h-20 bg-[#35354a] flex items-center justify-center p-4">
                                  <h4 className="text-white text-lg font-bold text-center">
                                    {career.career_name}
                                  </h4>
                                </div>
                                <div className="p-5 flex flex-col justify-between h-32 bg-gradient-to-b from-[#292931] to-[#232329]">
                                  <p className="text-gray-300 text-sm mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                    Discover salary potential, growth outlook, and required skills...
                                  </p>
                                  <div className="w-full flex justify-end">
                                    <button
                                      onClick={() => {
                                        setCareerIndex(originalIndex);
                                        fetchCareer(career.career_name);
                                      }}
                                      className="bg-[#7824f6] hover:bg-[#6620d0] rounded-md px-4 py-2 flex gap-2 items-center transition-all duration-200 shadow-md"
                                    >
                                      <p className="text-sm text-white font-medium">
                                        {t("readMore")}
                                      </p>
                                      <FaChevronRight size={12} color="white" />
                                    </button>
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
              
                {/* Mobile Category Content with different colors for each category */}
                <div className="md:hidden px-4">
                  {[
                    {category: "trending", color: "#7824f6"},
                    {category: "offbeat", color: "#e74c3c"},
                    {category: "traditional", color: "#2980b9"},
                    {category: "futuristic", color: "#1abc9c"},
                    {category: "ai-proof", color: "#f39c12"},
                    {category: "entrepreneurial", color: "#27ae60"},
                    {category: "hybrid", color: "#8e44ad"},
                    {category: "creative", color: "#d35400"},
                    {category: "sustainable and green", color: "#2ecc71"},
                    {category: "social impact", color: "#c0392b"},
                    {category: "tech-driven", color: "#3498db"},
                    {category: "experiential", color: "#16a085"},
                    {category: "digital and online", color: "#9b59b6"}
                  ].map(({category, color}) => {
                    const careersInCategory = resultData
                      .map((career, originalIndex) => ({ career, originalIndex }))
                      .filter(({ career }) => career.type === category);
              
                    return (activeTab === category && careersInCategory.length > 0) && (
                      <div key={category} className="mb-12">
                        <div className="flex items-center mb-3">
                          <h2 className="text-2xl font-bold capitalize" style={{color: color}}>
                            {category} Careers
                          </h2>
                          <div className="h-0.5 bg-[#3a3a3a] flex-grow ml-4 rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-300 mb-6 max-w-3xl">
                          {careerDescriptions[category]}
                        </p>
                        
                        <div className="grid grid-cols-1 gap-6">
                          {careersInCategory.map(({ career, originalIndex }) => (
                            <div
                              key={originalIndex}
                              className="bg-[#292931] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group hover:translate-y-[-3px]"
                              style={{borderBottom: `4px solid ${color}`}}
                            >
                              <div className="h-20 flex items-center justify-center p-4" 
                                   style={{background: `linear-gradient(to right, ${color}20, ${color}35)`}}>
                                <h4 className="text-white text-lg font-bold text-center">
                                  {career.career_name}
                                </h4>
                              </div>
                              <div className="p-5 flex flex-col justify-between h-32 bg-gradient-to-b from-[#292931] to-[#232329]">
                                <p className="text-gray-300 text-sm mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                  Discover salary potential, growth outlook, and required skills...
                                </p>
                                <div className="w-full flex justify-end">
                                  <button
                                    onClick={() => {
                                      setCareerIndex(originalIndex);
                                      fetchCareer(career.career_name);
                                    }}
                                    className="rounded-md px-4 py-2 flex gap-2 items-center transition-all duration-200 shadow-md"
                                    style={{backgroundColor: color, hover: {backgroundColor: `${color}dd`}}}
                                  >
                                    <p className="text-sm text-white font-medium">
                                      {t("readMore")}
                                    </p>
                                    <FaChevronRight size={12} color="white" />
                                  </button>
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
                        <div className="col-span-12 rounded-md overflow-hidden shadow-lg border border-[#3a3a3a] transform transition-all duration-300 hover:translate-y-[-3px]">
                          <div className="bg-gradient-to-r from-[#00bf63] to-[#00bf6320] py-3 border-l-4 border-[#00bf63]">
                            <p className="text-white font-bold text-lg uppercase text-center">
                              {t("careerSuitability")}
                            </p>
                          </div>
                          <div className="bg-gradient-to-b from-[#2a2b27] to-[#222420] p-6 min-h-[150px]">
                            <p className="text-gray-200 leading-relaxed">
                              {singleCareer?.reason_for_recommendation}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {singleCareer?.present_trends && (
                          <div className="rounded-md overflow-hidden shadow-lg border border-[#3a3a3a] transform transition-all duration-300 hover:translate-y-[-3px]">
                            <div className="bg-gradient-to-r from-[#ffa000] to-[#ffa00020] py-3 border-l-4 border-[#ffa000]">
                              <p className="text-white font-bold text-sm uppercase text-center">
                                {t("presentTrends")}
                              </p>
                            </div>
                            <div className="bg-gradient-to-b from-[#2a2b27] to-[#222420] p-4 min-h-[180px]">
                              <p className="text-gray-200 text-sm">
                                {singleCareer?.present_trends}
                              </p>
                            </div>
                          </div>
                        )}

                        {singleCareer?.future_prospects && (
                          <div className="rounded-md overflow-hidden shadow-lg border border-[#3a3a3a] transform transition-all duration-300 hover:translate-y-[-3px]">
                            <div className="bg-gradient-to-r from-[#7824f6] to-[#7824f620] py-3 border-l-4 border-[#7824f6]">
                              <p className="text-white font-bold text-sm uppercase text-center">
                                {t("futureProspects")} ({singleCareer?.currentYear} - {singleCareer?.tillYear})
                              </p>
                            </div>
                            <div className="bg-gradient-to-b from-[#2a2b27] to-[#222420] p-4 min-h-[180px]">
                              <p className="text-gray-200 text-sm">
                                {singleCareer?.future_prospects}
                              </p>
                            </div>
                          </div>
                        )}

                        {singleCareer?.beyond_prospects && (
                          <div className="rounded-md overflow-hidden shadow-lg border border-[#3a3a3a] transform transition-all duration-300 hover:translate-y-[-3px]">
                            <div className="bg-gradient-to-r from-[#9333ea] to-[#9333ea20] py-3 border-l-4 border-[#9333ea]">
                              <p className="text-white font-bold text-sm uppercase text-center">
                                {t("futureProspects")} ({singleCareer?.tillYear + 1} and beyond)
                              </p>
                            </div>
                            <div className="bg-gradient-to-b from-[#2a2b27] to-[#222420] p-4 min-h-[180px]">
                              <p className="text-gray-200 text-sm">
                                {singleCareer?.beyond_prospects}
                              </p>
                            </div>
                          </div>
                        )}

                        {singleCareer?.salary && (
                          <div className="rounded-md overflow-hidden shadow-lg border border-[#3a3a3a] transform transition-all duration-300 hover:translate-y-[-3px]">
                            <div className="bg-gradient-to-r from-[#5ce1e6] to-[#5ce1e620] py-3 border-l-4 border-[#5ce1e6]">
                              <p className="text-white font-bold text-sm uppercase text-center">
                                Salary
                              </p>
                            </div>
                            <div className="bg-gradient-to-b from-[#2a2b27] to-[#222420] p-4 min-h-[180px]">
                              <p className="text-gray-200 text-sm">
                                {singleCareer?.salary}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {singleCareer?.expenses && (
                        <div className="col-span-12 rounded-md overflow-hidden shadow-lg border border-[#3a3a3a] transform transition-all duration-300 hover:translate-y-[-3px]">
                          <div className="bg-gradient-to-r from-[#ff0000] to-[#ff000020] py-3 border-l-4 border-[#ff0000]">
                            <p className="text-white font-bold text-sm uppercase text-center">
                              {t("expenses")}
                            </p>
                          </div>
                          <div className="bg-gradient-to-b from-[#2a2b27] to-[#222420] p-4">
                            <p className="text-gray-200 text-sm">
                              {singleCareer?.expenses}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center items-center">
                      <button
                        className={`font-bold text-center md:py-4 md:px-7 py-3 px-5 max-md:text-sm uppercase rounded-md shadow-md transition-all duration-300 ${
                          saveResultloading || singleCareer?.isCareerMoved
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#00bf63] to-[#00a857] hover:from-[#00a857] hover:to-[#009e52] text-white transform hover:translate-y-[-2px]"
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
                          <p>
                            {singleCareer?.isCareerMoved
                              ? t("alreadyMoved")
                              : t("moveCareer")}
                          </p> 
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
    </div>
  );
}

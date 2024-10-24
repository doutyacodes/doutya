
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

export default function Results2() {
  const [resultData, setResultData] = useState(null);
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [prevSelectCount, setPrevSelectCount] = useState(null);
  const [displayResults, setDisplayResults] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [singleCareer, setSingleCareer] = useState(null);
  const [careerIndex, setCareerIndex] = useState(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user_feedback, setUserFeedback] = useState("");
  const [step, setStep] = useState(1);
  const [industries, setIndustries] = useState([]);
  const [saveResultloading, setSaveResultLoading] = useState(false);

  const [showDialogue, setShowDialogue] = useState(false);
  const [showAlert, setShowAlert] = useState(false);


  const t = useTranslations('Result2');

  const router = useRouter();
  const resultsRef = useRef();
  const maxSelections = 5;

  const language = localStorage.getItem('language') || 'en';

  useEffect(() => {
    const storedCareers = JSON.parse(localStorage.getItem("selectedCareers")) || [];
    setSelectedCareers(storedCareers);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedCareers", JSON.stringify(selectedCareers));
  }, [selectedCareers]);

  const handleSelect = (index) => {
    if (prevSelectCount < maxSelections) {
      if (selectedCareers.includes(index)) {
        setSelectedCareers(selectedCareers.filter((careerIndex) => careerIndex !== index));
      } else if (selectedCareers.length < maxSelections - prevSelectCount) {
        setSelectedCareers([...selectedCareers, index]);
      } else {
        toast.error(`You can only select up to ${maxSelections - prevSelectCount} careers.`);
      }
    }
  };

  const getColorByIndex = (index) => {
    const colorCodes = [
      "#FFA500", "#800080", "#FFC0CB", "#00FF00", "#808080",
      "#FFFF00", "#00FFFF", "#FF4500", "#0000FF",
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
      console.log("Updated resultData:", resultData);
    }
  }, [resultData]);

  const fetchResults = async (selectedIndustry) => {
    console.log("selectedIndustry", selectedIndustry);
    
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const industryParam = selectedIndustry ? selectedIndustry : "";
      const response = await GlobalApi.GetResult2(token, industryParam, language);
      console.log(response.data);
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
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
        setSelectedCareers(selectedCareers.filter((careerIndex) => careerIndex !== index));
      } else if (selectedCareers.length < 5 - prevSelectCount) {
        setSelectedCareers([...selectedCareers, index]);
      } else {
        toast.error(`You can only select up to ${5 - prevSelectCount} careers.`);
      }
    }
  };

  const handleSaveResult = async () => {
    setSaveResultLoading(true);
    if (selectedCareers.length > 0) {
      const selectedCareerObjects = selectedCareers.map((index) => resultData[index]);
      const payload = { results: selectedCareerObjects };
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await GlobalApi.SaveCarrerData(token, payload);
        if (response.status === 201) {
          toast.success("Career Data Saved");
          router.push("/dashboard/careers/career-guide");
        }
      } catch (err) {
        console.error("Failed to save career data:", err);
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(`Error: ${err.response.data.message}`);
        } else {
          toast.error("Failed to save career data. Please try again later.");
        }
      } finally {
        setSaveResultLoading(false);
      }
    } else {
      toast.error("Please select at least one result to continue.");
      setSaveResultLoading(false);
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

        // Add the image to the PDF
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add new pages if necessary
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

  const fetchIndustry = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data = await GlobalApi.GetIndustry(token, language);
      const parsedResult = JSON.parse(data.data.result);
      console.log("parsedResult", parsedResult);
      setIndustries(parsedResult);
    } catch (err) {
      console.error("Failed to fetch industries:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log("loading", loading)

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
    <>
      {step === 1 && industries && (
        <div className="bg-[#009be8] h-20 my-4 justify-center items-center flex">
          <p className="text-white uppercase font-bold text-center">
            {t('selectIndustry')}
          </p>
        </div>
      )}

      {step === 2 && !singleCareer && (
        <div className="bg-[#009be8] h-20 mb-5 justify-center items-center flex">
          <p className="text-white uppercase font-bold text-center md:text-xl">
            {t('careerSuggestion')}
          </p>
        </div>
      )}

      {singleCareer?.career_name && (
        <div className="bg-[#009be8] py-5 mb-5">
          <div className="flex flex-col md:flex-row justify-between items-center px-4 mx-auto h-full max-w-[1280px]">
            <div className="flex items-center gap-4 mb-2 md:mb-0">
              <button 
                onClick={() => {
                  setCareerIndex(null);
                  setSingleCareer(null);
                }}
                className="text-white flex items-center"
              >
                <ChevronsLeft className="text-white md:text-lg" />
                <span className="uppercase font-bold">{t('backToCareer')}</span>
              </button>
            </div>
            <div className="text-center">
              <p className="text-white uppercase font-bold md:text-xl mb-2">
                {singleCareer.career_name}
              </p>
              <p className="text-white md:text-lg font-bold">
                {t('match')} - {singleCareer.match}%
              </p>
            </div>
            <button
              onClick={downloadResultsAsImage}
              className="bg-white md:p-3 p-2 rounded-md uppercase max-md:text-xs font-bold text-[#009be8] transition-all duration-300 hover:bg-gray-300 mt-2 md:mt-0"
            >
              {t('PDFdownload')}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col text-white gap-5 w-full">
        {step === 1 && industries && (
          <div className="p-6 rounded-lg text-white mt-6 w-full">

            {/* <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-12 gap-6 max-w-4xl mx-auto">

            </div> */}

            <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-12 gap-6 max-w-4xl mx-auto">
              {showAlert && <AlertDialogue fetchResults={fetchResults} setShowAlert={setShowAlert}/>}
              <button
                  onClick={() => (setShowAlert(true))}
                  className="sm:col-span-6 md:col-span-6 col-span-12 text-[#341e44] p-[1px] pt-8 rounded-lg hover:opacity-70"
                  style={{ backgroundColor: '#FFA500' }}
                >
                  <div className="bg-[#1a1236] w-full p-3 h-28 flex justify-center items-center rounded-lg text-white">
                    {t('industryAgnostic')}
                  </div>
                </button>

                <button
                  onClick={handleAddIndustryClick}
                  className="sm:col-span-6 md:col-span-6 col-span-12 text-[#341e44] p-[1px] pt-8 rounded-lg hover:opacity-70"
                  style={{ backgroundColor: '#008000' }}
                >
                  <div className="bg-[#1a1236] w-full p-3 h-28 flex justify-center items-center rounded-lg text-white">
                    {t('industrySpecific')}
                  </div>

                  <AddIndustry
                    isOpen={showDialogue}
                    onClose={() => setShowDialogue(false)}
                    // setIndustryName={setIndustryName}
                    fetchResults={fetchResults}
                  />

                </button>

                <div className="col-span-12 h-20 my-4 justify-center items-center flex">
                  <p className="text-white uppercase font-bold text-center">
                    {t('selectBelowIndustry')}
                  </p>
                </div>


              {
                loading ? (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="flex items-center space-x-2">
                      <LoaderIcon className="w-10 h-10 text-white text-4xl animate-spin" />
                      <span className="text-white">{loadText}</span>
                    </div>
                  </div>
                ) : (
                  industries.map((industry, index) => {
                    const color = getColorByIndex(index);
                    return (
                      <button
                        key={index}
                        onClick={handleOptionSelect}
                        className="sm:col-span-6 md:col-span-4 max-w-72 col-span-12 text-[#341e44] p-[1px] pt-8 rounded-lg hover:opacity-70"
                        style={{ backgroundColor: color }}
                      >
                        <div className="bg-[#1a1236] w-full p-3 h-28 flex justify-center items-center rounded-lg text-white">
                          {industry.industry_name}
                        </div>
                      </button>
                    );
                  })
                )

              }

              {/* {
              industries.map((industry, index) => {
                const color = getColorByIndex(index);
                return (
                  <button
                    key={index}
                    onClick={handleOptionSelect}
                    className="sm:col-span-6 md:col-span-4 max-w-72 col-span-12 text-[#341e44] p-[1px] pt-8 rounded-lg hover:opacity-70"
                    style={{ backgroundColor: color }}
                  >
                    <div className="bg-[#1a1236] w-full p-3 h-28 flex justify-center items-center rounded-lg text-white">
                      {industry.industry_name}
                    </div>
                  </button>
                );
              })
              } */}
            </div>
          </div>
        )}
        {step === 2 && (
          <>
            <div ref={resultsRef} className="mt-8">
              {resultData && !singleCareer ? (
                <div className="grid grid-cols-12 gap-3 px-4">
                  {resultData?.map((career, index) => (
                    <div key={index} className="col-span-12 sm:col-span-6 md:col-span-2 flex flex-col">
                      <div
                        className={`flex-grow flex flex-col relative p-[1px] text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer
                        ${selectedCareers.includes(index) ? 'border-4 border-blue-500 shadow-2xl' : ''}`}
                        style={{
                          backgroundColor:
                            career?.type == "normal" ? "#0097b2" :
                            career?.type == "off beat" ? "#800080" : "#5dbb49",
                        }}
                        onClick={() => handleCareerClick(index)}
                      >
                        <p className="text-xl text-center text-white py-4 uppercase font-bold">
                          {career?.type == "normal" ? "BASIC" : career.type}
                        </p>
                        <div className="flex-grow w-full bg-[#191235] p-3 rounded-xl text-white flex flex-col justify-between">
                          {selectedCareers.includes(index) && (
                            <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-xl pointer-events-none"></div>
                          )}

                          <h2 className="text-lg font-bold text-white mb-4 md:h-[80px] h-[50px] flex items-center justify-center flex-wrap text-center">
                            {career.career_name}
                          </h2>
                          <div className="p-4 bg-[#0097b2] rounded-md mb-4">
                            <p className="text-center font-bold">
                              {t('match')} - {career.match} %
                            </p>
                          </div>
                          <p className="text-white flex-grow">
                            <strong>{t('reasonForRecommendation')}:</strong>{" "}
                            {career.reason_for_recommendation}
                          </p>
                        </div>
                      </div>
                      <div className="w-full flex justify-center items-center py-7">
                        <button
                          onClick={() => {
                            setSingleCareer(career);
                            setCareerIndex(index);
                          }}
                          className="bg-[#7824f6] px-7 py-2 rounded-full text-white font-bold"
                        >
                          {t('readMore')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : singleCareer ? (
                <div className="space-y-6 px-10">
                  <div className="grid grid-cols-12 gap-4">
                    {singleCareer?.reason_for_recommendation && (
                      <div className="bg-[#00bf63] px-[1px] py-[1px] col-span-12 rounded-t-md">
                        <p className="text-white font-bold text-lg uppercase text-center py-3">
                          {t('careerSuitability')}
                        </p>
                        <div className="bg-[#1c143b] px-6 py-3 min-h-[150px] justify-center items-center flex">
                          <p className="text-justify text-lg flex-grow overflow-hidden text-ellipsis">
                            {singleCareer?.reason_for_recommendation}
                          </p>
                          </div>
                      </div>
                    )}

                    {singleCareer?.present_trends && (
                      <div className="bg-[#ffa000] px-[1px] py-[1px] col-span-12 sm:col-span-6 md:col-span-3 rounded-t-md">
                        <p className="text-white font-bold text-lg uppercase text-center py-3">
                          {t('presentTrends')}
                        </p>
                        <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                          <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                            {singleCareer?.present_trends}
                          </p>
                        </div>
                      </div>
                    )}

                    {singleCareer?.future_prospects && (
                      <div className="bg-[#7824f6] px-[1px] py-[1px] col-span-12 sm:col-span-6 md:col-span-3 rounded-t-md">
                        <p className="text-white font-bold text-lg uppercase text-center py-3">
                          {t('futureProspects')}
                        </p>
                        <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                          <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                            {singleCareer?.future_prospects}
                          </p>
                        </div>
                      </div>
                    )}

                    {singleCareer?.expenses && (
                      <div className="bg-[#ff0000] px-[1px] py-[1px] col-span-12 sm:col-span-6 md:col-span-3 rounded-t-md">
                        <p className="text-white font-bold text-lg uppercase text-center py-3">
                          {t('expenses')}
                        </p>
                        <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                          <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                            {singleCareer?.expenses}
                          </p>
                        </div>
                      </div>
                    )}

                    {singleCareer?.opportunities && (
                      <div className="bg-[#5ce1e6] px-[1px] py-[1px] col-span-12 sm:col-span-6 md:col-span-3 rounded-t-md">
                        <p className="text-white font-bold text-lg uppercase text-center py-3">
                          {t('opportunities')}
                        </p>
                        <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                          <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                            {singleCareer?.opportunities}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-center">
                    <button
                      className={`text-white font-bold text-center py-4 px-7 uppercase rounded-lg ${
                        selectedCareers.includes(careerIndex) ? 'bg-red-600' : 'bg-green-600'
                      }`}
                      onClick={() => {
                        handleCareerClick(careerIndex);
                        setCareerIndex(null);
                        setSingleCareer(null);
                      }}
                    >
                      {selectedCareers.includes(careerIndex) ? t('deselect') : t('selectCareer')}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            {resultData && prevSelectCount < 3 && (
              <div>
                <button
                  className={`w-full bg-blue-500 text-white py-2 rounded-lg mt-4 flex justify-center items-center ${
                    saveResultloading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSaveResult}
                  disabled={saveResultloading}
                >
                  {saveResultloading ? (
                    <>
                      <LoaderIcon className="w-5 h-5 text-white animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    t('saveResults')
                  )}
                </button>
              </div>
            )}
            {displayResults && !feedbackGiven && (
              <div className="bg-white p-5 rounded-lg text-gray-600">
                <p className="text-center text-xl mb-4">{t('giveFeedback')}</p>
                <div className="flex justify-center mb-4">
                  {[...Array(10)].map((_, index) => (
                    <span
                      key={index}
                      className={`cursor-pointer text-2xl ${
                        index < rating ? "text-yellow-500" : "text-gray-400"
                      }`}
                      onClick={() => setRating(index + 1)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <textarea
                  className="w-full p-3 rounded-lg border"
                  placeholder={t('writeFeedback')}
                  onChange={(e) => setUserFeedback(e.target.value)}
                />
                <button
                  className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4"
                  onClick={handleFeedbackSubmit}
                >
                  {t('submitFeedback')}
                </button>
                {feedbackGiven && (
                  <p className="text-center text-white">
                    {t('thankYouFeedback')}
                  </p>
                )}
              </div>
            )}
            <br />
            <br />
          </>
        )}
      </div>
    </>
  );
}
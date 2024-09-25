import React, { useState, useEffect, useRef } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import toast, { LoaderIcon, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { ChevronsLeft } from "lucide-react";

export default function Results2() {
  const [resultData, setResultData] = useState(null);
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [prevSelectCount, setPrevSelectCount] = useState(null);
  const [displayResults, setDisplayResults] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [singleCareer, setSingleCareer] = useState(null);
  const [careerIndex, setCareerIndex] = useState(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state
  const [user_feedback, setUserFeedback] = useState("");
  const [step, setStep] = useState(1);
  const [industries, setIndustries] = useState([]);

  const [saveResultloading, setSaveResultLoading] = useState(false); // Loading state

  // const [industrySelect, setIndustrySelect] = useState(null)
  const router = useRouter();
  const resultsRef = useRef();
  const getColorByIndex = (index) => {
    const colorCodes = [
      "#FFA500", // Orange/Yellow
      "#800080", // Purple
      "#FFC0CB", // Pink
      "#00FF00", // Green
      "#808080", // Gray
      "#FFFF00", // Yellow
      "#00FFFF", // Light Blue
      "#FF4500", // Red/Orange
      "#0000FF", // Blue
    ];

    // Return the color based on the index or undefined if the index is out of bounds
    return colorCodes[index] || undefined;
  };
  // const handleStayClick = () => {
  //   setStep(0); // Hide everything if "Stay" is clicked
  // };

  // const handleContinueClick = () => {
  //   setStep(2);
  // };

  const handleOptionSelect = async (e) => {
    // setIndustrySelect(e.target.innerText);
    const selectedIndustry = e.target.innerText;
    fetchResults(selectedIndustry);
    handleOptionSelect;
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
    setLoading(true); // Start loading
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const industryParam = selectedIndustry ? selectedIndustry : "";
      const response = await GlobalApi.GetResult2(token, industryParam);
      console.log(response.data);
      if (response.status === 200) {
        const parsedResult = JSON.parse(response.data.result);
        setResultData(parsedResult);
        setDisplayResults(true);
        setStep(2);
      } else if (response.status === 204) {
        // No data found, redirect or go to another step
        console.log("fetchIndustry");
        setStep(1);
        fetchIndustry();
      }
      const userStatusData = await GlobalApi.CheckFeedback(token);
      setFeedbackGiven(userStatusData.data.exists);
      setPrevSelectCount(userStatusData.data.savedCareerCount);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await GlobalApi.SubmitFeedback(token, { rating, user_feedback });
      setFeedbackGiven(true);
      toast.success("Thank You for your feedback");
    } catch (err) {
      // Handle error
    }
  };

  const handleCareerClick = (index) => {
    if (prevSelectCount < 5) {
      if (selectedCareers.includes(index)) {
        // If already selected, deselect it
        setSelectedCareers(
          selectedCareers.filter((careerIndex) => careerIndex !== index)
        );
      } else if (selectedCareers.length < 5 - prevSelectCount) {
        // Add to selected list if less than 3 are selected
        setSelectedCareers([...selectedCareers, index]);
      } else {
        // Show a message or do nothing if already 3 selected
        toast.error(
          `You can only select up to ${5 - prevSelectCount} careers.`
        );
      }
    }
  };

  const handleSaveResult = async () => {
    setSaveResultLoading(true)
    if (selectedCareers.length > 0) {
      console.log("Greater than");

      const selectedCareerObjects = selectedCareers.map(
        (index) => resultData[index]
      );

      const payload = {
        results: selectedCareerObjects,
      };

      // Perform save operation with selectedCareerObjects
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await GlobalApi.SaveCarrerData(token, payload);

        if (response.status === 201) {
          toast.success("Career Data Saved");
          router.push("/dashboard/careers");
        }
      } catch (err) {
        console.error("Failed to save career data:", err); // Log the error for debugging purposes
        // Display a user-friendly error message
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(`Error: ${err.response.data.message}`);
        } else {
          toast.error("Failed to save career data. Please try again later.");
        }
      } finally {
        setSaveResultLoading(false)
      }
     } else {
      toast.error("Please select atleast one result to continue");
    }
  };
  const downloadResultsAsImage = async () => {
    if (resultsRef.current) {
      const canvas = await html2canvas(resultsRef.current); // Capture the section as a canvas
      const imgData = canvas.toDataURL("image/png"); // Convert the canvas to an image
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "results.png"; // Specify the image filename
      link.click();
    }
  };

  const fetchIndustry = async () => {
    setLoading(true); // Start loading
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      // const params = {
      //     country: selectedCountry,
      //   };
      const data = await GlobalApi.GetIndustry(token);
      const parsedResult = JSON.parse(data.data.result);

      console.log("parsedResult", parsedResult);

      setIndustries(parsedResult);
      // setDisplayResults(true);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // useEffect(()=>{
  //     fetchIndustry()
  // }, [])

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
            select an industry{" "}
          </p>
        </div>
      )}
      {singleCareer?.career_name && (
        <div className="bg-[#009be8] h-20 my-4  ">
            <div className="justify-between items-center flex flex-row px-4 mx-auto h-full max-w-[1280px]">
          <div className="justify-between items-center flex gap-4">
          <ChevronsLeft className="text-white text-lg" />
              <button
                onClick={() => {
                  setCareerIndex(null);
                  setSingleCareer(null);
                }}
                className="uppercase text-white font-bold"
              >
                back to career suggestions
              </button>
            </div>
            <p className="text-white uppercase font-bold text-center">
              {singleCareer?.career_name}
            </p>
            <p className=" uppercase font-bold text-center text-transparent">
              {singleCareer?.career_name}
            </p>
          </div>
        </div>
      )}
      <div className="w-4/5 mx-auto">
        <Toaster />
        {loading && (
          <div className="h-full flex items-center justify-center text-white">
            <div>
              <div className="font-semibold">
                <LoadingOverlay loadText={"Loading..."} />
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-white text-3xl mb-8">Results</p>
        <button
          className="bg-orange-300 p-4 rounded-xl mb-5 text-black hover:bg-orange-700 hover:text-white"
          onClick={downloadResultsAsImage}
        >
          Download Results
        </button>

        <div className="flex flex-col text-white gap-5">
          {/* {resultData && ( */}
          {/* <> */}
          {step === 1 && industries && (
            <div className=" p-6 rounded-lg text-white mt-6">
              <div className="grid grid-cols-12 gap-10 justify-between items-center">
                {industries.map((industry, index) => {
                  const color = getColorByIndex(index);
                  return (
                    <button
                      onClick={handleOptionSelect}
                      className="sm:col-span-6 md:col-span-4 max-w-72 col-span-12 text-[#341e44] p-[1px] pt-8 rounded-lg hover:opacity-70"
                      style={{ backgroundColor: color }}
                    >
                      <div className="bg-[#1a1236] w-full p-3 h-28 flex justify-center items-center rounded-lg text-white">
                        {industry.industry_name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {step === 2 && (
            <>
              <div ref={resultsRef}>
                {loading ? (
                  <div className="bg-white px-10 py-6 text-sm text-gray-600 rounded-xl">
                    Loading results...
                  </div>
                ) : resultData && !singleCareer ? (
                  <div className="grid grid-cols-12 gap-3">
                    {resultData?.map((career, index) => (
                      <div className="col-span-12 sm:col-span-6 md:col-span-2 ">
                        <div
                          key={index}
                          className={` relative p-[1px]  text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer min-h-[80vh]
                                                      ${
                                                        selectedCareers.includes(
                                                          index
                                                        )
                                                          ? "border-4 border-blue-500 shadow-2xl"
                                                          : ""
                                                      }`}
                                                      style={{backgroundColor:career?.type=="normal" ? "#0097b2" :career?.type=="off beat" ? "#800080":"#5dbb49" }}
                          onClick={() => handleCareerClick(index)}
                        >
                          <p className="text-xl text-center text-white py-4 uppercase font-bold">
                          {career?.type=="normal" ? "BASIC" :career.type}
                          </p>
                          <div className="w-full bg-[#191235] p-3  rounded-xl text-white min-h-[72vh] space-y-6">
                            {selectedCareers.includes(index) && (
                              <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-xl pointer-events-none"></div>
                            )}

                            <h2 className="text-xl font-bold text-white min-h-20">
                              {career.career_name}
                            </h2>
                            <div className="p-4 bg-[#0097b2] rounded-md">
                              <p className="text-center font-bold">
                                Match -  {career.match} %
                              </p>
                            </div>
                            <p className="text-white">
                              <strong>Reason for Recommendation:</strong>{" "}
                              {career.reason_for_recommendation}
                            </p>
                            {/* <h3 className="text-lg font-semibold text-white">
                            Roadmap:
                          </h3>
                          // <ul className="list-disc ml-5 mb-4">
                          //   {career.roadmap.map((step, idx) => (
                          //     <li key={idx}>{step}</li>
                          //   ))}
                          // </ul>
                          // <p className="mb-4">
                          //   <strong>Present Trends:</strong>{" "}
                          //   {career.present_trends}
                          // </p>
                          // <p className="mb-4">
                          //   <strong>Future Prospects:</strong>{" "}
                          //   {career.future_prospects}
                          // </p>
                          <p>
                            <strong>User Description:</strong>{" "}
                            {career.user_description}
                          </p> */}
                          </div>
                        </div>
                        <div className="w-full flex justify-center items-center py-7">
                          <button
                            onClick={() => {
                              setSingleCareer(career);
                              setCareerIndex(index);
                            }}
                            className="bg-[#7824f6] px-7 py-2 rounded-full text-white font-bold "
                          >
                            Read More
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : singleCareer ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-12 gap-4">
                      {singleCareer?.reason_for_recommendation && (
                        <div className="bg-[#00bf63] px-[1px] py-[1px] col-span-12 rounded-t-md">
                          <p className="text-white font-bold text-lg uppercase text-center py-3">
                            WHY IS THIS CAREER SUITABLE FOR YOU
                          </p>
                          <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                            <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                              {singleCareer?.reason_for_recommendation}
                            </p>
                          </div>
                        </div>
                      )}

                      {singleCareer?.present_trends && (
                        <div className="bg-[#ffa000] px-[1px] py-[1px] col-span-12 sm:col-span-6 md:col-span-3 rounded-t-md">
                          <p className="text-white font-bold text-lg uppercase text-center py-3">
                            Present Trends
                          </p>
                          <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                            <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                              {singleCareer?.present_trends}
                            </p>
                          </div>
                        </div>
                      )}

                      {singleCareer?.future_prospects && (
                        <>
                          <div className="bg-[#7824f6] px-[1px] py-[1px] col-span-12 sm:col-span-6 md:col-span-3 rounded-t-md">
                            <p className="text-white font-bold text-lg uppercase text-center py-3">
                              Future Prospects
                            </p>
                            <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                              <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                                {singleCareer?.future_prospects}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#ff0000] px-[1px] py-[1px] col-span-12 sm:col-span-6 md:col-span-3 rounded-t-md">
                            <p className="text-white font-bold text-lg uppercase text-center py-3">
                              Future Prospects
                            </p>
                            <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                              <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                                {singleCareer?.future_prospects}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#5ce1e6] px-[1px] py-[1px] col-span-12 sm:col-span-6 md:col-span-3 rounded-t-md">
                            <p className="text-white font-bold text-lg uppercase text-center py-3">
                              Future Prospects
                            </p>
                            <div className="bg-[#1c143b] p-3 min-h-[150px] justify-center items-center flex">
                              <p className="text-justify text-sm flex-grow overflow-hidden text-ellipsis">
                                {singleCareer?.future_prospects}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex justify-center items-center">
                      <button
                        className="text-white font-bold text-center bg-green-600 py-4 px-7 uppercase rounded-lg"
                        onClick={() => {
                          handleCareerClick(careerIndex);
                          setCareerIndex(null);
                          setSingleCareer(null);
                        }}
                      >
                        Select this career
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
                      "Save Results"
                    )}
                  </button>
                </div>
              )}
              {displayResults && !feedbackGiven && (
                <div className="bg-white p-5 rounded-lg text-gray-600">
                  <p className="text-center text-xl mb-4">Give Your Feedback</p>
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
                    placeholder="Write your feedback (optional)"
                    onChange={(e) => setUserFeedback(e.target.value)}
                  />
                  <button
                    className="w-full bg-blue-500 text-white py-2 rounded-lg mt-4"
                    onClick={handleFeedbackSubmit}
                  >
                    Submit Feedback
                  </button>
                  {feedbackGiven && (
                    <p className="text-center text-white">
                      Thank you for your feedback!
                    </p>
                  )}
                </div>
              )}
              <br />
              <br />
            </>
          )}

          {/* </> */}
          {/* // )} */}
          {/* <div ref={resultsRef}>
                    {loading ? (
                    <div className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl'>
                        Loading results...
                    </div>
                    ) : resultData ? (
                        resultData?.map((career, index) => (
                            <div
                                key={index}
                                className={`relative bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer mb-4 
                                    ${selectedCareers.includes(index) ? 'border-4 border-blue-500 shadow-lg' : ''}`}
                                onClick={() => handleCareerClick(index)}
                            >
                                {selectedCareers.includes(index) && (
                                    <div className='absolute inset-0 bg-blue-500 opacity-20 rounded-xl pointer-events-none'></div>
                                )}
                                <h2 className='text-xl font-bold text-blue-600 mb-4'>{career.career_name}</h2>
                                <p className='mb-4'><strong>Reason for Recommendation:</strong> {career.reason_for_recommendation}</p>
                                <h3 className='text-lg font-semibold text-gray-800 mb-2'>Roadmap:</h3>
                                <ul className='list-disc ml-5 mb-4'>
                                    {career.roadmap.map((step, idx) => (
                                        <li key={idx}>{step}</li>
                                    ))}
                                </ul>
                                <p className='mb-4'><strong>Present Trends:</strong> {career.present_trends}</p>
                                <p className='mb-4'><strong>Future Prospects:</strong> {career.future_prospects}</p>
                                <p><strong>User Description:</strong> {career.user_description}</p>
                            </div>
                        ))
                    ) : null}
                </div>
                {(resultData && prevSelectCount < 3) && (
                    <div>
                        <button
                            className='w-full bg-blue-500 text-white py-2 rounded-lg mt-4'
                            onClick={handleSaveResult}
                        >
                            Save Results
                        </button>
                    </div>
                )}
                {displayResults && !feedbackGiven && (
                    <div className='bg-white p-5 rounded-lg text-gray-600'>
                        <p className='text-center text-xl mb-4'>Give Your Feedback</p>
                        <div className='flex justify-center mb-4'>
                            {[...Array(10)].map((_, index) => (
                                <span
                                    key={index}
                                    className={`cursor-pointer text-2xl ${index < rating ? 'text-yellow-500' : 'text-gray-400'}`}
                                    onClick={() => setRating(index + 1)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            className='w-full p-3 rounded-lg border'
                            placeholder='Write your feedback (optional)'
                            onChange={(e) => setUserFeedback(e.target.value)}
                        />
                        <button
                            className='w-full bg-blue-500 text-white py-2 rounded-lg mt-4'
                            onClick={handleFeedbackSubmit}
                        >
                            Submit Feedback
                        </button>
                        {feedbackGiven && (
                            <p className='text-center text-white'>Thank you for your feedback!</p>
                        )}
                    </div>

                )}
                <br /><br /> */}
        </div>
      </div>
    </>
  );
}

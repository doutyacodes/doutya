import React, { useState, useEffect } from 'react';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Results2() {
    const [resultData, setResultData] = useState(null)
    const [selectedCareers, setSelectedCareers] = useState([]);
    const [prevSelectCount, setPrevSelectCount] = useState(null);
    const [displayResults, setDisplayResults] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(false);
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false); // Loading state
    const [user_feedback, setUserFeedback] = useState('');
    const [step, setStep] = useState(1);
    const [industries, setIndustries] = useState([])
    const [industrySelect, setIndustrySelect] = useState(null)
    const router = useRouter();
    
    const handleStayClick = () => {
      setStep(0); // Hide everything if "Stay" is clicked
    };
  
    const handleContinueClick = () => {
      setStep(2); // Show industry options if "Continue" is clicked
    };

    const handleOptionSelect = async(e) => {
        setIndustrySelect(e.target.innerText); 
        const selectedIndustry = e.target.innerText
        fetchResults(selectedIndustry)
    };

   useEffect(()=>{
    fetchResults('');
   },[]);

   useEffect(() => {
    if (resultData) {
        console.log('Updated resultData:', resultData);
    }
}, [resultData]);

    const fetchResults = async (selectedIndustry) => {
        setLoading(true); // Start loading
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            // const countryParam = country ? `${country.label}` : '';
            // console.log('countryyyy',countryParam)
            // const countryParam = country ? country.label : ''; 
            const industryParam = selectedIndustry ? selectedIndustry: '';            
            const data = await GlobalApi.GetResult2(token, industryParam);
            const parsedResult = JSON.parse(data.data.result);
            setResultData(parsedResult);
            setDisplayResults(true);

            const userStatusData = await GlobalApi.CheckFeedback(token);
            setFeedbackGiven(userStatusData.data.exists);
            setPrevSelectCount(userStatusData.data.savedCareerCount);
        } catch (err) {
            console.error('Failed to fetch results:', err);
        } finally {
            setLoading(false); // Stop loading
        }
    };
    // const handleCountryChange = (selectedOption) => {
    //     setSelectedCountry(selectedOption);
    //     fetchResults(industrySelect,selectedOption);
    // };

    // const handleGlobalClick = () => {
    //     fetchResults(''); // Fetch results globally
    // };

    // const handleCountryWiseClick = () => {
    //     setDisplayCountrySelect(true);
    // };

    const handleFeedbackSubmit = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            await GlobalApi.SubmitFeedback(token, { rating, user_feedback });
            setFeedbackGiven(true);
            toast.success("Thank You for your feedback");
        } catch (err) {
            // Handle error
        }
    };

    const handleCareerClick = (index) => {

        if(prevSelectCount < 3){
            if (selectedCareers.includes(index)) {
                // If already selected, deselect it
                setSelectedCareers(selectedCareers.filter(careerIndex => careerIndex !== index));
            } else if (selectedCareers.length < 3 - prevSelectCount) {
                // Add to selected list if less than 3 are selected
                setSelectedCareers([...selectedCareers, index]);
            } else {
                // Show a message or do nothing if already 3 selected
                toast.error(`You can only select up to ${3 - prevSelectCount} careers.`)
            }
        }

    };

    const handleSaveResult = async()=>{
       
        if (selectedCareers.length > 0) {
            const selectedCareerObjects = selectedCareers.map(index => resultData[index]);
            
            const payload = {
                country: selectedCountry,
                results: selectedCareerObjects,
              };
            
            // Perform save operation with selectedCareerObjects
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.SaveCarrerData(token, payload);
                        
                if (response.status === 201) {
                    toast.success("Career Data Saved");
                    router.push('/dashboard/careers');
                }
            } catch (err) {
                console.error('Failed to save career data:', err); // Log the error for debugging purposes
                // Display a user-friendly error message
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(`Error: ${err.response.data.message}`);
                } else {
                    toast.error('Failed to save career data. Please try again later.');
                }
            }
        } else {
            toast.error("Please select atleast one result to continue")
        }
        
        
    }

    useEffect(()=>{

        const fetchIndustry = async () => {
            // setLoading(true); // Start loading
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                // const params = {
                //     country: selectedCountry,
                //   };
                const data = await GlobalApi.GetIndustry(token);
                const parsedResult = JSON.parse(data.data.result);
                
                setIndustries(parsedResult);
                // setDisplayResults(true);
    
            } catch (err) {
                console.error('Failed to fetch results:', err);
            } finally {
                // setLoading(false); // Stop loading
            }
        };
        // if(step === 2){
            fetchIndustry()
        // }

    }, [])

    return (
        <div className='w-4/5 mx-auto'>
            <Toaster/>
            <p className='text-center text-white text-3xl mb-8'>Results</p>
            
            <div className='flex flex-col text-white gap-5'>
                {resultData && (
                    <>
                        {step === 1 && (
                                <div className="bg-[#252525] px-10 py-6 rounded-lg text-white">
                                <p className="text-center mb-4">Do you wish to continue with advanced results?</p>
                                <div className="flex justify-center gap-4">
                                    <button
                                    className="bg-white text-[#341e44] px-4 py-2 rounded-lg hover:bg-gray-100"
                                    onClick={handleStayClick}
                                    >
                                    Stay
                                    </button>
                                    <button
                                    className="bg-[#c17ffd] text-[#341e44] px-4 py-2 rounded-lg hover:bg-[#a05cc3]"
                                    onClick={handleContinueClick}
                                    >
                                    Continue
                                    </button>
                                </div>
                                </div>
                            )}
                        {step === 2 && (
                            <div className="bg-[#252525] p-6 rounded-lg text-white mt-6">
                                <p className="text-center mb-4">Please select an industry from below.</p>
                                <div className="flex flex-col gap-4">
                                    {
                                        industries.map((industry, index) => (
                                            
                                                <button onClick={handleOptionSelect} className="bg-white text-[#341e44] px-4 py-2 rounded-lg hover:bg-gray-100">
                                                    {industry.industry_name}
                                                </button>
                                            
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </>
                )}
                
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
                <br /><br />
            </div>
        </div>
    );
}

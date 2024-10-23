import React, { useState, useEffect } from 'react';
import GlobalApi from '@/app/_services/GlobalApi';
import countryList from 'react-select-country-list';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Results2() {
    const [resultData, setResultData] = useState(null)
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [displayCountrySelect, setDisplayCountrySelect] = useState(false);
    const [displayResults, setDisplayResults] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
    const options = countryList().getData();
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

    const fetchResults = async (selectedIndustry, country = null ) => {
        setLoading(true); // Start loading
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            const countryParam = country ? `?country=${country.label}` : '';
            const industryParam = selectedIndustry ? selectedIndustry: '';            
            const data = await GlobalApi.GetResult3(token, countryParam, industryParam);
            const parsedResult = JSON.parse(data.data.result);
            setResultData(parsedResult);
            setDisplayResults(true);

        } catch (err) {
            console.error('Failed to fetch results:', err);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
        fetchResults(selectedOption);
    };

    const handleGlobalClick = () => {
        fetchResults(''); // Fetch results globally
    };

    const handleCountryWiseClick = () => {
        setDisplayCountrySelect(true);
    };


    useEffect(()=>{

        const fetchIndustry = async () => {
            // setLoading(true); // Start loading
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const params = {
                    country: selectedCountry,
                  };
                const data = await GlobalApi.GetIndustry(token, params);
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
            {!displayResults && (
                <>
                    <p className='text-center text-white mb-8'>
                        Do you want to get the results globally or for a specific country?
                    </p>
                    <div className='flex justify-center gap-4 mb-8'>
                        <button
                            onClick={handleGlobalClick}
                            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                        >
                            Globally
                        </button>
                        <button
                            onClick={handleCountryWiseClick}
                            className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700'
                        >
                            Country Wise
                        </button>
                    </div>
                </>
            )}
            <div className='flex flex-col text-white gap-5'>
                {displayCountrySelect && !displayResults && (
                    <div className='mb-4'>
                        <p>Select your country to view relevant careers:</p>
                        <Select
                            options={options}
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className='text-gray-800 rounded-md'
                            placeholder="Select Country"
                        />
                    </div>
                )}
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
                            <div  className="bg-white sm:col-span-6 md:col-span-4 col-span-12 text-[#341e44] px-4 py-2 rounded-lg hover:bg-gray-100">
                                <p className="text-center mb-4">Please select an industry from below.</p>
                                <div className="grid grid-cols-12 gap-4">
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
                                `}
                        >
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
                <br /><br />
            </div>
        </div>
    );
}

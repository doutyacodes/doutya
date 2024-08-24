import React, { useState, useEffect } from 'react';
import GlobalApi from '@/app/_services/GlobalApi';
import countryList from 'react-select-country-list';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';

export default function Results2() {
    const [resultData, setResultData] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [displayCountrySelect, setDisplayCountrySelect] = useState(false);
    const [displayResults, setDisplayResults] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(false);
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false); // Loading state
    const options = countryList().getData();
    const [user_feedback, setUserFeedback] = useState('');

    const fetchResults = async (country = null) => {
        setLoading(true); // Start loading
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            const countryParam = country ? `?country=${country.label}` : '';
            const data = await GlobalApi.GetResult2(token, countryParam);
            const parsedResult = JSON.parse(data.data.result);
            setResultData(parsedResult);
            console.log(parsedResult)
            console.log(resultData)
            setDisplayResults(true);

            const feedbackData = await GlobalApi.CheckFeedback(token);
            console.log('trueor false',feedbackData.data.exists)
            setFeedbackGiven(feedbackData.data.exists);
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
                {loading ? (
                    <div className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl'>
                        Loading results...
                    </div>
                ) : resultData ? (
                    resultData?.map((career, index) => (
                        <div
                            key={index}
                            className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer'
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

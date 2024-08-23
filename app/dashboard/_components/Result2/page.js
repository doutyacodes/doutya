import React, { useState, useEffect } from 'react';
import GlobalApi from '@/app/_services/GlobalApi';
import countryList from 'react-select-country-list';
import Select from 'react-select';

export default function Results2() {
    const [resultData, setResultData] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const options = countryList().getData();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async (country = null) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
            const countryParam = country ? `?country=${country.label}` : '';
            const data = await GlobalApi.GetResult2(token, countryParam);
            const parsedResult = JSON.parse(data.data.result);
            setResultData(parsedResult);
        } catch (err) {
            console.error('Failed to fetch results:', err);
        }
    };

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
        fetchResults(selectedOption); 
    };
    return (
        <div className='w-4/5 mx-auto'>
            <p className='text-center text-white text-3xl mb-8'>Results</p>
            <div className='flex flex-col text-white gap-5'>
                {resultData ? (
                    resultData?.careers.map((career, index) => (
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
                ) : (
                    <div className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl'>
                        Loading results...
                    </div>
                )}
                <div className='mt-4'>
                    <p>Want to check careers according to your specific country?</p>
                    <Select
                        options={options}
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        className='text-gray-800 rounded-md'
                        placeholder="Select Country"
                    />
                </div>
                <br /><br />
            </div>
        </div>
    );
}

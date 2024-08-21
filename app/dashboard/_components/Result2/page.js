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
            console.log(data);
            setResultData(data);
        } catch (err) {
            console.error('Failed to fetch results:', err);
        }
    };

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
        fetchResults(selectedOption); 
    };

    // Convert \r\n to <div> for block-level rendering
    const formatText = (text) => {
        if (!text) return 'Loading...';
        return text.split('\r\n').map((line, index) => (
            <div key={index} className='mb-4'>
                {line}
            </div>
        ));
    };

    return (
        <div className='w-4/5 mx-auto'>
            <p className='text-center text-white text-3xl'>Results</p>
            <div className='flex flex-col text-white gap-5'>
                <div className=''>
                    <div
                        className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer'
                    >
                        {resultData ? formatText(resultData?.data?.result) : 'Loading results...'}
                    </div>
                </div>
                <div className='mt-4'>
                    <p>Want to check careers according to your specific country?</p>
                    <Select
                        options={options}
                        value={selectedCountry}
                        onChange={handleCountryChange}
                        className='text-gray-800 rounded-md'
                        placeholder="Select Country"
                    />
                    <br /><br />
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import GlobalApi from '@/app/_services/GlobalApi';

export default function Results2() {
    const [resultData, setResultData] = useState(null); // Initialize as null to indicate no data yet

    useEffect(() => {
        async function fetchResults() {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const data = await GlobalApi.GetResult2(token);
                console.log(data);
                setResultData(data);
            } catch (err) {
                // Handle error
                console.error('Failed to fetch results:', err);
            }
        }
        fetchResults();
    }, []);

    useEffect(() => {
        if (resultData) {
            console.log('Result Data Updated:', resultData.data.result);
        }
    }, [resultData]);

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
                        {formatText(resultData?.data?.result)}
                    </div>
                </div>
            </div>
        </div>
    );
}

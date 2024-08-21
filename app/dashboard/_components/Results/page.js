"use client"
import GlobalApi from '@/app/_services/GlobalApi'
import React, { useEffect, useState } from 'react'

function Results() {
    const [resultData, setResultData] = useState([]);
    useEffect(() => {
        async function fetchResults() {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const data = await GlobalApi.GetUserId(token);
                console.log(data.data[0])
                setResultData(data.data[0]);

            } catch (err) {
                // setError('Failed to fetch results.');
            } finally {
                // setLoading(false);
            }
        }
        fetchResults();
    }, []);

    useEffect(() => {
        if (resultData) {
            console.log('Result Data Updated:', resultData);
        }
    }, [resultData]);

    const { description, strengths, weaknesses, opportunities, threats, careers, leastSuitableCareers } = resultData;
    return (
        <div className='w-4/5 mx-auto'>
            <p className='text-center text-white text-3xl'>Results</p>
            <div className='flex flex-col text-white gap-5'>
                <div className=''>
                    <p>
                        Description
                    </p>
                    <div className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                            {description}
                        </p>
                    </div>
                </div>

                <div className=''>
                    <p>
                        Strengths
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.strengths ? (
                            resultData.strengths.split('\r\n').map((strength, index) => (
                                <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                    {strength}
                                </div>
                            ))
                        ) : (
                            <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                Loading
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <p>
                        Weaknesses
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                    {resultData.weaknesses ? (
                        resultData.weaknesses.split('\r\n').map((weakness, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{weakness}</div>
                        ))
                    ) : (
                        <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                            Loading
                        </div>
                    )}
                    </div>

                </div>
                <div>
                    <p>
                        Opportunities
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                    {resultData.opportunities ? (
                        resultData.opportunities.split('\r\n').map((opportunity, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{opportunity}</div>
                        ))
                    ) : (
                        <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                            Loading
                        </div>
                    )}
                    </div>
                </div>
                <div>
                    <p>
                        Threats
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                    {resultData.threats ? (
                        resultData.threats.split('\r\n').map((threat, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{threat}</div>
                        ))
                    ) : (
                        <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                            Loading
                        </div>
                    )}
                    </div>
                </div>
                <div>
                    <p>
                        Most Suitable Careers
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-sm text-gray-600'>
                    {resultData.most_suitable_careers ? (
                        resultData.most_suitable_careers.split('\r\n').map((career, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{career}</div>
                        ))
                    ) : (
                        <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                            Loading
                        </div>
                    )}
                    </div>
                </div>
                <div>
                    <p>
                        Least Suitable Careers
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-sm text-gray-600'>
                    {resultData.least_suitable_careers ? (
                        resultData.least_suitable_careers.split('\r\n').map((least_career, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{least_career}</div>
                        ))
                    ) : (
                        <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                            Loading
                        </div>
                    )}  
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Results

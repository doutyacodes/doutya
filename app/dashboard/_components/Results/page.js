"use client";
import GlobalApi from '@/app/_services/GlobalApi';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl'; // Import useTranslations

function Results() {
    const [resultData, setResultData] = useState([]);
    const t = useTranslations('ResultsPage'); // Initialize translations

    useEffect(() => {
        async function fetchResults() {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const language = localStorage.getItem('language') || 'en';
                const data = await GlobalApi.GetUserId(token,language);
                console.log(data.data[0]);
                setResultData(data.data[0]);
            } catch (err) {
                // Handle error if necessary
            } finally {
                // Perform any cleanup if necessary
            }
        }
        fetchResults();
    }, []);

    useEffect(() => {
        if (resultData) {
            console.log('Result Data Updated:', resultData);
        }
    }, [resultData]);

    const { description, strengths, weaknesses, opportunities, threats, careers } = resultData;

    return (
        <div className='w-4/5 mx-auto'>
            <p className='text-center text-white text-3xl'>{t('title')}</p>
            <div className='flex flex-col text-white gap-5'>
                <div>
                    <p>{t('description')}</p>
                    <div className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>{description}</p>
                    </div>
                </div>

                <div>
                    <p>{t('strengths')}</p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.strengths ? (
                            resultData.strengths.split(',').map((strength, index) => (
                                <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                    {strength}
                                </div>
                            ))
                        ) : (
                            <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                {t('loading')}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <p>{t('weaknesses')}</p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.weaknesses ? (
                            resultData.weaknesses.split(',').map((weakness, index) => (
                                <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                    {weakness}
                                </div>
                            ))
                        ) : (
                            <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                {t('loading')}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <p>{t('opportunities')}</p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.opportunities ? (
                            resultData.opportunities.split(',').map((opportunity, index) => (
                                <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                    {opportunity}
                                </div>
                            ))
                        ) : (
                            <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                {t('loading')}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <p>{t('threats')}</p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.threats ? (
                            resultData.threats.split(',').map((threat, index) => (
                                <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                    {threat}
                                </div>
                            ))
                        ) : (
                            <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                {t('loading')}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <p>{t('careers')}</p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-sm text-gray-600'>
                        {resultData.most_suitable_careers ? (
                            resultData.most_suitable_careers.split(',').map((career, index) => (
                                <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                    {career}
                                </div>
                            ))
                        ) : (
                            <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                                {t('loading')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Results;

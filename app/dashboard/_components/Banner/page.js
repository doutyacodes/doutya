import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

function Banner({ onToggleResults, showResults, onToggleQuiz2Results, showQuiz2Results }) {
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef(null);
    const t = useTranslations('Banner');

    const paginationDots = [0, 1];

    useEffect(() => {
        const getQuizData = async () => {
            setLoading(true);
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const resp = await GlobalApi.GetDashboarCheck(token);
                setDashboardData(resp.data);
            } catch (error) {
                console.error("Error Fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        getQuizData();
    }, []);

    const getQuizStatus = (quizId) => {
        const quiz = dashboardData.find((q) => q.quiz_id === quizId);
        return quiz ? { isCompleted: quiz.isCompleted } : { isCompleted: false };
    };

    const isTest1Completed = getQuizStatus(1).isCompleted;

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-white">
                <div>
                    <div className="font-semibold">
                        <LoadingOverlay loadText={t('loadingText')} />
                    </div>
                </div>
            </div>
        );
    }

    const MobileNavigation = dynamic(() => import('../Navbar/button.jsx'), { ssr: false });

    return (
      <div>
        <div className="w-full py-8 text-3xl font-bold text-white text-center bg-gradient-to-r from-[#2f87aa] to-green-300">CAREER ASSESSMENT TESTS</div>
        <div className="p-4">
            <div className="mt-8 flex justify-evenly gap-10 w-full">
                {/* Personality Test */}
                <div className="pt-3 p-[1px] rounded-lg max-w-96 flex-1"  style={{
                    backgroundImage: `linear-gradient(to right, #3294bb, #3294bb)`,
                  }}>
                    <h3 className="font-bold text-center text-white text-md pb-2 uppercase">
                      Find Your strengths
                    </h3>
                   {/* 
                    <div className="text-center mt-4">
                        {getQuizStatus(1).isCompleted ? (
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-md"
                                onClick={onToggleResults}
                            >
                                {showResults ? t('hideResults') : t('viewResults')}
                            </button>
                        ) : (
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                                disabled
                            >
                                {t('viewResults')}
                            </button>
                        )}
                    </div> */}
                    <div className="bg-[#191134] h-full rounded-lg p-3 gap-3 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="font-bold text-2xl text-center py-3 text-white ">
                          <p> Personality</p><p> Test</p>
                        </h3>
                        <div className="bg-slate-600 p-[1px]" />
                        <p className="text-white text-justify text-md">
                        {t('personalityTestDescription')}
                        </p>
                        <div className="flex justify-center items-center">
                        <Link
                          href="/quiz-section/1"
                          className="hover:cursor-pointer bg-gradient-to-r from-[#2f87aa] to-green-400  p-3 rounded-full w-40 "
                        >
                          <p className="text-white font-semibold text-lg text-center">Take the Test</p>
                        </Link>
                      </div>
                      </div>
                      
                  </div>
                </div>

                {/* Interest Test */}
                
                   {/* <div className="text-center mt-4">
                        {getQuizStatus(2).isCompleted ? (
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-md"
                                onClick={onToggleQuiz2Results}
                            >
                                {showQuiz2Results ? t('hideResults') : t('viewResults')}
                            </button>
                        ) : (
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                                disabled
                            >
                                {t('viewResults')}
                            </button>
                        )}
                    </div>
                </div>*/}

<div className="pt-3 p-[1px] rounded-lg max-w-96  flex-1"  style={{
                    backgroundImage: `linear-gradient(to right, #f39033fb, #f39033fb)`,
                  }}>
                    <h3 className="font-bold text-center text-black text-md pb-2 uppercase ">
                      Follow the right career
                    </h3>
                    
                    <div className="bg-[#191134] h-full rounded-lg p-3 gap-3 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="font-bold text-2xl text-center py-3 text-white ">
                           <p> Interests</p><p> Test</p>
                        </h3>
                        <div className="bg-slate-600 p-[1px]" />
                        <p className="text-white text-justify text-md">
                        {t('interestTestDescription')}
                        </p>
                      <div className="flex justify-center items-center">
                        <Link
                          href="CareerQuizSection/2"
                          className="hover:cursor-pointer bg-neutral-400 p-3 rounded-full w-40 "
                        >
                          <p className="text-white font-semibold text-lg text-center">Take the Test</p>
                        </Link>
                      </div>
                      </div>
                  </div>
                </div>

            </div> 

            {/* Mobile view: Swiper carousel */}
            <div className="mt-8 sm:hidden">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={10}
                    slidesPerView={1}
                    onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    className="pb-12"
                >
                    {/* Personality Test - Mobile */}
                    <SwiperSlide>
                        <div className="border border-cyan-400 pb-3 rounded-sm h-auto w-full">
                            <img
                                className="rounded-md object-cover w-full h-48"
                                src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
                                alt={t('personalityTestTitle')}
                            />
                            <div className="border-t border-cyan-400"></div>
                            <h1 className="text-white mt-4 text-2xl font-bold ml-3">
                                {t('personalityTestTitle')}
                            </h1>
                            <div className="relative">
                                {!getQuizStatus(1).isCompleted ? (
                                    <Link href="/quiz-section/1">
                                        <img
                                            src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                                            className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-pointer"
                                            alt={t('navigateToQuizAlt')}
                                        />
                                    </Link>
                                ) : (
                                    <img
                                        src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                                        className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-not-allowed opacity-50"
                                        alt={t('quizCompletedAlt')}
                                    />
                                )}
                            </div>
                            <div className="relative">
                                <p className="ml-3 text-white pt-8 w-4/5">
                                    {t('personalityTestDescription')}
                                </p>
                            </div>
                            <div className="text-center mt-4">
                                {getQuizStatus(1).isCompleted ? (
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                                        onClick={onToggleResults}
                                    >
                                        {showResults ? t('hideResults') : t('viewResults')}
                                    </button>
                                ) : (
                                    <button
                                        className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                                        disabled
                                    >
                                        {t('viewResults')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* Interest Test - Mobile */}
                    <SwiperSlide>
                        <div className="border border-cyan-400 pb-3 rounded-sm h-auto w-full">
                            <img
                                className="rounded-md object-cover w-full h-48"
                                src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
                                alt={t('interestTestTitle')}
                            />
                            <div className="border-t border-cyan-400"></div>
                            <h1 className="text-white mt-4 text-2xl font-bold ml-3">
                                {t('interestTestTitle')}
                            </h1>
                            <div className="relative">
                                {!getQuizStatus(2).isCompleted ? (
                                    <Link href="CareerQuizSection/2">
                                        <img
                                            src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                                            className={`h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 ${isTest1Completed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                            alt={t('navigateToQuizAlt')}
                                        />
                                    </Link>
                                ) : (
                                    <img
                                        src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                                        className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-not-allowed opacity-50"
                                        alt={t('quizCompletedAlt')}
                                    />
                                )}
                            </div>
                            <div className="relative">
                                <p className="ml-3 text-white pt-8 w-4/5">
                                    {t('interestTestDescription')}
                                </p>
                            </div>
                            <div className="text-center mt-4">
                                {getQuizStatus(2).isCompleted ? (
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                                        onClick={onToggleQuiz2Results}
                                    >
                                        {showQuiz2Results ? t('hideResults') : t('viewResults')}
                                    </button>
                                ) : (
                                    <button
                                        className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                                        disabled
                                    >
                                        {t('viewResults')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>

                {/* Custom pagination dots */}
                <div className="flex justify-center space-x-2 gap-2 mt-4 mb-16">
                    {paginationDots.map((_, index) => (
                        <div
                            key={index}
                            className={`h-3 w-3 rounded-full cursor-pointer ${activeIndex === index ? 'bg-green-400' : 'bg-gray-400'}`}
                            onClick={() => swiperRef.current?.slideTo(index)}
                        ></div>
                    ))}
                </div>
            </div>

            <MobileNavigation />
        </div>
        </div>
    );
}

export default Banner;
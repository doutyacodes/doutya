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

    function Banner({ onToggleResults, showResults, onToggleQuiz2Results, showQuiz2Results, isTest2Completed, setIsTest2Completed }) {
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
                    
                    // Check if Test 2 is completed
                    const test2 = resp.data.find(q => q.quiz_id === 2);
                    if (test2 && test2.isCompleted) {
                        setIsTest2Completed(true);
                    }
                } catch (error) {
                    console.error("Error Fetching data:", error);
                } finally {
                    setLoading(false);
                }
            };
            getQuizData();
        }, [setIsTest2Completed]);

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
            <div className="max-md:pb-14">
                <div className="w-full py-8 md:text-3xl text-xl font-bold text-white text-center bg-gradient-to-r from-[#2f87aa] to-green-300">{t('careerAssesment')}</div>
                <div className="p-4">
                <div className="mt-8 md:flex hidden md:flex-row justify-evenly gap-10 w-full">
        {/* Personality Test */}
        {!getQuizStatus(1).isCompleted && (
        <div className="pt-3 p-[1px] rounded-lg w-full md:w-[400px]" style={{
            backgroundImage: `linear-gradient(to right, #3294bb, #3294bb)`,
        }}>
            <h3 className="font-bold text-center text-white text-md pb-2 uppercase">
                {t('findStrength')}
            </h3>
            <div className="bg-[#191134] rounded-lg p-3 flex flex-col justify-between  ">
                <div className="space-y-4 flex flex-col">
                    <h3 className="font-bold text-2xl text-center py-3 text-white">
                        {t('personalityTestTitle')}
                    </h3>
                    <div className="bg-slate-600 p-[1px]" />
                    <p className="text-white text-justify text-md p-4">
                        {t('personalityTestDescription')}
                    </p>
                </div>
                <div className="flex justify-center items-center p-4 mt-auto">
                    {/* {!getQuizStatus(1).isCompleted ? ( */}
                        <Link
                            href="/quiz-section/1"
                            className="hover:cursor-pointer bg-gradient-to-r from-[#2f87aa] to-green-400 p-3 rounded-full w-40"
                        >
                            <p className="text-white font-semibold text-lg text-center">{t('takeTest')}</p>
                        </Link>
                     {/* ) : (
                         <p className="text-white font-semibold bg-gradient-to-r from-[#2f87aa] to-green-400 text-lg text-center opacity-50 p-3 rounded-full w-40">{t('takeTest')}</p> */}
                    {/* )} */}
                </div>
            </div>
        </div>
        )}

        {/* Interest Test */}
        <div className="pt-3 p-[1px] rounded-lg w-full md:w-[400px]" style={{
            backgroundImage: `linear-gradient(to right, #f39033fb, #f39033fb)`,
        }}>
            <h3 className="font-bold text-center text-black text-md pb-2 uppercase">
                {t('followCareer')}
            </h3>
            <div className="bg-[#191134] rounded-lg p-3 flex flex-col justify-between">
                <div className="space-y-4 flex flex-col">
                    <h3 className="font-bold text-2xl text-center py-3 text-white">
                        {t('interestTestTitle')}
                    </h3>
                    <div className="bg-slate-600 p-[1px]" />
                    <p className="text-white text-justify text-md p-4">
                        {t('interestTestDescription')}
                    </p>
                </div>
                <div className="flex justify-center items-center p-4 mt-auto">
                    {!getQuizStatus(2).isCompleted && getQuizStatus(1).isCompleted ? (
                        <Link
                            href="/CareerQuizSection/2"
                            className="hover:cursor-pointer bg-gradient-to-r from-[#2f87aa] to-green-400 p-3 rounded-full w-40"
                        >
                            <p className="text-white font-semibold text-lg text-center">{t('takeTest')}</p>
                        </Link>
                    ) : (
                        <p className="text-white font-semibold bg-gradient-to-r from-[#2f87aa] to-green-400 text-lg text-center opacity-50 p-3 rounded-full w-40">{t('takeTest')}</p>
                    )}
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
        {!getQuizStatus(1).isCompleted && (
        <SwiperSlide>
            <div className="pt-3 p-[1px] rounded-lg w-full" style={{
                backgroundImage: `linear-gradient(to right, #3294bb, #3294bb)`,
            }}>
                <h3 className="font-bold text-center text-white text-md pb-2 uppercase">
                    {t('findStrength')}
                </h3>
                <div className="bg-[#191134] rounded-lg p-3 flex flex-col justify-between min-h-[430px]">
                    <div className="space-y-4 flex flex-col">
                        <h3 className="font-bold text-2xl text-center py-3 text-white">
                            {t('personalityTestTitle')}
                        </h3>
                        <div className="bg-slate-600 p-[1px]" />
                        <p className="text-white text-justify text-md p-4 flex-grow">
                            {t('personalityTestDescription')}
                        </p>
                    </div>
                    <div className="flex justify-center items-center p-4 mt-auto">
                        {/* {!getQuizStatus(1).isCompleted ? ( */}
                            <Link
                                href="/quiz-section/1"
                                className="hover:cursor-pointer bg-gradient-to-r from-[#2f87aa] to-green-400 p-3 rounded-full w-40"
                            >
                                <p className="text-white font-semibold text-lg text-center">{t('takeTest')}</p>
                            </Link>
                        {/* ) : (
                            <p className="text-white font-semibold bg-gradient-to-r from-[#2f87aa] to-green-400 text-lg text-center opacity-50 p-3 rounded-full w-40">{t('takeTest')}</p>
                        )} */}
                    </div>
                </div>
            </div>
        </SwiperSlide>
    )}

        {/* Interest Test - Mobile */}
        <SwiperSlide>
            <div className="pt-3 p-[1px] rounded-lg w-full" style={{
                backgroundImage: `linear-gradient(to right, #f39033fb, #f39033fb)`,
            }}>
                <h3 className="font-bold text-center text-black text-md pb-2 uppercase">
                    {t('followCareer')}
                </h3>
                <div className="bg-[#191134] rounded-lg p-3 flex flex-col justify-between min-h-[430px]">
                    <div className="space-y-4 flex flex-col">
                        <h3 className="font-bold text-2xl text-center py-3 text-white">
                            {t('interestTestTitle')}
                        </h3>
                        <div className="bg-slate-600 p-[1px]" />
                        <p className="text-white text-justify text-md p-4 flex-grow">
                            {t('interestTestDescription')}
                        </p>
                    </div>
                    <div className="flex justify-center items-center p-4 mt-auto">
                        {!getQuizStatus(2).isCompleted && getQuizStatus(1).isCompleted ? (
                            <Link
                                href="/CareerQuizSection/2"
                                className="hover:cursor-pointer bg-gradient-to-r from-[#2f87aa] to-green-400 p-3 rounded-full w-40"
                            >
                                <p className="text-white font-semibold text-lg text-center">{t('takeTest')}</p>
                            </Link>
                        ) : (
                            <p className="text-white font-semibold bg-gradient-to-r from-[#2f87aa] to-green-400 text-lg text-center opacity-50 p-3 rounded-full w-40">{t('takeTest')}</p>
                        )}
                    </div>
                </div>
            </div>
        </SwiperSlide>
    </Swiper>

                        
                        {/* Custom pagination dots */}
                        {!getQuizStatus(1).isCompleted &&(
                        <div className="flex justify-center space-x-2 gap-2 mt-4 mb-16">
                            {paginationDots.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-3 w-3 rounded-full cursor-pointer ${activeIndex === index ? 'bg-green-400' : 'bg-gray-400'}`}
                                    onClick={() => swiperRef.current?.slideTo(index)}
                                ></div>
                            ))}
                        </div>
                        )}
                        
                    </div>

                    {/* <MobileNavigation /> */}
                </div>
            </div>
        );
    }

    export default Banner;
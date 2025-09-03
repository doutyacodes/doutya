import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import QuizTransitionScreens from "../screens/page";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import CareerOnboarding from "@/app/_components/CareerOnboarding";
import { PersonalityTestComplete, StartPersonalityTest } from "@/app/_components/StepCompletionNotifications";

function Bannerkids({
   onToggleResults, 
   showResults, 
   onToggleQuiz2Results, 
   showQuiz2Results, 
   setIsTest1Completed,
   setIsCountryAdded,
   setIsInstitutionDetailsAdded,
   setEducationStageExists,
   setResultPageShown,
   setGradeData
  }) {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState(0);
  const swiperRef = useRef(null);
  const t = useTranslations('Banner');

  const paginationDots = [0, 1];

  useEffect(() => {
    const getQuizData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);
        console.log('Response: of  GetQuizData', resp.data);
        setDashboardData(resp.data.data);
        setIsCountryAdded(resp.data.countryAdded);  // Set country added state
        setIsInstitutionDetailsAdded(resp.data.institutionDetailsAdded);  // Set country added state
        setEducationStageExists(resp.data.educationStageExists);  // Set country added state
        setResultPageShown(resp.data.resultPageShown)
        setGradeData(resp.data.grade)

        // Check if Test 1 is completed
        const test1 = resp.data.data.find(q => q.quiz_id === 1);
        if (test1 && test1.isCompleted) {
          setIsTest1Completed(true);
        }

      } catch (error) {
        console.error('Error Fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    getQuizData();
  }, []);

  const getQuizStatus = (quizId) => {
    const quiz = dashboardData.find(q => q.quiz_id === quizId);
    return quiz ? { isCompleted: quiz.isCompleted } : { isCompleted: false };
  };

  const handleNextScreen = () => {
    if (currentScreen < 3) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const isTest1Completed = getQuizStatus(1).isCompleted;

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center text-white'>
        <div>
          <div className='font-semibold'>
            <LoadingOverlay loadText={t('loadingText')} />
          </div>
        </div>
      </div>
    );
  }

  const MobileNavigation = dynamic(() => import('../Navbar/button.jsx'), { ssr: false });

  if (currentScreen > 0 && currentScreen <= 3) {
    return (
      <QuizTransitionScreens
        currentScreen={currentScreen}
        handleNextScreen={handleNextScreen}
      />
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {!isTest1Completed && <StartPersonalityTest />}
      {!getQuizStatus(1).isCompleted && <CareerOnboarding />}
      <div className="w-full py-8 md:text-3xl text-xl font-bold text-white text-center bg-gradient-to-r from-[#2f87aa] to-green-300">
        {t('careerAssesment')}
      </div>

      <div className="p-4">
        <div className="mt-8 md:flex justify-evenly gap-10 w-full hidden">
          {/* Personality Test */}
          <div className="pt-3 p-[1px] rounded-lg max-w-96 flex-1"
            style={{
              backgroundImage: `linear-gradient(to right, #3294bb, #3294bb)`,
            }}>
            <h3 className="font-bold text-center text-white text-md pb-2 uppercase">
              {t('findStrength')}
            </h3>
            <div className="bg-[#191134] min-h-[240px] rounded-lg p-3 gap-3 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-2xl text-center py-3 text-white ">
                  <p>{t('personalityTestTitle')}</p>
                </h3>
                <div className="bg-slate-600 p-[1px]" />
                <p className="text-white text-justify text-md">
                  {t('personalityTestDescription')}
                </p>
                <div className="flex justify-center items-center">
                  {!getQuizStatus(1).isCompleted ? (
                    <div
                      onClick={() => setCurrentScreen(1)}
                      className="hover:cursor-pointer bg-gradient-to-r from-[#2f87aa] to-green-400  p-3 rounded-full w-40 ">
                      <p className="text-white font-semibold text-lg text-center">{t('takeTest')}</p>
                    </div>) :
                    <p className="text-white font-semibold bg-gradient-to-r from-[#2f87aa] to-green-400 text-lg text-center opacity-50 p-3 rounded-full w-40">{t('takeTest')}</p>
                  }
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
            // slidesPerView={1}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            className="pb-12"
          >
            {/* Personality Test - Mobile */}
            <SwiperSlide>
              <div className="pt-3 p-[1px] rounded-lg max-w-96 flex-1" style={{
                backgroundImage: `linear-gradient(to right, #3294bb, #3294bb)`,
              }}>
                <h3 className="font-bold text-center text-white text-md pb-2 uppercase">
                  {t('findStrength')}
                </h3>
                <div className="bg-[#191134] h-auto rounded-lg p-3 gap-3 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-bold text-2xl text-center py-3 text-white ">
                      <p>Personality</p><p>Test</p>
                    </h3>
                    <div className="bg-slate-600 p-[1px]" />
                    <p className="text-white text-justify text-md">
                      {t('personalityTestDescription')}
                    </p>
                  </div>
                {/* Adjusting the button placement */}
                <div className="flex justify-center items-center mt-4 mb-6"> {/* Increased margin */}
                  {!getQuizStatus(1).isCompleted ? (
                    <div
                      onClick={() => setCurrentScreen(1)}
                      className="hover:cursor-pointer bg-gradient-to-r from-[#2f87aa] to-green-400 p-3 rounded-full w-40">
                      <p className="text-white font-semibold text-lg text-center">{t('takeTest')}</p>
                    </div>
                  ) : (
                    <p className="text-white font-semibold bg-gradient-to-r from-[#2f87aa] to-green-400 text-lg text-center opacity-50 p-3 rounded-full w-40">{t('takeTest')}</p>
                  )}
                </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
          {/* Custom pagination dots */}
          {/* <div className="flex justify-center space-x-2 gap-2 mt-4 mb-16">
            {paginationDots.map((_, index) => (
              <div
                key={index}
                className={`h-3 w-3 rounded-full cursor-pointer ${activeIndex === index ? 'bg-green-400' : 'bg-gray-400'}`}
                onClick={() => swiperRef.current?.slideTo(index)}
              ></div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Bannerkids;

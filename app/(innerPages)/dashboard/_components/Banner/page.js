import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import CareerOnboarding from "@/app/_components/CareerOnboarding.jsx";
import { PersonalityTestComplete, StartPersonalityTest } from "@/app/_components/StepCompletionNotifications.jsx";

function Banner({
  setIsTest2Completed,
  setIsCountryAdded,
  setIsInstitutionDetailsAdded,
  setEducationStageExists,
  setResultPageShown,
  setGradeData
}) {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const t = useTranslations("Banner");

  const paginationDots = [0, 1];

  useEffect(() => {
    const getQuizData = async () => {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);
        setDashboardData(resp.data.data);
        setIsCountryAdded(resp.data.countryAdded);  // Set country added state
        setIsInstitutionDetailsAdded(resp.data.institutionDetailsAdded);  // Set country added state
        setEducationStageExists(resp.data.educationStageExists);  // Set country added state
        setResultPageShown(resp.data.resultPageShown)
        setGradeData(resp.data.grade)

        // Check if Test 2 is completed
        const test2 = resp.data.data.find((q) => q.quiz_id === 2);
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
            <LoadingOverlay loadText={t("loadingText")} />
          </div>
        </div>
      </div>
    );
  }

  // const MobileNavigation = dynamic(() => import("../Navbar/button.jsx"), {
  //   ssr: false,
  // });

  return (
    <div className="max-md:pb-14">
      {isTest1Completed ? <PersonalityTestComplete /> : <StartPersonalityTest />}
      {!getQuizStatus(1).isCompleted && <CareerOnboarding />}
      <div className="w-full py-8 md:text-3xl text-xl font-bold text-white text-center bg-gradient-to-r from-orange-500 to-red-500">
        {t("careerAssesment")}
      </div>
      <div className="p-4 bg-gradient-to-br from-gray-900/50 via-gray-800/50 to-gray-900/50">
        <div className="mt-8 md:flex hidden md:flex-row justify-evenly gap-10 w-full">
          {/* Personality Test */}
          {!getQuizStatus(1).isCompleted && (
            <div className="relative md:w-[400px]">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl"></div>
              <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full mb-4">
                    <h3 className="font-bold text-orange-400 text-sm uppercase tracking-wide">
                      {t("findStrength")}
                    </h3>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-2xl text-center text-white mb-4">
                      {t("personalityTestTitle")}
                    </h3>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-200 text-justify leading-relaxed">
                      {t("personalityTestDescription")}
                    </p>
                  </div>
                  <div className="flex justify-center pt-4">
                    <Link
                      href="/quiz-section/1"
                      className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/25"
                    >
                      {t("takeTest")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interest Test */}
          <div className="relative w-full md:w-[400px]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4">
                  <h3 className="font-bold text-blue-400 text-sm uppercase tracking-wide">
                    {t("followCareer")}
                  </h3>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-2xl text-center text-white mb-4">
                    {t("interestTestTitle")}
                  </h3>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-200 text-justify leading-relaxed">
                    {t("interestTestDescription")}
                  </p>
                </div>
                <div className="flex justify-center pt-4">
                  {!getQuizStatus(2).isCompleted &&
                  getQuizStatus(1).isCompleted ? (
                    <Link
                      href="/CareerQuizSection/2"
                      className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25"
                    >
                      {t("takeTest")}
                    </Link>
                  ) : (
                    <div className="inline-block bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-3 rounded-xl font-semibold text-gray-400 cursor-not-allowed">
                      {t("takeTest")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile view: Swiper carousel */}
        <div className="mt-8 md:hidden">
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
                <div className="relative w-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-2xl min-h-[430px] flex flex-col">
                    <div className="text-center mb-4">
                      <div className="inline-block px-4 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full mb-4">
                        <h3 className="font-bold text-orange-400 text-sm uppercase tracking-wide">
                          {t("findStrength")}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="font-bold text-2xl text-center text-white mb-4">
                          {t("personalityTestTitle")}
                        </h3>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-200 text-justify leading-relaxed">
                          {t("personalityTestDescription")}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center pt-6">
                      <Link
                        href="/quiz-section/1"
                        className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/25"
                      >
                        {t("takeTest")}
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )}

            {/* Interest Test - Mobile */}
            <SwiperSlide>
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-2xl min-h-[430px] flex flex-col">
                  <div className="text-center mb-4">
                    <div className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4">
                      <h3 className="font-bold text-blue-400 text-sm uppercase tracking-wide">
                        {t("followCareer")}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="font-bold text-2xl text-center text-white mb-4">
                        {t("interestTestTitle")}
                      </h3>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-200 text-justify leading-relaxed">
                        {t("interestTestDescription")}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center pt-6">
                    {!getQuizStatus(2).isCompleted &&
                    getQuizStatus(1).isCompleted ? (
                      <Link
                        href="/CareerQuizSection/2"
                        className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25"
                      >
                        {t("takeTest")}
                      </Link>
                    ) : (
                      <div className="inline-block bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-3 rounded-xl font-semibold text-gray-400 cursor-not-allowed">
                        {t("takeTest")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          {/* Custom pagination dots */}
          {!getQuizStatus(1).isCompleted && (
            <div className="flex justify-center space-x-2 gap-2 mt-4 mb-16">
              {paginationDots.map((_, index) => (
                <div
                  key={index}
                  className={`h-3 w-3 rounded-full cursor-pointer transition-all duration-200 ${
                    activeIndex === index ? "bg-orange-400 shadow-lg" : "bg-gray-400 hover:bg-gray-300"
                  }`}
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

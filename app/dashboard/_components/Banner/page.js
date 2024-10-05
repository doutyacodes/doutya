import Link from "next/link";
import React, { useEffect, useState, useRef  } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // Updated Swiper CSS path
import "swiper/css/pagination"; // For pagination styles
import "swiper/css/navigation"; // For navigation styles
import { Pagination, Navigation } from "swiper/modules"; 
import dynamic from 'next/dynamic';


function Banner({
  onToggleResults,
  showResults,
  onToggleQuiz2Results,
  showQuiz2Results,
}) {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  // Custom pagination dots
  const paginationDots = [0, 1]; // Number of slides

  useEffect(() => {
    const getQuizData = async () => {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
    // return quiz ? { isCompleted: quiz.isCompleted, isStarted: quiz.isStarted } : { isCompleted: false, isStarted: false };
    return quiz ? { isCompleted: quiz.isCompleted } : { isCompleted: false };
  };


  const isTest1Completed = getQuizStatus(1).isCompleted;

  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        </div>
      </div>
    );
  }
  const MobileNavigation = dynamic(() => import('../Navbar/button.jsx'), { ssr: false });

  return (
    <div className="mb-8 w-full px-10 mt-18">
      <h2 className="text-white mt-7 font-bold font-serif pb-6">
        Personality
      </h2>

      
      <div className="border-t border-cyan-400"></div>

      <div className="mt-8 sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 hidden w-full">
        <div className="border border-cyan-400 pb-3 rounded-sm w-full">
          <img
            className="rounded-md object-cover w-full h-36"
            src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
            alt="Test 4 Image"
          />
          <div className="border-t border-cyan-400"></div>
          <h1 className="text-white mt-4 text-2xl font-bold ml-7">Personality Test</h1>
          <div className="relative">
            {!getQuizStatus(1).isCompleted ? (
              <Link href="/quiz-section/1">
                <img
                  src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                  className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-pointer"
                  alt="Navigate to Quiz Section"
                />
              </Link>
            ) : (
              <img
                src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-not-allowed opacity-50"
                alt="Quiz Completed"
              />
            )}
          </div>
          <div className="relative">
            <p className="mx-auto text-white pt-8 w-4/5 text-justify">
            Begin your journey of self-discovery with the Personality Test! Uncover your unique traits to build a foundation for finding your ideal career path.
            </p>
          </div>
          <div className="text-center mt-4">
            {getQuizStatus(1).isCompleted ? (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                onClick={onToggleResults}
              >
                {showResults ? "Hide Results" : "View Results"}
              </button>
            ) : (
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                disabled
              >
                View Results
              </button>
            )}
          </div>
        </div>

        {/* Interest Test */}
        <div className="border border-cyan-400 pb-3 rounded-sm w-full">
          <img
            className="rounded-md object-cover w-full h-36"
            src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
            alt="Test 3 Image"
          />
          <div className="border-t border-cyan-400"></div>
          <h1 className="text-white mt-4 text-2xl font-bold ml-7">Interest Test</h1>
          <div className="relative">
            {!getQuizStatus(2).isCompleted ? (
              <Link href="CareerQuizSection/2">
                <img
                  src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                  className={`h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 ${isTest1Completed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  alt="Navigate to Quiz Section"
                />
              </Link>
            ) : (
              <img
                src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-not-allowed opacity-50"
                alt="Quiz Completed"
              />
            )}
          </div>
          <div className="relative">
            <p className="mx-auto text-white pt-8 w-4/5 text-justify">
              Explore your interests in the next phase! Uncover your passions and combine them with your personality profile to find career paths that truly resonate with you.
            </p>
          </div>
          <div className="text-center mt-4">
            {getQuizStatus(2).isCompleted ? (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                onClick={onToggleQuiz2Results}
              >
                {showQuiz2Results ? "Hide Results" : "View Results"}
              </button>
            ) : (
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                disabled
              >
                View Results
              </button>
            )}
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
                alt="Personality Test Image"
              />
              <div className="border-t border-cyan-400"></div>
              <h1 className="text-white mt-4 text-2xl font-bold ml-3">
                Personality Test
              </h1>
              <div className="relative">
                {!getQuizStatus(1).isCompleted ? (
                  <Link href="/quiz-section/1">
                    <img
                      src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                      className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-pointer"
                      alt="Navigate to Quiz Section"
                    />
                  </Link>
                ) : (
                  <img
                    src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                    className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-not-allowed opacity-50"
                    alt="Quiz Completed"
                  />
                )}
              </div>
              <div className="relative">
                <p className="ml-3 text-white pt-8 w-4/5">
                  Begin your journey of self-discovery with the Personality Test! Uncover your unique traits to build a foundation for finding your ideal career path.
                </p>
              </div>
              <div className="text-center mt-4">
                {getQuizStatus(1).isCompleted ? (
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                    onClick={onToggleResults}
                  >
                    {showResults ? "Hide Results" : "View Results"}
                  </button>
                ) : (
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                    disabled
                  >
                    View Results
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
                alt="Interest Test Image"
              />
              <div className="border-t border-cyan-400"></div>
              <h1 className="text-white mt-4 text-2xl font-bold ml-3">
                Interest Test
              </h1>
              <div className="relative">
                {!getQuizStatus(2).isCompleted ? (
                  <Link href="CareerQuizSection/2">
                    <img
                      src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                      className={`h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 ${isTest1Completed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                      alt="Navigate to Quiz Section"
                    />
                  </Link>
                ) : (
                  <img
                    src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                    className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-not-allowed opacity-50"
                    alt="Quiz Completed"
                  />
                )}
              </div>
              <div className="relative">
                <p className="ml-3 text-white pt-8 w-4/5">
                  Explore your interests in the next phase! Uncover your passions and combine them with your personality profile to find career paths that truly resonate with you.
                </p>
              </div>
              <div className="text-center mt-4">
                {getQuizStatus(2).isCompleted ? (
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                    onClick={onToggleQuiz2Results}
                  >
                    {showQuiz2Results ? "Hide Results" : "View Results"}
                  </button>
                ) : (
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
                    disabled
                  >
                    View Results
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
              className={`h-3 w-3 rounded-full cursor-pointer ${
                activeIndex === index ? 'bg-green-400' : 'bg-gray-400'
              }`}
              onClick={() => swiperRef.current?.slideTo(index)}
            ></div>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
}

export default Banner;
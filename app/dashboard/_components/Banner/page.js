import Link from "next/link";
import React, { useEffect, useState } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";

function Banner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interests, setInterests] = useState("");
  const [responseContent, setResponseContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const getQuizData = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);
        console.log('Response: of  GetQuizData', resp.data);
        setDashboardData(resp.data); 
      } catch (error) {
        console.error('Error Fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    getQuizData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    console.log("Entered Interests:", interests);
    try {
      const resp = await GlobalApi.InterestResult({ interests });
      setResponseContent(resp.data.result);
      setInterests("");
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
    closeModal();
  };

  const handleInputChange = (event) => {
    setInterests(event.target.value);
  };

  const formatContent = (text) => {
    return text.split("\n").map((line, index) => <p key={index}>{line}</p>);
  };

  const getQuizStatus = (quizId) => {
    const quiz = dashboardData.find(q => q.quiz_id === quizId);
    // return quiz ? { isCompleted: quiz.isCompleted, isStarted: quiz.isStarted } : { isCompleted: false, isStarted: false };
    return quiz ? { isCompleted: quiz.isCompleted} : { isCompleted: false };

  };

  if(loading){
    return (
        <div className='h-screen flex items-center justify-center text-white'>
            <div>
                <div className='font-semibold'>
                     <LoadingOverlay loadText={"Loading..."}/>;
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="mb-7 w-4/5 mx-auto">
      <h2 className="text-white mt-7 font-bold font-serif pb-6">
        Personality
      </h2>
      <div className="border-t border-cyan-400"></div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Test 1 */}
        {/* <div className="border border-cyan-400 pb-3 rounded-sm w-full">
          <img
            className="rounded-md object-cover w-full h-36"
            src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
            alt="Test 1 Image"
          />
          <div className="border-t border-cyan-400"></div>
          <h1 className="text-white mt-4 text-2xl font-bold ml-3">Test 1</h1>
          <div className="relative">
            <Link href="/quiz-section/1">
              <img
                src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
                className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-pointer"
                alt="Navigate to Quiz Section"
              />
            </Link>
          </div>
          <div className="relative">
            <p className="ml-3 text-white pt-8 w-4/5">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>
        </div> */}
        <div className="border border-cyan-400 pb-3 rounded-sm w-full">
          <img
            className="rounded-md object-cover w-full h-36"
            src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
            alt="Test 4 Image"
          />
          <div className="border-t border-cyan-400"></div>
          <h1 className="text-white mt-4 text-2xl font-bold ml-3">Test 4</h1>
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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>
          <div className="text-center mt-4">
            {getQuizStatus(1).isCompleted ? (
              <Link href={`/results/1`}>
                <button className="bg-green-500 text-white px-4 py-2 rounded-md">
                  View Results
                </button>
              </Link>
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

        {/* Test 2 */}
        <div className="border border-cyan-400 pb-3 rounded-sm w-full">
          <img
            className="rounded-md object-cover w-full h-36"
            src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
            alt="Test 2 Image"
          />
          <div className="border-t border-cyan-400"></div>
          <h1 className="text-white mt-4 text-2xl font-bold ml-3">Test 2</h1>
          <div className="relative">
            <img
              src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
              className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-pointer"
              alt="Navigate to Quiz Section"
              onClick={openModal}
            />
          </div>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-md">
                <h2 className="text-xl font-bold mb-4">Enter Your Interests</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Your interests"
                    className="border border-gray-300 p-2 rounded w-full mb-4"
                    value={interests}
                    onChange={handleInputChange}
                  />
                  <button
                    type="submit"
                    className="bg-cyan-400 text-white px-4 py-2 rounded-md"
                    disabled={loading}
                  >
                    {loading ? "Analyzing..." : "Submit"}
                  </button>
                </form>
                <button
                  className="mt-4 text-red-500"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="relative">
            <p className="ml-3 text-white pt-8 w-4/5">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>
        </div>

        {/* Test 3 */}
        <div className="border border-cyan-400 pb-3 rounded-sm w-full">
          <img
            className="rounded-md object-cover w-full h-36"
            src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
            alt="Test 3 Image"
          />
          <div className="border-t border-cyan-400"></div>
          <h1 className="text-white mt-4 text-2xl font-bold ml-3">Test 3</h1>
          <div className="relative">
          {!getQuizStatus(2).isCompleted ? (
            <Link href="/quiz-section/2">
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
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>
          <div className="text-center mt-4">
            {getQuizStatus(1).isCompleted ? (
              <Link href={`/results/1`}>
                <button className="bg-green-500 text-white px-4 py-2 rounded-md">
                  View Results
                </button>
              </Link>
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

        {/* Test 4 */}
        <div className="border border-cyan-400 pb-3 rounded-sm w-full">
          <img
            className="rounded-md object-cover w-full h-36"
            src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg"
            alt="Test 4 Image"
          />
          <div className="border-t border-cyan-400"></div>
          <h1 className="text-white mt-4 text-2xl font-bold ml-3">Test 4</h1>
          <div className="relative">

            <img
              src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png"
              className="h-10 absolute top-1/2 transform -translate-y-1/2 right-0 mr-3 cursor-not-allowed opacity-50"
              alt="Quiz Completed"
            />

          </div>
          <div className="relative">
            <p className="ml-3 text-white pt-8 w-4/5">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas
            </p>
          </div>
          <div className="text-center mt-4">
            {getQuizStatus(3).isCompleted ? (
              <Link href={`/results/1`}>
                <button className="bg-green-500 text-white px-4 py-2 rounded-md">
                  View Results
                </button>
              </Link>
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
    </div>
  );
}

export default Banner;

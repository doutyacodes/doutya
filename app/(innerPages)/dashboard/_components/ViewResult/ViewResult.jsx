import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa'; // Import star icons
import toast from 'react-hot-toast';
import GlobalApi from '@/app/_services/GlobalApi';
import LoadingOverlay from '@/app/_components/LoadingOverlay';


// function ViewResult({ testID, setSubjectTestId }) {
//     const [resultData, setResultData] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);

//     useEffect(() => {
//         const getResults = async () => {
//             setIsLoading(true);
//             try {
//                 const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
//                 const response = await GlobalApi.GetSkillTestResult(token, testID);
//                 if (response.status === 200) {
//                     setResultData(response.data);
//                 } else {
//                     toast.error('Failed to fetch result data. Please try again later.');
//                 }
//             } catch (err) {
//                 if (err.response && err.response.data && err.response.data.message) {
//                     toast.error(`Error: ${err.response.data.message}`);
//                 } else {
//                     toast.error('Failed to fetch results. Please try again later.');
//                 }
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         getResults();
//     }, [testID]);

//     const renderStars = (count) => {
//         const stars = [];
//         if (count === null) return <span className="text-gray-400">No stars awarded</span>;
        
//         for (let i = 0; i < 3; i++) {
//             if (i < count) {
//                 stars.push(<FaStar key={i} className="text-yellow-400 text-xl inline-block mr-1" />);
//             } else {
//                 stars.push(<FaRegStar key={i} className="text-gray-500 text-xl inline-block mr-1" />);
//             }
//         }
//         return <div className="flex items-center">{stars}</div>;
//     };

//     if (isLoading) {
//         return (
//             <div className="h-screen flex items-center justify-center">
//                 <div>
//                     <div className="font-semibold">
//                         <LoadingOverlay loadText={"Loading..."} />
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="relative">
//             {/* Back Button */}
//             <button
//                 className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
//                 onClick={() => setSubjectTestId(null)}
//             >
//                 &#8592; Back
//             </button>

//             <div className="grid grid-cols-1 gap-6 mt-16 bg-gray-800 p-10 rounded-lg shadow-lg">
//                 {resultData ? (
//                     <>
//                         <div className="bg-gradient-to-r from-indigo-800 to-purple-900 p-6 rounded-t-lg text-white">
//                             <h2 className="text-3xl font-bold mb-2">{resultData.subjectName} Test Results</h2>
//                             <p className="text-lg opacity-90">Completed on {new Date(resultData.completedAt).toLocaleDateString()}</p>
//                         </div>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900 rounded-lg">
//                             {/* Performance Summary */}
//                             <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
//                                 <h3 className="text-xl font-semibold mb-4 text-white">Performance</h3>
//                                 <div className="space-y-4">
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-gray-300">Stars Earned:</span>
//                                         {renderStars(resultData.starsAwarded)}
//                                     </div>
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-gray-300">Skilled Age Level:</span>
//                                         <span className="font-semibold text-white">{resultData.skilledAge || 'Not available'}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-gray-300">Your Age:</span>
//                                         <span className="font-semibold text-white">{resultData.userAge}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-gray-300">Performance:</span>
//                                         <span className="font-semibold text-white">
//                                             {resultData.skilledAge > resultData.userAge 
//                                                 ? 'Outstanding' 
//                                                 : resultData.skilledAge === resultData.userAge 
//                                                     ? 'On Track' 
//                                                     : 'Developing'}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             {/* Accuracy Summary */}
//                             <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
//                                 <h3 className="text-xl font-semibold mb-4 text-white">Answer Summary</h3>
//                                 <div className="space-y-4">
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-gray-300">Correct Answers:</span>
//                                         <span className="font-semibold text-green-400">{resultData.correctAnswers}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-gray-300">Total Questions:</span>
//                                         <span className="font-semibold text-white">{resultData.totalQuestions}</span>
//                                     </div>
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-gray-300">Accuracy:</span>
//                                         <span className="font-semibold text-white">{resultData.accuracy}%</span>
//                                     </div>
//                                     <div className="mt-2 bg-gray-700 rounded-full h-4">
//                                         <div 
//                                             className="bg-indigo-600 h-4 rounded-full" 
//                                             style={{ width: `${resultData.accuracy}%` }}
//                                         ></div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         {/* Feedback Section */}
//                         <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
//                             <h3 className="text-xl font-semibold mb-4 text-white">Feedback</h3>
//                             <div className="bg-gray-900 p-6 rounded-md border-l-4 border-indigo-500">
//                                 <p className="text-lg text-gray-200 italic">
//                                     {resultData.feedback}
//                                 </p>
//                             </div>
//                         </div>
                        
//                         {/* Star Award Information Section */}
//                         <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
//                             <h3 className="text-xl font-semibold mb-4 text-white">How Stars are Awarded</h3>
//                             <div className="space-y-4">
//                                 <p className="text-gray-200">
//                                     <span className="font-semibold">⭐ Stars are awarded based on:</span>
//                                 </p>
//                                 <ul className="list-disc pl-5 space-y-2 text-gray-200">
//                                     <li>Accuracy of your answers</li>
//                                     <li>Speed of completion - faster correct answers earn more points</li>
//                                     <li>Overall performance compared to the skill level for your age</li>
//                                 </ul>
//                                 <div className="mt-4 p-4 bg-indigo-900 bg-opacity-50 rounded-md">
//                                     <p className="text-indigo-200">
//                                         <span className="font-semibold">Tip:</span> To improve your star rating, focus on both accuracy and speed. Take your time to understand the questions, but try to answer correctly as quickly as you can.
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="bg-gray-700 p-10 rounded-md shadow-md text-center">
//                         <p className="text-xl text-gray-200">No Results Available.</p>
//                         <p className="text-gray-400 mt-2">Try taking a test first or check back later.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

function ViewResult({ testID, setSubjectTestId }) {
    const [resultData, setResultData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getResults = async () => {
            setIsLoading(true);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetSkillTestResult(token, testID);
                if (response.status === 200) {
                    setResultData(response.data);
                } else {
                    toast.error('Failed to fetch result data. Please try again later.');
                }
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(`Error: ${err.response.data.message}`);
                } else {
                    toast.error('Failed to fetch results. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        getResults();
    }, [testID]);

    const renderStars = (count) => {
        // Handle null or 0 stars case
        if (count === null || count === 0) {
            return (
                <div className="flex items-center">
                    <div className="flex mr-2">
                        <FaRegStar className="text-gray-500 text-lg md:text-xl inline-block mr-1" />
                        <FaRegStar className="text-gray-500 text-lg md:text-xl inline-block mr-1" />
                        <FaRegStar className="text-gray-500 text-lg md:text-xl inline-block mr-1" />
                    </div>
                    <span className="text-gray-400 text-xs md:text-sm">(No stars earned)</span>
                </div>
            );
        }
        
        const stars = [];
        for (let i = 0; i < 3; i++) {
            if (i < count) {
                stars.push(<FaStar key={i} className="text-yellow-400 text-lg md:text-xl inline-block mr-1" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-gray-500 text-lg md:text-xl inline-block mr-1" />);
            }
        }
        return <div className="flex items-center">{stars}</div>;
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div>
                    <div className="font-semibold">
                        <LoadingOverlay loadText={"Loading..."} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Back Button */}
            <button
                className="absolute top-2 md:top-4 left-2 md:left-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 md:py-2 px-3 md:px-4 rounded text-sm md:text-base"
                onClick={() => setSubjectTestId(null)}
            >
                &#8592; Back
            </button>

            <div className="grid grid-cols-1 gap-4 md:gap-6 mt-12 md:mt-16 bg-gray-800 p-4 md:p-10 rounded-lg shadow-lg">
                {resultData ? (
                    <>
                        <div className="bg-gradient-to-r from-indigo-800 to-purple-900 p-4 md:p-6 rounded-t-lg text-white">
                            <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{resultData.subjectName} Test Results</h2>
                            <p className="text-sm md:text-lg opacity-90">Completed on {new Date(resultData.completedAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-3 md:p-6 bg-gray-900 rounded-lg">
                            {/* Performance Summary */}
                            <div className="bg-gray-800 p-3 md:p-6 rounded-lg shadow-md border border-gray-700">
                                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white">Performance</h3>
                                <div className="space-y-3 md:space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm md:text-base text-gray-300">Stars Earned:</span>
                                        {renderStars(resultData.starsAwarded)}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm md:text-base text-gray-300">Skilled Age Level:</span>
                                        <span className="font-semibold text-sm md:text-base text-white">{resultData.skilledAge || 'Not available'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm md:text-base text-gray-300">Your Age:</span>
                                        <span className="font-semibold text-sm md:text-base text-white">{resultData.userAge}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm md:text-base text-gray-300">Performance:</span>
                                        <span className="font-semibold text-sm md:text-base text-white">
                                            {resultData.skilledAge > resultData.userAge 
                                                ? 'Outstanding' 
                                                : resultData.skilledAge === resultData.userAge 
                                                    ? 'On Track' 
                                                    : 'Developing'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Accuracy Summary */}
                            <div className="bg-gray-800 p-3 md:p-6 rounded-lg shadow-md border border-gray-700">
                                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white">Answer Summary</h3>
                                <div className="space-y-3 md:space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm md:text-base text-gray-300">Correct Answers:</span>
                                        <span className="font-semibold text-sm md:text-base text-green-400">{resultData.correctAnswers}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm md:text-base text-gray-300">Total Questions:</span>
                                        <span className="font-semibold text-sm md:text-base text-white">{resultData.totalQuestions}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm md:text-base text-gray-300">Accuracy:</span>
                                        <span className="font-semibold text-sm md:text-base text-white">{resultData.accuracy}%</span>
                                    </div>
                                    <div className="mt-1 md:mt-2 bg-gray-700 rounded-full h-3 md:h-4">
                                        <div 
                                            className="bg-indigo-600 h-3 md:h-4 rounded-full" 
                                            style={{ width: `${resultData.accuracy}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Feedback Section */}
                        <div className="bg-gray-800 p-3 md:p-6 rounded-lg shadow-md border border-gray-700">
                            <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white">Feedback</h3>
                            <div className="bg-gray-900 p-3 md:p-6 rounded-md border-l-4 border-indigo-500">
                                <p className="text-base md:text-lg text-gray-200 italic">
                                    {resultData.feedback}
                                </p>
                            </div>
                        </div>
                        
                        {/* Star Award Information Section */}
                        <div className="bg-gray-800 p-3 md:p-6 rounded-lg shadow-md border border-gray-700">
                            <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white">How Stars are Awarded</h3>
                            <div className="space-y-3 md:space-y-4">
                                <p className="text-sm md:text-base text-gray-200">
                                    <span className="font-semibold">⭐ Stars are awarded based on:</span>
                                </p>
                                <ul className="list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 text-sm md:text-base text-gray-200">
                                    <li>Accuracy of your answers</li>
                                    <li>Speed of completion - faster correct answers earn more points</li>
                                    <li>Overall performance compared to the skill level for your age</li>
                                </ul>
                                <div className="mt-2 md:mt-4 p-3 md:p-4 bg-indigo-900 bg-opacity-50 rounded-md">
                                    <p className="text-xs md:text-sm text-indigo-200">
                                        <span className="font-semibold">Tip:</span> To improve your star rating, focus on both accuracy and speed. Take your time to understand the questions, but try to answer correctly as quickly as you can.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-gray-700 p-6 md:p-10 rounded-md shadow-md text-center">
                        <p className="text-lg md:text-xl text-gray-200">No Results Available.</p>
                        <p className="text-sm md:text-base text-gray-400 mt-2">Try taking a test first or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewResult;

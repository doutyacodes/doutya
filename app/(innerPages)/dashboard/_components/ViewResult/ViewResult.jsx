import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import GlobalApi from '@/app/_services/GlobalApi';
import LoadingOverlay from '@/app/_components/LoadingOverlay';
import { ArrowLeft, Award, Target, CheckCircle, TrendingUp, Clock, Lightbulb } from 'lucide-react';

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

    const getPerformanceInfo = (skilledAge, userAge) => {
        if (skilledAge > userAge) {
            return {
                label: 'Outstanding',
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10',
                icon: <Award className="w-5 h-5 text-emerald-400" />
            };
        } else if (skilledAge === userAge) {
            return {
                label: 'On Track',
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10',
                icon: <Target className="w-5 h-5 text-yellow-400" />
            };
        } else {
            return {
                label: 'Developing',
                color: 'text-orange-400',
                bgColor: 'bg-orange-500/10',
                icon: <TrendingUp className="w-5 h-5 text-orange-400" />
            };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center text-white">
                <div>
                    <div className="font-semibold">
                        <LoadingOverlay loadText={"Loading..."} />
                    </div>
                </div>
            </div>
        );
    }

    const performanceInfo = resultData ? getPerformanceInfo(resultData.skilledAge, resultData.userAge) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="relative max-w-6xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    className="group flex items-center gap-2 mb-6 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 hover:border-orange-500/50 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    onClick={() => setSubjectTestId(null)}
                >
                    <ArrowLeft className="w-4 h-4 group-hover:text-orange-400 transition-colors" />
                    <span>Back to Tests</span>
                </button>

                {resultData ? (
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-2xl"></div>
                            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 lg:p-8 shadow-2xl">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-orange-500/10 rounded-full">
                                            <CheckCircle className="w-8 h-8 text-orange-400" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl lg:text-4xl font-bold text-white">
                                                {resultData.subjectName} Test Results
                                            </h1>
                                            <p className="text-gray-400 text-sm lg:text-base">
                                                Completed on {new Date(resultData.completedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-20 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Overview Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Performance Summary */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl"></div>
                                <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-6 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-orange-500/10 rounded-lg">
                                            <Award className="w-6 h-6 text-orange-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">Performance</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300">Stars Earned:</span>
                                            {renderStars(resultData.starsAwarded)}
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300">Skilled Age Level:</span>
                                            <span className="font-semibold text-white">
                                                {resultData.skilledAge || 'Not available'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300">Your Age:</span>
                                            <span className="font-semibold text-white">{resultData.userAge}</span>
                                        </div>
                                        <div className={`flex justify-between items-center p-3 ${performanceInfo.bgColor} border border-gray-600/30 rounded-lg`}>
                                            <span className="text-gray-300">Performance:</span>
                                            <div className="flex items-center gap-2">
                                                {performanceInfo.icon}
                                                <span className={`font-semibold ${performanceInfo.color}`}>
                                                    {performanceInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Accuracy Summary */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl"></div>
                                <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-6 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <Target className="w-6 h-6 text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white">Answer Summary</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300">Correct Answers:</span>
                                            <span className="font-semibold text-green-400">
                                                {resultData.correctAnswers}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300">Total Questions:</span>
                                            <span className="font-semibold text-white">
                                                {resultData.totalQuestions}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300">Accuracy:</span>
                                            <span className="font-semibold text-white">{resultData.accuracy}%</span>
                                        </div>
                                        <div className="p-3 bg-gray-700/30 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-300 text-sm">Progress</span>
                                                <span className="text-white text-sm font-medium">{resultData.accuracy}%</span>
                                            </div>
                                            <div className="bg-gray-600 rounded-full h-3">
                                                <div 
                                                    className={`h-3 rounded-full transition-all duration-500 ${
                                                        resultData.accuracy >= 85 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                                        resultData.accuracy >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                        'bg-gradient-to-r from-orange-500 to-red-500'
                                                    }`}
                                                    style={{ width: `${resultData.accuracy}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Feedback Section */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Feedback</h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg"></div>
                                    <div className="relative bg-gray-700/50 border-l-4 border-orange-500 p-6 rounded-lg">
                                        <p className="text-gray-200 leading-relaxed italic text-base lg:text-lg">
                                            "{resultData.feedback}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Star Award Information Section */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-yellow-500/5 rounded-xl"></div>
                            <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                                        <Lightbulb className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">How Stars are Awarded</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-gray-200 font-medium">
                                        <span className="text-yellow-400">⭐</span> Stars are awarded based on:
                                    </p>
                                    <ul className="space-y-3 ml-4">
                                        <li className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                            <div className="p-1 bg-green-500/10 rounded-full mt-0.5">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-200">Accuracy of your answers</span>
                                        </li>
                                        <li className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                            <div className="p-1 bg-blue-500/10 rounded-full mt-0.5">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-200">Speed of completion - faster correct answers earn more points</span>
                                        </li>
                                        <li className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                                            <div className="p-1 bg-purple-500/10 rounded-full mt-0.5">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-200">Overall performance compared to the skill level for your age</span>
                                        </li>
                                    </ul>
                                    <div className="relative mt-6">
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-lg"></div>
                                        <div className="relative bg-gray-700/50 border border-orange-500/30 p-4 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                                    <Clock className="w-5 h-5 text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-orange-400 mb-1">Pro Tip:</p>
                                                    <p className="text-gray-300 text-sm">
                                                        To improve your star rating, focus on both accuracy and speed. Take your time to understand the questions, but try to answer correctly as quickly as you can.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-xl"></div>
                        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-xl p-8 lg:p-12 shadow-xl text-center">
                            <div className="p-4 bg-gray-700/50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">No Results Available</h3>
                            <p className="text-gray-400 text-lg">
                                Try taking a test first or check back later.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewResult;
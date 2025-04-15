import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import PricingCard from '@/app/_components/PricingCard';
import { ChevronDown, Lock } from 'lucide-react';
import { Award, Book, Star, TrendingUp } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import InitialFeedback from '../InitialFeedback/InitialFeedback';
import FeatureGuideWrapper from '@/app/_components/FeatureGuideWrapper';


function Feedback({ selectedCareer }) {
    const [isLoading, setIsLoading] = useState(false);
    const [feedBackData, setFeedBackData] = useState([]);
    const [isRestricted, setIsRestricted] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [currentFeedbackview, setCurrentFeedbackview] = useState("initialFeedback");
    const t = useTranslations('FeedbackPage');

    const language = localStorage.getItem('language') || 'en';
    const router = useRouter();

    // Combine related state
    const [selectedPeriod, setSelectedPeriod] = useState({
        year: null,
        month: null
    });

    const [feedbackData, setFeedbackData] = useState({
        feedback: null,
        challengeFeedback: null,
        consolidatedFeedback: null,
        message: null
    });

    const currentYear = selectedCareer.weekData.yearsSinceJoined
    const currentMonth = selectedCareer.weekData.monthsSinceJoined
    const currentWeek = selectedCareer.weekData.weekNumber

    // Initialize selected period once when component mounts
    useEffect(() => {
        if (currentYear && currentMonth) {
            setSelectedPeriod({
                year: currentYear,
                month: currentMonth
            });
        }
        }, [currentYear, currentMonth]);

        const getFeedBacks = async () => {
            setIsLoading(true);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetFeedBackData(
                selectedCareer.career_group_id, 
                selectedPeriod.month, 
                selectedPeriod.year, 
                currentWeek, 
                token
            );
                if (response.status === 200) {
                    if (response.data.message) {
                        setFeedbackData(prev => ({ ...prev, message: response.data.message }));
                        setIsRestricted(false);
                    } else {
                        const { feedback, challengeFeedback, consolidatedFeedback } = response.data;
                        setFeedbackData({
                            feedback,
                            challengeFeedback,
                            consolidatedFeedback,
                            message: null
                        });
                        setIsRestricted(false);
                    }
                } else {
                    toast.error('Failed to fetch feedback data. Please try again later.');
                }
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    setIsRestricted(true);
                } else if (err.response && err.response.data && err.response.data.message) {
                    toast.error(`Error: ${err.response.data.message}`);
                } else {
                    toast.error('Failed to fetch feedback data. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };


        // Only fetch feedback when we have all required data
        useEffect(() => {
            if (selectedPeriod.year && selectedPeriod.month && selectedCareer) {
                getFeedBacks();
            }
        }, [selectedPeriod.year, selectedPeriod.month, selectedCareer]);

        const years = useMemo(() => 
            Array.from({ length: currentYear }, (_, i) => i + 1),
            [currentYear]
        );
        
        const months = useMemo(() => 
            Array.from({ length: currentMonth }, (_, i) => i + 1),
            [currentMonth]
        );
    
        const handleYearChange = (year) => {
            setSelectedPeriod(prev => ({ ...prev, year: parseInt(year) }));
        };
    
        const handleMonthChange = (month) => {
            setSelectedPeriod(prev => ({ ...prev, month: parseInt(month) }));
        };

    if (isLoading) {
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

    if (isRestricted) {
        return (
            <div className="bg-gray-900 p-4 sm:p-10 rounded-lg">
                <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 px-3 sm:px-4">
                    <div className="bg-gray-800 rounded-full p-3 sm:p-4 mb-4 sm:mb-6">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">
                        {t('careerFeedback')}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 max-w-md">
                        Unlock personalized career feedback and insights with our Pro plan. Get detailed analysis and recommendations for your career path.
                    </p>
                    <button
                        onClick={() => setShowPricing(true)}
                        className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                    >
                        View Pro Features
                    </button>
                </div>
                {showPricing && (
                    <PricingCard onClose={() => setShowPricing(false)} />
                )}
            </div>
        );
    }
    
    return (
        <FeatureGuideWrapper featureKey="feedback">
            <div className="bg-gray-900 p-4 sm:p-10 rounded-lg space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
                    <div>
                        {currentFeedbackview === "initialFeedback" ? (
                            <button
                            onClick={() => setCurrentFeedbackview("monthlyFeedback")}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                            >
                            View Monthly Feedback
                            </button>
                        ) : (
                            <button
                            onClick={() => setCurrentFeedbackview("initialFeedback")}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                            >
                            View Initial Feedback
                            </button>
                        )}
                    </div>
    
                    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-5 ${currentFeedbackview === "initialFeedback" ? "hidden" : ""}`}>
                        <Select 
                            defaultValue={selectedPeriod.year?.toString()} 
                            onValueChange={handleYearChange}
                        >
                            <SelectTrigger className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg w-full sm:w-32 text-sm sm:text-base">
                                <div className="flex items-center justify-between w-full">
                                    <SelectValue placeholder="Select Year" />
                                    <ChevronDown size={18} />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem 
                                        key={year} 
                                        value={year.toString()}
                                        className="cursor-pointer text-sm sm:text-base"
                                    >
                                        YEAR-{year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
    
                        <Select 
                            defaultValue={selectedPeriod.month?.toString()} 
                            onValueChange={handleMonthChange}
                        >
                            <SelectTrigger className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg w-full sm:w-32 text-sm sm:text-base">
                                <div className="flex items-center justify-between w-full">
                                    <SelectValue placeholder="Select Month" />
                                    <ChevronDown size={18} />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem 
                                        key={month} 
                                        value={month.toString()}
                                        className="cursor-pointer text-sm sm:text-base"
                                    >
                                        Month-{month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
    
                {
                    currentFeedbackview === "initialFeedback" ? (
                    <InitialFeedback selectedCareer={selectedCareer}/>
                    ):
                    (
                        feedbackData.message ? (
                        <div className="bg-gray-900 p-4 sm:p-10 rounded-lg">
                        <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 px-3 sm:px-4">
                          <div className="bg-gray-800 rounded-full p-3 sm:p-4 mb-4 sm:mb-6">
                            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">Monthly Feedback</h2>
                          <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 max-w-md">
                            {feedbackData.message}
                          </p>
                        </div>
                      </div>
                        ):(
                            <>
                                {/* Header Section */}
                                <div className="text-center mb-5 sm:mb-8">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Monthly Feedback Report</h1>
                                    <p className="text-sm sm:text-base text-gray-400">Your detailed performance analysis and feedback</p>
                                </div>
    
                                {/* Consolidated Feedback Card */}
                                <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
                                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Overall Progress</h2>
                                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{feedbackData.consolidatedFeedback}</p>
                                    </div>
                                    </div>
                                </div>
    
                                {/* Subject Feedback Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {feedbackData.feedback?.map((subject, index) => (
                                    <div 
                                        key={index}
                                        className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700 transition-all hover:border-gray-600"
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg">
                                            <Book className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2 sm:gap-0">
                                            <h3 className="text-base sm:text-lg font-semibold text-white">{subject.subject}</h3>
                                            <div className="flex items-center gap-1">
                                                {[...Array(8)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                                    i < subject.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                                                    }`}
                                                />
                                                ))}
                                            </div>
                                            </div>
                                            <p className="text-xs sm:text-sm md:text-base text-gray-300">{subject.feedback}</p>
                                        </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
    
                                {/* Challenge Feedback Card */}
                                <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
                                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Challenge Progress</h2>
                                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{feedbackData.challengeFeedback}</p>
                                    </div>
                                    </div>
                                </div>
                            </>
                        )
                    )
                }
            </div>
        </FeatureGuideWrapper>
    );
}

export default Feedback;

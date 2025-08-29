import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import PricingCard from '@/app/_components/PricingCard';
import { Lock, MessageSquare } from 'lucide-react';

function InitialFeedback({ selectedCareer }) {
    const [isLoading, setIsLoading] = useState(false);
    const [feedBackData, setFeedBackData] = useState([]);
    const [isRestricted, setIsRestricted] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const t = useTranslations('FeedbackPage');

    const language = localStorage.getItem('language') || 'en';
    const router = useRouter();

    useEffect(() => {
        const getFeedBacks = async () => {
            setIsLoading(true);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetInitialFeedBack(selectedCareer.scope_grp_id, token, language);
                if (response.status === 200) {
                    const feedback = response.data.feedback;
                    const parsedFeedback = typeof feedback === 'string' ? feedback : JSON.parse(feedback);
                    console.log(parsedFeedback);
                    setFeedBackData(parsedFeedback);
                    setIsRestricted(false);
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

        getFeedBacks();
    }, [selectedCareer]);

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
            <div>
                <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 px-3 sm:px-4">
                    <div className="bg-gray-800 rounded-full p-3 sm:p-4 mb-4 sm:mb-6">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">
                        {t('careerFeedback')}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 max-w-md">
                        Unlock personalized career feedback and insights with our Pro plan. Get detailed analysis and recommendations for your career path.
                    </p>
                    <button
                        onClick={() => setShowPricing(true)}
                        className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-orange-500/20"
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
        <div className="space-y-6">
            {feedBackData ? (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 shadow-xl">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-orange-500/10 rounded-lg">
                            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                                {t('careerFeedback')}
                            </h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line">
                                    {feedBackData}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 px-3 sm:px-4">
                    <div className="bg-gray-800/50 rounded-full p-3 sm:p-4 mb-4 sm:mb-6">
                        <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">
                        No Feedback Available
                    </h2>
                    <p className="text-sm sm:text-base text-gray-400 max-w-md">
                        {t('noFeedbackAvailable')}.
                    </p>
                </div>
            )}
        </div>
    );
}

export default InitialFeedback;
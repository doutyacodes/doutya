import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import ContentGenerationLoading from '@/app/_components/ContentGenerationLoading';
import FeatureGuideWrapper from '@/app/_components/FeatureGuideWrapper';

export default function Challenge({ selectedCareer }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [challenges, setChallenges] = useState([]);
    const [files, setFiles] = useState({});
    const [fileNames, setFileNames] = useState({});
    const [submitting, setSubmitting] = useState({}); // Track submitting state for each challenge
    const [activeTab, setActiveTab] = useState('weekly');
    const [lastSubmittedChallenge, setLastSubmittedChallenge] = useState(null); // Track last submitted challenge
    const [fetching, setFetching] = useState(false); // Track fetching state for loading spinner
    const [currentWeek, setCurrentWeek] = useState(null); // Initialize null
    const [showWaitMessage, setShowWaitMessage] = useState(false); 

    const t = useTranslations('ChallengePage');

    const language = localStorage.getItem('language') || 'en';

    // Authenticate the use
    useEffect(() => {
        const authCheck = () => {
            if (!token) {
                router.push('/login');
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
        };
        authCheck();
    }, [router, token]);

    // Fetch weekly challenges and last submitted challenge for weekly tab
    const fetchWeeklyChallenges = async () => {
        console.log('fetching')
        setFetching(true);
        try {
            const response = await GlobalApi.getChallenges(selectedCareer.scope_grp_id, token, language);
            setChallenges(response.data.challenges);

            // Fetch the last submitted challenge for the current user
            const lastSubmissionResponse = await GlobalApi.getLastSubmittedChallenge(selectedCareer.scope_grp_id,token);
            setLastSubmittedChallenge(lastSubmissionResponse.data.lastSubmittedChallenge);

            const lastChallenge = lastSubmissionResponse.data.lastSubmittedChallenge;
            console.log(lastChallenge)
            // Logic to determine the current week based on submission and 7-day delay
            if (lastChallenge ) {
                
                const lastSubmittedWeek = lastChallenge.week;
                const submissionDate = new Date(lastChallenge.created_at);
                const currentDate = new Date();
                const diffTime = Math.abs(currentDate - submissionDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log(diffDays)
                if (diffDays >= 7) {
                    setCurrentWeek(lastSubmittedWeek + 1);
                    setShowWaitMessage(false);
                } else {
                    setCurrentWeek(lastSubmittedWeek);
                    setShowWaitMessage(true);
                }
            } else {
                setCurrentWeek(1); // Default to week 1 if no submission exists
                setShowWaitMessage(false);
            }
        } catch (error) {
            console.error('Error fetching weekly challenges:', error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (lastSubmittedChallenge) {
            console.log(lastSubmittedChallenge); // Log after it has been updated
        }
    }, [lastSubmittedChallenge]);

    // Fetch challenges by status using getChallengesStatus API
    const fetchChallengesByStatus = async (status) => {
        setFetching(true);
        try {
            const response = await GlobalApi.getChallengesByStatus(status, selectedCareer.scope_grp_id,token);
            setChallenges(response.data.challenges); // Update challenges based on status
        } catch (error) {
            console.error(`Error fetching ${status} challenges:`, error);
        } finally {
            setFetching(false);
        }
    };

    // useEffect(() => {
    //     if (activeTab === 'weekly' && selectedCareer && token) {
    //         fetchWeeklyChallenges(); // Fetch challenges only when all required dependencies are available
    //     }
    // }, [activeTab, selectedCareer, token]); // Ensure selectedCareer and token are valid dependencies
    
    // Fetch data based on the active tab
    useEffect(() => {
        if (activeTab === 'weekly') {
            fetchWeeklyChallenges(); // Fetch weekly challenges when 'weekly' tab is active
        } else if (activeTab === 'pending') {
            fetchChallengesByStatus('pending'); // Fetch pending challenges using the API
        } else if (activeTab === 'rejected') {
            fetchChallengesByStatus('rejected'); // Fetch rejected challenges using the API
        }
    }, [activeTab]);

    const handleFileChange = (event, week) => {
        const selectedFile = event.target.files[0];
        setFiles((prevFiles) => ({
            ...prevFiles,
            [week]: selectedFile,
        }));
        setFileNames((prevFileNames) => ({
            ...prevFileNames,
            [week]: selectedFile ? selectedFile.name : 'No file chosen',
        }));
    };

    // Handle challenge submission
    const handleSubmit = async (week, challengeId) => {
        const file = files[week];
        if (!file) {
            toast.error(t('pleaseSelectFile'));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('week', week);
        formData.append('id', challengeId);

        setSubmitting((prevSubmitting) => ({
            ...prevSubmitting,
            [challengeId]: true,
        }));

        try {
            const response = await GlobalApi.submitChallenge(formData, token);
            if (response.status === 200) {
                toast.success(t('challengeSubmittedSuccess'));

                // Remove the submitted challenge from the state
                setChallenges((prevChallenges) =>
                    prevChallenges.filter((challenge) => challenge.week !== week)
                );

                // Fetch updated challenge progress
                const updatedProgress = await GlobalApi.getLastSubmittedChallenge(selectedCareer.scope_grp_id, token);
                setLastSubmittedChallenge(updatedProgress.data.lastSubmittedChallenge);

                // Update currentWeek for the next challenge
                const submissionDate = new Date(updatedProgress.data.lastSubmittedChallenge.created_at);
                const diffTime = Math.abs(new Date() - submissionDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 7) {
                    setCurrentWeek(updatedProgress.data.lastSubmittedChallenge.week + 1);
                    setShowWaitMessage(false);
                } else {
                    setCurrentWeek(updatedProgress.data.lastSubmittedChallenge.week);
                    setShowWaitMessage(true);
                }
            } else {
                toast.error(t('failedToSubmitChallenge'));
            }
        } catch (error) {
            console.error('Error submitting challenge:', error);
            toast.error(t('errorSubmittingChallenge'));
        } finally {
            setSubmitting((prevSubmitting) => ({
                ...prevSubmitting,
                [challengeId]: false,
            }));
        }
    };

    const renderChallenges = () => {        
        if (activeTab === 'weekly') {
            return challenges
                .filter((challenge) => challenge.week === currentWeek )
                .map((challenge, index) => (
                    <div key={index} className="group relative cursor-pointer">
                        {/* Modern Card Design */}
                        <div className="relative overflow-hidden rounded-2xl transition-all duration-300 group-hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-700/10 to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative backdrop-blur-sm border-2 rounded-2xl p-6 shadow-xl transition-all duration-300 min-h-[200px] bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-blue-500/40 hover:border-blue-400/60 shadow-blue-500/20">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                            {t('week')} {challenge.week}
                                        </span>
                                    </div>
                                    <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500">
                                        Active
                                    </div>
                                </div>

                                {/* Challenge Content */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-white mb-3 leading-tight">
                                        {challenge.challenge}
                                    </h3>
                                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                        <strong>{t('verification')}:</strong> {challenge.verification}
                                    </p>
                                </div>

                                {/* Upload Section */}
                                <div className="space-y-3">
                                    <label className="group/upload relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:scale-105">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span>{t('uploadImage')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, challenge.week)}
                                            className="hidden"
                                        />
                                    </label>
                                    
                                    {fileNames[challenge.week] && (
                                        <p className="text-center text-sm text-gray-300 bg-gray-800/50 rounded-lg py-2 px-3">
                                            📎 {fileNames[challenge.week]}
                                        </p>
                                    )}
                                    
                                    <button
                                        onClick={() => handleSubmit(challenge.week, challenge.id)}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        disabled={submitting[challenge.id]}
                                    >
                                        {submitting[challenge.id] ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                {t('submitting')}
                                            </div>
                                        ) : (
                                            t('submit')
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ));
        } else if (activeTab === 'pending') {
            return challenges.map((challenge, index) => (
                <div key={index} className="group relative">
                    <div className="relative overflow-hidden rounded-2xl transition-all duration-300">
                        <div className="relative backdrop-blur-sm border-2 rounded-2xl p-6 shadow-xl min-h-[160px] bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border-yellow-500/40 shadow-yellow-500/20">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                        {t('week')} {challenge.week}
                                    </span>
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500">
                                    Under Review
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                                    {challenge.challenge}
                                </h3>
                                <p className="text-gray-300 text-sm mb-3">
                                    <strong>{t('verification')}:</strong> {challenge.verification}
                                </p>
                                <p className="text-orange-200 font-medium text-sm bg-orange-500/20 rounded-lg p-3">
                                    ⏳ This challenge is currently under verification by our team
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ));
        } else if (activeTab === 'rejected') {
            return challenges.map((challenge, index) => (
                <div key={index} className="group relative">
                    <div className="relative overflow-hidden rounded-2xl transition-all duration-300">
                        <div className="relative backdrop-blur-sm border-2 rounded-2xl p-6 shadow-xl min-h-[160px] bg-gradient-to-br from-red-600/30 to-pink-600/30 border-red-500/40 shadow-red-500/20">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                        {t('week')} {challenge.week}
                                    </span>
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500">
                                    Rejected
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                                    {challenge.challenge}
                                </h3>
                                <p className="text-gray-300 text-sm mb-3">
                                    <strong>{t('verification')}:</strong> {challenge.verification}
                                </p>
                                <p className="text-red-200 font-medium text-sm bg-red-500/20 rounded-lg p-3">
                                    ❌ This submission was rejected. Please review and resubmit.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ));
        }
    };

    return (
        <FeatureGuideWrapper featureKey="challenges">
            <div className="w-full mx-auto">
                <Toaster />

                {/* Loading Modal */}
                <ContentGenerationLoading
                    isOpen={fetching}
                    onClose={() => setFetching(false)}
                    page="challenges"
                    showDelay={1000}
                />

                {/* Main Container */}
                <div className="w-full bg-gray-900 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                        <div className="grid grid-cols-3 gap-4 w-full">
                            <button
                                onClick={() => setActiveTab('weekly')}
                                className={`px-4 py-2 rounded transition-colors duration-300 ${
                                    activeTab === 'weekly'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                }`}
                            >
                                <span className="uppercase text-sm">{t('weeklyChallenges')}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-4 py-2 rounded transition-colors duration-300 ${
                                    activeTab === 'pending'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                }`}
                            >
                                <span className="uppercase text-sm">{t('pendingChallenges')}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('rejected')}
                                className={`px-4 py-2 rounded transition-colors duration-300 ${
                                    activeTab === 'rejected'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                }`}
                            >
                                <span className="uppercase text-sm">{t('rejectedChallenges')}</span>
                            </button>
                        </div>
                    </div>

                    {currentWeek && (
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-white text-xl">WEEK - {currentWeek}/52 CHALLENGES</h2>
                        </div>
                    )}

                    {fetching ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">⏳</div>
                            <p className="text-gray-400 text-lg">{t('loadingChallenges')}</p>
                        </div>
                    ) : challenges.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {renderChallenges()}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🎯</div>
                            <p className="text-gray-400 text-lg">{t('noChallengesAvailable')}</p>
                            <p className="text-gray-500 text-sm mt-2">Check back later for new challenges</p>
                        </div>
                    )}

                    {activeTab === 'weekly' && showWaitMessage && (
                        <div className="mt-6 text-center">
                            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4">
                                <p className="text-yellow-200 font-medium">⏰ {t('waitForNextWeek')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FeatureGuideWrapper>

    );
}

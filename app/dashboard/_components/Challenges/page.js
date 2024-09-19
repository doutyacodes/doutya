import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';

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
    const [showWaitMessage, setShowWaitMessage] = useState(false); // Track if the "Wait for the next week" message should be shown

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
            const response = await GlobalApi.getChallenges(selectedCareer.career_group_id, token);
            console.log(response)
            setChallenges(response.data.challenges);

            // Fetch the last submitted challenge for the current user
            const lastSubmissionResponse = await GlobalApi.getLastSubmittedChallenge(token);
            console.log('lasttt',lastSubmissionResponse)
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
            const response = await GlobalApi.getChallengesByStatus(status, token);
            setChallenges(response.data.challenges); // Update challenges based on status
        } catch (error) {
            console.error(`Error fetching ${status} challenges:`, error);
        } finally {
            setFetching(false);
        }
    };

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
            toast.error('Please select a file before submitting.');
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
                toast.success('Challenge submitted successfully');

                // Remove the submitted challenge from the state
                setChallenges((prevChallenges) =>
                    prevChallenges.filter((challenge) => challenge.week !== week)
                );

                // Fetch updated challenge progress
                const updatedProgress = await GlobalApi.getLastSubmittedChallenge(token);
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
                toast.error('Failed to submit the challenge');
            }
        } catch (error) {
            console.error('Error submitting challenge:', error);
            toast.error('An error occurred while submitting the challenge.');
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
                    <li key={index} className="border p-4 rounded bg-yellow-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Week {challenge.week}</h3>
                            <p><strong>Challenge:</strong> {challenge.challenge}</p>
                            <p><strong>Verification:</strong> {challenge.verification}</p>
                        </div>
                        <div className="flex flex-col">
                            <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer mb-2">
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, challenge.week)}
                                    className="hidden"
                                />
                            </label>
                            <button
                                onClick={() => handleSubmit(challenge.week, challenge.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                disabled={submitting[challenge.id]}
                            >
                                {submitting[challenge.id] ? 'Submitting...' : 'Submit'}
                            </button>
                            <p className="mt-2 text-sm text-gray-600">
                                {fileNames[challenge.week] || 'No file chosen'}
                            </p>
                        </div>
                    </li>
                ));
        } else if (activeTab === 'pending') {
            return challenges.map((challenge, index) => (
                <li key={index} className="border p-4 rounded bg-yellow-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Week {challenge.week}</h3>
                        <p><strong>Challenge:</strong> {challenge.challenge}</p>
                        <p><strong>Verification:</strong> {challenge.verification}</p>
                    </div>
                </li>
            ));
        } else if (activeTab === 'rejected') {
            return challenges.map((challenge, index) => (
                <li key={index} className="border p-4 rounded bg-yellow-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Week {challenge.week}</h3>
                        <p><strong>Challenge:</strong> {challenge.challenge}</p>
                        <p><strong>Verification:</strong> {challenge.verification}</p>
                    </div>
                </li>
            ));
        }
    };

    return (
        <div className="bg-white mb-6 p-4 text-black">
            <Toaster />
            <div className="flex gap-1 pl-2 pr-2">
                <button
                    className={`bg-purple-400 text-black font-bold py-2 px-4 w-1/3 ${activeTab === 'weekly' ? 'bg-purple-700' : ''}`}
                    onClick={() => setActiveTab('weekly')}
                >
                    Weekly Challenges
                </button>
                <button
                    className={`bg-red-400 text-black font-bold py-2 px-4 w-1/3 ${activeTab === 'pending' ? 'bg-red-700' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Challenges
                </button>
                <button
                    className={`bg-blue-400 text-black font-bold py-2 px-4 w-1/3 ${activeTab === 'rejected' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveTab('rejected')}
                >
                    Rejected Challenges
                </button>
            </div>
            <br />
            {fetching ? (
                <p>Loading challenges...</p>
            ) : challenges.length > 0 ? (
                <ul className="space-y-4">
                    {renderChallenges()}
                    {activeTab === 'weekly' && showWaitMessage && <p>Wait for the next week!</p>}
                </ul>
            ) : (
                <p>No challenges available.</p>
            )}
        </div>
    );
}

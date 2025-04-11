"use client"
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { CalendarIcon, ChatBubbleLeftRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PaymentSuccessModal from '@/app/_components/modals/PaymentSuccessModal';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

export default function MentorBookingPage() {
  const router = useRouter();
  // const { mentorId, tabIndex = '0' } = router.query;
  const params = useParams(); // For dynamic route params
  const searchParams = useSearchParams(); // For query params

  const mentorId = params.mentorId; // from the dynamic segment
  const tabIndex = searchParams.get('tabIndex') || '0'; // from the query string

  // const [activeTab, setActiveTab] = useState(parseInt(tabIndex) || 0);
  const [activeTab, setActiveTab] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [mentor, setMentor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [timeToNextBooking, setTimeToNextBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingType, setBookingType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch mentor data
  useEffect(() => {
    if (!mentorId) return;
    
    const fetchMentorData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/mentors/mentor/${mentorId}/get-mentor`, {
          method: 'GET', // optional, defaults to GET
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch mentor data');
        
        const data = await response.json();
        setMentor(data);
        
        // Check daily question limit for this mentor
        const limitResponse = await fetch(`/api/mentors/questions/daily-limit?mentorId=${mentorId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const limitData = await limitResponse.json();
        
        if (limitData.limitReached) {
          setDailyLimitReached(true);
          setTimeToNextBooking(limitData.resetTime);
        }
        
        // Fetch availability slots
        // const slotsResponse = await fetch(`/api/mentors/mentor/${mentorId}/availability-slots`);
        const slotsResponse = await fetch(`/api/mentors/mentor/${mentorId}/availability-slots`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const slotsData = await slotsResponse.json();
        setAvailableSlots(slotsData.slots);
      } catch (error) {
        console.error('Error loading mentor data:', error);
        setErrorMessage('Failed to load mentor data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentorData();
  }, [mentorId]);

  // Update tab when tabIndex changes in URL
  useEffect(() => {
    if (router.isReady && tabIndex) {
      setActiveTab(parseInt(tabIndex) || 0);
    }
  }, [router.isReady, tabIndex]);


  useEffect(() => {
    const indexFromUrl = parseInt(searchParams.get('tabIndex')) || 0;
    setActiveTab(indexFromUrl);
  }, [searchParams]);

  const handleTabChange = (index) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('tabIndex', index);
    router.push(`?${params.toString()}`);
  };

  const bookQuestionPackage = async () => {
    if (dailyLimitReached) return;
    
    setIsLoading(true);
    try {
      // const response = await fetch('/api/mentors/questions/book-package', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ mentorId })
      // });
      const response = await fetch('/api/mentors/questions/book-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mentorId })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book question package');
      }
      
      setBookingType('questions');
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error booking question package:', error);
      setErrorMessage(error.message || 'Failed to book questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const bookOneOnOneSession = async () => {
    if (!selectedSlot) {
      setErrorMessage('Please select a time slot first');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/mentors/sessions/book-one-on-one', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({ 
          mentorId,
          slotId: selectedSlot
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book session');
      }
      
      setBookingType('session');
      setShowPaymentModal(true);
      
      // Refresh slots after booking
      // const slotsResponse = await fetch(`/api/mentors/mentor/${mentorId}/availability-slots`);
      const slotsResponse = await fetch(`/api/mentors/mentor/${mentorId}/availability-slots`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const slotsData = await slotsResponse.json();
      setAvailableSlots(slotsData.slots);
    } catch (error) {
      console.error('Error booking one-on-one session:', error);
      setErrorMessage(error.message || 'Failed to book session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    // Refresh data after booking
    router.refresh();
  };

  if (isLoading || !mentor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.push(`/mentors/profile/${mentorId}`)}
            className="text-blue-400 hover:text-blue-300 flex items-center mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Mentor Profile
          </button>
          <h1 className="text-3xl font-bold">Book a Session with {mentor.full_name}</h1>
          <p className="text-gray-400 mt-2">{mentor.profession} • {mentor.experience_years} years of experience</p>
        </div>

        {errorMessage && (
          <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-md mb-6 flex justify-between items-center">
            <p>{errorMessage}</p>
            <button onClick={() => setErrorMessage('')} className="text-white">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
          <Tab.List className="flex rounded-xl bg-gray-800 p-1.5 mb-8">
            <Tab 
              className={({ selected }) =>
                `w-full py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selected 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              <div className="flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Book 5 Questions Package
              </div>
            </Tab>
            <Tab 
              className={({ selected }) =>
                `w-full py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selected 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              <div className="flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Book One-on-One Session
              </div>
            </Tab>
          </Tab.List>
          
          <Tab.Panels className="bg-gray-800 rounded-xl p-6 shadow-lg">
            {/* 5 Questions Package Panel */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-lg p-5">
                  <h2 className="text-xl font-semibold mb-4">5 Questions Package</h2>
                  <p className="text-gray-300 mb-4">
                    Get personalized answers to your specific career questions directly from {mentor.full_name}. This package allows you to ask up to 5 questions about your career path, industry insights, or professional development.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Ask up to 5 detailed questions about your career</p>
                    </div>
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Get thoughtful, personalized responses from an experienced professional</p>
                    </div>
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Responses typically within 48 hours</p>
                    </div>
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Valid for 30 days from purchase</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-t border-gray-700">
                    <div>
                      <p className="text-xl font-bold">₹{mentor.question_price} <span className="text-gray-400 text-sm font-normal">per package</span></p>
                    </div>
                    
                    {dailyLimitReached ? (
                      <div className="text-right">
                        <button disabled className="bg-gray-700 text-gray-400 px-5 py-2 rounded-lg cursor-not-allowed">
                          Daily Limit Reached
                        </button>
                        <p className="text-sm text-gray-400 mt-1">
                          Try again in {timeToNextBooking}
                        </p>
                      </div>
                    ) : (
                      <button 
                        onClick={bookQuestionPackage} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition duration-200"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Tab.Panel>
            
            {/* One-on-One Session Panel */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-lg p-5">
                  <h2 className="text-xl font-semibold mb-4">One-on-One Session</h2>
                  <p className="text-gray-300 mb-4">
                    Schedule a private, real-time session with {mentor.full_name} to discuss your career goals, challenges, and receive personalized guidance. Each session lasts {mentor.slot_duration_minutes || 60} minutes.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Live, one-on-one conversation with an industry expert</p>
                    </div>
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Ask unlimited questions during your session</p>
                    </div>
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Get immediate feedback on your career questions</p>
                    </div>
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">Access to chat history after the session</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-t border-gray-700 mb-6">
                    <div>
                      <p className="text-xl font-bold">₹{mentor.one_on_one_session_price} <span className="text-gray-400 text-sm font-normal">per session</span></p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4">Available Time Slots</h3>
                  
                  {availableSlots.length === 0 ? (
                    <p className="text-gray-400 py-4 text-center">No available slots at the moment. Please check back later.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.slot_id}
                          onClick={() => slot.is_booked ? null : setSelectedSlot(slot.slot_id)}
                          disabled={slot.is_booked}
                          className={`p-3 rounded-lg text-left transition-all duration-200 ${
                            selectedSlot === slot.slot_id
                              ? 'bg-blue-700 border-2 border-blue-500'
                              : slot.is_booked
                                ? 'bg-gray-700 cursor-not-allowed opacity-60'
                                : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <p className="font-medium">{getDayName(slot.day_of_week)}</p>
                          <p className="text-gray-300">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </p>
                          {slot.is_booked && (
                            <div className="mt-1 inline-flex items-center text-sm text-gray-400">
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Already booked
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={bookOneOnOneSession} 
                      disabled={!selectedSlot || availableSlots.length === 0}
                      className={`font-medium px-5 py-2 rounded-lg transition duration-200 ${
                        !selectedSlot || availableSlots.length === 0 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Book Selected Slot
                    </button>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      
      {/* Payment Success Modal */}
      {showPaymentModal && (
        <PaymentSuccessModal
          isOpen={showPaymentModal}
          onClose={handleCloseModal}
          bookingType={bookingType}
          mentorName={mentor.full_name}
          selectedSlot={bookingType === 'session' && selectedSlot ? 
            availableSlots.find(slot => slot.slot_id === selectedSlot) : null}
        />
      )}
    </div>
  );
}
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow, parseISO, differenceInSeconds } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Lock, Send, CheckCheck } from "lucide-react";

export default function MentorChatPage() {
  const { mentorId } = useParams();
  const searchParams = useSearchParams();
  const initialTabIndex = parseInt(searchParams.get("tabIndex") || "0");
  
  const [activeTab, setActiveTab] = useState(initialTabIndex);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 5-Question Session States
  const [questionSession, setQuestionSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  
  // One-on-One Session States
  const [oneOnOneSession, setOneOnOneSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [remainingTime, setRemainingTime] = useState(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatEndRef = useRef(null);

  const router = useRouter();

  const params = useParams();
  const careerGroupId = params.careerGroupId;


  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


  // Fetch mentor details and session data
  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        
        // Fetch mentor profile
        // const mentorRes = await fetch(`/api/mentors/mentor/${mentorId}/get-mentor`);
        const mentorRes = await fetch(`/api/mentors/mentor/${mentorId}/get-mentor`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
        if (!mentorRes.ok) throw new Error("Failed to fetch mentor details");
        const mentorData = await mentorRes.json();
        setMentor(mentorData);
        
        // Fetch question session data
        // const questionSessionRes = await fetch(`/api/mentors/questions/sessions/${mentorId}`);
        const questionSessionRes = await fetch(`/api/mentors/questions/sessions/${mentorId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        if (questionSessionRes.ok) {
          const questionSessionData = await questionSessionRes.json();
          setQuestionSession(questionSessionData.session);
          setQuestions(questionSessionData.questionsAndAnswers || []);
          setQuestionCount(questionSessionData.questionCount || 0);
        }
        
        // Fetch one-on-one session data
        // const oneOnOneRes = await fetch(`/api/mentors/sessions/one-on-one/${mentorId}`);
        const oneOnOneRes = await fetch(`/api/mentors/sessions/one-on-one/${mentorId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        if (oneOnOneRes.ok) {
          const oneOnOneData = await oneOnOneRes.json();
          setOneOnOneSession(oneOnOneData.session);
          setChatMessages(oneOnOneData.messages || []);
          
          // Set up timer if session is active
          if (oneOnOneData.session && oneOnOneData.session.session_status === "in_progress") {
            const endTime = parseISO(oneOnOneData.session.end_time);
            updateRemainingTime(endTime);
            
            const timer = setInterval(() => {
              updateRemainingTime(endTime);
            }, 1000);
            
            return () => clearInterval(timer);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchMentorData();
    
    // Set up polling for new messages
    const pollInterval = setInterval(() => {
      if (activeTab === 0) {
        fetchQuestionUpdates();
      } else {
        fetchChatUpdates();
      }
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [mentorId]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    if (activeTab === 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (activeTab === 1 && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [questions, chatMessages, activeTab]);

  const updateRemainingTime = (endTime) => {
    const secondsLeft = differenceInSeconds(endTime, new Date());
    
    if (secondsLeft <= 0) {
      setRemainingTime("Session ended");
      setOneOnOneSession(prev => ({...prev, session_status: "completed"}));
      return;
    }
    
    setRemainingTime(formatTime(secondsLeft));
    
    // Show warnings as time approaches end
    if (secondsLeft <= 10) {
      setShowTimeWarning("10 seconds remaining!");
    } else if (secondsLeft <= 60) {
      setShowTimeWarning("1 minute remaining!");
    } else if (secondsLeft <= 300) {
      setShowTimeWarning("5 minutes remaining!");
    } else {
      setShowTimeWarning(null);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchQuestionUpdates = async () => {
    if (!questionSession?.question_session_id) return;
    
    try {
    //   const res = await fetch(`/api/mentors/questions/sessions/${mentorId}/updates?lastUpdate=${new Date(questions[questions.length - 1]?.created_at || 0).toISOString()}`);

    const res = await fetch(
        `/api/mentors/questions/sessions/${mentorId}/updates?lastUpdate=${new Date(questions[questions.length - 1]?.created_at || 0).toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.updates && data.updates.length > 0) {
          setQuestions(prev => [...prev, ...data.updates]);
        }
      }
    } catch (error) {
      console.error("Error fetching question updates:", error);
    }
  };
  
  const fetchChatUpdates = async () => {
    if (!oneOnOneSession?.session_id || oneOnOneSession.session_status !== "in_progress") return;
    
    try {
    //   const res = await fetch(`/api/mentors/sessions/one-on-one/${mentorId}/messages?lastUpdate=${new Date(chatMessages[chatMessages.length - 1]?.sent_at || 0).toISOString()}`);

    const res = await fetch(
        `/api/mentors/sessions/one-on-one/${mentorId}/messages?lastUpdate=${new Date(chatMessages[chatMessages.length - 1]?.sent_at || 0).toISOString()}`,
        {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        }
    );
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setChatMessages(prev => [...prev, ...data.messages]);
          
          // Mark new messages as read if they're from mentor
          const unreadMessages = data.messages
            .filter(msg => msg.sender_type === "mentor" && !msg.is_read)
            .map(msg => msg.message_id);
            
          if (unreadMessages.length > 0) {
            fetch(`/api/mentors/sessions/one-on-one/${mentorId}/messages/read`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ messageIds: unreadMessages })
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching chat updates:", error);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !questionSession?.question_session_id || questionCount >= 5) return;
    
    try {
      const res = await fetch(`/api/mentors/questions/sessions/${mentorId}/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        body: JSON.stringify({ questionText: newQuestion })
      });
      
      if (res.ok) {
        const data = await res.json();
        setQuestions(prev => [...prev, data.question]);
        setNewQuestion("");
        setQuestionCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error sending question:", error);
    }
  };
  
  const handleSubmitChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !oneOnOneSession?.session_id || oneOnOneSession.session_status !== "in_progress") return;
    
    try {
      const res = await fetch(`/api/mentors/sessions/one-on-one/${mentorId}/messages/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        body: JSON.stringify({ messageText: newMessage })
      });
      
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
          <button onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
        {mentor && (
          <div className="flex items-center">
            <div className="relative h-10 w-10 mr-3">
              <Image 
                // src={mentor.profile_picture_url || "/default-avatar.png"} 
                src={"/default-avatar.png"}
                alt={mentor.full_name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-white font-semibold">{mentor.full_name}</h1>
              <p className="text-gray-400 text-sm">{mentor.profession}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex bg-gray-800 border-b border-gray-700">
        <button 
          className={`flex-1 py-3 text-center ${activeTab === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
          onClick={() => setActiveTab(0)}
        >
          5-Question Session
        </button>
        <button 
          className={`flex-1 py-3 text-center ${activeTab === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
          onClick={() => setActiveTab(1)}
        >
          One-on-One Session
        </button>
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {/* 5-Question Session Tab */}
        {activeTab === 0 && (
          <div className="h-full flex flex-col">
            {questionSession && questionSession.session_status === "active" && questionSession.payment_status === "paid" ? (
              <>
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                  {questions.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      <p>Ask your first question below. You can ask up to 5 questions per day.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((item, index) => {
                        const prevDate = index > 0 ? new Date(questions[index-1].created_at) : null;
                        const currentDate = new Date(item.created_at);
                        const showDateSeparator = prevDate && 
                          (currentDate.getDate() !== prevDate.getDate() || 
                           currentDate.getMonth() !== prevDate.getMonth() || 
                           currentDate.getFullYear() !== prevDate.getFullYear());
                        
                        return (
                          <div key={item.question_id || item.id || index}>
                            {showDateSeparator && (
                              <div className="flex justify-center my-4">
                                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            
                            {item.question_text && (
                              <div className="flex justify-end">
                                <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none max-w-[80%]">
                                  <p>{item.question_text}</p>
                                  <div className="text-blue-200 text-xs text-right mt-1">
                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {item.answer_text && (
                              <div className="flex mt-2">
                                <div className="relative h-8 w-8 mr-2">
                                  <Image 
                                    // src={mentor.profile_picture_url || "/default-avatar.png"} 
                                    src={"/default-avatar.png"}
                                    
                                    alt={mentor.full_name}
                                    fill
                                    className="rounded-full object-cover"
                                  />
                                </div>
                                <div className="bg-gray-800 text-white p-3 rounded-lg rounded-tl-none max-w-[80%]">
                                  <div className="text-xs text-gray-400 mb-1">
                                    In response to: "{item.question_text?.substring(0, 50)}..."
                                  </div>
                                  <p>{item.answer_text}</p>
                                  <div className="text-gray-400 text-xs text-right mt-1">
                                    {formatDistanceToNow(new Date(item.answer_created_at || item.created_at), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Input area */}
                <div className="bg-gray-800 p-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {questionCount}/5 questions used today
                    </span>
                  </div>
                  <form onSubmit={handleSubmitQuestion} className="flex items-center">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      disabled={questionCount >= 5}
                      placeholder={questionCount >= 5 ? "You've used all 5 questions today" : "Ask a question..."}
                      className="flex-1 bg-gray-700 text-white p-3 rounded-l-md focus:outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={!newQuestion.trim() || questionCount >= 5}
                      className={`bg-blue-600 text-white p-3 rounded-r-md focus:outline-none ${
                        !newQuestion.trim() || questionCount >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              // Locked state
              <div className="flex flex-col items-center justify-center h-full bg-gray-900 bg-opacity-80">
                <Lock className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-white text-xl font-semibold mb-2">5-Question Session Locked</h2>
                <p className="text-gray-400 text-center max-w-md mb-4">
                  Purchase a 5-question session to ask this mentor questions they can answer at their convenience.
                </p>
                <Link 
                  href={`/mentors/${careerGroupId}/${mentorId}/booking?tabIndex=0`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                >
                  Purchase Session
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* One-on-One Chat Tab */}
        {activeTab === 1 && (
          <div className="h-full flex flex-col">
            {oneOnOneSession && oneOnOneSession.session_status === "in_progress" && oneOnOneSession.payment_status === "paid" ? (
              <>
                {/* Timer bar */}
                <div className={`flex items-center justify-between px-4 py-2 ${showTimeWarning ? 'bg-red-900' : 'bg-gray-800'} border-b border-gray-700`}>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={`text-sm ${showTimeWarning ? 'text-red-300' : 'text-gray-300'}`}>
                      Remaining time: {remainingTime}
                    </span>
                  </div>
                  {showTimeWarning && (
                    <span className="text-red-300 text-sm font-medium animate-pulse">
                      {showTimeWarning}
                    </span>
                  )}
                </div>
                
                {/* Chat area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                  {chatMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      <p>Start chatting with your mentor. This is a live one-on-one session.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => {
                        const isMentor = message.sender_type === "mentor";
                        
                        return (
                          <div key={message.message_id || index} className={`flex ${isMentor ? '' : 'justify-end'}`}>
                            {isMentor && (
                              <div className="relative h-8 w-8 mr-2">
                                <Image 
                                //   src={mentor.profile_picture_url || "/default-avatar.png"} 
                                    src={"/default-avatar.png"} 
                                  alt={mentor.full_name}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                            )}
                            <div className={`p-3 rounded-lg max-w-[80%] ${
                              isMentor 
                                ? 'bg-gray-800 text-white rounded-tl-none' 
                                : 'bg-blue-600 text-white rounded-tr-none'
                            }`}>
                              <p>{message.message_text}</p>
                              <div className={`text-xs text-right mt-1 flex justify-end items-center ${
                                isMentor ? 'text-gray-400' : 'text-blue-200'
                              }`}>
                                {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}
                                {!isMentor && message.is_read && (
                                  <CheckCheck className="w-3 h-3 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Input area */}
                <div className="bg-gray-800 p-4 border-t border-gray-700">
                  <form onSubmit={handleSubmitChatMessage} className="flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={oneOnOneSession.session_status !== "in_progress"}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-700 text-white p-3 rounded-l-md focus:outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim() || oneOnOneSession.session_status !== "in_progress"}
                      className={`bg-blue-600 text-white p-3 rounded-r-md focus:outline-none ${
                        !newMessage.trim() || oneOnOneSession.session_status !== "in_progress" ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              // Locked state
              <div className="flex flex-col items-center justify-center h-full bg-gray-900 bg-opacity-80">
                <Lock className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-white text-xl font-semibold mb-2">One-on-One Session Locked</h2>
                <p className="text-gray-400 text-center max-w-md mb-4">
                  Book a one-on-one live chat session with this mentor to get personalized guidance.
                </p>
                <Link 
                  href={`/mentors/${careerGroupId}/${mentorId}/booking?tabIndex=1`}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
                >
                  Book Session
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
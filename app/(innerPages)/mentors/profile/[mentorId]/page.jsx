'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { 
  UserIcon, 
  StarIcon, 
  BadgeCheckIcon, 
  ClipboardListIcon, 
  MessageCircleIcon 
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MentorProfilePage({ params }) {
  const [mentor, setMentor] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerGroupId = searchParams.get('careerGroupId');

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        const response = await axios.get(`/api/mentors/profile/${params.mentorId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setMentor(response.data.mentor);
        setIsFollowed(response.data.mentor.is_followed);
        setLoading(false);
      } catch (err) {
        setError('Failed to load mentor profile');
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, [params.mentorId]);

  const handleFollowToggle = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      await axios.post(
        '/api/mentors/browse', 
        {  
          mentorId: params.mentorId,
          careerGroupId,
          action: isFollowed ? 'unfollow' : 'follow'
        }, 
        {  
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsFollowed(!isFollowed);
    } catch (err) {
      console.error('Failed to update follow status');
    }
  };

  const handleBookQuestions = () => {
    router.push(`/mentors/${params.mentorId}/booking?tabIndex=0`);
  };
  
  const handleBookOneOnOne = () => {
    router.push(`/mentors/${params.mentorId}/booking?tabIndex=1`);
  };

  if (loading) return <div className="text-white text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!mentor) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-green-600 opacity-70"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <Image 
              src={mentor.profile_picture || '/default-avatar.png'}
              alt={mentor.full_name}
              width={150}
              height={150}
              className="rounded-full border-4 border-white mx-auto"
            />
          </div>
        </div>

        {/* Mentor Details */}
        <div className="pt-20 px-6 pb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white">{mentor.full_name}</h1>
            <p className="text-gray-400">{mentor.profession} | {mentor.experience_years} Years Experience</p>
            
            {/* Follow Button */}
            <button 
              onClick={handleFollowToggle}
              className={`mt-4 px-6 py-2 rounded-full transition-all duration-300 ${
                isFollowed 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFollowed ? 'Unfollow' : 'Follow'}
            </button>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <UserIcon className="mr-2 text-blue-500" /> About Me
            </h2>
            <p className="text-gray-300">{mentor.bio}</p>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <StarIcon className="mr-2 text-green-500" /> Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300"
                >
                  {skill.skill_name} - {skill.proficiency_level}
                </span>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <BadgeCheckIcon className="mr-2 text-yellow-500" /> Highlights
            </h2>
            {mentor.highlights.map((highlight, index) => (
              <div 
                key={index} 
                className="bg-gray-700 rounded-lg p-4 mb-3"
              >
                <h3 className="font-bold text-white">{highlight.title}</h3>
                <p className="text-gray-400">{highlight.description}</p>
                <span className="text-sm text-gray-500">{highlight.date}</span>
              </div>
            ))}
          </div>

          {/* Pricing & Services */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <ClipboardListIcon className="mr-2 text-purple-500" /> Pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* 5 Questions Package */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">5 Questions Package</h3>
                <p className="text-gray-300 mb-4">Ask 5 detailed questions to the mentor</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-500">
                    {mentor.pricing.currency} {mentor.pricing.question_price}
                  </span>
                  <button 
                    onClick={handleBookQuestions}
                    // onClick={() => window.location.href = `/mentors/questions/${params.mentorId}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Buy Package
                  </button>
                </div>
              </div>

              {/* One-on-One Session */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">One-on-One Session</h3>
                <p className="text-gray-300 mb-4">Personal mentorship session</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-500">
                    {mentor.pricing.currency} {mentor.pricing.one_on_one_session_price}
                  </span>
                  <button 
                    onClick={handleBookOneOnOne}
                    // onClick={() => window.location.href = `/mentors/session/${params.mentorId}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
                  >
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold mb-3 flex items-center justify-center">
              <MessageCircleIcon className="mr-2 text-indigo-500" /> Contact
            </h2>
            <p className="text-gray-400">Contact Email: {mentor.contact_email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
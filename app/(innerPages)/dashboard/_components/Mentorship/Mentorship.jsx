import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

const BASE_IMAGE_URL = 'https://wowfy.in/doutya-api/photos/';

const Mentorship = ({ selectedCareer }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  console.log("selectedCareer", selectedCareer)

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await axios.get(`/api/mentors/${selectedCareer.scope_grp_id}/user-mentors`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        setMentors(response.data.mentors);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch mentors');
        setLoading(false);
      }
    };

    if (selectedCareer.scope_grp_id) {
      fetchMentors();
    }
  }, [selectedCareer.scope_grp_id]);

  // const handleAddMentors = () => {
  //   router.push(`/mentors/browse?careerGroupId=${selectedCareer.scope_grp_id}`);
  // };

  const handleAddMentors = () => {
    router.push(`/mentors/${selectedCareer.scope_grp_id}/browse`);
  };
  
  const handleMentorProfile = (mentorId) => {
    router.push(`/mentors/${selectedCareer.scope_grp_id}/profile/${mentorId}`);
  };

  const handleOneOnOneSessions = (mentorId) => {
    router.push(`/mentors/${selectedCareer.scope_grp_id}/${mentorId}/booking?tabIndex=1`);
  };
  
  const handleChat = (mentorId) => {
    router.push(`/mentors/${selectedCareer.scope_grp_id}/${mentorId}/chat`);
  };

  if (loading) {
    return <div className="text-white text-center">Loading mentors...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-bold">Mentors</h2>
        <button 
          onClick={handleAddMentors}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Mentors
        </button>
      </div>

      {mentors.length === 0 ? (
        <div className="text-center text-gray-400">
          <p>No mentors are currently linked to this career.</p>
          <button 
            onClick={handleAddMentors}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Browse and Add Mentors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((mentor) => (
            <div 
              key={mentor.mentor_id} 
              className="bg-gray-700 rounded-lg p-4 flex flex-col items-center"
            >
              <Image
                src={mentor.profile_picture_url 
                  ? `${BASE_IMAGE_URL}${mentor.profile_picture_url}` 
                  : '/default-avatar.png'}
                alt={mentor.full_name}
                width={100}
                height={100}
                className="rounded-full mb-3"
              />
              <h3 className="text-white font-bold text-lg">{mentor.full_name}</h3>
              <p className="text-gray-400">{mentor.profession}</p>
              <p className="text-gray-400 mb-3">{mentor.experience_years} years experience</p>
              
              <div className="flex w-full justify-between">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleMentorProfile(mentor.mentor_id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => handleOneOnOneSessions(mentor.mentor_id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                  >
                    Book Session
                  </button>
                </div>
                
                <button 
                  onClick={() => handleChat(mentor.mentor_id)}
                  className="bg-purple-600 text-white px-4 py-1 rounded-md hover:bg-purple-700 font-medium"
                >
                  Interactive Q&A
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mentorship;
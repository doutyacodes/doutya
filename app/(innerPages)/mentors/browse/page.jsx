"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  UserMinus 
} from 'lucide-react';

const BASE_IMAGE_URL = 'https://wowfy.in/doutya-api/photos/';


const MentorsBrowsePage = () => {
  const router = useRouter();
  const [mentors, setMentors] = useState([]);
  const [popularProfessions, setPopularProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const careerGroupId = searchParams.get('careerGroupId');

  // Filtering States
  const [selectedProfession, setSelectedProfession] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const fetchMentors = async (page = 1) => {
    setLoading(true);
    try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await axios.get('/api/mentors/browse', {
        headers: {
            Authorization: `Bearer ${token}`,
          },
        params: {
          profession: selectedProfession,
          search: searchQuery,
          page,
          limit: pagination.limit,
        }
      });

      setMentors(response.data.mentors);
      setPopularProfessions(response.data.popularProfessions);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch mentors');
      setLoading(false);
    }
  };

  console.log("mentors", mentors)

  useEffect(() => {
    fetchMentors();
  }, [selectedProfession, searchQuery]);

  const handleFollowToggle = async (mentorId, isFollowed) => {
    try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    await axios.post(
        '/api/mentors/browse', 
        {  // Data payload (body)
            mentorId,
            careerGroupId,
            action: isFollowed ? 'unfollow' : 'follow'
        }, 
        {  // Config object (headers)
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

      // Update local state
      setMentors(prev => 
        prev.map(mentor => 
          mentor.mentor_id === mentorId 
            ? { ...mentor, is_followed: !isFollowed } 
            : mentor
        )
      );
    } catch (err) {
      console.error('Failed to update follow status');
    }
  };

  const handleMentorProfile = (mentorId) => {
    router.push(`/mentors/profile/${mentorId}?careerGroupId=${careerGroupId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find Your Mentor</h1>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search mentors by name or profession"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          {/* Profession Filter */}
          <select 
            value={selectedProfession}
            onChange={(e) => setSelectedProfession(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Professions</option>
            {popularProfessions.map(prof => (
              <option key={prof} value={prof}>{prof}</option>
            ))}
          </select>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="text-center text-xl">Loading mentors...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : mentors.length === 0 ? (
          <div className="text-center text-gray-400">
            No mentors found. Try a different search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors?.map(mentor => (
              <div 
                key={mentor.mentor_id} 
                className="bg-gray-800 rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <Image
                    src={mentor.profile_picture_url 
                      ? `${BASE_IMAGE_URL}${mentor.profile_picture_url}` 
                      : '/default-avatar.png'}
                    alt={mentor.full_name}
                    width={80}
                    height={80}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{mentor.full_name}</h3>
                    <p className="text-gray-400">{mentor.profession}</p>
                  </div>
                </div>

                {/* ✅ Check if mentor.skills is an array */}
                <div className="mt-2 flex flex-wrap gap-2">
                {(Array.isArray(mentor.skills) ? mentor.skills.slice(0, 3) : [])
                    .map(skill => (
                    <span 
                        key={skill} 
                        className="bg-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                        {skill}
                    </span>
                ))}
                </div>

                <div className="flex justify-between">
                  <button 
                    onClick={() => handleMentorProfile(mentor.mentor_id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => handleFollowToggle(mentor.mentor_id, mentor.is_followed)}
                    className={`
                      px-4 py-2 rounded-md flex items-center gap-2 transition-colors
                      ${mentor.is_followed 
                        ? 'bg-gray-600 text-white hover:bg-gray-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                      }
                    `}
                  >
                    {mentor.is_followed ? (
                      <>
                        <UserMinus size={18} /> Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} /> Follow
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={() => fetchMentors(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="bg-gray-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              <ChevronLeft />
            </button>
            <span className="self-center">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button 
              onClick={() => fetchMentors(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="bg-gray-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsBrowsePage;
import React, { useState, useEffect } from 'react';
import { X, Newspaper, ExternalLink } from 'lucide-react';
import GlobalApi from '@/app/_services/GlobalApi';
import toast from 'react-hot-toast';


const CareerNews = ({ communityId, onClose }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);


  useEffect(() => {
    const fetchCareerNews = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        
        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const response = await GlobalApi.GetCareerNews(token, communityId);
        
        if (response.status === 200 && response.data) {
          setNewsItems(response.data.news);
        } else {
          toast.error("Failed to fetch career news");
        }
      } catch (error) {
        console.error("Error fetching career news:", error);
        toast.error("An error occurred while fetching news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCareerNews();
  }, [communityId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNextNews = () => {
    setCurrentNewsIndex((prev) => 
      prev < newsItems.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevNews = () => {
    setCurrentNewsIndex((prev) => 
      prev > 0 ? prev - 1 : prev
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        <Newspaper className="mx-auto mb-4 text-gray-400" size={36} />
        <p>No recent news available for this career.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center space-x-3 border-b border-gray-700 pb-4">
        <Newspaper className="text-blue-500" size={24} />
        <h2 className="text-xl font-bold text-white">Career News</h2>
      </div>

      <div className="space-y-6">
        {newsItems.map((news) => (
          <div 
            key={news.id} 
            className="bg-[#2a2b27] rounded-lg p-6 hover:bg-[#383939] transition-colors duration-300"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#F0394F] mb-2">
                {news.title}
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                {news.summary}
              </p>
              <div className="text-xs text-gray-500 mb-3">
                Published: {formatDate(news.published_at)}
              </div>
            </div>
            <a 
              href={news.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-400 hover:text-blue-500 transition"
            >
              Read Full Article 
              <ExternalLink className="ml-2" size={16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerNews;
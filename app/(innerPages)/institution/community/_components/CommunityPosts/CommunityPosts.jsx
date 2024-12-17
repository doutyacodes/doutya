import React from 'react';
import { Camera, User, VideoIcon, Type, Clock } from 'lucide-react';

// Mapping for user type badges
const USER_TYPE_STYLES = {
  SchoolAdmin: 'bg-blue-500 text-white',
  Admin: 'bg-red-500 text-white',
  ClassAdmin: 'bg-green-500 text-white',
  Student: 'bg-purple-500 text-white'
};

const CommunityPosts = ({ communityPosts }) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render different post types
  const renderPostContent = (post) => {
    const baseUrl = 'https://wowfy.in/testusr/images/';
    
    switch(post.type) {
      case 'Video':
        return (
          <video 
            controls 
            className="w-full rounded-lg mt-4"
            src={post.file_url ? `${baseUrl}${post.file_url}` : undefined}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'Image':
        return (
          <img 
            src={post.file_url ? `${baseUrl}${post.file_url}` : undefined} 
            alt="Post image" 
            className="w-full rounded-lg mt-4 object-cover max-h-[500px]"
          />
        );
      case 'Text':
        return (
          <p className="text-gray-700 mt-4">{post.text_content}</p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {communityPosts.map((post) => (
        <div 
          key={post.id} 
          className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* User Icon */}
              <div className="bg-gray-200 rounded-full p-2">
                <User className="text-gray-600" size={24} />
              </div>
              
              {/* User Details */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{post.user_name}</span>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs ${USER_TYPE_STYLES[post.posted_by_type] || 'bg-gray-200'}`}
                  >
                    {post.posted_by_type}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Post Date */}
            <div className="flex items-center text-gray-500 text-sm">
              <Clock size={16} className="mr-2" />
              {formatDate(post.created_at)}
            </div>
          </div>
          
          {/* Caption */}
          {post.caption && (
            <div className="text-gray-600 mb-4 italic">
              "{post.caption}"
            </div>
          )}
          
          {/* Post Content */}
          <div className="relative">
            {/* Type Icon */}
            <div className="absolute top-2 right-2 bg-white/70 rounded-full p-2">
              {post.type === 'Video' && <VideoIcon size={20} />}
              {post.type === 'Image' && <Camera size={20} />}
              {post.type === 'Text' && <Type size={20} />}
            </div>
            
            {renderPostContent(post)}
          </div>
          
          {/* Placeholder for future Interactions */}
          {/* <div className="mt-4 border-t pt-4 flex justify-between text-gray-500">
            <button className="hover:text-blue-500">
              Like
            </button>
            <button className="hover:text-green-500">
              Comment
            </button>
            <button className="hover:text-purple-500">
              Share
            </button>
          </div> */}
        </div>
      ))}
    </div>
  );
};

export default CommunityPosts;
import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

const CommunityCard = ({ community, onSelect }) => {
  return (
    <div className="bg-[#2a2b27] p-4 rounded-md shadow-md hover:scale-105 transition-all relative">
      <div className="absolute top-2 right-2">
        <span className={`
          py-1 px-3 text-white font-semibold text-[10px] rounded-full
          ${community.country ? 'bg-blue-500' : 'bg-red-500'}
        `}>
          {community.country || 'Global'}
        </span>
      </div>

      <h4 className="text-[#F0394F] font-bold mb-2">{community.career}</h4>
      
      <p className="text-xs text-white mb-4">
        {community.description || 'Traditional careers with established paths.'}
      </p>

      <div className="flex justify-between items-center">
        {community.already_in ? (
          <div className="text-xs text-white/70 border border-white/70 rounded-full px-3 py-2">
            Joined
          </div>
        ) : (
          <button className="text-xs text-white bg-[#f09566] rounded-full px-3 py-2">
            Join Now
          </button>
        )}

        <button 
          onClick={onSelect}
          className="bg-[#7824f6] text-white text-xs rounded-full px-3 py-2 flex items-center gap-2"
        >
          Go to Community
          <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
};

export default CommunityCard;
import React, { useState } from "react";
import {
  AiOutlineLike,
  AiOutlineComment,
  AiOutlineClose,
  AiOutlineFlag,
} from "react-icons/ai";
import { motion } from "framer-motion";

const Post = () => {
  const departmentPosts = [
    {
      id: 1,
      department: "Finance",
      title: "Quarterly Earnings Report",
      content: "Apple announces record-breaking earnings for the last quarter.",
      image:
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    },
    {
      id: 2,
      department: "Software",
      title: "New iOS Update",
      content: "iOS 16.2 released with new features and improvements.",
      image:
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    },
    {
      id: 3,
      department: "Marketing",
      title: "Product Launch Event",
      content: "Apple unveils the new MacBook lineup at its annual event.",
      image:
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    },
    {
      id: 4,
      department: "Human Resources",
      title: "Hiring Spree",
      content: "Apple announces plans to hire 10,000 new employees globally.",
      image:
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    },
  ];

  // State to manage likes, comments, comment input, modals visibility
  const [likes, setLikes] = useState(departmentPosts.map(() => false)); // false represents "unliked"
  const [comments, setComments] = useState(
    departmentPosts.map(() => [
      {
        name: "John Doe",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        comment: "Great report!",
      },
      {
        name: "Jane Smith",
        image: "https://randomuser.me/api/portraits/women/2.jpg",
        comment: "Looking forward to the new update!",
      },
      {
        name: "David Brown",
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        comment: "Can’t wait to see the new products.",
      },
    ])
  ); // Dummy comments for now
  const [commentInput, setCommentInput] = useState("");
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activePostIndex, setActivePostIndex] = useState(null);
  const [reportText, setReportText] = useState("");

  // Function to toggle like/unlike
  const toggleLike = (index) => {
    const newLikes = [...likes];
    newLikes[index] = !newLikes[index];
    setLikes(newLikes);
  };

  // Function to handle adding a comment
  const handleComment = () => {
    if (commentInput.trim()) {
      const newComments = [...comments];
      newComments[activePostIndex].push({
        name: "You",
        image: "https://randomuser.me/api/portraits/men/4.jpg",
        comment: commentInput,
      });
      setComments(newComments);
      setCommentInput("");
    }
  };

  // Function to handle reporting a post
  const handleReport = () => {
    alert(`Reported with reason: ${reportText}`);
    setIsReportModalOpen(false);
    setReportText("");
  };

  // Function to open comment modal
  const openCommentModal = (index) => {
    setActivePostIndex(index);
    setIsCommentModalOpen(true);
  };

  // Function to close comment modal
  const closeCommentModal = () => {
    setIsCommentModalOpen(false);
    setCommentInput("");
  };

  // Function to open report modal
  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  // Function to close report modal
  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportText("");
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#1f1f1b] rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Posts from Departments</h2>
      {departmentPosts.length > 0 ? (
        <div className="space-y-4">
          {departmentPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="p-4 bg-[#2a2b27] rounded-lg border border-gray-700 hover:bg-gray-800 transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-bold mb-2">{post.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{post.content}</p>
              <p className="text-sm text-gray-500">
                Department: {post.department}
              </p>
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto rounded-lg mt-4 mb-4"
              />

              {/* Icons Section (Like, Comment, Report) */}
              <div className="flex space-x-4 items-center">
                {/* Like Button */}
                <button
                  onClick={() => toggleLike(index)}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <AiOutlineLike className="mr-2" />
                  Like
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => openCommentModal(index)}
                  className="flex items-center text-green-500 hover:text-green-700"
                >
                  <AiOutlineComment className="mr-2" />
                  Comment
                </button>

                {/* Report Button */}
                <button
                  onClick={openReportModal}
                  className="flex items-center text-red-500 hover:text-red-700"
                >
                  <AiOutlineFlag className="mr-2" />
                  Report
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No posts available from departments.</p>
      )}

      {/* Comment Modal */}
{isCommentModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center w-full min-w-max">
    <motion.div
      className="bg-[#2a2b27] p-6 rounded-lg md:w-1/3 w-[90vw] mx-4 min-h-[80vh] max-h-[85vh] h-full flex flex-col justify-between"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Comments</h3>
          <button onClick={closeCommentModal} className="text-gray-400">
            <AiOutlineClose />
          </button>
        </div>

        {/* Displaying existing comments */}
        <div className="max-h-[60vh] overflow-y-auto mb-4">
          {comments[activePostIndex].map((comment, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-center mb-2">
                <img
                  src={comment.image}
                  alt={comment.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <p className="text-gray-400">{comment.name}</p>
              </div>
              <p className="text-gray-400 text-sm mb-2">{comment.comment}</p>
              <button className="text-blue-500 text-sm">Reply</button>
            </div>
          ))}
        </div>
      </div>

      {/* Input for new comment */}
      <div>
        <input
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="w-full p-2 bg-[#3a3b37] text-white rounded-lg"
          placeholder="Write a comment..."
        />
        <button
          onClick={handleComment}
          className="w-full py-2 bg-blue-500 text-white rounded-lg mt-2"
        >
          Post Comment
        </button>
      </div>
    </motion.div>
  </div>
)}


      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center w-full min-w-max">
          <motion.div
            className="bg-[#2a2b27] p-6 rounded-lg md:w-1/3 w-[90vw] mx-4 "
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Report Post</h3>
              <button onClick={closeReportModal} className="text-gray-400">
                <AiOutlineClose />
              </button>
            </div>

            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full p-2 bg-[#3a3b37] text-white rounded-lg mb-4"
              placeholder="Reason for reporting (optional)"
            />

            <button
              onClick={handleReport}
              className="w-full py-2 bg-red-500 text-white rounded-lg"
            >
              Submit Report
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Post;

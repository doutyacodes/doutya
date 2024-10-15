"use client"
import React from "react";
import { motion } from "framer-motion"; // Ensure framer-motion is installed
import { useRouter } from "next/navigation";

const NoCareersAvailable = () => {
    const router = useRouter()
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <motion.div
        className="text-center p-10 bg-white rounded-3xl shadow-2xl transform transition-transform duration-300 ease-in-out hover:scale-105 max-w-md w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <motion.div
          className="flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Replace with an icon from a library or SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="none"
            className="w-20 h-20 text-indigo-500"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-14a6 6 0 110 12 6 6 0 010-12zm0 3a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
        </motion.div>

        <h1 className="text-4xl font-semibold text-gray-800 mb-3">
          No Careers Available
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          We're currently out of career opportunities. Please check back later
          or explore other sections to discover more possibilities!
        </p>

        <motion.button
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={()=>router.push("/")}
        >
          Explore Other Sections
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NoCareersAvailable;

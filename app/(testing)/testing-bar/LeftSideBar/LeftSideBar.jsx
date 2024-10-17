"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FaBars, FaHome, FaUser, FaCog } from "react-icons/fa"; // Example icons

const LeftSideBar = () => {
  const [isOpen, setIsOpen] = useState(false); // Sidebar state

  // Function to toggle sidebar state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
       {/* FAB for mobile view */}
       <button
        className={`fixed bottom-4 right-4 bg-[#2a2b27] text-white p-4 rounded-full z-50 lg:hidden` }
        onClick={toggleSidebar}
      >
        <FaBars className="text-2xl" />
      </button>
    <div className="min-h-screen poppins-regular">
      
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out bg-[#2a2b27] text-white h-full m-2 rounded-md p-4 ${
          isOpen ? "w-72" : "md:w-20 max-md:hidden"
        }`}
      >
        <div className="my-4">
          {/* Logo aligned to the right */}
          <div className={`${isOpen ? "flex" : "block"} items-center justify-between gap-3`}>
            <Image
              src={
                isOpen
                  ? "/assets/images/logo-full.png"
                  : "/assets/images/small-logo.png"
              }
              alt="Logo"
              width={150}
              height={120}
              className=" object-contain"
            />
            {/* Toggle button inside sidebar */}
            <button
              className={`text-2xl p-2 mb-6 max-md:hidden transition-transform ${
                isOpen ? "rotate-0" : "rotate-180"
              }`}
              onClick={toggleSidebar}
            >
              <FaBars />
            </button>
          </div>
        </div>
        {/* Sidebar content */}
        <div className="flex flex-col gap-5 h-full">
          <div className="mt-4">
            {/* Navigation Links */}
            <ul className="space-y-4">
              {/* Example Link 1 */}
              <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                <FaHome className="text-2xl" />
                {isOpen && <span className="text-xl ">Home</span>}
              </li>
              {/* Example Link 2 */}
              <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                <FaUser className="text-2xl" />
                {isOpen && <span className="text-xl ">Profile</span>}
              </li>
              {/* Example Link 3 */}
              <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                <FaCog className="text-2xl" />
                {isOpen && <span className="text-xl ">Settings</span>}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LeftSideBar;

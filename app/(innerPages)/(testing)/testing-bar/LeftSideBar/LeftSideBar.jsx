"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  FaBars,
  FaHome,
  FaUser,
  FaCog,
  FaClipboardList,
  FaSuitcase,
  FaChevronDown,
  FaBuilding,
} from "react-icons/fa";
import {
  PiCompassRoseFill
} from "react-icons/pi";
import Link from "next/link"; // Import Link from Next.js for navigation
import { usePathname, useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import { ChevronLeft } from "lucide-react";

const LeftSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard_kids/");
  const [isTest2Completed, setIsTest2Completed] = useState(false);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isCareersDropdownOpen, setIsCareersDropdownOpen] = useState(false);
  const [isInstituteDropdownOpen, setIsInstituteDropdownOpen] = useState(false);


  const toggleSidebars = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleLogoutPopup = () => {
    setIsLogoutPopupOpen(!isLogoutPopupOpen);
  };

  const toggleCareersDropdown = () => {
    setIsCareersDropdownOpen(!isCareersDropdownOpen);
  };
  
  const toggleInstituteDropdown = () => {
    setIsInstituteDropdownOpen(!isCareersDropdownOpen);
  };

  useEffect(() => {
    const getQuizData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);

        // Check if Test 2 is completed
        const test2 = resp.data.find((q) => q.quiz_id === 2);
        if (test2 && test2.isCompleted) {
          setIsTest2Completed(true);
        }
      } catch (error) {
        console.error("Error Fetching data:", error);
      }
    };
    getQuizData();
  }, [setIsTest2Completed]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUrl = localStorage.getItem("dashboardUrl");
    if (token) {
      setIsLoggedIn(true);
    }
    if (storedUrl) {
      setDashboardUrl(storedUrl);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("dashboardUrl");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  const router = useRouter();
  const handleLinkClick = () => {
    if (isOpen) {
      toggleSidebars();
    }
  };
  const pathname = usePathname();

  return (
    <>
      {/* FAB for mobile view */}
      {(pathname != "/login" && pathname != "/signup") && (
        <button
          className={`fixed bottom-4 right-4 bg-[#2a2b27] text-white p-4 rounded-full z-50 lg:hidden`}
          onClick={toggleSidebars}
          aria-label="Toggle Sidebar"
          aria-expanded={isOpen}
        >
          <FaBars className="text-xl" />
        </button>
      )}
      {/* {!isTest2Completed && (pathname != "/login" && pathname != "/signup") && (
        <button
          onClick={() => router.push("/dashboard/careers/career-guide")}
          className={`fixed top-4 right-4 bg-orange-500 text-white p-4 rounded-full z-50 flex items-center`}
        >
          <FaSuitcase className="text-lg" />
          <span className="text-lg pl-3 hidden lg:block">Career Guide</span>
        </button>
      )} */}
      <div className="min-h-screen poppins-regular">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out bg-[#2a2b27] ${(pathname == "/login" || pathname == "/signup") && "hidden"} text-white h-full m-2 rounded-md p-4 ${
            isOpen ? "w-72 max-md:fixed top-0 z-[99999999999]" : "md:w-20 max-md:hidden"
          }`}
        >
          <div className="my-4">
            {/* Logo aligned to the right */}
            {/* <div className={`${isOpen ? "flex" : "block"} items-center justify-between gap-3`}>
              <Image
                src={isOpen ? "/assets/images/logo-full.png" : "/assets/images/small-logo.png"}
                alt="Logo"
                width={150}
                height={120}
                className="object-contain"
              />
              <button
                className={`text-xl p-2 mb-6 max-md:hidden transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`}
                onClick={toggleSidebars}
              >
                <FaBars />
              </button>
            </div> */}

          <div className={`${isOpen ? "flex" : "block mb-10"} items-center justify-between relative gap-3`}>
              <Image
                src={isOpen ? "/assets/images/logo-full.png" : "/assets/images/small-logo.png"}
                alt="Logo"
                width={150}
                height={120}
                className="object-contain"
              />
              <button
                onClick={toggleSidebars}
                className={`
                  max-md:hidden
                  p-2
                  rounded-full
                  hover:bg-gray-100/10
                  transition-all
                  duration-200
                  transform
                  ${isOpen ? "" : "rotate-180"}
                  group
                  absolute
                  ${isOpen ? "-right-3" : "-right-0 mt-5"}
                  top-6
                `}
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <div className="
                  bg-gray-800 
                  rounded-full 
                  p-1.5
                  shadow-lg
                  border
                  border-gray-700
                  group-hover:border-gray-600
                  transition-colors
                ">
                  <ChevronLeft 
                    className={`
                      w-4 
                      h-4 
                      text-gray-400
                      group-hover:text-white
                      transition-colors
                    `}
                  />
                </div>
              </button>
            </div>
          </div>
          
          {/* Sidebar content */}
          <div className="flex flex-col gap-5 h-full">
            <div className="mt-4">
              <ul className="space-y-4">
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center">
                    <FaClipboardList className="text-xl" />
                    {isOpen && <span className="text-xl pl-3">Tests</span>}
                  </Link>
                </li>

                {/* Careers Dropdown */}
                <li className="relative">
                  <div
                    className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg cursor-pointer"
                    onClick={()=>{

                      !isOpen && toggleSidebars();

                      toggleCareersDropdown();
                    }}
                  >
                    <PiCompassRoseFill className="text-xl" />
                    {isOpen && (
                      <>
                        <span className="text-xl pl-3">Careers</span>
                        <FaChevronDown className="ml-auto" />
                      </>
                    )}
                  </div>
                  {isCareersDropdownOpen && isOpen && (
                    <ul className="ml-8 space-y-3 mt-3">
                      <li>
                        <Link href="/dashboard/careers/career-guide" className="text-white hover:underline">
                          Career Guide
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard/careers/career-suggestions" className="text-white hover:underline">
                          Career Suggestions
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* School/College Link */}
                <li className="relative">
                  <div
                    className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg cursor-pointer"
                    onClick={()=>{

                      !isOpen && toggleSidebars();

                      toggleInstituteDropdown();
                    }}
                  >
                    <FaBuilding className="text-xl" />
                    {isOpen && (
                      <>
                        <span className="text-xl pl-3">School Activities</span>
                        <FaChevronDown className="ml-auto" />
                      </>
                    )}
                  </div>
                  {isInstituteDropdownOpen && isOpen && (
                    <ul className="ml-8 space-y-3 mt-3">
                      <li>
                        <Link href="/institution/challenges" className="text-white hover:underline">
                          Challenges
                        </Link>
                      </li>
                      <li>
                        <Link href="/institution/tests" className="text-white hover:underline">
                          Tests
                        </Link>
                      </li>
                      <li>
                        <Link href="/institution/community" className="text-white hover:underline">
                          Community
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Profile Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link href="/dashboard/user-profile" onClick={handleLinkClick} className="flex items-center">
                    <FaUser className="text-xl" />
                    {isOpen && <span className="text-xl pl-3">My Profile</span>}
                  </Link>
                </li>

                {/* Sign Out Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <button onClick={toggleLogoutPopup} className="flex items-center">
                    <FaCog className="text-xl" />
                    {isOpen && <span className="text-xl pl-3">Sign Out</span>}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Logout confirmation popup */}
      {isLogoutPopupOpen && (
        <div className="fixed inset-0 px-3 bg-black bg-opacity-50 z-[999999999999] flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl mb-4">Are you sure you want to sign out?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Sign Out
              </button>
              <button
                onClick={toggleLogoutPopup}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftSideBar;

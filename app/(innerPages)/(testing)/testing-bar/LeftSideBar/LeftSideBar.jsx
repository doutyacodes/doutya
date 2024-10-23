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
} from "react-icons/fa";
import { SiPytest } from "react-icons/si";
import Link from "next/link"; // Import Link from Next.js for navigation
import { usePathname, useRouter } from "next/navigation";

const LeftSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard_kids/");
  const [isTest2Completed, setIsTest2Completed] = useState(false);

  const toggleSidebars = () => {
    setIsOpen(!isOpen);
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  const router = useRouter()

  const handleLinkClick = () => {
    if (isOpen) {
      toggleSidebars();
    }
  };
  const pathname = usePathname();

  // console.log(pathname)
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
      {!isTest2Completed && (pathname != "/login" && pathname != "/signup") && (
        <button
        onClick={()=>router.push("/dashboard/careers")}
          className={`fixed top-4 right-4 bg-orange-500 text-white p-4 rounded-full z-50 flex items-center`}
        >
          <FaSuitcase className="text-lg" />
          { <span className="text-lg pl-3 hidden lg:block">Career Guide</span>}
        </button>
      )}
      <div className="min-h-screen poppins-regular">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out bg-[#2a2b27] ${(pathname == "/login" || pathname == "/signup") && "hidden"} text-white h-full m-2 rounded-md p-4 ${
            isOpen
              ? "w-72 max-md:fixed top-0 z-[99999999999]"
              : "md:w-20 max-md:hidden"
          }`}
        >
          <div className="my-4">
            {/* Logo aligned to the right */}
            <div
              className={`${
                isOpen ? "flex" : "block"
              } items-center justify-between gap-3`}
            >
              <Image
                src={
                  isOpen
                    ? "/assets/images/logo-full.png"
                    : "/assets/images/small-logo.png"
                }
                alt="Logo"
                width={150}
                height={120}
                className="object-contain"
              />
              {/* Toggle button inside sidebar */}
              <button
                className={`text-xl p-2 mb-6 max-md:hidden transition-transform ${
                  isOpen ? "rotate-0" : "rotate-180"
                }`}
                onClick={toggleSidebars}
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
                {/* Home Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <FaHome className="text-xl" />
                    {isOpen && <span className="text-xl pl-3">Home</span>}
                  </Link>
                </li>
                {/* Tests Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <FaClipboardList className="text-xl" />
                    {isOpen && (
                      <span className="text-xl pl-3">
                        {isTest2Completed ? "Tests" : "Career Suggestions"}
                      </span>
                    )}
                  </Link>
                </li>
                {/* Careers Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/dashboard/careers"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <FaSuitcase className="text-xl" />
                    {isOpen && (
                      <span className="text-xl pl-3">Career Guide</span>
                    )}
                  </Link>
                </li>
                {/* Your Profile Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/dashboard/user-profile"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <FaUser className="text-xl" />
                    {isOpen && <span className="text-xl pl-3">My Profile</span>}
                  </Link>
                </li>
                {/* My Analysis Link */}
                {/* <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/dashboard/myResults"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <SiPytest className="text-xl" />
                    {isOpen && (
                      <span className="text-xl pl-3">My Analysis</span>
                    )}
                  </Link>
                </li> */}
                {/* Sign Out Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <button onClick={handleLogout} className="flex items-center">
                    <FaCog className="text-xl" />
                    {isOpen && <span className="text-xl pl-3">Sign Out</span>}
                  </button>
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

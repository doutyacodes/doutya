"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaBars, FaHome, FaUser, FaCog } from "react-icons/fa";
import Link from "next/link"; // Import Link from Next.js for navigation
import { usePathname } from "next/navigation";

const LeftSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/dashboard_kids/");
  const toggleSidebars = () => {
    setIsOpen(!isOpen);
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
      {pathname != "/login" && pathname != "/signup" && (
        <button
          className={`fixed bottom-4 right-4 bg-[#2a2b27] text-white p-4 rounded-full z-50 lg:hidden`}
          onClick={toggleSidebars}
          aria-label="Toggle Sidebar"
          aria-expanded={isOpen}
        >
          <FaBars className="text-2xl" />
        </button>
      )}
      <div className="min-h-screen poppins-regular">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out bg-[#2a2b27] text-white h-full m-2 rounded-md p-4 ${
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
                {/* Home Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <FaHome className="text-2xl" />
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
                    <FaCog className="text-2xl" />
                    {isOpen && <span className="text-xl pl-3">Tests</span>}
                  </Link>
                </li>
                {/* Careers Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/dashboard/careers"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <FaCog className="text-2xl" />
                    {isOpen && <span className="text-xl pl-3">Careers</span>}
                  </Link>
                </li>
                {/* Your Profile Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/dashboard/user-profile"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <FaUser className="text-2xl" />
                    {isOpen && (
                      <span className="text-xl pl-3">Your Profile</span>
                    )}
                  </Link>
                </li>
                {/* My Analysis Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link
                    href="/myResults"
                    onClick={handleLinkClick}
                    className="flex items-center"
                  >
                    <FaCog className="text-2xl" />
                    {isOpen && (
                      <span className="text-xl pl-3">My Analysis</span>
                    )}
                  </Link>
                </li>
                {/* Sign Out Link */}
                <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <button onClick={handleLogout} className="flex items-center">
                    <FaCog className="text-2xl" />
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

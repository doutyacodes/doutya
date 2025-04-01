"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Footer from "../Footer/page";
import { useTranslations } from 'next-intl'; 
import Image from "next/image";

function Navbarkids() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/dashboard_kids/');
  const t = useTranslations('Navbar'); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUrl = localStorage.getItem('dashboardUrl');
    if (token) {
      setIsLoggedIn(true);
    }if (storedUrl) {
      setDashboardUrl(storedUrl);
    }
  }, []);

  const handleLogout = () => {

    // Clear localStorage
    // localStorage.clear();
    localStorage.removeItem("token");

    // Remove specific cookie (auth_token)
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";

    setIsLoggedIn(false);
    window.location.href = "/login";
    
  };

  return (
    <div>
      <nav className="py-1">
        <div className="container  flex items-center justify-between gap-5 w-screen">
          {/* Logo */}
          
          <div className="flex items-center ">
            <Image
              src={"/assets/images/logo-full.png"}
              width={150}
              height={150}
            />
          </div>

          

         

          {/* Navigation Links */}
          <div className=" flex items-center space-x-6">
            <a href={dashboardUrl} className="hidden md:block">
              <button
                                className="text-white"

              >
                {t('tests')}
              </button>
            </a>
            {/* Updated "MY PROFILE" to link to user profile */}
            {/* <a href="/dashboard/user-profile">
              <button
                style={{ ...styles.navButton, ...styles.navButtonProfile }}
                data-bg="#FFD700"
              >
                MY PROFILE
              </button>
            </a> */}
            <a href="/dashboard_kids/myResultsKids" className="hidden md:block">
              <button
                className="text-white"
              >
               My Analysis
              </button>
            </a>

            <div>
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt="User Avatar"
                      src="/assets/images/avatar.png"
                      className="h-8 w-8 rounded-full"
                    />
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <MenuItem key={"Your Profile"}>
                    <a
                      href="/dashboard/user-profile"
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                    >
                      {t('profileLink')}
                    </a>
                  </MenuItem>

                  <MenuItem key={"Your results"}>
                    <Link
                      href="/dashboard_kids/myResultsKids"
                      className="block px-4 py-2 text-sm text-gray-700"
                    >
                      {t('myResults')}
                    </Link>
                  </MenuItem>

                  <MenuItem key={"Sign Out"}>
                    <a
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                    >
                      {t('signOutLink')}
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>
      </nav>

      
    </div>
  );
}

export default Navbarkids;

const styles = {
  navigationBar: {
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
    padding: "10px 0",
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
  },
  navButton: {
    border: "none",
    borderRadius: "30px",
    color: "white",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  navButtonHome: {
    backgroundColor: "#FF6F61",
  },
  navButtonProfile: {
    backgroundColor: "#FFD700",
  },
  navButtonCareer: {
    backgroundColor: "#4CAF50",
  },
  navButtonHover: {
    backgroundColor: "#FFC0CB",
  },
};

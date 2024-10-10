"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Footer from "../Footer/page";
import { useTranslations } from 'next-intl'; 

function Navbarkids() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const t = useTranslations('Navbar'); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("dashboardUrl");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <div>
      <nav className="pt-6 pb-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="https://i.postimg.cc/pT86s6Zp/doutya-logo-removebg-preview.png"
              alt="Logo"
              className="h-8 w-8 mr-2"
            />
            <span className="text-white text-xl font-bold">
              Pers<span className="text-blue-400">Analytics</span>
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 mx-4 relative">
            <input
              type="text"
              placeholder="Search...                                                           🔍"
              className="w-full md:w-96 px-4 py-2 rounded-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 lg:ml-44"
            />
          </div>

          {/* Menu Button */}
          <button className="md:hidden text-white" onClick={toggleSidebar}>
            ☰
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/dashboard_kids">
              <button
                style={{ ...styles.navButton, ...styles.navButtonHome }}
                data-bg="#FF6F61"
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
            <a href="/dashboard/careers">
              <button
                style={{ ...styles.navButton, ...styles.navButtonCareer }}
                data-bg="#4CAF50"
              >
                {t('careers')}
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

      {/* Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-75 z-50 transform transition-transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="w-64 h-full bg-white p-4">
          <button className="text-black float-right" onClick={toggleSidebar}>
            ×
          </button>
          <div className="mt-8">
            <a href="#" className="block py-2 text-black hover:bg-gray-200">
            {t('aboutUsLink')}
            </a>
            <a
              href="./login"
              className="block py-2 text-black hover:bg-gray-200"
            >
              {t('sidebarLogin')}
            </a>
            <select className="bg-transparent text-black mt-4">
              <option value="">{t('solutionsPlaceholder')}</option>
              <option value="">{t('options.option1')}</option>
              <option value="">{t('options.option2')}</option>
              <option value="">{t('options.option3')}</option>
            </select>
          </div>
        </div>
      </div>
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

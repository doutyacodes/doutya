"use client";
import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaClipboardList,
  FaUser,
  FaCog,
  FaSuitcase,
  FaChevronDown,
  FaBuilding,
  FaInfoCircle,
  FaVial,
  FaUsers,
} from "react-icons/fa";
import { PiCompassRoseFill } from "react-icons/pi";
import { AlertCircle, CheckCircle, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import CareerGuideExplanation from "@/app/_components/CareerGuideExplanation";
import CareerOnboarding from "@/app/_components/CareerOnboarding";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import TestTypeSelectorModal from "@/app/_components/TestTypeSelectorModal";

const LeftSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Track active dropdown
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isCareersDropdownOpen, setIsCareersDropdownOpen] = useState(false);
  const [isInstituteDropdownOpen, setIsInstituteDropdownOpen] = useState(false);
  const [guideDropdownOpen, setGuideDropdownOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);


  const [isTest2Completed, setIsTest2Completed] = useState(false);

   // New state for managing instructions modal
   const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
   const [instructionsType, setInstructionsType] = useState(null);

   const [scopeType, setScopeType] = useState(null)

  const toggleSidebars = () => setIsOpen(!isOpen);

  const toggleLogoutPopup = () => {
    setIsLogoutPopupOpen(!isLogoutPopupOpen);
  };

  const toggleCareersDropdown = () => {
    setIsCareersDropdownOpen(!isCareersDropdownOpen);
  };
  
  const toggleInstituteDropdown = () => {
    setIsInstituteDropdownOpen(!isCareersDropdownOpen);
  };

  const toggleInstructionDropdown = () => {
    setGuideDropdownOpen(!isCareersDropdownOpen);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };


  useEffect(() => {
    const getQuizData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);

        setScopeType(resp.data.scopeType)

        // Check if Test 2 is completed
        const test2 = resp.data.data.find((q) => q.quiz_id === 2);
        if (test2 && test2.isCompleted) {
          setIsTest2Completed(true);
        }
      } catch (error) {
        console.error("Error Fetching data:", error);
      }
    };
    getQuizData();
  }, [setIsTest2Completed]);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = async() => {
    await fetch('/api/logout', { method: 'GET' });

    // Clear localStorage
    localStorage.removeItem("token");

    // Remove specific cookie (auth_token)
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  const handleLinkClick = () => {
    // Only close the sidebar on mobile devices (screen width < 768px)
    if (isOpen && window.innerWidth < 768) {
      toggleSidebars();
    }
  };

  // New method to open instructions
  const openInstructions = (type) => {
    setInstructionsType(type);
    setIsInstructionsModalOpen(true);
  };

   // Status icon component that works with any menu item
   const StatusIcon = ({ status }) => {
    const iconProps = {
      size: 16,
      className: "ml-2"
    };

    switch (status) {
      case "completed":
        return <CheckCircle {...iconProps} className="text-green-500 ml-2" />;
      case "pending":
        return <Clock {...iconProps} className="text-amber-500 ml-2" />;
      case "attention":
        return <AlertCircle {...iconProps} className="text-red-500 ml-2" />;
      default:
        return null;
    }
  };

  const menus = [
    {
      name: "Tests",
      icon: <FaClipboardList className="text-base" />,
      link: "/dashboard",
      submenus: [],
      isDisabled: isTest2Completed,
      status: isTest2Completed ? "completed" : null,
      statusTooltip: isTest2Completed ? "All tests are completed" : null
    },
    {
      name: scopeType === "career" ? "Careers" : scopeType === "sector" ? "Sectors" : "Clusters",
      icon: <PiCompassRoseFill className="text-base" />,
      link: "#",
      submenus: [
        { 
          name: scopeType === "career" ? "Career Suggestions" : 
                scopeType === "sector" ? "Sector Suggestions" : 
                "Cluster Suggestions", 
          link: scopeType === "career" ? "/dashboard/careers/career-suggestions" : 
                scopeType === "sector" ? "/dashboard_kids/sector-suggestion" : 
                "/dashboard_junior/cluster-suggestion" 
        },
        { name: "Career Guide", link: "/dashboard/careers/career-guide" },
      ],
    },
    {
      name: "Community",
      icon: <FaUsers className="text-base" />, // You might need to import FaUsers from react-icons/fa
      link: "/community",
      submenus: [],
    },
    // {
    //   name: "Companies",
    //   icon: <FaSuitcase className="text-xl" />,
    //   link: "#",
    //   submenus: [
    //     { name: "Companies", link: "/company" },
    //     { name: "My Companies", link: "/my-companies" },
    //   ],
    // },
    {
      name: "My Profile",
      icon: <FaUser className="text-base" />,
      link: "/dashboard/user-profile",
      submenus: [],
    },
    // {
    //   name: "School Activities",
    //   icon: <FaBuilding className="text-base" />,
    //   link: "#",
    //   submenus: [
    //     { name: "Challenges", link: "/institution/challenges" },
    //     { name: "Tests", link: "/institution/tests" },
    //     { name: "Community", link: "/institution/community" },
    //   ],
    // },
    {
      name: "Sign Out",
      icon: <FaCog className="text-base" />,
      link: "#",
      submenus: [],
      onClick: toggleLogoutPopup,
    },
    {
      name: "Manual Results",
      icon: <FaVial className="text-base" />,
      link: "#",
      submenus: [],
      onClick: handleOpenModal,
    },
    // {
    //   name: "Instructions",
    //   icon: <FaInfoCircle className="text-xl" />, // Use an info or help icon
    //   link: "#",
    //   submenus: [],
    //   onClick: () => {
    //     // When clicked, open instructions
    //     openInstructions('initial');
    //   },
    // }
  ];

  const toggleDropdown = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName); // Toggle dropdown
  };

  return (
    <>
      {/* FAB for mobile view */}
      {(pathname != "/login" && pathname != "/signup") && (
        <button
          className={`fixed bottom-6 right-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 lg:hidden backdrop-blur-sm border border-gray-600/20`}
          onClick={toggleSidebars}
          aria-label="Toggle Sidebar"
          aria-expanded={isOpen}
        >
          <FaBars className="text-xl" />
        </button>
      )}

      <div className="h-screen">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out bg-gray-900/95 backdrop-blur-md border-r border-gray-700/50 shadow-xl text-white h-full ${
            isOpen ? "w-72 max-md:fixed top-0 z-[99999999999] max-md:bg-gray-900" : "md:w-20 max-md:hidden"
          }`}
        >
          <div className="p-6 border-b border-gray-700/50">
            <div className={`${isOpen ? "flex" : "block mb-10"} items-center justify-between relative gap-3`}>
              <div className="text-xl font-bold">
                  <Image
                    src={isOpen ? "/assets/images/logo-full.png" : "/assets/images/small-logo.png"}
                    width={150}
                    height={150}
                    className="transition-all duration-300"
                  />
              </div>
              <button
                onClick={toggleSidebars}
                className={`p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 transform ${isOpen ? "" : "rotate-180"} group absolute ${isOpen ? "-right-3" : "-right-0 mt-5"} top-6`}
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-1.5 shadow-md border border-gray-600/20 group-hover:shadow-lg transition-all duration-200">
                  <ChevronLeft className="w-4 h-4 text-white transition-colors" />
                </div>
              </button>
            </div>
          </div>

          {/* Sidebar content */}
          <div className="flex flex-col gap-5 h-full p-4">
            <div className="flex-1">
              <ul className="space-y-2">
                {menus.map((menu, index) => (
                  <li key={index} className="relative">
                    <div
                      className={`flex items-center gap-4 hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-600/60 p-3 rounded-xl transition-all duration-200 group ${isTest2Completed && menu.name === "Tests" ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                      onClick={() => {
                        if (!(isTest2Completed && menu.name === "Tests")) {
                          if (menu.submenus.length > 0) {
                            toggleDropdown(menu.name);
                          } else if (menu.link) {
                            router.push(menu.link);
                            handleLinkClick();
                          }
                          if (menu.onClick) menu.onClick();
                        }
                      }}
                      title={menu.name === "Tests" && isTest2Completed ? "All tests are completed" : ""}
                    >
                      <div className="text-gray-400 group-hover:text-orange-400 transition-colors duration-200">
                        {menu.icon}
                      </div>
                      {isOpen && <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200">{menu.name}</span>}
                      {menu.submenus.length > 0 && isOpen && <FaChevronDown className="ml-auto text-sm text-gray-500 group-hover:text-orange-400 transition-colors duration-200" />}
                      {isOpen && menu.name === "Tests" && isTest2Completed && (
                        <CheckCircle size={16} className="text-green-500 ml-2" />
                      )}
                    </div>
                    {menu.submenus.length > 0 && isOpen && activeDropdown === menu.name && (
                      <ul className="ml-8 space-y-2 mt-2 border-l-2 border-orange-500/30 pl-4">
                        {menu.submenus.map((submenu, subIndex) => (
                          <li key={subIndex}>
                            <Link 
                              href={submenu.link} 
                              className="text-gray-400 hover:text-orange-400 hover:bg-gray-700/60 px-3 py-2 rounded-lg transition-all duration-200 block text-sm font-medium" 
                              onClick={handleLinkClick}
                            >
                              {submenu.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
                <li>
                  {isCareersDropdownOpen && isOpen && (
                    <ul className="ml-8 space-y-2 mt-2 border-l-2 border-orange-500/30 pl-4">
                      <li>
                        <Link 
                          href="/dashboard/careers/career-suggestions" 
                          className="text-gray-400 hover:text-orange-400 hover:bg-gray-700/60 px-3 py-2 rounded-lg transition-all duration-200 block text-sm font-medium" 
                          onClick={handleLinkClick}
                        >
                          Career Suggestions
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/dashboard/careers/career-guide" 
                          className="text-gray-400 hover:text-orange-400 hover:bg-gray-700/60 px-3 py-2 rounded-lg transition-all duration-200 block text-sm font-medium" 
                          onClick={handleLinkClick}
                        >
                          Career Guide
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Guide Link */}
                <li className="relative">
                  <div
                    className="flex items-center gap-4 hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-600/60 p-3 rounded-xl cursor-pointer transition-all duration-200 group hover:shadow-sm"
                    onClick={()=>{
                      !isOpen && toggleSidebars();
                      toggleInstructionDropdown();
                    }}
                  >
                    <div className="text-gray-400 group-hover:text-orange-400 transition-colors duration-200">
                      <FaInfoCircle className="text-base" />
                    </div>
                    {isOpen && (
                      <>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200">Instructions</span>
                        <FaChevronDown className="ml-auto text-gray-500 group-hover:text-orange-400 transition-colors duration-200" />
                      </>
                    )}
                  </div>
                    {guideDropdownOpen && isOpen && (
                      <ul className="ml-8 space-y-2 mt-2 border-l-2 border-orange-500/30 pl-4">
                        <li onClick={handleLinkClick}>
                          <div 
                            onClick={()=>openInstructions('intro')} 
                            className="text-gray-400 hover:text-orange-400 hover:bg-gray-700/60 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium"
                          >
                            Introduction
                          </div>
                        </li>
                        <li onClick={handleLinkClick}>
                          <div 
                            onClick={()=>openInstructions('career-guide')} 
                            className="text-gray-400 hover:text-orange-400 hover:bg-gray-700/60 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium"
                          >
                            Career Guide
                          </div>
                        </li>
                      </ul>
                    )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Logout confirmation popup */}
      {isLogoutPopupOpen && (
        <div className="fixed inset-0 px-3 bg-black/50 backdrop-blur-sm z-[999999999999] flex justify-center items-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center border border-gray-200 max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCog className="text-red-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign Out</h2>
              <p className="text-gray-600">Are you sure you want to sign out of your account?</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Sign Out
              </Button>
              <Button
                onClick={toggleLogoutPopup}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 font-medium py-3 rounded-xl transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal Trigger */}
      {isInstructionsModalOpen && (
        <>
          {instructionsType === 'intro' && (
            <CareerOnboarding
              forceShow={true} 
              onClose={() => setIsInstructionsModalOpen(false)} 
            />
          )}
          {instructionsType === 'career-guide' && (
            <CareerGuideExplanation
              forceShow={true} 
              onClose={() => setIsInstructionsModalOpen(false)} 
            />
          )}
        </>
      )}

      <TestTypeSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default LeftSideBar;

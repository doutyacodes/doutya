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
  FaUserTie,
  FaGraduationCap,
} from "react-icons/fa";
import { PiCompassRoseFill } from "react-icons/pi";
import { AlertCircle, CheckCircle, ChevronLeft, Clock, School } from "lucide-react";
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
  const [userRoleType, setUserRoleType] = useState(null);

  const [isTest2Completed, setIsTest2Completed] = useState(false);
  const [userInstitution, setUserInstitution] = useState(null);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        const cached = localStorage.getItem("user_institution");
        if (cached) {
          try {
            setUserInstitution(JSON.parse(cached));
          } catch (e) {}
        }

        const res = await GlobalApi.GetUserData(token);
        if (res.data?.institution) {
          setUserInstitution(res.data.institution);
          localStorage.setItem("user_institution", JSON.stringify(res.data.institution));
        }
      } catch (err) {
        console.error("Error fetching user institution in sidebar:", err);
      }
    };

    fetchInstitution();
  }, []);


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
        setUserRoleType(resp.data.userRoleType);
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
    // {
    //   name: "Community",
    //   icon: <FaUsers className="text-base" />,
    //   link: "/community",
    //   submenus: [
    //     { name: "All Communities", link: "/community" },
    //     { name: "My Community", link: "/my-community" },
    //   ],
    // },
    // {
    //   name: "Mentorship",
    //   icon: <FaUserTie className="text-base" />,
    //   link: "/mentors/1/browse",
    //   submenus: [
    //     { name: "Browse Mentors", link: "/mentors/1/browse" },
    //   ],
    // },
    {
      name: "Certifications",
      icon: <FaGraduationCap className="text-base" />,
      link: "#",
      submenus: [
        { name: "Course Certifications", link: "/dashboard/careers/career-guide?tab=certification" },
        { name: "Verify Certificate", link: "/verify" },
      ],
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
  ];

  const toggleDropdown = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName); // Toggle dropdown
  };
  return (
    <>
      {/* FAB for mobile view */}
      {pathname != "/login" && pathname != "/signup" && (
        <button
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 lg:hidden backdrop-blur-sm border border-gray-600/20"
          onClick={toggleSidebars}
          aria-label="Toggle Sidebar"
          aria-expanded={isOpen}
        >
          <FaBars className="text-xl" />
        </button>
      )}

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebars}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999998] md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Root */}
      <aside
        className={`h-screen flex flex-col justify-between transition-all duration-300 ease-in-out bg-gray-900/95 backdrop-blur-md border-r border-gray-700/50 shadow-xl text-white select-none shrink-0 ${
          isOpen
            ? "w-72 fixed inset-y-0 left-0 z-[999999999] md:static md:z-auto"
            : "md:w-20 hidden md:flex"
        }`}
      >
        {/* Header: School Logo / Brand */}
        {isOpen ? (
          <div className="shrink-0 p-4 border-b border-gray-700/50 flex flex-col gap-2.5 relative">
            {/* Top row: Collapse toggle button */}
            <div className="flex items-center justify-end w-full">
              <button
                onClick={toggleSidebars}
                className="p-1 rounded-full hover:bg-gray-800 transition-all duration-200 shrink-0"
                aria-label="Collapse sidebar"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-1.5 shadow-md border border-gray-600/20 hover:shadow-lg transition-all">
                  <ChevronLeft className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            </div>

            {/* Logo: Spanning full width of the side panel */}
            <div className="w-full flex items-center justify-center">
              {userInstitution?.logo ? (
                <div className="w-full bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-center justify-center shadow-inner">
                  <img
                    src={userInstitution.logo}
                    alt={userInstitution.name || "School Logo"}
                    className="w-full h-16 sm:h-20 object-contain"
                  />
                </div>
              ) : userInstitution?.name ? (
                <div className="w-full py-4 rounded-xl bg-gray-800/80 border border-gray-700 flex flex-col items-center justify-center gap-2">
                  <School className="w-8 h-8 text-orange-400" />
                </div>
              ) : (
                <div className="w-full py-2 flex items-center justify-center">
                  <img
                    src="/assets/images/logo-full.png"
                    alt="Logo"
                    className="w-full max-h-12 object-contain"
                  />
                </div>
              )}
            </div>

            {/* School Name fully displayed below without cutoff */}
            {userInstitution?.name && (
              <div className="text-sm font-semibold text-gray-100 leading-snug break-words">
                {userInstitution.name}
              </div>
            )}
          </div>
        ) : (
          <div className="shrink-0 p-3.5 border-b border-gray-700/50 flex items-center justify-center relative">
            <button
              onClick={toggleSidebars}
              className="p-1.5 rounded-full hover:bg-gray-800 transition-all duration-200"
              aria-label="Expand sidebar"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-1.5 shadow-md border border-gray-600/20 hover:shadow-lg transition-all">
                <ChevronLeft className="w-3.5 h-3.5 text-white rotate-180" />
              </div>
            </button>
          </div>
        )}

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-transparent">
          <ul className="space-y-1.5">
            {menus.map((menu, index) => (
              <li key={index} className="relative">
                <div
                  className={`flex items-center gap-3.5 hover:bg-gradient-to-r hover:from-gray-800/80 hover:to-gray-700/60 p-2.5 rounded-xl transition-all duration-200 group ${
                    isTest2Completed && menu.name === "Tests"
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-sm'
                  }`}
                  onClick={() => {
                    if (!(isTest2Completed && menu.name === "Tests")) {
                      if (menu.submenus.length > 0) {
                        toggleDropdown(menu.name);
                      } else if (menu.link && menu.link !== "#") {
                        router.push(menu.link);
                        handleLinkClick();
                      }
                      if (menu.onClick) menu.onClick();
                    }
                  }}
                  title={menu.name === "Tests" && isTest2Completed ? "All tests are completed" : ""}
                >
                  <div className="text-gray-400 group-hover:text-orange-400 transition-colors duration-200 shrink-0">
                    {menu.icon}
                  </div>
                  {isOpen && (
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200 truncate">
                      {menu.name}
                    </span>
                  )}
                  {menu.submenus.length > 0 && isOpen && (
                    <FaChevronDown
                      className={`ml-auto text-xs text-gray-500 group-hover:text-orange-400 transition-transform duration-200 ${
                        activeDropdown === menu.name ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                  {isOpen && menu.name === "Tests" && isTest2Completed && (
                    <CheckCircle size={16} className="text-green-500 ml-auto shrink-0" />
                  )}
                </div>
                {menu.submenus.length > 0 && isOpen && activeDropdown === menu.name && (
                  <ul className="ml-7 space-y-1 my-1.5 border-l-2 border-orange-500/40 pl-3">
                    {menu.submenus.map((submenu, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          href={submenu.link}
                          className="text-gray-400 hover:text-orange-400 hover:bg-gray-800/60 px-2.5 py-1.5 rounded-lg transition-all duration-200 block text-xs font-medium"
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

            {/* Guide Link */}
            <li className="relative">
              <div
                className="flex items-center gap-3.5 hover:bg-gradient-to-r hover:from-gray-800/80 hover:to-gray-700/60 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group hover:shadow-sm"
                onClick={() => {
                  !isOpen && toggleSidebars();
                  toggleInstructionDropdown();
                }}
              >
                <div className="text-gray-400 group-hover:text-orange-400 transition-colors duration-200 shrink-0">
                  <FaInfoCircle className="text-base" />
                </div>
                {isOpen && (
                  <>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-200 truncate">
                      Instructions
                    </span>
                    <FaChevronDown
                      className={`ml-auto text-xs text-gray-500 group-hover:text-orange-400 transition-transform duration-200 ${
                        guideDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </>
                )}
              </div>
              {guideDropdownOpen && isOpen && (
                <ul className="ml-7 space-y-1 my-1.5 border-l-2 border-orange-500/40 pl-3">
                  <li onClick={handleLinkClick}>
                    <div
                      onClick={() => openInstructions('intro')}
                      className="text-gray-400 hover:text-orange-400 hover:bg-gray-800/60 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-xs font-medium"
                    >
                      Introduction
                    </div>
                  </li>
                  <li onClick={handleLinkClick}>
                    <div
                      onClick={() => openInstructions('career-guide')}
                      className="text-gray-400 hover:text-orange-400 hover:bg-gray-800/60 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-xs font-medium"
                    >
                      Career Guide
                    </div>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Powered by XORTCUT Pinned Footer */}
        <div className="shrink-0 p-3 border-t border-gray-800/90 bg-gray-950/70 backdrop-blur-sm">
          {isOpen ? (
            <div className="flex items-center justify-center gap-2 py-0.5">
              <span className="text-[11px] font-medium text-gray-400 tracking-wider">
                Powered by
              </span>
              <img
                src="/assets/images/xortcut-full-small.png"
                onError={(e) => {
                  e.currentTarget.src = "/assets/images/small-logo.png";
                }}
                alt="XORTCUT"
                className="h-4 w-auto max-w-[90px] object-contain brightness-110"
              />
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-1 py-0.5 group cursor-pointer"
              title="Powered by XORTCUT"
            >
              <span className="text-[8px] font-medium text-gray-400 tracking-tighter uppercase leading-none">
                by
              </span>
              <img
                src="/assets/images/small-logo.png"
                alt="XORTCUT"
                className="h-4 w-4 object-contain group-hover:scale-110 transition-transform"
              />
            </div>
          )}
        </div>
      </aside>

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

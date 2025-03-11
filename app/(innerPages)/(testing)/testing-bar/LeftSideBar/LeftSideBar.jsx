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
} from "react-icons/fa";
import { PiCompassRoseFill } from "react-icons/pi";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import CareerGuideExplanation from "@/app/_components/CareerGuideExplanation";
import CareerOnboarding from "@/app/_components/CareerOnboarding";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const LeftSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Track active dropdown
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogoutPopupOpen, setIsLogoutPopupOpen] = useState(false);
  const [isCareersDropdownOpen, setIsCareersDropdownOpen] = useState(false);
  const [isInstituteDropdownOpen, setIsInstituteDropdownOpen] = useState(false);
  const [guideDropdownOpen, setGuideDropdownOpen] = useState(false);


  const [isTest2Completed, setIsTest2Completed] = useState(false);

   // New state for managing instructions modal
   const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
   const [instructionsType, setInstructionsType] = useState(null);

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


  useEffect(() => {
    const getQuizData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetDashboarCheck(token);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  const handleLinkClick = () => {
    if (isOpen) {
      toggleSidebars();
    }
  };

  // New method to open instructions
  const openInstructions = (type) => {
    setInstructionsType(type);
    setIsInstructionsModalOpen(true);
  };

  const menus = [
    {
      name: "Tests",
      icon: <FaClipboardList className="text-xl" />,
      link: "/dashboard",
      submenus: [],
    },
    {
      name: "Careers",
      icon: <PiCompassRoseFill className="text-xl" />,
      link: "#",
      submenus: [
        { name: "Career Guide", link: "/dashboard/careers/career-guide" },
        { name: "Career Suggestions", link: "/dashboard/careers/career-suggestions" },
      ],
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
      icon: <FaUser className="text-xl" />,
      link: "/dashboard/user-profile",
      submenus: [],
    },
    {
      name: "School Activities",
      icon: <FaBuilding className="text-xl" />,
      link: "#",
      submenus: [
        { name: "Challenges", link: "/institution/challenges" },
        { name: "Tests", link: "/institution/tests" },
        { name: "Community", link: "/institution/community" },
      ],
    },
    {
      name: "Sign Out",
      icon: <FaCog className="text-xl" />,
      link: "#",
      submenus: [],
      onClick: toggleLogoutPopup,
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
          className={`fixed bottom-4 right-4 bg-[#2a2b27] text-white p-4 rounded-full z-50 lg:hidden`}
          onClick={toggleSidebars}
          aria-label="Toggle Sidebar"
          aria-expanded={isOpen}
        >
          <FaBars className="text-xl" />
        </button>
      )}

      <div className="min-h-screen poppins-regular">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out bg-[#2a2b27] text-white h-full m-2 rounded-md p-4 ${
            isOpen ? "w-72 max-md:fixed top-0 z-[99999999999]" : "md:w-20 max-md:hidden"
          }`}
        >
          <div className="my-4">
            <div className={`${isOpen ? "flex" : "block mb-10"} items-center justify-between relative gap-3`}>
              <div className="text-xl font-bold">
                <Image
                  src={isOpen ? "/assets/images/logo-full.png" : "/assets/images/small-logo.png"}
                  width={150}
                  height={150}
                />
              </div>
              <button
                onClick={toggleSidebars}
                // max-md:hidden
                className={` p-2 rounded-full hover:bg-gray-100/10 transition-all duration-200 transform ${isOpen ? "" : "rotate-180"} group absolute ${isOpen ? "-right-3" : "-right-0 mt-5"} top-6`}
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <div className="bg-gray-800 rounded-full p-1.5 shadow-lg border border-gray-700 group-hover:border-gray-600 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>
          </div>

          {/* Sidebar content */}
          <div className="flex flex-col gap-5 h-full">
            <div className="mt-4">
              <ul className="space-y-4">
                {menus.map((menu, index) => (
                  <li key={index} className="relative">
                    <div
                      className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg cursor-pointer"
                      onClick={() => {
                        if (menu.submenus.length > 0) {
                          toggleDropdown(menu.name); // Toggle dropdown for specific menu
                        }
                        if (menu.onClick) menu.onClick();
                      }}
                    >
                      {menu.icon}
                      {isOpen && <span className="text-xl pl-3">{menu.name}</span>}
                      {menu.submenus.length > 0 && isOpen && <FaChevronDown className="ml-auto" />}
                    </div>
                    {menu.submenus.length > 0 && isOpen && activeDropdown === menu.name && (
                      <ul className="ml-8 space-y-3 mt-3">
                        {menu.submenus.map((submenu, subIndex) => (
                          <li key={subIndex}>
                            <Link href={submenu.link} className="text-white hover:underline">
                              {submenu.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  {/* </div> */}
                  </li>
                ))}
                <li>
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
                {/* <li className="relative">
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
                </li> */}

                {/* Guide Link */}
                <li className="relative">
                  <div
                    className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg cursor-pointer"
                    onClick={()=>{

                      !isOpen && toggleSidebars();

                      toggleInstructionDropdown();
                    }}
                  >
                    <FaInfoCircle className="text-xl" />
                    {isOpen && (
                      <>
                        <span className="text-xl pl-3">Instructions</span>
                        <FaChevronDown className="ml-auto" />
                      </>
                    )}
                  </div>
                    {guideDropdownOpen && isOpen && (
                      <ul className="ml-8 space-y-3 mt-3">
                        <li>
                          <div onClick={()=>openInstructions('intro')} className="text-white cursor-pointer hover:underline">
                            Introduction
                          </div>
                        </li>
                        <li>
                          <div onClick={()=>openInstructions('career-guide')} className="text-white cursor-pointer hover:underline ">
                            Carrer Guide
                          </div>
                        </li>
                      </ul>
                    )}
                </li>


                {/* Profile Link */}
                {/* <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <Link href="/dashboard/user-profile" onClick={handleLinkClick} className="flex items-center">
                    <FaUser className="text-xl" />
                    {isOpen && <span className="text-xl pl-3">My Profile</span>}
                  </Link>
                </li> */}

                {/* Sign Out Link */}
                {/* <li className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg">
                  <button onClick={toggleLogoutPopup} className="flex items-center">
                    <FaCog className="text-xl" />
                    {isOpen && <span className="text-xl pl-3">Sign Out</span>}
                  </button>
                </li> */}
                  {/* </li>
                ))} */}
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
    </>
  );
};

export default LeftSideBar;

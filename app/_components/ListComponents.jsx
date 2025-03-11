"use client";
import React, { useState } from "react";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import {
  FaUserGraduate,
  FaChild,
  FaSchool,
  FaBuilding,
  FaBlog,
  FaPodcast,
  FaBriefcase,
  FaInfoCircle,
  FaNewspaper,
  FaBook,
  FaUsers,
} from "react-icons/fa";
import Link from "next/link";

const ListComponents = () => {
  const [isProductVisible, setIsProductVisible] = useState(false);
  const [isResourcesVisible, setIsResourcesVisible] = useState(false);
  const [isCompanyVisible, setIsCompanyVisible] = useState(false);

  const toggleProductVisibility = () => setIsProductVisible(!isProductVisible);
  const toggleResourcesVisibility = () =>
    setIsResourcesVisible(!isResourcesVisible);
  const toggleCompanyVisibility = () =>
    setIsCompanyVisible(!isCompanyVisible);

  return (
    <>
      {/* Product Section */}
      {/* <li>
        <div
          className="flex w-full justify-between items-center px-3 cursor-pointer transition-colors duration-300 hover:text-indigo-500"
          onClick={toggleProductVisibility}
        >
          <p className="text-gray-700 text-sm font-medium">Product</p>
          {isProductVisible ? (
            <IoChevronUpOutline size={18} className="text-indigo-600" />
          ) : (
            <IoChevronDownOutline size={18} className="text-gray-600" />
          )}
        </div> */}
        {/* {isProductVisible && (
          <div className="w-full bg-[#f0f4ff] px-3 py-4 space-y-4">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/xortlist"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaUserGraduate color="#6a1b9a" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">
                    Xortcut
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href="/xortlist-junior"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaUserGraduate color="#43a047" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">
                    Xortcut - Junior
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href="/xortlist-kids"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaChild color="#f4511e" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">
                    Xortcut - Kids
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href="/xortlist-schools"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaSchool color="#1e88e5" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">
                    Xortcut - Schools
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href="/xortlist-college"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaBuilding color="#e53935" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">
                    Xortcut - College
                  </p>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </li> */}

      {/* Resources Section */}
      <li>
        <div
          className="flex w-full justify-between items-center px-3 cursor-pointer transition-colors duration-300 hover:text-indigo-500"
          onClick={toggleResourcesVisibility}
        >
          <p className="text-gray-700 text-sm font-medium">Resources</p>
          {isResourcesVisible ? (
            <IoChevronUpOutline size={18} className="text-indigo-600" />
          ) : (
            <IoChevronDownOutline size={18} className="text-gray-600" />
          )}
        </div>
        {isResourcesVisible && (
          <div className="w-full bg-[#f0f4ff] px-3 py-4 space-y-4">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/blog"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaBlog color="#8d6e63" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">Blogs</p>
                </Link>
              </li>
              <li>
                <Link
                  href="/podcasts"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaPodcast color="#8d6e63" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">Podcasts</p>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </li>

      {/* Company Section */}
      <li>
        <div
          className="flex w-full justify-between items-center px-3 cursor-pointer transition-colors duration-300 hover:text-indigo-500"
          onClick={toggleCompanyVisibility}
        >
          <p className="text-gray-700 text-sm font-medium">Company</p>
          {isCompanyVisible ? (
            <IoChevronUpOutline size={18} className="text-indigo-600" />
          ) : (
            <IoChevronDownOutline size={18} className="text-gray-600" />
          )}
        </div>
        {isCompanyVisible && (
          <div className="w-full bg-[#f0f4ff] px-3 py-4 space-y-4">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/careers"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaBriefcase color="#5d4037" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">Careers</p>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaInfoCircle color="#5d4037" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">About</p>
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaNewspaper color="#5d4037" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">Press</p>
                </Link>
              </li>
              <li>
                <Link
                  href="/operating-principles"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaBook color="#5d4037" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">
                    Operating Principles
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href="/leadership-principles"
                  className="flex gap-3 items-center hover:scale-105 transition-transform"
                >
                  <FaUsers color="#5d4037" size={16} />
                  <p className="text-gray-700 text-xs font-semibold">
                    Leadership Principles
                  </p>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </li>
    </>
  );
};

export default ListComponents;

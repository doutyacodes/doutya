"use client";
import React, { useState } from "react";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import {
  FaSort,
  FaUserGraduate,
  FaSchool,
  FaChild,
  FaBuilding,
  FaBlog,
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
  const [companyVisible, setCompanyVisible] = useState(false);
  const [career, setCareer] = useState(false);
  // const [isResourcesVisible, setIsResourcesVisible] = useState(false);

  const toggleProductVisibility = () => setIsProductVisible(!isProductVisible);
  const toggleResourcesVisibility = () =>
    setIsResourcesVisible(!isResourcesVisible);
  const toggleCompanyVisibility = () => setCompanyVisible(!isResourcesVisible);

  return (
    <>
      {/* Product Section */}
      <li>
        <div
          className="flex w-full justify-between px-3"
          onClick={toggleProductVisibility}
        >
          <p className="text-blue-600 text-sm cursor-pointer focus:underline">
            Product
          </p>
          {isProductVisible ? (
            <IoChevronUpOutline size={20} color="red" />
          ) : (
            <IoChevronDownOutline size={20} color="blue" />
          )}
        </div>
        {isProductVisible && (
          <div className="w-full bg-[#f5edff] px-3 space-y-3 py-5">
            <ul className="space-y-5">
              <li className="flex gap-2 items-center hover:scale-105 transition-transform">
                <FaUserGraduate color="purple" size={20} />
                <p className="text-blue-600 text-sm font-semibold">Xortlist</p>
              </li>
              <li className="flex gap-2 items-center hover:scale-105 transition-transform">
                <FaUserGraduate color="green" size={20} />
                <p className="text-blue-600 text-sm font-semibold">
                  Xortlist - Junior
                </p>
              </li>
              <li className="flex gap-2 items-center hover:scale-105 transition-transform">
                <FaChild color="orange" size={20} />
                <p className="text-blue-600 text-sm font-semibold">
                  Xortlist - Kids
                </p>
              </li>
              <li className="flex gap-2 items-center hover:scale-105 transition-transform">
                <FaSchool color="blue" size={20} />
                <p className="text-blue-600 text-sm font-semibold">
                  Xortlist - Schools
                </p>
              </li>
              <li className="flex gap-2 items-center hover:scale-105 transition-transform">
                <FaBuilding color="red" size={20} />
                <p className="text-blue-600 text-sm font-semibold">
                  Xortlist - College
                </p>
              </li>
            </ul>
          </div>
        )}
      </li>

      {/* Resources Section */}
      <li>
        <div
          className="flex w-full justify-between px-3"
          onClick={toggleResourcesVisibility}
        >
          <p className="text-blue-600 text-sm cursor-pointer focus:underline">
            Resources
          </p>
          {isResourcesVisible ? (
            <IoChevronUpOutline size={20} color="red" />
          ) : (
            <IoChevronDownOutline size={20} color="blue" />
          )}
        </div>
        {isResourcesVisible && (
          <div className="w-full bg-[#f5edff] px-3 space-y-3 py-5">
            <ul className="space-y-5">
              <li>
                <Link
                  href={"/blog"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaBlog color="brown" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">Blogs</p>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </li>
      <li>
        <div
          className="flex w-full justify-between px-3"
          onClick={toggleCompanyVisibility}
        >
          <p className="text-blue-600 text-sm cursor-pointer focus:underline">
            Company
          </p>
          {companyVisible ? (
            <IoChevronUpOutline size={20} color="red" />
          ) : (
            <IoChevronDownOutline size={20} color="blue" />
          )}
        </div>
        {companyVisible && (
          <div className="w-full bg-[#f5edff] px-3 space-y-3 py-5">
            <ul className="space-y-5">
              <li>
                <Link
                  href={"/careers"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaBriefcase color="#8B4513" size={20} />{" "}
                  {/* Brown color for careers */}
                  <p className="text-blue-600 text-sm font-semibold">Careers</p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/about"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaInfoCircle color="#8B4513" size={20} />{" "}
                  {/* Brown color for about */}
                  <p className="text-blue-600 text-sm font-semibold">About</p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/press"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaNewspaper color="#8B4513" size={20} />{" "}
                  {/* Brown color for press */}
                  <p className="text-blue-600 text-sm font-semibold">Press</p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/operating-principles"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaBook color="#8B4513" size={20} />{" "}
                  {/* Brown color for operating principles */}
                  <p className="text-blue-600 text-sm font-semibold">
                    Operating Principles
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/leadership-principles"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaUsers color="#8B4513" size={20} />{" "}
                  {/* Brown color for leadership principles */}
                  <p className="text-blue-600 text-sm font-semibold">
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

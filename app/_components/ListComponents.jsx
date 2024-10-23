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
  FaPodcast,
} from "react-icons/fa";
import Link from "next/link";

const ListComponents = () => {
  const [isProductVisible, setIsProductVisible] = useState(false);
  const [isResourcesVisible, setIsResourcesVisible] = useState(false);
  const [companyVisible, setCompanyVisible] = useState(false);

  const toggleProductVisibility = () => setIsProductVisible(!isProductVisible);
  const toggleResourcesVisibility = () =>
    setIsResourcesVisible(!isResourcesVisible);
  const toggleCompanyVisibility = () => setCompanyVisible(!companyVisible);

  return (
    <>
      {/* Product Section */}
      {/* <li>
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
              <li>
                <Link
                  href={"/xortlist"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaUserGraduate color="purple" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">Xortlist</p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/xortlist-junior"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaUserGraduate color="green" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">
                    Xortlist - Junior
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/xortlist-kids"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaChild color="orange" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">
                    Xortlist - Kids
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/xortlist-schools"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaSchool color="blue" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">
                    Xortlist - Schools
                  </p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/xortlist-college"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaBuilding color="red" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">
                    Xortlist - College
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
              <li>
                <Link
                  href={"/newsletter"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaNewspaper color="brown" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">Newsletter</p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/podcasts"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaPodcast color="brown" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">Podcasts</p>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </li>

      {/* Company Section */}
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
                  <FaBriefcase color="#8B4513" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">Careers</p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/about"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaInfoCircle color="#8B4513" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">About</p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/press"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaNewspaper color="#8B4513" size={20} />
                  <p className="text-blue-600 text-sm font-semibold">Press</p>
                </Link>
              </li>
              <li>
                <Link
                  href={"/operating-principles"}
                  className="flex gap-2 items-center hover:scale-105 transition-transform"
                >
                  <FaBook color="#8B4513" size={20} />
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
                  <FaUsers color="#8B4513" size={20} />
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

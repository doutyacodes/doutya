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
} from "react-icons/fa";

const ListComponents = () => {
  const [isProductVisible, setIsProductVisible] = useState(false);
  const [isResourcesVisible, setIsResourcesVisible] = useState(false);

  const toggleProductVisibility = () => setIsProductVisible(!isProductVisible);
  const toggleResourcesVisibility = () =>
    setIsResourcesVisible(!isResourcesVisible);

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
              <li className="flex gap-2 items-center hover:scale-105 transition-transform">
                <FaBlog color="brown" size={20} />
                <p className="text-blue-600 text-sm font-semibold">Blogs</p>
              </li>
            </ul>
          </div>
        )}
      </li>
    </>
  );
};

export default ListComponents;

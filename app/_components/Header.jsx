"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import ListComponents from "./ListComponents";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import {
  FaBriefcase,
  FaInfoCircle,
  FaNewspaper,
  FaClipboardList,
  FaUserTie,
  FaStore,
} from "react-icons/fa";
const Header = ({ dark = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const companyData = [
    {
      title: "Careers",
      description: "It’s a great time to join Xortlist",
      href: "/careers",
      icon: <FaBriefcase className="w-4 h-4 text-[#3e0075]" />,
    },
    {
      title: "About",
      description: "Learn what binds us together at Xortlist",
      href: "/about",
      icon: <FaInfoCircle className="w-4 h-4 text-[#3e0075]" />,
    },
    {
      title: "Press",
      description: "The latest news on Xortlist",
      href: "/press",
      icon: <FaNewspaper className="w-4 h-4 text-[#3e0075]" />,
    },
    {
      title: "Operating Principles",
      description: "The rules that drive our day to day",
      href: "/operating-principles",
      icon: <FaClipboardList className="w-4 h-4 text-[#3e0075]" />,
    },
    {
      title: "Leadership Principles",
      description: "What it means to lead at Xortlist",
      href: "/leadership-principles",
      icon: <FaUserTie className="w-4 h-4 text-[#3e0075]" />,
    },
  ];

  return (
    <header className="flex justify-between items-center container mx-auto px-4 relative">
      <div>
        <Link href={"/"}>
          <Image
            src={dark ? "/assets/images/doutya4.png" : "/assets/images/logo-full.png"}
            width={150}
            height={150}
          />
        </Link>
      </div>
      <ul className="lg:flex hidden gap-7 ">
        <li className="group">
          <Link href={"/blog"} className="cursor-pointer relative z-[9999]">
            <p
              className={`text-${
                !dark ? "white" : "[#3e0075]"
              } text-sm hover:font-bold`}
            >
              Blog
            </p>
          </Link>
        </li>
        <li className="group">
          <div className="cursor-pointer relative z-[9999]">
            <p
              className={`text-${
                !dark ? "white" : "[#3e0075]"
              } text-sm hover:font-bold`}
            >
              Company
            </p>
          </div>
          <div
            className={`absolute top-0 z-[9999] pt-20 left-0 w-full min-h-72 mt-2 hidden group-hover:block transition-opacity duration-300`}
          >
            <div className="bg-white p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-1">
                {companyData.map((item, index) => (
                  <div key={index} className="py-5 flex items-center">
                    <Link href={item.href} className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        {item.icon}
                        <h2 className="text-[12px] font-semibold">
                          {item.title}
                        </h2>
                      </div>
                      <p className="text-[10px] text-[#3e0075] font-semibold">
                        {item.description}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </li>
      </ul>

      <div>
        <div className="hidden lg:flex justify-start md:justify-center w-full">
          <Link
            href={"/login"}
            className="bg-[#01bf61] text-white rounded-full px-7 py-3 font-semibold"
          >
            Explore Now
          </Link>
        </div>
        <div className="lg:hidden">
          <IoIosMenu
            size={32}
            color="blue"
            onClick={toggleMenu}
            className="cursor-pointer"
          />

          <div
            className={`min-w-80 z-[9999] py-3 absolute lg:hidden right-3 top-3 bg-white h-[80vh] shadow-xl rounded-md outline outline-slate-100 transition-all duration-300 ease-in-out transform space-y-3 ${
              isOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-5 pointer-events-none"
            }`}
          >
            <div className="flex justify-end items-center px-3">
              <IoIosClose
                size={37}
                color="blue"
                onClick={toggleMenu}
                className="cursor-pointer"
              />
            </div>
            <p className="text-[#3e0075] text-sm cursor-pointer font-semibold focus:underline px-3 mb-2">
              Why Xortlist?
            </p>
            <ul className="space-y-5">
              <ListComponents />
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

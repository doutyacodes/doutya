"use client"
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import ListComponents from './ListComponents';
import { IoIosClose, IoIosMenu } from "react-icons/io";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };
  return (
    <header className="flex justify-between items-center max-w-[1200px] mx-auto px-4">
        <div>
          <Link href={"/"}>
            <Image
              src={"/assets/images/logo-full.png"}
              width={150}
              height={150}
            />
          </Link>
        </div>
        <ul className="lg:flex hidden gap-7">
          <li>
            
            <p className="text-white text-sm cursor-pointer">Product</p>
          </li>
          <li>
            <p className="text-white text-sm cursor-pointer">Solutions</p>
          </li>
          <li>
          <Link href={"/careers"}>

            <p className="text-white text-sm cursor-pointer">Careers</p>
            </Link>
          </li>
          <li>
          <Link href={"/blog"}>
            <p className="text-white text-sm cursor-pointer">Blog</p>
            </Link>
          </li>
          <li>
          <Link href={"/about"}>
            <p className="text-white text-sm cursor-pointer">About</p>
            </Link>
          </li>
        </ul>
        <div>
          <div className="hidden lg:flex justify-start md:justify-center w-full">
            <Link
              href={"/login"}
              className="bg-[#9069e7] text-white rounded-full px-7 py-3 font-semibold"
            >
              Sign In
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
              className={`min-w-80 py-3 absolute lg:hidden right-3 top-3 bg-white h-[80vh] shadow-xl rounded-md outline outline-slate-100 transition-all duration-300 ease-in-out transform space-y-3 ${
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
              {/* <div className="flex justify-end items-end h-full px-3 ">
                <Link
                  href={"/login"}
                  className="bg-gradient-to-r from-blue-500 to-[#00b999] text-white rounded-full px-7 py-3 font-semibold"
                >
                  Sign In
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </header>
  )
}

export default Header
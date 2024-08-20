"use client";
import React, { useState } from "react";

function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
            <a href="#" className="text-white hover:text-gray-300">
              About Us
            </a>
            <select className="bg-transparent text-white">
              <option className="text-black" value="">
                Solutions
              </option>
              <option className="text-black" value="">
                option1
              </option>
              <option className="text-black" value="">
                option2
              </option>
              <option className="text-black" value="">
                option3
              </option>
            </select>
            <a
              href="./login"
              className="text-white hover:text-gray-300 font-bold"
            >
              Login
            </a>
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
              About Us
            </a>
            <a
              href="./login"
              className="block py-2 text-black hover:bg-gray-200"
            >
              Login
            </a>
            <select className="bg-transparent text-black mt-4">
              <option value="">Solutions</option>
              <option value="">option1</option>
              <option value="">option2</option>
              <option value="">option3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

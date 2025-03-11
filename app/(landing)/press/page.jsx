"use client";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { ArrowDownToLine, Blend, Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const Press = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Click handler to update the selected category
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  // Function to filter news based on selected category
  const filterNews = () => {
    if (selectedCategory === "Company News") {
      return newsData.company_news;
    } else if (selectedCategory === "Product News") {
      return newsData.product_news;
    }
    // For 'All', merge company and product news
    return [...newsData.company_news, ...newsData.product_news];
  };
  const newsData = {
    company_news: [
      {
        date: "September 4, 2024",
        title:
          "Independent Research Firm Names Xortcut a Leader in Revenue Orchestration Platforms",
        category: "Company news",
      },
      {
        date: "August 6, 2024",
        title:
          "Xortcut Named to the Forbes Cloud 100 for the Fifth Consecutive Year",
        category: "Company news",
      },
      {
        date: "July 25, 2024",
        title:
          "IDC MarketScape Names Xortcut a Leader in Worldwide Revenue Intelligence Platforms 2024 Vendor Assessment",
        category: "Company news",
      },
      {
        date: "June 26, 2024",
        title:
          "Xortcut Named 'Best AI-Based Solution for Sales' in 2024 AI Breakthrough Awards",
        category: "Company news",
      },
      {
        date: "June 25, 2024",
        title:
          "Xortcut Unveils New AI Capabilities to Help Revenue Teams Drive Excellence in Execution",
        category: "Company news",
      },
      {
        date: "May 15, 2024",
        title:
          "Xortcut Recognizes Top Companies Harnessing AI for Revenue Success",
        category: "Company news",
      },
      {
        date: "May 15, 2024",
        title: "Xortcut Appoints Emily He as Chief Marketing Officer",
        category: "Company news",
      },
      {
        date: "March 26, 2024",
        title:
          "Xortcut Introduces Industry’s First AI 'Ask Anything' Solution for Individual Contacts to Help Revenue Teams Gain More Complete Insights and Boost Efficiency",
        category: "Company news",
      },
      {
        date: "March 5, 2024",
        title: "Xortcut Named to Forbes' List of America’s Best Startup Employers",
        category: "Company news",
      },
    ],
    product_news: [
      {
        date: "September 10, 2024",
        title:
          "Xortcut Launches Enhanced Conversation Intelligence Feature for Real-Time Sales Coaching",
        category: "Product news",
      },
      {
        date: "August 22, 2024",
        title:
          "Xortcut Expands AI-Powered Forecasting Tools to Improve Revenue Predictions",
        category: "Product news",
      },
      {
        date: "July 12, 2024",
        title: "Xortcut Adds Multilingual Support for Global Sales Teams",
        category: "Product news",
      },
      {
        date: "June 30, 2024",
        title:
          "Xortcut Integrates with Major CRM Systems to Provide Seamless Data Syncing",
        category: "Product news",
      },
      {
        date: "May 20, 2024",
        title: "Xortcut Introduces New Mobile App for On-the-Go Sales Insights",
        category: "Product news",
      },
    ],
  };
  const renderNewsGrid = () => {
    const filteredNews = filterNews();
    return filteredNews.map((news, index) => (
      <div
      key={index}
      className="relative p-4 border group rounded-md h-72 shadow bg-[#ebf7fe] hover:bg-[#3caff2] hover:text-white overflow-hidden"
    >
      <div className="flex w-full justify-between items-center">
        <p className="text-[#3e0075] text-sm font-semibold bg-white py-[1px] px-2 rounded-full ">
          {news.category}
        </p>
        <p className=" text-sm text-[#3e0075] font-medium group-hover:text-white">{news.date}</p>
      </div>
      <h3 className="text-sm font-medium mt-7">{news.title}</h3>
      
      
        <div className="absolute bottom-0 left-0 p-4 text-red-500 group-hover:text-white">
        <Blend />
        </div>
    
      
    </div>
    
    ));
  };
  return (
    <main className="relative w-full ">
      <div className="min-h-screen bg-white py-2">
      <Header  />
      <div className="container mx-auto px-3 max-md:flex max-md:flex-col gap-7">
          <div className="text-[#3e0075] text-center md:mt-28 mt-10 text-6xl max-md:text-4xl font-bold">
            NEWSROOM
          </div>
          <p className="text-[#3e0075] text-center md:mt-10 text-sm font-medium">
            The latest news on Xortcut
          </p>
          <div className="md:mt-10 flex justify-center items-center gap-5 flex-wrap">
            <div className="p-4 bg-[#f2f2f2] min-w-72 rounded-md flex items-center justify-between">
              <h4 className="uppercase font-semibold text-[#8058e7]">
                Contact
              </h4>
              <a
                href="mailto:press@doutya.com"
                className="text-[#3e0075] text-sm font-semibold py-2"
              >
                press@doutya.com
              </a>
            </div>
            <div className="p-4 bg-[#f2f2f2] min-w-72 rounded-md flex items-center justify-between">
              <h4 className="uppercase font-semibold text-[#8058e7]">Follow</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com"
                  className="text-[#8058e7] rounded-full bg-white p-2 text-sm font-semibold"
                >
                  <Instagram />
                </a>
                <a
                  href="https://www.facebook.com"
                  className="text-[#8058e7] rounded-full bg-white p-2 text-sm font-semibold"
                >
                  <Facebook />
                </a>
              </div>
            </div>
            <div className="p-4 bg-[#f2f2f2] min-w-72 rounded-md flex items-center justify-between">
              <h4 className="uppercase font-semibold text-[#8058e7]">
                media resources
              </h4>
              <a
                href="https://www.facebook.com"
                className="text-[#8058e7] rounded-full bg-white p-2 text-sm font-semibold"
              >
                <ArrowDownToLine />
              </a>
            </div>
          </div>
          <div className="md:mt-10 mt-3 flex max-md:flex-col ">
            <div className="w-full bg-[#1c143b] p-3 max-md:first:rounded-t-md md:rounded-l-md space-y-4">
              <h6 className="text-yellow-400 uppercase text-lg font-bold">
                Latest Story
              </h6>
              <p className="text-white text-3xl font-medium">
                Independent Research Firm Names Xortcut a Leader in Revenue
                Orchestration Platforms{" "}
              </p>
            </div>
            <Image
              className="max-md:first:rounded-t-md md:rounded-r-md"
              src={"/assets/images/news.webp"}
              width={500}
              height={500}
            />
          </div>
          <div className="flex justify-center items-center md:gap-5 gap-3 flex-wrap md:mt-10">
            <div
              onClick={() => handleCategoryClick("All")}
              className={`md:p-4 p-2 rounded-full cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-[#8058e7] text-white"
                  : "bg-[#f2f2f2] text-[#8058e7]"
              }`}
            >
              <p className="uppercase font-medium text-center text-xs">All</p>
            </div>
            <div
              onClick={() => handleCategoryClick("Company News")}
              className={`md:p-4 p-2 rounded-full cursor-pointer ${
                selectedCategory === "Company News"
                  ? "bg-[#8058e7] text-white"
                  : "bg-[#f2f2f2] text-[#8058e7]"
              }`}
            >
              <p className="uppercase font-medium text-center text-xs">
                Company News
              </p>
            </div>
            <div
              onClick={() => handleCategoryClick("Product News")}
              className={`md:p-4 p-2 rounded-full cursor-pointer ${
                selectedCategory === "Product News"
                  ? "bg-[#8058e7] text-white"
                  : "bg-[#f2f2f2] text-[#8058e7]"
              }`}
            >
              <p className="uppercase font-medium text-center text-xs">
                Product News
              </p>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1  md:grid-cols-3  gap-6 md:mt-10 md:mb-10 mb-5">
            {renderNewsGrid()}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Press;

import { ArrowDownToLine, Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import React from "react";

const Press = () => {
  const company_news = [
    {
      date: "September 4, 2024",
      title:
        "Independent Research Firm Names Gong a Leader in Revenue Orchestration Platforms",
      category: "Company news",
    },
    {
      date: "August 6, 2024",
      title:
        "Gong Named to the Forbes Cloud 100 for the Fifth Consecutive Year",
      category: "Company news",
    },
    {
      date: "July 25, 2024",
      title:
        "IDC MarketScape Names Gong a Leader in Worldwide Revenue Intelligence Platforms 2024 Vendor Assessment",
      category: "Company news",
    },
    {
      date: "June 26, 2024",
      title:
        "Gong Named 'Best AI-Based Solution for Sales' in 2024 AI Breakthrough Awards",
      category: "Company news",
    },
    {
      date: "June 25, 2024",
      title:
        "Gong Unveils New AI Capabilities to Help Revenue Teams Drive Excellence in Execution",
      category: "Company news",
    },
    {
      date: "May 15, 2024",
      title: "Gong Recognizes Top Companies Harnessing AI for Revenue Success",
      category: "Company news",
    },
    {
      date: "May 15, 2024",
      title: "Gong Appoints Emily He as Chief Marketing Officer",
      category: "Company news",
    },
    {
      date: "March 26, 2024",
      title:
        "Gong Introduces Industry’s First AI 'Ask Anything' Solution for Individual Contacts to Help Revenue Teams Gain More Complete Insights and Boost Efficiency",
      category: "Company news",
    },
    {
      date: "March 5, 2024",
      title: "Gong Named to Forbes' List of America’s Best Startup Employers",
      category: "Company news",
    },
  ];
  return (
    <main className="relative w-full ">
      <div className="min-h-screen bg-white py-2">
        <header className="h-20 bg-red-400 w-full" />
        <div className="max-w-[1200px] mx-auto px-3">
          <h2 className="text-[#3e0075] text-center mt-28 text-6xl max-md:text-4xl font-bold">
            NEWSROOM
          </h2>
          <p className="text-[#3e0075] text-center mt-10 text-sm font-medium">
            The latest news on Xortlist
          </p>
          <div className="mt-10 flex justify-center items-center gap-5 flex-wrap">
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
          <div className="mt-10 flex max-md:flex-col ">
            <div className="w-full bg-[#3e0075] p-3 max-md:first:rounded-t-md md:rounded-l-md space-y-4">
              <h6 className="text-yellow-400 uppercase text-lg font-bold">
                Latest Story
              </h6>
              <p className="text-white text-3xl font-medium">
                Independent Research Firm Names Gong a Leader in Revenue
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
        </div>
      </div>
    </main>
  );
};

export default Press;

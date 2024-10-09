import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import { IoChevronForwardOutline } from "react-icons/io5";

const page = () => {
  const currentOpenings = [
    {
      title: "Account Executive - EBU",
      department: "Sales",
      location: "Remote (US)",
    },
    {
      title: "Account Executive - Emerging Markets",
      department: "Sales",
      location: "Salt Lake City | San Francisco",
    },
    {
      title: "Account Executive, Mid Market - Israel",
      department: "Sales",
      location: "Dublin",
    },
    {
      title: "APAC Mid-Market Account Executive",
      department: "Sales",
      location: "Singapore",
    },
    {
      title: "CI/CD Engineer",
      department: "R&D",
      location: "Tel Aviv",
    },
    {
      title: "Commercial Account Executive",
      department: "Sales",
      location: "Chicago",
    },
    {
      title: "Commercial Account Executive",
      department: "Sales",
      location: "San Francisco",
    },
    {
      title: "Commercial Account Executive DACH",
      department: "Sales",
      location: "Dublin",
    },
    {
      title: "Commercial Account Executive - Nordics",
      department: "Sales",
      location: "Dublin",
    },
    {
      title: "Customer Lifecycle Marketing Manager - Retention",
      department: "Marketing",
      location: "Chicago | New York | Salt Lake City | San Francisco",
    },
  ];
  return (
    <main className="relative w-full ">
      <div className=" md:min-h-screen bg-[#3e0075] ">
      <Header />
      <div className="py-4 justify-center items-center flex flex-col h-full w-full gap-7">
          <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center">
            BECOME A XORTIAN
          </h1>
          <h6 className="text-white font-medium text-sm max-md:text-center">
            Be part of Xortlist’s worldwide expansion!
          </h6>
          <Image
            src={"/assets/images/trophy1.webp"}
            width={1200}
            height={1200}
          />
        </div>
      </div>
      <div className=" md:min-h-screen bg-white ">
        <div className=" max-w-[1240px] mx-auto p-3 ">
          <h1 className="text-[#3e0075] text-4xl max-md:text-3xl font-bold uppercase">
            Current Openings
          </h1>

          <div className="grid gap-3 grid-cols-12 mt-6">
            {currentOpenings?.length > 0 &&
              currentOpenings?.map((item, index) => {
                return (
                  <div key={index} className="col-span-12 group md:col-span-6 rounded-md p-3 bg-[#f5edff] hover:bg-[#9069e7] flex flex-col justify-between">
                    <div className="w-full flex justify-between items-center text-[#3e0075] font-semibold text-lg">
                      <p className="group-hover:text-white">{item.title}</p>
                      <ChevronRight className="group-hover:text-white text-[#3e0075]" />
                    </div>
                    <div className="w-full flex justify-between items-center">
                      <p className="text-blue-400 font-semibold uppercase">{item.department}</p>
                      <div className="w-fit rounded-full px-5 py-2 bg-white text-sm">
                        <p className="text-blue-400 text font-medium">{item.location}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default page;

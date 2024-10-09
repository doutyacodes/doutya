import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import Image from "next/image";
import React from "react";

const page = () => {
  const data = {
    sections: [
      {
        title: "Customer Service",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "hexagon",
        color: "bg-yellow-500",
      },
      {
        title: "Diversity",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "hexagon",
        color: "bg-teal-500",
      },
      {
        title: "Trust",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "rectangle",
        color: "bg-blue-500",
      },
      {
        title: "Innovation",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "rectangle",
        color: "bg-pink-500",
      },
    ],
  };
  const getShapeClass = (shape) => {
    switch (shape) {
      case "hexagon":
        return "hexagon-shape";
      case "rectangle":
        return "rectangle-shape";
      default:
        return "";
    }
  };
  return (
    <main className="relative w-full ">
      <div className=" md:min-h-screen bg-[#3e0075] py-4">
        <Header />
        <div className="max-w-[1240px] mx-auto px-3">
          <div className="flex max-md:flex-col w-full pt-5">
            <div className="w-full space-y-5 flex flex-col justify-center">
              <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center">
                WE ARE XORTLIST
              </h1>
              <h6 className="text-white font-medium text-sm max-md:text-center">
                We’re on a mission to help companies transform their revenue
                organizations by harnessing customer interactions to increase
                business efficiency, improve decision-making and accelerate
                revenue growth.
              </h6>
            </div>
            <Image src={"/assets/images/about.svg"} width={800} height={800} />
          </div>
        </div>
      </div>
      <div className=" md:min-h-screen bg-[#1d0254] py-4">
        <div className="max-w-[1240px] mx-auto px-3">
          <div className="flex max-md:flex-col w-full pt-5">
            <div className="w-full space-y-5 flex flex-col justify-center">
              <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center">
                See More. Understand More. Win More.
              </h1>
              <h6 className="text-white font-medium text-sm text-justify tracking-wide">
                Years ago, while CEO at another company, Amit Bendov had an
                idea. His teams were consistently losing deals and no one
                understood why. After reviewing sales calls and emails in search
                of a solution, Amit realized that team members were hearing only
                part of the customer interaction. Lacking an efficient process
                for accessing and synthesizing customer communications,
                executives and their teams would spend hours reviewing CRM
                notes. Despite this laborious effort, most still resorted to
                guesswork rather than what customers were actually telling them
                when making crucial business decisions. The results were
                inefficient seller workflows, misaligned teams, failed strategic
                initiatives, and lost deals. A discussion with his engineer
                friend Eilon Reshef revealed that AI could help solve the
                problem. What ensued was an idea for an AI-powered platform that
                captured customer interactions and analyzed them (at scale) to
                deliver powerful insights, suggest next best actions, and
                automate workflows. Xortlist’s Revenue Intelligence platform was
                born. Today, Xortlist transforms revenue organizations by harnessing
                customer interactions to increase business efficiency, improve
                decision-making and accelerate revenue growth. The Revenue
                Intelligence platform uses proprietary AI technology to enable
                teams to capture every customer interaction, understand and act
                on all customer interactions in a single, integrated platform.
                More than 4,000 companies around the world rely on Xortlist to
                support their go-to-market strategies and grow revenue
                efficiently.
              </h6>
            </div>
          </div>
        </div>
      </div>
      <div className=" bg-white px-4 mx-auto py-10">
        <div className="max-w-[1240px] px-4 mx-auto py-10">
          <div className="grid grid-cols-12 gap-6">
            {data.sections.map((section, index) => (
              <div
                key={index}
                className="flex col-span-6 flex-col items-center"
              >
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-40 md:h-[50vh] object-cover rounded-lg mb-4"
                />
                <div
                  className={`relative px-4 py-2 rounded-md flex justify-center items-center ${
                    section.color
                  } ${getShapeClass(section.shape)}`}
                >
                  <h3 className="text-white font-bold text-center">
                    {section.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default page;

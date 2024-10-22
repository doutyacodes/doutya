import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { Blend } from "lucide-react";
import Image from "next/image";
import React from "react";

const Principle = () => {
  const principles = [
    {
      "id": 1,
      "title": "CREATE RAVING FANS",
      "description": "We don’t want just customers; we only want raving fans. We prioritize selling to customers that are a great fit for Gong, and do our utmost to create the best possible product and service experience. You cannot go wrong by making a customer happy."
    },
    {
      "id": 2,
      "title": "WANT MORE",
      "description": "We are never completely satisfied with our accomplishments. When we achieve new records, we celebrate, and then imagine new ones. Across the product and company we’re building, this applies to everything we do. Every individual and team at Gong strive to be the best at their craft."
    },
    {
      "id": 3,
      "title": "CHALLENGE CONVENTIONAL WISDOM",
      "description": "Conventional wisdom yields conventional results. We want extraordinary results. We encourage ourselves to question common assumptions and 'axioms'. This doesn’t mean we’re doing the opposite of conventional wisdom, but the notion that 'everybody is doing it that way' just doesn’t cut it at Gong."
    },
    {
      "id": 4,
      "title": "WIN AS A TEAM",
      "description": "Gongsters optimize for the team win, and we strive to hire people who prioritize team wins above their own. We’re here to win as a team."
    },
    {
      "id": 5,
      "title": "ACT NOW",
      "description": "Instead of spending too much time discussing how we’re going to act, we simply act. We keep 'work about work' and 'plans for having plans' to the necessary minimum."
    },
    {
      "id": 6,
      "title": "NO SUGAR",
      "description": "As bitter as they may be, we prefer to know the facts. Sugar-coating does not help make decisions or solve problem quickly. We encourage every Gongster to be direct, speak their mind, and expect the same from their peers."
    },
    {
      "id": 7,
      "title": "FAVOR THE LONG TERM",
      "description": "Our vision will take a while to fulfill; When conflicted with taking a shortcut now vs. doing the right thing for the long term, we favor the long term."
    },
    {
      "id": 8,
      "title": "ENJOY THE RIDE",
      "description": "Last but not least: While we’re very serious about our work, we don’t take ourselves too seriously. Have fun and enjoy the ride!"
    }
  ]
  
  const renderprincipleGrid = () => {
    return principles.map((principle, index) => (
      <div
        key={index}
        className="relative p-4  group rounded-xl min-h-[50vh] md:min-h-[70vh] bg-white shadow-xl overflow-hidden shadow-[#f5edff]"
      >
        <div className="text-red-600 my-4">
          <Blend />
        </div>
        <div className="">
          <p className="text-[#3e0075] text-2xl font-extrabold tracking-tighter bg-white py-[1px] px-2 rounded-full ">
            {principle.title}
          </p>
        </div>
        <h3 className="text-sm font-medium mt-7 text-[#3e0075]">
          {principle.description}
        </h3>
        <div className="absolute top-4 right-5 ">
          <p className="text-slate-700/20 text-9xl font-extrabold">{principle.id}</p>
        </div>
      </div>
    ));
  };
  return (
    <main className="relative w-full bg-white">
      <div className=" md:min-h-screen bg-[#1c143b]">
      <Header />
      <div className="container mx-auto px-3">
          <div className="flex max-md:flex-col w-full pt-5">
            <div className="w-full space-y-10 flex flex-col justify-center">
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
            <Image
              src={"/assets/images/about.svg"}
              className="max-md:mt-10"
              width={800}
              height={800}
            />
          </div>
        </div>
      </div>
      <div className="bg-[#f5edff]">
        <div className="container py-5 mx-auto px-3">
          <div className="w-full space-y-10 flex flex-col justify-center">
            <h1 className="text-[#3e0075] text-4xl font-bold max-md:text-center">
              WHAT DOES IT MEAN TO LEAD AT XORTLIST?
            </h1>
            <h6 className="text-[#3e0075] font-medium text-sm max-md:text-center">
              We’re on a mission to help companies transform their revenue
              organizations by harnessing customer interactions to increase
              business efficiency, improve decision-making and accelerate
              revenue growth.
            </h6>
          </div>
        </div>
      </div>

      <div className="bg-[#fefdfe]">
        <div className="container py-5 mx-auto px-3">
          <div className="grid grid-cols-1  md:grid-cols-3  gap-6 mt-10">
            {renderprincipleGrid()}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Principle;

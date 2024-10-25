"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import Navbar from "../dashboard/_components/Navbar/page";
import CareerStripe from "@/app/_components/CareerStripe";

const Home = () => {
  const router = useRouter();
  const homeData = [
    {
      id: 1,
      title: "Find your strengths",
      MainTitle: "Career Assessment Test",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aut soluta nostrum debitis natus molestiae, aperiam iure a fugit quo sunt vitae? Voluptates aspernatur, ipsa pariatur illo soluta excepturi non assumenda.",
      color1: "#57d6e2",
      color2: "#0450af",
      location: "/dashboard",
    },
    {
      id: 2,
      title: "Follow the right career",
      MainTitle: "Career Guidance Companion",
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aut soluta nostrum debitis natus molestiae, aperiam iure a fugit quo sunt vitae? Voluptates aspernatur, ipsa pariatur illo soluta excepturi non assumenda.",
      color1: "#ffbd59",
      color2: "#ffbd59",
      location: "/dashboard/careers/career-guide",
    },
  ];
  return (
    <div>
      <CareerStripe />
      <div className="p-4 ">
        <div className="w-full flex gap-5 md:gap-20  max-sm:flex-col justify-center items-center container mx-auto min-h-[75vh] pt-4">
          {homeData?.length > 0 &&
            homeData?.map((item) => {
              return (
                <div
                  key={item.id}
                  className=" pt-3 p-[1px] rounded-lg max-w-96 min-h-96 flex-1"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${item.color1}, ${item.color2})`,
                  }}
                >
                  <h3 className="font-bold text-center text-white text-sm pb-2 uppercase">
                    {item.title}
                  </h3>
                  <div className="bg-[#191134] h-full min-h-96 rounded-lg p-3 gap-3 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-center text-white uppercase">
                        {item.MainTitle}
                      </h3>
                      <div className="bg-slate-600 p-[1px]" />
                      <p className="text-white text-justify text-xs">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex justify-center items-center">
                      <Link
                        href={item.location}
                        className="hover:cursor-pointer bg-[#7824f6] p-3 rounded-full w-40 "
                      >
                        <p className="text-white text-center">Get Started</p>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Home;

import React from "react";
import "./test.css";
import LeftSideBar from "./LeftSideBar/LeftSideBar";
import { FaChevronRight } from "react-icons/fa"; // Example icons

const careers = [
  {
    title: "Cloud Solutions Architect",
    match: "84%",
    status: "trending",
    link: "Read More",
    id: 1,
  },
  {
    title: "Cybersecurity Analyst",
    match: "83%",
    status: "trending",
    link: "Read More",
    id: 2,
  },
  {
    title: "Data Scientist",
    match: "81%",
    status: "trending",
    link: "Read More",
    id: 3,
  },
];
const page = () => {
  return (
    <div className="w-screen min-h-screen bg-blue-300 flex ">
      <LeftSideBar />
      <div className="flex-grow  h-full p-4">
        <div className="flex flex-wrap gap-5">
          {careers?.length > 0 &&
            careers?.map((item) => {
              return (
                <div
                  className="pt-8 bg-[#303030] px-3 relative w-64 pb-3 rounded-md shadow hover:scale-105 transition-all ease-in-out duration-150 space-y-3 shadow-slate-800"
                  key={item.id}
                >
                  <p className="py-1 px-3 bg-blue-500 text-white font-semibold w-fit text-[10px] top-2 right-2 rounded-full absolute">
                    {item.status}
                  </p>
                  <div className="">
                    <h4 className=" text-white text-wrap font-bold">
                      {item.title}
                    </h4>
                  </div>
                  <div className=" text-xs text-gray-300">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Minima ad facilis placeat aliquam odit distinctio sapiente.
                    Voluptates nesciunt soluta, facilis quam recusandae delectus
                    ut ullam! Distinctio nihil veniam quo dolore!
                  </div>
                  <div className="w-full flex justify-end items-end">
                    <button className="w-fit bg-[#7824f6]  rounded-full px-3 py-2 flex gap-2 items-center">
                      <p className="text-sm text-white">Read More</p>
                      <FaChevronRight size={10} color="white" />{" "}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default page;

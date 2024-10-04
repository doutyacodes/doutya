"use client";
// import { useEffect, useState } from "react";
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import HeroImageWithSideImages from "./_components/HeroImageWithSideImages";
// import { Play } from "lucide-react";

// export default function Page() {
//   const [loading, setLoading] = useState(true);

//   //  useEffect(()=>{
//   //     const url = typeof window !== "undefined" ? localStorage.getItem("dashboardUrl") : null;
//   //     if(url){
//   //       redirect(url)
//   //     } else {
//   //       redirect("/login")
//   //     }
//   //   },[])
//   return (
//     <main className="bg-[#13164a] min-h-screen min-w-full">
//       <div className="mx-auto max-w-[1400px]">
//         <section className="min-h-screen w-full">
//           <div className="p-4">
//             <Image
//               src={"/assets/images/logo-full.png"}
//               width={150}
//               height={150}
//             />
//           </div>
//           <div className="h-full w-full px-4 flex md:min-h-[40vh] flex-col justify-center items-center space-y-7">
//             <h1 className="text-white md:text-6xl text-4xl font-semibold md:text-center md:leading-relaxed md:w-4/5">
//               Next-Generation{" "}
//               <span className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 text-transparent bg-clip-text">
//                 AI Powered
//               </span>{" "}
//               SEO Content Generator
//             </h1>
//             <p className="text-slate-300 md:text-center md:leading-relaxed md:w-2/5">
//               Generate SEO-friendly content effortlessly and watch your organic
//               traffic soar with our AI-powered writing tool.
//             </p>
//             <div className="flex justify-start md:justify-center w-full">
//               <Link
//                 href={"/dashboard"}
//                 className="bg-gradient-to-r from-green-500 to-[#00b999] text-white rounded-lg px-7 py-3 font-bold text-lg"
//               >
//                 Get Started
//               </Link>
//             </div>
//             <div className="relative w-full">
//               <Image
//                 src={
//                   "https://images.pexels.com/photos/3760072/pexels-photo-3760072.jpeg"
//                 }
//                 width={1386}
//                 height={300}
//                 objectFit="cover"
//                 className="rounded-lg"
//               />
//               <button className="hover:scale-110  transition-transform ease-in-out duration-200 bg-gradient-to-r from-[#0086e6] to-[#00c587] p-8 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                 <Play className="text-white" />
//               </button>
//             </div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import ListComponents from "./_components/ListComponents";
import Footer from "./_components/Footer";

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(1);
  const [featureLink, setFeatureLink] = useState(1);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const revenueList = [
    {
      id: 1,
      title: "Team Productivity",
      image:
        "https://www.gong.io/wp-content/uploads/2024/02/Team-Productivity.png",
      image2: "https://www.gong.io/wp-content/uploads/2024/02/pitchbook.svg",
      subTitle: "10x sales efficiency",
      description:
        "Save time and maximize team effectiveness with AI-powered insights and guidance.",
    },
    {
      id: 2,
      title: "Revenue Predictability",
      image:
        "https://www.gong.io/wp-content/uploads/2024/02/Revenue-Predictability.png",
      image2: "https://www.gong.io/wp-content/uploads/2024/02/image-42.svg",
      subTitle: "95% forecast accuracy",
      description:
        "Deliver a strong quarter every quarter with AI that powers precise pipeline management and accurate forecasts.",
    },
    {
      id: 3,
      title: "Pipeline Growth",
      image:
        "https://www.gong.io/wp-content/uploads/2024/02/Pipeline-Growth.png",
      image2: "https://www.gong.io/wp-content/uploads/2024/02/image-44.svg",
      subTitle: "80% increase in email response rate",
      description:
        "Create, accelerate, and close pipeline with customer-centric sales engagement.",
    },
  ];
  const activeItem = revenueList.find((item) => item.id === activeLink);
  const features = [
    {
      id: 1,
      description: "Built on customer interactions",
    },
    {
      id: 2,
      description: "Powered by the industry’s leading AI",
    },
    {
      id: 3,
      description: "Meaningful insights to drive action",
    },
    {
      id: 4,
      description: "Enriched by a robust ecosystem",
    },
    {
      id: 5,
      description: "Purpose-built for revenue workflows and outcomes",
    },
  ];

  return (
    <main className="relative w-full max-lg:bg-white min-h-screen">
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
            <p className="text-white text-sm cursor-pointer">Customer</p>
          </li>
          <li>
            <p className="text-white text-sm cursor-pointer">Resources</p>
          </li>
          <li>
            <p className="text-white text-sm cursor-pointer">Company</p>
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
      <video
        autoPlay
        loop
        muted
        // controls
        className="lg:absolute top-0 left-0 w-full h-full object-cover lg:h-screen -z-20 max-lg:rounded-lg"
      >
        <source src="/assets/videos/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="lg:absolute max-md:hidden top-0 left-0 w-full h-full bg-black opacity-50 -z-10"></div>
      <div className=" container z-50 h-full w-full max-lg:mt-16  lg:h-screen lg:flex items-center">
        <div className="space-y-5 max-w-[1200px] mx-auto px-4">
          <h1 className="lg:text-white lg:text-5xl text-3xl font-bold lg:leading-relaxed leading-normal lg:w-3/5 max-lg:text-center uppercase">
            <span className="bg-blue-600  text-transparent bg-clip-text">
              Next-Generation AI{" "}
            </span>
            Powered SEO Content Generator
          </h1>
          <p className=" max-lg:text-center text-blue-600 font-medium lg:w-3/6">
            Engage customers, forecast accurately, and improve team
            productivity, all in one revenue intelligence platform.
          </p>
          <div className="flex max-lg:justify-center w-full">
            <Link
              href={"/login"}
              className="bg-[#9069e7] text-white rounded-full px-7 py-3 font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-xl outline outline-slate-100 p-3 rounded-t-3xl mt-5 space-y-5 pt-10 w-full">
        <h1 className="text-center text-[#3e0075] lg:text-5xl text-3xl font-bold w-4/5 mx-auto ">
          The world’s leading companies power their revenue workflows with
          Xortlist
        </h1>
        <div className="w-full flex justify-center items-center flex-col max-w-[1200px] mx-auto">
          <div className="mt-14 flex flex-wrap gap-5 mx-auto  p-3 md:gap-7">
            {revenueList?.length > 0 &&
              revenueList?.map((item) => {
                return (
                  <div
                    onClick={() => setActiveLink(item.id)}
                    key={item.id}
                    className=" max-sm:w-full"
                  >
                    <p
                      className="md:text-2xl text-center font-bold"
                      style={{
                        color: activeLink == item.id ? "#a572e8" : "black",
                      }}
                    >
                      {item.title}
                    </p>
                  </div>
                );
              })}
          </div>
          <div>
            {activeItem && (
              <div className="w-full p-6 mt-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* On md and above: image on the left, other content on the right */}
                  <div className="md:w-1/2 w-full">
                    <img
                      src={activeItem.image}
                      alt={activeItem.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  <div className="md:w-1/2 w-full md:space-y-10">
                    <Image
                      src={activeItem.image2}
                      alt={activeItem.title + " secondary"}
                      width={240}
                      height={240}
                      className=" object-cover mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-2 md:text-4xl">
                      {activeItem.subTitle}
                    </h3>
                    <p className="text-gray-600 md:w-4/5">
                      {activeItem.description}
                    </p>
                  </div>
                </div>

                {/* On small screens: stack images and content */}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full bg-gradient-to-tr from-[#b1aaf6] to-[#8054df]">
        <div className="w-full max-w-[1200px] mx-auto px-3 py-5 space-y-4">
          <h1 className="text-white text-2xl md:text-4xl font-bold text-center">
            From Interactions to Insights to Revenue — All in One Platform
          </h1>
          <div className="grid grid-cols-12 w-full gap-3">
            <div className="col-span-12 w-full md:col-span-6 ">
              <div className="h-[1px] bg-white w-full" />
              {
               features?.length > 0 && features?.map((item,index)=>{
                return(
                  <div className="w-full" onClick={()=>setFeatureLink(item.id)}>
                  <p className="my-8 text-white/70 hover:text-white font-semibold text-lg">0{index+1}{" "}{item.description}</p>
                  <div className="h-[1px] bg-white w-full" />

                  </div>
                )
               })
              }
              
            </div>
            <div className="col-span-12 w-full md:col-span-6">
              <Image src={`/assets/images/${featureLink}.webp`} width={600} height={700} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Page;

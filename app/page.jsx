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
import React, { useEffect, useState } from "react";
import Footer from "./_components/Footer";
import { cn } from "@/lib/utils";
import Header from "./_components/Header";
import { useRouter } from "next/navigation";

const Page = () => {
  const [activeLink, setActiveLink] = useState(1);
  const [featureLink, setFeatureLink] = useState(1);

  const router = useRouter();

  // useEffect(() => {
  //     router.replace("/login");
  // }, []);

  const revenueList = [
    {
      id: 1,
      title: "Discover Your True Fit",
      image:
        "https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg",
     
      description:
        "Xortlist leverages cutting-edge AI algorithms to analyze your unique personality, strengths, and interests. Through engaging quizzes and insightful data, our system identifies career paths that align with who you truly are.",
    },
    {
      id: 2,
      title: "Navigate Your Career Landscape",
      image:
        "https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg",
      description:
        "With a comprehensive career database powered by AI, Xortlist offers a diverse array of options—from traditional roles to trending, offbeat, and futuristic careers. Simply enter any career you’re curious about, and our AI generates a detailed, customized roadmap to guide you through the necessary steps to success.",
    },
    {
      id: 3,
      title: "Chart Your Course to Success",
      image:
        "https://images.pexels.com/photos/4065137/pexels-photo-4065137.jpeg",
      description:
        "After selecting a career path, Xortlist utilizes advanced AI to create a personalized roadmap, outlining essential steps such as education, skill acquisition, and internships. Users can track their progress, set milestones, get tested continously and receive real-time feedback, ensuring they stay motivated and on track throughout their journey.",
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
  const resources = [
    {
      type: "news",
      title: "Xortlist named a leader in Forrester Wave 2024",
      image: "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
      description: "Revenue Orchestration Platforms For B2B",
    },
    {
      type: "executive blog",
      title: "Why Companies are Shifting to AI-Powered Revenue Forecasting",
      description: "",
      image: null,
    },
    {
      type: "ebook",
      title: "8 Key Email Templates for Sales Success",
      description: "",
      image: null,
    },
    {
      type: "xortlist labs",
      title:
        "Selling is more complex than ever, and 24M sales calls told us why",
      description: "",
      image: "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
    },
  ];
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveLink((prevLink) =>
        prevLink < revenueList.length ? prevLink + 1 : 1
      );
    }, 3000); // Change active link every 3 seconds

    return () => clearTimeout(timer); // Cleanup timeout on component unmount
  }, [activeLink]);

  // Calculate progress percentage

  return (
    <main className="relative w-full max-lg:bg-white min-h-screen">
      <Header />
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
        <div className="space-y-5 container mx-auto px-3">
          <h1 className="lg:text-white lg:text-5xl text-3xl font-bold lg:leading-relaxed leading-normal lg:w-3/5 max-lg:text-center uppercase">
          Your Future Awaits -
          </h1>
         <p className="lg:text-white lg:text-5xl text-3xl font-bold lg:leading-relaxed leading-normal lg:w-2/5 max-lg:text-center uppercase"> Are You Ready to Discover It?</p>
          <p className=" max-lg:text-center text-white font-medium lg:w-3/6">
          Discover, navigate, and conquer your career options with Xortlist’s smart AI-driven insights.
          </p>
          <div className="flex max-lg:justify-center w-full">
            <Link
              href={"/login"}
              className="bg-[#01bf61] text-white rounded-full px-7 py-3 font-semibold"
            >
              Explore Now
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-xl outline outline-slate-100 p-3 rounded-t-3xl mt-5 space-y-5 pt-10 w-full">
        <h1 className="text-center text-[#3e0075] lg:text-5xl text-3xl font-bold w-4/5 mx-auto ">
        Empowering Your Future with AI-Driven Career Guidance
        </h1>
        <div className="w-full flex justify-center items-center flex-col container mx-auto">
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
                      className="md:text-2xl text-center font-bold cursor-pointer"
                      style={{
                        color: activeLink == item.id ? "#a572e8" : "black",
                      }}
                    >
                      {item.title}
                    </p>
                    {activeLink == item.id && (
                      <div className="w-full h-2 bg-gray-200 mb-4 rounded mt-5">
                        <div
                          className="h-full rounded-full bg-[#a572e8] transition-all duration-500 ease-in-out"
                          style={{
                            width: `${
                              (activeLink / revenueList.length) * 100
                            }%`,
                          }}
                        />
                      </div>
                    )}
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
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>

                  <div className="md:w-1/2 w-full md:space-y-10">
                    
                    <p className="md:w-4/5 text-lg">
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
      {/* <div className="w-full bg-gradient-to-tr from-[#b1aaf6] to-[#8054df]">
        <div className="w-full container mx-auto px-3 py-5 space-y-4">
          <h1 className="text-white text-2xl md:text-4xl font-bold text-center">
            From Interactions to Insights to Revenue — All in One Platform
          </h1>
          <div className="grid grid-cols-12 w-full gap-3">
            <div className="col-span-12 w-full md:col-span-6 ">
              <div className="h-[1px] bg-white w-full" />
              {features?.length > 0 &&
                features?.map((item, index) => {
                  return (
                    <div
                      className="w-full"
                      onClick={() => setFeatureLink(item.id)}
                    >
                      <p className="my-8 text-white/70 hover:text-white font-semibold text-lg">
                        0{index + 1} {item.description}
                      </p>
                      <div className="h-[1px] bg-white w-full" />
                    </div>
                  );
                })}
            </div>
            <div className="col-span-12 w-full md:col-span-6">
              <Image
                src={`/assets/images/${featureLink}.webp`}
                width={600}
                height={700}
              />
            </div>
          </div>
        </div>
      </div> */}
      {/* <div className="w-full bg-white">
        <div className="mx-auto container p-3">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-4 space-y-5">
              <p className="text-center md:text-left uppercase font-semibold text-lg text-[#8039df]">
                Resources
              </p>
              <p className="text-center md:text-left uppercase font-bold text-3xl text-[#3e0075] ">
                Unlock your team’s revenue potential
              </p>
            </div>
            <div className="col-span-12 md:col-span-8 space-y-5 grid grid-cols-12 gap-3">
              {resources?.length > 0 &&
                resources?.map((item, index) => {
                  return (
                    <div
                      className={cn(
                        "w-full shadow hover:shadow-lg  p-4 bg-white border border-slate-300 rounded-md",
                        index == 0 || index == 3
                          ? "col-span-12 md:col-span-8 md:flex"
                          : "col-span-12 md:col-span-4"
                      )}
                    >
                      <div className="space-y-4">
                        <p className="uppercase font-semibold text-[#8039df]">
                          {item.type}
                        </p>
                        <p className="uppercase text-xl font-semibold text-[#3e0075]">
                          {item.title}
                        </p>
                      </div>
                      {item.image && (
                        <div className="w-full h-full relative max-md:hidden">
                          <Image src={item.image} fill className="rounded-md" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div> */}
      <Footer />
    </main>
  );
};
// return(
//   <>
//   </>
// )
// }

export default Page;

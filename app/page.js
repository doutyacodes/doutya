"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import HeroImageWithSideImages from "./_components/HeroImageWithSideImages";
import { Play } from "lucide-react";

export default function Page() {
  const [loading, setLoading] = useState(true);

  //  useEffect(()=>{
  //     const url = typeof window !== "undefined" ? localStorage.getItem("dashboardUrl") : null;
  //     if(url){
  //       redirect(url)
  //     } else {
  //       redirect("/login")
  //     }
  //   },[])
  return (
    <main className="bg-[#13164a] min-h-screen min-w-full">
      <div className="mx-auto max-w-[1400px]">
        <section className="min-h-screen w-full">
          <div className="p-4">
            <Image
              src={"/assets/images/logo-full.png"}
              width={150}
              height={150}
            />
          </div>
          <div className="h-full w-full px-4 flex md:min-h-[40vh] flex-col justify-center items-center space-y-7">
            <h1 className="text-white md:text-6xl text-4xl font-semibold md:text-center md:leading-relaxed md:w-4/5">
              Next-Generation{" "}
              <span className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 text-transparent bg-clip-text">
                AI Powered
              </span>{" "}
              SEO Content Generator
            </h1>
            <p className="text-slate-300 md:text-center md:leading-relaxed md:w-2/5">
              Generate SEO-friendly content effortlessly and watch your organic
              traffic soar with our AI-powered writing tool.
            </p>
            <div className="flex justify-start md:justify-center w-full">
              <Link
                href={"/dashboard"}
                className="bg-gradient-to-r from-green-500 to-[#00b999] text-white rounded-lg px-7 py-3 font-bold text-lg"
              >
                Get Started
              </Link>
            </div>
            <div className="relative w-full">
              <Image
                src={
                  "https://images.pexels.com/photos/3760072/pexels-photo-3760072.jpeg"
                }
                width={1386}
                height={300}
                objectFit="cover"
                className="rounded-lg"
              />
              <button className="hover:scale-110  transition-transform ease-in-out duration-200 bg-gradient-to-r from-[#0086e6] to-[#00c587] p-8 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Play className="text-white" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

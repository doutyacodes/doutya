"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import HeroImageWithSideImages from "./_components/HeroImageWithSideImages";

export default function Page() {
  const [loading, setLoading] = useState(true);

  // Animation variants for left and right animations
  const leftAnimation = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0 },
  };
  
  const rightAnimation = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
  };
  
 useEffect(()=>{
    const url = typeof window !== "undefined" ? localStorage.getItem("dashboardUrl") : null;
    if(url){
      redirect(url)
    } else {
      redirect("/login")
    }
  },[])
  return (
    <main className="bg-[#13164a] min-h-screen min-w-full p-3">
      <div className="w-full grid-cols-12 grid items-center">
        <div className="col-span-12 sm:col-span-7 space-y-6">
          <h5 className="text-[#17C2EC] font-semibold text-lg">
            Discover Your Future with Xortlist
          </h5>
          <h2 className="text-white font-bold text-5xl leading-tight">
            Discover Your Future with{" "}
            <span className="text-[#17C2EC]">Xortlist</span>
          </h2>
          <p className="text-slate-400 font-semibold text-sm">
            Unlock your true potential with AI-driven insights into your
            personality. Xortlist guides you from a young age, providing
            tailored roadmaps to help you shine in your ideal career.
          </p>
          <div className="flex gap-5 items-center">
            <Link
              className="px-5 py-3 rounded-lg font-bold text-white bg-[#17C2EC]"
              href="/home"
            >
              Get Started
            </Link>
            <Link
              className="px-5 py-3 rounded-lg font-bold text-white bg-transparent outline outline-[#17C2EC]"
              href="/home"
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-5 py-5 px-5">
          <HeroImageWithSideImages loading={loading} setLoading={setLoading} />
        </div>
      </div>

      {/* Animated Sections */}
      <section className="mt-12 grid gap-10 lg:grid-cols-3">
  <motion.div
    className="bg-[rgba(256,256,256,0.2)] p-6 space-y-4 rounded-lg shadow-lg lg:col-span-1"
    variants={leftAnimation}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <h3 className="text-xl font-bold text-[#17C2EC]">
      Personalized Career Paths
    </h3>
    <div className="relative w-full h-96 md:h-72">
      <Image
        src="https://images.pexels.com/photos/3653849/pexels-photo-3653849.jpeg"
        fill
        alt="hero-img"
        className="rounded-lg object-contain"
      />
    </div>
    <p className="text-white">
      Xortlist offers customized career paths based on your unique
      personality traits, helping you reach your full potential.
    </p>
  </motion.div>

  <motion.div
    className="bg-[rgba(256,256,256,0.2)] p-6 space-y-4 rounded-lg shadow-lg lg:col-span-1"
    variants={rightAnimation}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <h3 className="text-xl font-bold text-[#17C2EC]">
      AI-Driven Insights
    </h3>
    <div className="relative w-full h-96 md:h-72">
      <Image
        src="https://images.pexels.com/photos/3653849/pexels-photo-3653849.jpeg"
        fill
        alt="hero-img"
        className="rounded-lg object-contain"
      />
    </div>
    <p className="text-white">
      Our AI algorithms analyze your strengths and weaknesses to suggest
      the best career options for your future success.
    </p>
  </motion.div>

  <motion.div
    className="bg-[rgba(256,256,256,0.2)] p-6 space-y-4 rounded-lg shadow-lg lg:col-span-1"
    variants={leftAnimation}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <h3 className="text-xl font-bold text-[#17C2EC]">
      Comprehensive Roadmaps
    </h3>
    <div className="relative w-full h-96 md:h-72">
      <Image
        src="https://images.pexels.com/photos/3653849/pexels-photo-3653849.jpeg"
        fill
        alt="hero-img"
        className="rounded-lg object-contain"
      />
    </div>
    <p className="text-white">
      Get a detailed roadmap tailored to your needs, guiding you every
      step of the way toward achieving your career goals.
    </p>
  </motion.div>
</section>

    </main>
  );
}

// import React from 'react'
// import PaymentGateway from './_components/PaymentGateway'

// const page = () => {
//   return (
//     <div>
//       <PaymentGateway />
//     </div>
//   )
// }

// export default page
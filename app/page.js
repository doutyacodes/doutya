"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import HeroImageWithSideImages from "./_components/HeroImageWithSideImages";

export default function Page() {
  const [loading, setLoading] = useState(true);

   useEffect(()=>{
      const url = typeof window !== "undefined" ? localStorage.getItem("dashboardUrl") : null;
      if(url){
        redirect(url)
      } else {
        redirect("/login")
      }
    },[])
  return (
    <main className="bg-[#13164a] min-h-screen min-w-full">
      <section className="min-h-screen w-full">
        <div className="p-4">
          <Image src={"/assets/images/logo-full.png"} width={150} height={150} />
        </div>
        <div className="flex-1 bg-red-100 w-full h-full">

        </div>
      </section>
    </main>
  );
}

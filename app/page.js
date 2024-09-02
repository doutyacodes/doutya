"use client"
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function page() {
  useEffect(()=>{
    const url = typeof window !== "undefined" ? localStorage.getItem("dashboardUrl") : null;
    if(url){
      redirect(url)
    } else {
      redirect("/login")
    }
  },[])
  
  return (
    <main>
    </main>
  );
}

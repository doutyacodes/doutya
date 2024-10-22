"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "../_components/LoadingOverlay";
import Results from "../dashboard/_components/Results/page";
import Results2 from "../dashboard/_components/Result2/page";
import BannerJunior from "./_components/Banner/page";
// import Navbarkids from "../dashboard_kids/_components/Navbar/page";
import Navbar from "../dashboard/_components/Navbar/page";
import dynamic from 'next/dynamic';


export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showQuiz2Results, setShowQuiz2Results] = useState(false);
  const [isTest2Completed, setIsTest2Completed] = useState(false);


  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    };
    authCheck();
  }, [router]);

  const toggleResults = () => {
    setShowResults(prevState => !prevState);
  };

  const toggleQuiz2Results = () => {
    setShowQuiz2Results(prevState => !prevState);
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.loadingContainer}>
        <div>
          <div style={styles.loadingText}>
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        </div>
      </div>
    );
  }

  const MobileNavigation = dynamic(() => import('./_components/Button/button.jsx'), { ssr: false });

  return (
    <>
    <Navbar/>
    <div style={styles.dashboardContainer}>
      {/* <Navbarkids /> */}
      {
        !isTest2Completed ?  (
          <>
          <BannerJunior 
            onToggleResults={toggleResults} 
            showResults={showResults} 
            onToggleQuiz2Results={toggleQuiz2Results} 
            showQuiz2Results={showQuiz2Results}
            setIsTest2Completed={setIsTest2Completed}
          />
  
          {/* Animated Image for Kids */}
          <img
            src="https://cdn.prod.website-files.com/6047c2070742bf6f0e9457e6/60d1f12db8b1d09fda86ebb1_Quiz.jpeg"
            alt="Kids Animation"
            style={styles.animatedImage}
          />
  
          {/* Adding keyframes manually using a <style> tag */}
          <style jsx>{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-15px);
              }
              60% {
                transform: translateY(-7px);
              }
            }
          `}</style>
  
          <br />
          <br />
          {showResults && <Results />} 
          {showQuiz2Results && <Results2/>}
        </>
        ) : (
          <Results2 />
        )
      }
      {/* <MobileNavigation /> */}
    </div>
    </>
  )
}

const styles = {
  loadingContainer: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  loadingText: {
    fontWeight: "600",
  },
  dashboardContainer: {
    // background: "linear-gradient(135deg, #ff0099 0%, #493240 100%)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    color: "white",
    // padding: "20px",
    position: "relative",
  },
  animatedImage: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "170px",
    height: "auto",
    borderRadius: "50%",
    animation: "bounce 2s infinite",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
};
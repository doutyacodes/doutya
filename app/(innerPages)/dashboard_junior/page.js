"use client";
import React, { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import BannerJunior from "./_components/Banner/page";
// import Navbarkids from "../dashboard_kids/_components/Navbar/page";
import dynamic from 'next/dynamic';
import LoadingOverlay from "@/app/_components/LoadingOverlay";


export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [isTest2Completed, setIsTest2Completed] = useState(false);

  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isCountryAdded, setIsCountryAdded] = useState(null);
  const [isInstitutionDetailsAdded, setIsInstitutionDetailsAdded] = useState(null);
  const [educationStageExists, setEducationStageExists] = useState(null);
  const [resultPageShown, setResultPageShown] = useState(null);
  const [gradeData, setGradeData] = useState(null);


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

  useEffect(() => {
    if (isTest2Completed) {
      const interval = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);

      // const timer = setTimeout(() => {
      //     if (resultPageShown === false) {
      //       router.replace("/user/results");
      //     } else if (!educationStageExists) {
      //         router.replace("/user/education-profile");
      //     } else if (!isInstitutionDetailsAdded) {
      //         router.replace("/education-details");
      //     } else if (!isCountryAdded) {
      //         console.log("else if");
      //         router.replace("/country");
      //     } else {
      //         // router.replace("/dashboard_junior/cluster-suggestion");
      //         router.replace("/dashboard_kids/sector-suggestion");
      //     }
      // }, 5000);

      const timer = setTimeout(() => {
        if (!educationStageExists) {
            router.replace("/user/education-profile");
        } else if (!isInstitutionDetailsAdded) {
              router.replace("/education-details");
        // } else if (!isCountryAdded) {
        // 1️⃣ Check if country is added
          // console.log("Country not added");
          // router.replace("/country");
        } 
        // 2️⃣ Then go to kids/junior/career suggestion
        else if (["8", "9", "10"].includes(gradeData)) {
          router.replace("/dashboard_junior/cluster-suggestion");
        } 
        else if (["11", "12", "college"].includes(gradeData)) {
          router.replace("/dashboard/careers/career-suggestions");
        }
        else {
          // Default for younger kids
          router.replace("/dashboard_kids/sector-suggestion");
        }

        // 3️⃣ Finally, if results page hasn’t been shown, go there
        // if (resultPageShown === false) {
        //   router.replace("/user/results");
        // }

        // 4️⃣ Commented out for now
        /*
        else if (!educationStageExists) {
          router.replace("/user/education-profile");
        } else if (!isInstitutionDetailsAdded) {
          router.replace("/education-details");
        }
        */
      }, 5000);


      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isTest2Completed, isInstitutionDetailsAdded, isCountryAdded, educationStageExists, router, resultPageShown]);


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

  if (isTest2Completed) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-center">
        <div>
          <div className="text-4xl font-semibold">
            All tests are completed!
          </div>
          <p className="mt-4">
            Redirecting to the career suggestions in {secondsRemaining} seconds...
          </p>
        </div>
      </div>
    );
  }

  const MobileNavigation = dynamic(() => import('./_components/Button/button.jsx'), { ssr: false });

  return (
    <>
    {/* <CareerStripe/> */}
    <div style={styles.dashboardContainer}>
      {/* <Navbarkids /> */}
      {
        !isTest2Completed &&(
          <>
          <BannerJunior 
            setIsTest2Completed={setIsTest2Completed}
            setIsCountryAdded={setIsCountryAdded}
            setIsInstitutionDetailsAdded={setIsInstitutionDetailsAdded}
            setEducationStageExists={setEducationStageExists}
            setResultPageShown={setResultPageShown}
            setGradeData={setGradeData}
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
        </>
        ) 
      }
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
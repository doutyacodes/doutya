"use client"
import React, { useEffect, useState } from 'react'
import Banner from './_components/Banner/page'
import Results from './_components/Results/page'
import Results2 from './_components/Result2/page'
import { redirect, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic';
import LoadingOverlay from '@/app/_components/LoadingOverlay'
import CareerStripe from '@/app/_components/CareerStripe'

export default function Dashboard() {
  const [showResults, setShowResults] = useState(false);
  const [isTest2Completed, setIsTest2Completed] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Changed to null initially
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [isCountryAdded, setIsCountryAdded] = useState(null);
  const [isInstitutionDetailsAdded, setIsInstitutionDetailsAdded] = useState(null);
  const [educationStageExists, setEducationStageExists] = useState(null);
  const [resultPageShown, setResultPageShown] = useState(null);
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false); // New state to track data loading
  const [initialDataCheck, setInitialDataCheck] = useState(false); // Track if initial data check is done
  const [gradeData, setGradeData] = useState(null);

  
  useEffect(() => {
    const authCheck = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push('/login');
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(true)
        }
      }
    };
    authCheck()
  }, [router]);

  // New useEffect to handle dashboard data loading completion
  useEffect(() => {
    // Set a timeout to ensure we don't wait indefinitely
    const timeout = setTimeout(() => {
      if (!initialDataCheck) {
        setInitialDataCheck(true);
        setLoading(false);
        setDashboardDataLoaded(true);
      }
    }, 2000); // Wait max 2 seconds for Banner to set states

    // This will be triggered when Banner component sets the required states
    if (
      isCountryAdded !== null && 
      isInstitutionDetailsAdded !== null && 
      educationStageExists !== null && 
      resultPageShown !== null
    ) {
      setDashboardDataLoaded(true);
      setLoading(false);
      setInitialDataCheck(true);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [isCountryAdded, isInstitutionDetailsAdded, educationStageExists, resultPageShown, initialDataCheck]);

  useEffect(() => {
    if (isTest2Completed && dashboardDataLoaded) {
      const interval = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);

      // const timer = setTimeout(() => {
      //   if (resultPageShown === false) {
      //     router.replace("/user/results");
      //   } else if (!edweucationStageExists) {
      //     router.replace("/user/education-profile");
      //   } else if (!isInstitutionDetailsAdded) {
      //     router.replace("/education-details");
      //   } else if (!isCountryAdded) {
      //     router.replace("/country");
      //   } else {
      //     if (["9", "10"].includes(gradeData)) {
      //       router.replace("/dashboard_junior/cluster-suggestion");
      //     } else if (["11", "12", "college"].includes(gradeData)){
      //       router.replace("/dashboard/careers/career-suggestions");
      //     }
      //   }
      // }, 5000);

      const timer = setTimeout(() => {
        // 1️⃣ Check if country is added first
        if (!isCountryAdded) {
          router.replace("/country");
        } 
        // 2️⃣ Then check grade-based suggestions
        else if (["8", "9", "10"].includes(gradeData)) {
          router.replace("/dashboard_junior/cluster-suggestion");
        } 
        else if (["11", "12", "college"].includes(gradeData)) {
          router.replace("/dashboard/careers/career-suggestions");
        } 
        // 3️⃣ Then check if results page is shown
        // else if (resultPageShown === false) {
        //   router.replace("/user/results");
        // } 
        
        // 4️⃣ Commented out checks (not using for now)
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
  }, [isTest2Completed, isInstitutionDetailsAdded, isCountryAdded, educationStageExists, resultPageShown, router, dashboardDataLoaded]);

  // Show loading while authentication or dashboard data is being checked
  if (isAuthenticated === null || (loading && !initialDataCheck)) {
    return (
      <div className='h-screen flex items-center justify-center text-white'>
        <div>
          <div className='font-semibold'>
            <LoadingOverlay loadText={"Preparing dashboard..."} />
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Show completion message and countdown if test is completed
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

  // Only show banner if tests are not completed and data is loaded
  return (
    <div>
      {/* <CareerStripe /> */}
      <Banner
        setIsTest2Completed={setIsTest2Completed}
        setIsCountryAdded={setIsCountryAdded}
        setIsInstitutionDetailsAdded={setIsInstitutionDetailsAdded}
        setEducationStageExists={setEducationStageExists}
        setResultPageShown={setResultPageShown}
        setGradeData={setGradeData}
      />
      <br />
    </div>
  )
}
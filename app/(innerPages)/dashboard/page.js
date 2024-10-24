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
  const [showQuiz2Results, setShowQuiz2Results] = useState(false);
  const [isTest2Completed, setIsTest2Completed] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true)

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

  const toggleResults = () => {
    setShowResults(prevState => !prevState);
  };

  const toggleQuiz2Results = () => {
    setShowQuiz2Results(prevState => !prevState);
  };

  if (!isAuthenticated) {
    return (
      <div className='h-screen flex items-center justify-center text-white'>
        <div>
          <div className='font-semibold'>
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        </div>
      </div>
    )
  }

  const MobileNavigation = dynamic(() => import('./_components/Navbar/button.jsx'), { ssr: false });


  return (
    <div>
      <CareerStripe />
     {!isTest2Completed ? (
  <>
    <Banner
      onToggleResults={toggleResults}
      showResults={showResults}
      onToggleQuiz2Results={toggleQuiz2Results}
      showQuiz2Results={showQuiz2Results}
      isTest2Completed={isTest2Completed}
      setIsTest2Completed={setIsTest2Completed}
    />
    <br />
    <br />
    {showResults && <Results />}
    {showQuiz2Results && redirect("/dashboard/careers/career-suggestions")}
  </>
) : (
  redirect("/dashboard/careers/career-suggestions")
)}

      {/* <MobileNavigation /> */}
    </div>
  )
}
"use client"
import React, { useEffect, useState } from 'react'
import Banner from './_components/Banner/page'
import Results from './_components/Results/page'
import Results2 from './_components/Result2/page'
import { useRouter } from 'next/navigation'
import LoadingOverlay from '../_components/LoadingOverlay'
import dynamic from 'next/dynamic';

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
          {showQuiz2Results && <Results2 />}
        </>
      ) : (
        <Results2 />
      )}
      {/* <MobileNavigation /> */}
    </div>
  )
}
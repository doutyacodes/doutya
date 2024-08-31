"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingOverlay from '../_components/LoadingOverlay'

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  useEffect(() => {
    const authCheck = ()=>{
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem("token");
        if(!token){
          router.push('/login');
          setIsAuthenticated(false)
        }else{
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


  if(!isAuthenticated){
    return (
        <div className='h-screen flex items-center justify-center text-white'>
            <div>
                <div className='font-semibold'>
                     <LoadingOverlay loadText={"Loading..."}/>
                </div>
            </div>
        </div>
    )
  }

  

  return (
    <div>
      <h1 className='text-white'>Hello kids</h1>
    </div>
  )
}

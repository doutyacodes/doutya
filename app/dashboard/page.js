"use client"
import React, { useEffect, useRef, useState } from 'react'
import Navbar from './_components/Navbar/page'
import Banner from './_components/Banner/page'
import Results from './_components/Results/page'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const resultsRef = useRef(null);
  const router = useRouter();
  const [isResult, setIsResult] = useState(false);

  useEffect(() => {
    const storedResult = localStorage.getItem('isResult');
    console.log("result storedResult",storedResult );
    
    if (storedResult === 'true') {
        setIsResult(true);
        localStorage.removeItem('isResult');
    }
}, []);

  useEffect(() => {
    if (isResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isResult]);
console.log("tesResult",isResult);

  return (
    <div>
      <Navbar/>
      <Banner/>
      {
        isResult && (
          <div ref={resultsRef}>
            <Results />
          </div>
        )
      }
      <br />
      <br />
    </div>
  )
}

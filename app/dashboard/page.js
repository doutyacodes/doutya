"use client"
import React, { useEffect, useRef, useState } from 'react'
import Navbar from './_components/Navbar/page'
import Banner from './_components/Banner/page'
import Results from './_components/Results/page'
import Results2 from './_components/Result2/page'

export default function Dashboard() {
  const [showResults, setShowResults] = useState(false);
  const [showQuiz2Results, setShowQuiz2Results] = useState(false);

  const toggleResults = () => {
    setShowResults(prevState => !prevState); 
  };

  const toggleQuiz2Results = () => {
    setShowQuiz2Results(prevState => !prevState);
  };

  return (
    <div>
      <Navbar/>
      <Banner onToggleResults={toggleResults} showResults={showResults} onToggleQuiz2Results={toggleQuiz2Results} showQuiz2Results={showQuiz2Results}/>
      <br />
      <br />
      {showResults && <Results />} 
      {showQuiz2Results && <Results2/>}
    </div>
  )
}

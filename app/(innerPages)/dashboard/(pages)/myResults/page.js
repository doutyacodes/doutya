import React from 'react'
import Results from '../../_components/Results/page'
import dynamic from 'next/dynamic';

export default function page() {
  const MobileNavigation = dynamic(
    () => import("../../_components/Navbar/button.jsx"),
    { ssr: false }
  );
  return (
    <div>
        <Results/>
        <br />
        {/* <MobileNavigation /> */}
    </div>
  )
}

import LeftSideBar from '@/app/(testing)/testing-bar/LeftSideBar/LeftSideBar'
import React from 'react'
import "./test.css"
const CommunityLayout = ({children}) => {
  return (
    <div className="w-screen min-h-screen h-full bg-[#1f1f1f] flex ">
      <LeftSideBar />
      <div className="flex-grow  h-full p-4">
        {children}
      </div>
    </div>
  )
}

export default CommunityLayout
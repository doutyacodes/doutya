import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div className='w-full p-3 bg-[#261e33]'>
        <div className="w-full flex flex-col items-center max-w-[1200px] mx-auto space-y-5 px-3 pb-5">
        <Image
               src={"/assets/images/logo-full.png"}
               width={150}
               height={150}
             />
             <Link
              href={"/login"}
              className="bg-[#9069e7] text-white rounded-full px-7 py-3 font-semibold"
            >
              Sign In
            </Link>
            <p className='text-white text-xs text-center'>Copyright {new Date().getFullYear()} Xortlist Inc. All rights reserved. Various
            trademarks held by their respective owners.</p>
        </div>
    </div>
  )
}

export default Footer
import Link from 'next/link';
import React from 'react'

function Banner() {
  return (
    <div className='mb-7 w-4/5 mx-auto'>
        <h2 className='text-white ml-9 mt-7 font-bold font-serif pb-6'>Personality</h2>
        <div className="border-t  border-cyan-400 ml-9 w-10/12"></div>

        <br/>
        <br/>
        <div className='border border-cyan-400 pb-3 rounded-sm'> {/* Removed this lg:ml-9 sm:ml-4 */}
            <img className='rounded-md object-cover w-full' src="https://i.postimg.cc/QtY528dt/Blog-3-trends-2024.jpg" alt="" />
            <div className="border-t  border-cyan-400 "></div>
            <h1 className='text-white mt-4 text-2xl font-bold ml-3'>AI Powered Personality Assesment Test</h1>
            <div className='relative'>
            <p className='ml-3 text-white pt-8 w-4/5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae maiores molestias possimus optio nisi quos sint, quo facere est rem deserunt voluptas nam officia repellendus eos modi, architecto sit cupiditate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui, est! Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur, amet.
            </p>
              {/* <img src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png" className='h-20 absolute top-0 right-3 cursor-pointer'/> */}
              <Link href="/quiz-section/33">
                <img 
                  src="https://i.postimg.cc/tCZZkBrG/images-removebg-preview-4.png" 
                  className="h-20 absolute top-0 right-3 cursor-pointer"
                  alt="Navigate to Quiz Section"
                />
              </Link>
            </div>
        </div>
    </div>
  )
}

export default Banner;
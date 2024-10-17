import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { IoIosMenu, IoIosClose } from 'react-icons/io';
import {
  FaBriefcase,
  FaInfoCircle,
  FaNewspaper,
  FaUserTie,
} from 'react-icons/fa';

const Footer = () => {
  const companyData = [
    {
      title: 'Careers',
      href: '/careers',
      icon: <FaBriefcase className="w-4 h-4 text-cyan-300" />,
    },
    {
      title: 'About',
      href: '/about',
      icon: <FaInfoCircle className="w-4 h-4 text-cyan-300" />,
    },
    // {
    //   title: 'Press',
    //   href: '/press',
    //   icon: <FaNewspaper className="w-4 h-4 text-cyan-300" />,
    // },
    // {
    //   title: 'Leadership',
    //   href: '/leadership-principles',
    //   icon: <FaUserTie className="w-4 h-4 text-cyan-300" />,
    // },
  ];

  return (
    <div className="w-full bg-[#261e33] md:p-6 p-3 text-white flex md:items-center">
      <div className="container md:mx-auto flex items-center space-y-5 justify-between md:justify-center md:gap-48 w-full">
        
        <Image src="/assets/images/logo-full.png" width={150} height={150} alt="Xortlist Logo" className='max-md:w-24 ' />
       

        {/* <ul className="flex flex-wrap justify-center gap-4">
          {companyData.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              {item.icon}
              <Link href={item.href} className="text-xs font-semibold">{item.title}</Link>
            </li>
          ))}
        </ul> */}
        <div className='flex md:flex-row flex-col justify-between md:justify-center md:gap-48'>
          <p className="text-center text-xs w-full">
            <span>AWHO, Whitefield - Hoskote Rd,</span><br />
            <span>Whitefield, SV, Kannamangala,</span><br />
            <span>Bengaluru, Karnataka 560067</span>
          </p>

          <p className="text-center text-xs w-full">
            Copyright {new Date().getFullYear()} Xortlist Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;

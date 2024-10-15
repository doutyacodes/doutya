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
    <div className="w-full bg-[#261e33] p-6 text-white">
      <div className="container mx-auto flex flex-col items-center space-y-5">
        <Image src="/assets/images/logo-full.png" width={150} height={150} alt="Xortlist Logo" />
        
       

        {/* <ul className="flex flex-wrap justify-center gap-4">
          {companyData.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              {item.icon}
              <Link href={item.href} className="text-xs font-semibold">{item.title}</Link>
            </li>
          ))}
        </ul> */}

<p className="text-center text-xs">
  <span>AWHO, Whitefield - Hoskote Rd,</span><br />
  <span>Whitefield, SV, Kannamangala,</span><br />
  <span>Bengaluru, Karnataka 560067</span>
</p>

        <p className="text-center text-xs">
          Copyright {new Date().getFullYear()} Xortlist Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;

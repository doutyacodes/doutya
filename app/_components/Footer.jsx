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
    {
      title: 'Press',
      href: '/press',
      icon: <FaNewspaper className="w-4 h-4 text-cyan-300" />,
    },
    {
      title: 'Leadership',
      href: '/leadership-principles',
      icon: <FaUserTie className="w-4 h-4 text-cyan-300" />,
    },
  ];

  return (
    <div className="w-full bg-[#261e33] p-6 text-white">
      <div className="container mx-auto flex flex-col items-center space-y-5">
        <Image src="/assets/images/logo-full.png" width={150} height={150} alt="Xortlist Logo" />
        
        <Link href="/login" className="bg-[#00c061] text-white rounded-full px-7 py-3 font-semibold">
          Sign In
        </Link>

        <ul className="flex flex-wrap justify-center gap-4">
          {companyData.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              {item.icon}
              <Link href={item.href} className="text-xs font-semibold">{item.title}</Link>
            </li>
          ))}
        </ul>

        <p className="text-center text-xs">
          AWHO, Whitefield - Hoskote Rd, Whitefield, SV, Kannamangala, Bengaluru, Karnataka 560067
        </p>
        <p className="text-center text-xs">
          Copyright {new Date().getFullYear()} Xortlist Inc. All rights reserved. Various trademarks held by their respective owners.
        </p>
      </div>
    </div>
  );
};

export default Footer;

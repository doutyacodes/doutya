'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LeftSideBar from './(testing)/testing-bar/LeftSideBar/LeftSideBar';

export default function RootLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [pathname]);

  const shouldHideSidebar = pathname === '/login' || pathname === '/signup';

  return (
    <div className="flex">
      {isAuthenticated && !shouldHideSidebar && <LeftSideBar />}
      <div className="flex-grow h-full w-full">
        {children}
      </div>
    </div>
  );
}

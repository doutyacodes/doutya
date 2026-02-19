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

  const shouldHideSidebar = pathname === '/login' || pathname === '/signup' || pathname === '/open-signup' || pathname === '/activation';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex h-screen">
        {isAuthenticated && !shouldHideSidebar && <LeftSideBar />}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

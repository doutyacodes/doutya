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
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex h-full w-full overflow-hidden">
        {isAuthenticated && !shouldHideSidebar && <LeftSideBar />}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

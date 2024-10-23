// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { GoHomeFill,GoBriefcase } from "react-icons/go";
// import { FaBriefcase } from "react-icons/fa";
// import { RxAvatar } from "react-icons/rx";
// import { IoMdAnalytics } from "react-icons/io";





// const MobileNavigation = () => {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('');
//   const [isMounted, setIsMounted] = useState(false); // State to check if mounted
//   const [dashboardUrl, setDashboardUrl] = useState("/dashboard/");

//   // Set the mounted state to true after the first render
//   useEffect(() => {
//     setIsMounted(true);
//     const storedUrl = localStorage.getItem("dashboardUrl");
//     if (storedUrl) {
//       setDashboardUrl(storedUrl);
//     }
//     console.log(dashboardUrl)
//   }, []);

//   // Update activeTab when route changes (only if mounted)
//   useEffect(() => {
//     if (isMounted) {
//       setActiveTab(router.pathname);
//     }
//   }, [router, isMounted]);

//   const navItems = [
//     { name: 'Dashboard', href: dashboardUrl, icon: <IoMdAnalytics /> },
//     { name: 'My Analysis', href: '/dashboard_kids/myResultsKids', icon: <FaBriefcase /> },
//     { name: 'Profile', href: '/dashboard/user-profile', icon: <RxAvatar /> },
//   ];
  

//   // Prevent rendering until the component is mounted
//   if (!isMounted) {
//     return null;
//   }

//   return (
//     <nav className="fixed bottom-4 left-4 right-4 lg:hidden z-50">
//       <div className="bg-teal-800 rounded-full p-1 shadow-lg items-center">
//         <ul className="flex justify-around items-center">
//           {navItems.map((item) => (
//             <li key={item.name} className="relative">
//               <Link href={item.href}>
//                 <div
//                   className={`flex flex-col items-center p-2 cursor-pointer ${
//                     activeTab === item.href ? 'text-white' : 'text-teal-300'
//                   }`}
//                   onClick={() => setActiveTab(item.href)}
//                 >
//                   <div className="flex items-center justify-center">
//                     {item.icon}
//                   </div>
//                   <span className="text-xs mt-1 transition-all duration-300 ease-in-out">
//                     {item.name}
//                   </span>
//                   {activeTab === item.href && (
//                     <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2" />
//                   )}
//                 </div>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default MobileNavigation;
import React from 'react'

const MobileNavigation = () => {
  return (
    <></>
  )
}

export default MobileNavigation
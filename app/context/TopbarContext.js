// 'use client';

// import { createContext, useContext, useState } from 'react';

// const TopbarContext = createContext();

// export const TopbarProvider = ({ children }) => {
//   const [refreshTopbar, setRefreshTopbar] = useState(false);

//   const triggerTopbarRefresh = () => {
//     console.log("Topbar refresh triggered!");
//     setRefreshTopbar(prev => !prev);
//   };

//   return (
//     <TopbarContext.Provider value={{ refreshTopbar, triggerTopbarRefresh }}>
//       {children}
//     </TopbarContext.Provider>
//   );
// };

// export const useTopbar = () => useContext(TopbarContext);


'use client';

import { createContext, useContext, useState, useCallback } from 'react';

// Create the context
export const TopbarContext = createContext();

// Provider component
export function TopbarProvider({ children }) {
  const [refreshTopbar, setRefreshTopbar] = useState(false);

  const triggerTopbarRefresh = useCallback(() => {
    console.log("Topbar refresh triggered!");
    setRefreshTopbar(prev => !prev); // Toggle to force re-render
  }, []);

  return (
    <TopbarContext.Provider value={{ refreshTopbar, triggerTopbarRefresh }}>
      {children}
    </TopbarContext.Provider>
  );
}

// 🔥 Custom hook for easy use
export function useTopbar() {
  const context = useContext(TopbarContext);
  if (!context) {
    throw new Error('useTopbar must be used within a TopbarProvider');
  }
  return context;
}


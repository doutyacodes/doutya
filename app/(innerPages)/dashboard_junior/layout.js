import { TopbarProvider } from "@/app/context/TopbarContext";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }) => {
    return (
      <TopbarProvider>
      <div>
        <Toaster />
        <main>{children}</main>
      </div>
      </TopbarProvider>
    );
  };
  
  export default Layout;
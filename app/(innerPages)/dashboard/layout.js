import { TopbarProvider } from "@/app/context/TopbarContext";
import Navbar from "./_components/Navbar/page";

const Layout = ({ children }) => {
  return (
    <TopbarProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* <Navbar /> */}
        <main>{children}</main>
      </div>
    </TopbarProvider>
  );
};

export default Layout;

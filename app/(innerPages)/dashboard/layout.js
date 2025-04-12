import { TopbarProvider } from "@/app/context/TopbarContext";
import Navbar from "./_components/Navbar/page";

const Layout = ({ children }) => {
  return (
    <TopbarProvider>
      <div>
        {/* <Navbar /> */}
        <main>{children}</main>
      </div>
    </TopbarProvider>
  );
};

export default Layout;

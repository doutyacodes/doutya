import LeftSideBar from "./(testing)/testing-bar/LeftSideBar/LeftSideBar";

export default async function RootLayout({ children }) {


  return (
    <div className=" flex ">
      <LeftSideBar />
      <div className="flex-grow  h-full">
        {children}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import AddCareer from '../(innerPages)/dashboard/_components/AddCareer/AddCareer'
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { PlusIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { useTranslations } from "next-intl";

const CareerStripe = () => {
    const [careerData, setCareerData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCareer, setShowCareer] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [showDialogue, setShowDialogue] = useState(false);
    const [careerName, setCareerName] = useState("");
    const [roadMapLoading, setRoadMapLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("roadmap");
    const [age, setAge] = useState("");
    const router = useRouter();
    const t = useTranslations("CareerPage");
  
    const pathname = usePathname();
  
    useEffect(() => {
      const PathChange = () => {
        if (pathname == "/dashboard/careers/career-guide") {
          setShowCareer(true);
        } else {
          setShowCareer(false);
        }
      };
      PathChange();
    }, [pathname]);
    useEffect(() => {
        const authCheck = () => {
          if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (!token) {
              router.push("/login");
              setIsAuthenticated(false);
            } else {
              setIsAuthenticated(true);
            }
          }
        };
        authCheck();
      }, [router]);
      
      useEffect(() => {
        if (careerData.length > 0) {
          setSelectedCareer(careerData[0]);
        }
      }, [careerData]);
    
      const getCareers = async () => {
        setIsLoading(true);
        try {
          const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;
          if (!token) {
            setIsLoading(false);
            return;
          }
    
          const response = await GlobalApi.GetCarrerData(token);
        //   console.log("response",response.data)

          if (
            response.status === 201 &&
            response.data &&
            response.data.carrerData.length > 0
          ) {
            setCareerData(response.data.carrerData);
            // console.log("response",response.data)
            setAge(response.data.age);
          }
          //  else {
          //   toast.error("No career data available at the moment.");
          // }
        } catch (err) {
          toast.error("Failed to fetch career data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
    
      useEffect(() => {
        getCareers();
      }, []);
    
      const handleAddCareerClick = () => {
        if (careerData.length >= 5) {
          toast.error("You can only add up to 5 careers.");
          return;
        }
        setShowDialogue(true);
      };
    
      const handleCareerClick = (career) => {
        setSelectedCareer(career);
        setActiveTab("roadmap");
        if (pathname !== "/dashboard/careers/career-guide") {
          router.push("/dashboard/careers/career-guide");
        }
      };
    
      if (isLoading || !isAuthenticated) {
        return (
          <div className="h-screen flex items-center justify-center text-white">
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        );
      }
  return (
    <div>
         <Toaster />

{/* Add Career Dialog */}
<AddCareer
  isOpen={showDialogue}
  onClose={() => setShowDialogue(false)}
  getCareers={getCareers}
  setCareerName={setCareerName}
  careerName={careerName}
  handleSubmit={handleAddCareerClick}
  roadMapLoading={roadMapLoading}
/>

{/* Mobile Heading */}
<p className="text-center font-bold sm:hidden text-white text-2xl sm:text-4xl md:pl-5 max-sm:bg-[#1f1f1f]">
  {t("careers")}
</p>

{/* Career Selector for Desktop */}
<div className="flex flex-col pt-4 sm:flex-row justify-start sm:items-center items-start gap-4 text-white bg-[#2c2c2c] sm:p-10 mb-5 overflow-x-scroll">
  <p className="text-center font-bold hidden sm:flex text-white text-2xl sm:text-4xl">
    {t("careers")}
  </p>

  <div className="flex gap-4 justify-start items-center max-md:pl-4 w-fit pb-2">
    {careerData.map((career, index) => (
      <div
        key={index}
        onClick={() => handleCareerClick(career)}
        className={`w-28 h-28 flex justify-center items-center sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg transition-transform transform hover:scale-105 cursor-pointer duration-150 ${
          selectedCareer?.id === career.id
            ? "bg-gray-700 border-2 border-blue-500"
            : "bg-gray-800"
        }`}
      >
        <p className="text-center text-xs sm:text-sm font-bold text-white">
          {career.career_name}
        </p>
      </div>
    ))}

    <div
      className="w-28 h-28 sm:w-32 sm:h-32 p-2 shadow-lg rounded-lg bg-gray-700 flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150"
      onClick={handleAddCareerClick}
    >
      <PlusIcon className="text-white h-6 w-6 sm:h-8 sm:w-8" />
    </div>
  </div>
</div>
    </div>
  )
}

export default CareerStripe
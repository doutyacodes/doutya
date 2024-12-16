"use client";

import { useParams, useRouter } from "next/navigation";
import Department from "../../_company_components/Department";
import Post from "../../_company_components/Post";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import LoadingOverlay from "@/app/_components/LoadingOverlay";

// const companyDetails = {
//   id: 1,
//   name: "Apple Inc.",
//   image: "https://wowfy.in/testusr/images/apple-logo.jpg",
//   description: `Apple Inc. designs, manufactures, and markets mobile communication and media devices, personal computers, and portable digital music players. The company also offers a variety of software, services, accessories, networking solutions, and third-party digital content and applications.`,
//   departments: [
//     "Finance",
//     "Software",
//     "Hardware",
//     "Marketing",
//     "Sales",
//     "Human Resources",
//     "Customer Support",
//   ],
// };

export default function CompanyDetailsPage() {
  const params = useParams();
  const { company_id } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [companyDetails, setCompanyDetails] = useState([]);
  const [departmentDetails, setDepartmentDetails] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();
  const fetchCompany = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchOneCompany({
        id: company_id,
      });
      console.log(response.data);
      if (response.data.companyDetails) {
        setCompanyDetails(response.data.companyDetails);
        setDepartmentDetails(response.data.DeparmentData);
        setTotalCount(response.data.departmentCount);
      }
    } catch (error) {
      toast.error("Oops! Failed to fetch department. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [company_id]);
  // console.log(company_id)
  
  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen bg-[#2a2b27] text-white p-6">
      {/* Company Details Section */}
      <div className="max-w-4xl mx-auto bg-[#1f1f1b] rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <img
            src={`https://wowfy.in/testusr/images/${companyDetails.image}`}
            alt={companyDetails.name}
            className="w-48 h-48 object-cover rounded-md mb-6 md:mb-0 md:mr-6"
          />
          <div>
            <h1 className="text-3xl font-bold mb-4">{companyDetails.name}</h1>
            <p className="text-gray-400 text-sm mb-4 text-justify">
              {companyDetails.description}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full mx-auto">
        <Tabs
          defaultValue="post"
          className="w-full flex justify-center items-center flex-col"
        >
          <TabsList className="w-fit mx-auto bg-[#2a2b27] border border-slate-600 grid grid-cols-2">
            <TabsTrigger value="post">Post</TabsTrigger>
            <TabsTrigger value="department">Department</TabsTrigger>
          </TabsList>
          <TabsContent value="post" className="w-full">
            <Post />
          </TabsContent>
          <TabsContent value="department" className="w-full">
            <Department totalCount={totalCount} companyDetails={departmentDetails} companyId={company_id} />{" "}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

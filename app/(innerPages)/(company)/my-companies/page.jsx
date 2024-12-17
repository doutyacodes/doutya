"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlobalApi from "@/app/_services/GlobalApi";
import toast from "react-hot-toast";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { useRouter } from "next/navigation";

export default function Company() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState([]);
  const router = useRouter();
  const fetchCompany = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchDepartmentCompanies();
      // console.log(response.data);
      if (response.data.companies) {
        setCompanyData(response.data.companies);
      }
    } catch (error) {
      toast.error("Oops! Failed to fetch department. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);
  // Filter companies based on search query
  const filteredResults = companyData.filter((company) =>
    company.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#2a2b27] text-white px-4">
      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md text-center mt-6"
      >
        <h1 className="text-3xl font-semibold mb-4">My Companies</h1>
        
      </motion.div>

      {/* Results Section */}
      <div className="mt-12 w-full px-6">
        {filteredResults.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredResults.map((company) => (
              <motion.div
                key={company.id}
                className="bg-[#1f1f1b] p-6 rounded-lg shadow-md hover:shadow-lg transition border border-gray-700 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push(`/my-companies/${company.id}`)}
              >
                <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://wowfy.in/testusr/images/${company.image}`}
                    alt={company.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold mt-4 mb-2">
                  {company.title}
                </h2>
                <p className="text-gray-400 text-sm ">
                  {company.description.length > 70
                    ? company.description.slice(0, 70) + "..."
                    : company.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://via.placeholder.com/200"
              alt="No Data"
              className="mb-4"
            />
            <p className="text-lg font-medium">
              No companies match your search.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

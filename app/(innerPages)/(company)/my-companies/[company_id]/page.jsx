"use client";

import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import moment from "moment";

const CompanyPage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const params = useParams();
  const { company_id } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [companyDetails, setCompanyDetails] = useState({});
  const [departments, setDepartments] = useState([]);

  // Fetch company and department data
  const fetchCompany = async () => {
    try {
      setIsLoading(true);
      const response = await GlobalApi.FetchOneDepartment({
        id: company_id,
      });

      if (response.data.companyDetails) {
        setCompanyDetails(response.data.companyDetails);
      }

      if (response.data.departments) {
        setDepartments(response.data.departments);
        if (response.data.departments.length > 0) {
          setSelectedDepartment(response.data.departments[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const formatDate = (date) => {
    return moment(date).format('DD-MM-YYYY HH:mm:ss');
  };

  useEffect(() => {
    fetchCompany();
  }, [company_id]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!companyDetails || !departments || departments.length === 0) {
    return null;
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

      {/* Departments and Challenges Section */}
      <div className="max-w-4xl mx-auto">
        <div className="overflow-x-auto whitespace-nowrap bg-[#1f1f1b] p-4 rounded-lg mb-6">
          <div className="flex space-x-4">
            {departments.map((dept) => (
              <button
                key={dept.departmentId}
                onClick={() => setSelectedDepartment(dept)}
                className={`py-2 px-4 rounded-md transition-colors ${
                  selectedDepartment?.departmentId === dept.departmentId
                    ? "bg-purple-700 border-purple-500"
                    : "bg-[#2a2b27] hover:bg-gray-800"
                }`}
              >
                {dept.departmentName}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Content */}
        <div className="space-y-6">
          {selectedDepartment?.challenges.length > 0 ? (
            selectedDepartment?.challenges.map((challenge, index) => (
              <Link href={`/challenges/${challenge.slug}`} key={challenge.id} >
                <motion.div
                  className="bg-[#3a3b35] rounded-lg shadow-md mb-3 relative overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                >
                  {/* Image */}
                  <motion.img
                    src={`https://wowfy.in/testusr/images/${challenge.image}`}
                    alt={challenge.title}
                    className="w-full h-40 object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Title */}
                  <div className="p-4 text-center">
                    <h2 className="text-lg font-semibold text-white">
                      {challenge.title}
                    </h2>
                  </div>
                  {/* Footer Section */}
                  <div className="flex justify-between items-center bg-[#484a44] px-4 py-3 text-sm text-gray-300">
                    <div>
                      <p>📅 Start: {formatDate(challenge.show_date)}</p>
                      <p>⏳ End: {formatDate(challenge.end_date)}</p>
                    </div>
                    <div className="text-right">
                      <p>Entry Fee: NILL</p>
                      <p>🏆 Reward: {challenge.points} Points</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-[#3a3b35] rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">
                No Challenges Available
              </h2>
              <p className="text-gray-400 text-center mb-6">
                Looks like there are no challenges at the moment. Check back
                later or stay tuned for upcoming challenges!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;

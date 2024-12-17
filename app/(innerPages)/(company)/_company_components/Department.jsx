"use client";

import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import GlobalApi from "@/app/_services/GlobalApi";
import { useRouter } from "next/navigation";

const Department = ({ companyDetails, totalCount, companyId }) => {
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const router = useRouter()

  const toggleDepartment = (department) => {
    setSelectedDepartments((prev) => {
      const exists = prev.find((dep) => dep.id === department.id);
      if (exists) {
        // Remove the department if it already exists
        return prev.filter((dep) => dep.id !== department.id);
      } else if (prev.length < 3 - totalCount) {
        // Add the department if it doesn't exist and limit is not reached
        return [...prev, { id: department.id, title: department.title }];
      } else {
        // Return the current list if limit is reached
        return prev;
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedDepartments.length === 0) {
      toast.error("No departments selected!");
      return;
    }

    try {
      // Prepare data for submission
      const departmentIds = selectedDepartments.map((dep) => dep.id);

      // Mock API call
      const response = await GlobalApi.AddUserDepartment({ companyId, departmentIds })

      if (response.data.newDepartments) {
        toast.success("Departments selected successfully!");
        // Reset selection if necessary
        router.push("/my-companies")
        setSelectedDepartments([]);

      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit departments.");
      }
    } catch (error) {
      console.error("Error submitting departments:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#1f1f1b] rounded-lg shadow-md p-6 mb-8">
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-semibold mb-4">Select Departments</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {companyDetails.map((department) => (
          <div
            key={department.id}
            onClick={() => toggleDepartment(department)}
            className={`cursor-pointer p-4 rounded-lg flex items-center justify-between transition border border-gray-700 ${
              selectedDepartments.some((dep) => dep.id === department.id)
                ? "bg-purple-700 border-purple-500"
                : "bg-[#2a2b27] hover:bg-gray-800"
            }`}
          >
            <span className="text-sm font-medium">{department.title}</span>
            {selectedDepartments.some((dep) => dep.id === department.id) && (
              <FaCheckCircle className="text-purple-300" />
            )}
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-4">
        You can select up to {3 - totalCount} departments.
      </p>
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="mt-6 w-fit bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Department;

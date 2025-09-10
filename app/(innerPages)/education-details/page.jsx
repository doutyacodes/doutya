"use client"
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const EducationDetailsForm = () => {
  const [institutions, setInstitutions] = useState([]);
  const [childClassOptions, setChildClassOptions] = useState([]);
  const [childDivisionOptions, setChildDivisionOptions] = useState([]);
  const [showCustomSchool, setShowCustomSchool] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInstitutionDropdownOpen, setIsInstitutionDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      instituteId: "",
      classId: "",
      divisionId: "",
      academicYearStartMonth: new Date().getMonth() + 1, // Current month
      academicYearStartYear: new Date().getFullYear(), // Current year
      academicYearEndMonth: new Date().getMonth() + 1, // Current month
      academicYearEndYear: new Date().getFullYear(), // Current year
      institute_name: "",
      class_name: "",
    },
  });

  const instituteId = watch("instituteId");
  const classId = watch("classId");
  const customSchoolSelected = watch("customSchool");

  // Helper function to check authentication
  const checkAuth = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return null;
    }
    return token;
  };

  // Check authentication and completion status on component mount
  useEffect(() => {
    const getProfileStatus = async () => {
      setLoading(true);
      try {
        const token = checkAuth();
        if (!token) return;
        
        const resp = await GlobalApi.GetDashboarCheck(token);
        const scopeType = resp.data.scopeType;

        // Check education profile completion in the correct order
        if (!resp.data.educationStageExists) {
          // Education stage not selected yet, redirect to education profile page
          router.replace("/user/education-profile");
        } else if (resp.data.isEducationCompleted) {
          // User has completed education, skip institution details check
          if (scopeType === "career") {
            router.replace("/dashboard/careers/career-suggestions");
          } else if (scopeType === "sector") {
            router.replace("/dashboard_kids/sector-suggestion");
          } else if (scopeType === "cluster") {
            router.replace("/dashboard_junior/cluster-suggestion");
          }
        } else {
          // User is in school or college, check institution details
          if (!resp.data.institutionDetailsAdded) {
            // Stay on current page for institution details
            // No redirection needed
          } else {
            if (scopeType === "career") {
              router.replace("/dashboard/careers/career-suggestions");
            } else if (scopeType === "sector") {
              router.replace("/dashboard_kids/sector-suggestion");
            } else if (scopeType === "cluster") {
              router.replace("/dashboard_junior/cluster-suggestion");
            }
          }
        }
        // If education stage doesn't exist, we stay on this page
      } catch (error) {
        console.error("Error fetching profile status:", error);
        toast.error("Error loading profile status. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    getProfileStatus();
  }, [router]);
    
  // Fetch institutions on component mount
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await GlobalApi.GetAllInstitutes();
        if (response.status === 200) {
          setInstitutions(response.data.institutions);
        }
      } catch (error) {
        toast.error("Failed to fetch institutions");
      }
    };

    fetchInstitutes();
  }, []);

  // Function to fetch classes for a specific institution
  const fetchClassesForChild = async (instituteId) => {
    if (!instituteId) return;
    
    try {
      setIsLoading(true);
      const response = await GlobalApi.GetClassesByInstitute(instituteId);
      if (response.status === 200) {
        setChildClassOptions(response.data.classes);
        
        // Reset dependent fields
        setValue("classId", "");
        setValue("divisionId", "");

        // Reset division options
        setChildDivisionOptions([]);
      }
    } catch (error) {
      toast.error("Failed to fetch classes");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch divisions for a specific class
  const fetchDivisionsForChild = async (classId) => {
    if (!classId) return;
    
    try {
      setIsLoading(true);
      const response = await GlobalApi.GetDivisionsByClass(classId);
      if (response.status === 200) {
        setChildDivisionOptions(response.data.divisions);
        
        // Reset division field
        setValue("divisionId", "");
      }
    } catch (error) {
      toast.error("Failed to fetch divisions");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter institutions based on search term
  const filteredInstitutions = institutions.filter(
    (institute) => institute.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const token = checkAuth();
      if (!token) return;
      
      const resp = await GlobalApi.GetDashboarCheck(token);
      const scopeType = resp.data.scopeType;
      
      // Format academic year values
      const academicYearStart = `${data.academicYearStartYear}-${String(data.academicYearStartMonth).padStart(2, '0')}`;
      const academicYearEnd = `${data.academicYearEndYear}-${String(data.academicYearEndMonth).padStart(2, '0')}`;
      
      const payload = {
        academicYearStart,
        academicYearEnd,
      };

      if (showCustomSchool) {
        // For custom school entry
        payload.institute_name = data.institute_name;
        payload.class_name = data.class_name;
      } else {
        // For institution selection from dropdown
        payload.institution_id = data.instituteId;
        payload.class_id = data.classId;
        payload.division_id = data.divisionId;
      }

      const response = await GlobalApi.UpdateUserEducationDetails(payload);
      
      if (response.status === 200) {
        toast.success("Education details updated successfully");
        
        if (scopeType === "career") {
          router.replace("/dashboard/careers/career-suggestions");
        } else if (scopeType === "sector") {
          router.replace("/dashboard_kids/sector-suggestion");
        } else if (scopeType === "cluster") {
          router.replace("/dashboard_junior/cluster-suggestion");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update education details");
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];
  
  // Show loading overlay while checking status
  if (loading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <LoadingOverlay loadText={"Loading..."} />
      </div>
    );
  }

  // Generate array of years (last 10 years and next 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="min-h-screen bg-gray-950 py-12 flex flex-col items-center">
      {/* Page heading section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Student Profile</h1>
        <p className="text-gray-400 mt-2">Please provide your educational information</p>
      </div>

      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Educational Information</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Option to toggle between selecting or entering custom school */}
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <button
                type="button" // CRITICAL: Explicitly set type="button"
                onClick={(e) => {
                  e.preventDefault(); // Prevent any form submission
                  setShowCustomSchool(false);
                }}
                className={`px-4 py-2 rounded-md ${
                  !showCustomSchool
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Select from List
              </button>
              <button
                type="button" // CRITICAL: Explicitly set type="button"
                onClick={(e) => {
                  e.preventDefault(); // Prevent any form submission
                  setShowCustomSchool(true);
                }}
                className={`px-4 py-2 rounded-md ${
                  showCustomSchool
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                My Institution is Not Listed
              </button>
            </div>
          </div>

          {!showCustomSchool ? (
            <>
              {/* Institution Dropdown with Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Institution</label>
                <div className="relative">
                  <div 
                    onClick={() => setIsInstitutionDropdownOpen(!isInstitutionDropdownOpen)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer"
                  >
                    {instituteId 
                      ? institutions.find(i => i.id.toString() === instituteId.toString())?.name || "Select Institution" 
                      : "Select Institution"}
                  </div>
                  
                  {isInstitutionDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                      <div className="sticky top-0 z-10 bg-gray-800 p-2 rounded-t-md">
                        <input
                          type="text"
                          placeholder="Search institutions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredInstitutions.length > 0 ? (
                          filteredInstitutions.map((institute) => (
                            <div
                              key={institute.id}
                              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-gray-100"
                              onClick={() => {
                                setValue("instituteId", institute.id);
                                fetchClassesForChild(institute.id);
                                setIsInstitutionDropdownOpen(false);
                                setSearchTerm("");
                              }}
                            >
                              {institute.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-400">No institutions found</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="hidden"
                    {...register("instituteId", { required: !showCustomSchool && "Institution is required" })}
                  />
                </div>
                {errors.instituteId && (
                  <p className="mt-1 text-sm text-red-600">{errors.instituteId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Class</label>
                  <select
                    {...register("classId", { required: !showCustomSchool && "Class is required" })}
                    disabled={!childClassOptions || childClassOptions.length === 0}
                    onChange={(e) => {
                      const classId = e.target.value;
                      fetchDivisionsForChild(classId);
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                  >
                    <option value="">Select Class</option>
                    {childClassOptions?.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                  {errors.classId && (
                    <p className="mt-1 text-sm text-red-600">{errors.classId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Division</label>
                  <select
                    {...register("divisionId", { required: !showCustomSchool && "Division is required" })}
                    disabled={!childDivisionOptions || childDivisionOptions.length === 0}
                    className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                  >
                    <option value="">Select Division</option>
                    {childDivisionOptions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                  {errors.divisionId && (
                    <p className="mt-1 text-sm text-red-600">{errors.divisionId.message}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Custom school entry form */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Institution Name</label>
                <input
                  type="text"
                  {...register("institute_name", { required: showCustomSchool && "Institution name is required" })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your institution name"
                />
                {errors.institute_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.institute_name.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Class/Grade/Batch</label>
                <input
                  type="text"
                  {...register("class_name", { required: showCustomSchool && "Class/Grade/Batch is required" })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="E.g., Class 10, Standard 8, Grade 6, Batch, Sem"
                />
                {errors.class_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.class_name.message}</p>
                )}
              </div>
            </>
          )}

          <div className="mt-6">
            <h3 className="text-md font-medium text-white mb-2">Current Academic Year</h3>
          
            {/* Start Date (Separate Month and Year) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Start of Academic Year</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Month</label>
                    <select
                      {...register("academicYearStartMonth", { 
                        required: "Month is required",
                        valueAsNumber: true
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                    >
                      {months.map(month => (
                        <option key={`start-${month.value}`} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Year</label>
                    <select
                      {...register("academicYearStartYear", {
                        required: "Year is required",
                        valueAsNumber: true
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                    >
                      {years.map(year => (
                        <option key={`start-${year}`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {(errors.academicYearStartMonth || errors.academicYearStartYear) && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicYearStartMonth?.message || errors.academicYearStartYear?.message}
                  </p>
                )}
              </div>
              
              {/* End Date (Separate Month and Year) */}
              <div>
                <label className="block text-sm font-medium text-gray-300">End of Academic Year</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Month</label>
                    <select
                      {...register("academicYearEndMonth", { 
                        required: "Month is required",
                        valueAsNumber: true
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                    >
                      {months.map(month => (
                        <option key={`end-${month.value}`} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Year</label>
                    <select
                      {...register("academicYearEndYear", {
                        required: "Year is required",
                        valueAsNumber: true
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                    >
                      {years.map(year => (
                        <option key={`end-${year}`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {(errors.academicYearEndMonth || errors.academicYearEndYear) && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicYearEndMonth?.message || errors.academicYearEndYear?.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Education Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationDetailsForm;
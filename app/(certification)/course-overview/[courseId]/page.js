"use client";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Book, Calendar, ArrowLeft, GraduationCap, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import GlobalApi from "@/app/_services/GlobalApi";

function Page({ params }) {
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [certificationName, setCertificationName] = useState(null);
  const [courseStatus, setCourseStatus] = useState(null);
  const [careerName, setCareerName] = useState(null);
  const router = useRouter();
  const courseID = params.courseId;
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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
    const getCourseData = async () => {
      setIsLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetCourseOverview(courseID, token);
        const data = resp.data.courseOverview[0];
        
        // Parse descriptions to arrays if they are in JSON string format
        data.prerequisite_description = JSON.parse(data.prerequisite_description || "[]");
        data.skill_description = JSON.parse(data.skill_description || "[]");
        data.application_description = JSON.parse(data.application_description || "[]");

        setCourseData(data);
        setCertificationName(resp.data.certificationName)
        setCareerName(resp.data.careerName)

        if (resp.data.courseStatus){
          setCourseStatus(resp.data.courseStatus)
        }
          
      } catch (error) {
        console.error("Error Fetching Course data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getCourseData();
  }, [courseID]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <LoadingOverlay loadText={"Loading..."} />
      </div>
    );
  }

  const handleTakeCourse = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data = {
        courseID,
        status: "in_progress"
      };
      const response = await GlobalApi.UpdateCertificationStatus(data, token);
      // if (response.status === 201) {
        // toast.success("Updated Succedssfully");
      // } 
    } catch (err) {
      toast.error("Unexpector error");
    } finally {
      router.push(`/certification-course/${courseID}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };
  

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" reverseOrder={false} />
      
      { courseData && (
        <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{certificationName}</h1>
            <p className="text-lg text-gray-600">Career Path: {careerName}</p>
            <div className="flex items-center mt-4 text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>Duration: 3 weeks</span>
            </div>
          </div>
        </div>

        {/* Course Overview Cards */}
        <div className="grid gap-6 mb-8">
          {/* Prerequisites Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="w-5 h-5 mr-2" />
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {courseData?.prerequisite_description.map((prereq, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Skills Acquired Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Skills You'll Acquire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {courseData.skill_description.map((skill, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Real-world Applications Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="w-5 h-5 mr-2" />
                Real-world Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {courseData.application_description.map((application, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{application}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Participants will engage with real-world scenarios and practical assignments that encourage hands-on learning.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Certification will be awarded upon successful completion of the course, which will include a final assessment.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Go Back
          </button>
          <button
            onClick={handleTakeCourse}
            disabled={courseStatus === 'completed'}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2
              ${courseStatus === 'completed' 
                ? 'bg-gray-400 text-gray-100 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {courseStatus === 'completed' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Completed
              </>
            ) : (
              'Take Course'
            )}
          </button>
        </div>
        </div>
      )
      }
    </div>
  );
}

export default Page;
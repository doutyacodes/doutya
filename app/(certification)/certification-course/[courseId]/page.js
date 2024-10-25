"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import GlobalApi from "@/app/_services/GlobalApi";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, ClipboardList, Target } from "lucide-react";

function Page({ params }) {
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState(null);
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

  const getCourseData = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const resp = await GlobalApi.GetCertificationCourse(courseID, token);
      setCourseData(resp.data);
    } catch (error) {
      console.error("Error Fetching Course data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCourseData();
  }, [courseID]);

  const handleCompleteCourse = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data = {
        courseID,
        status: "completed"
      };
      const response = await GlobalApi.UpdateCertificationStatus(data, token);
      if (response.status === 201) {
        toast.success("Completed Succedssfully");
      } 
    } catch (err) {
      toast.error("Unexpector error");
    } finally {
      getCourseData()
    }
  };

  const handleCertificationTest = ()=>{
    router.push(`/certification/${courseID}/${encodeURIComponent(courseData?.certificationName)}`)
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <LoadingOverlay loadText={"Loading..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{courseData?.certificationName}</h1>
          <p className="mt-2 text-lg text-gray-600">Career Path: {courseData?.careerName}</p>
          <p className="text-sm text-gray-500">Recommended Age: {courseData?.userAge}+</p>
        </div>

        {/* Weeks Section */}
        <div className="space-y-6">
          {courseData?.weeks.map((week) => (
            <Card key={week.week_number}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Week {week.week_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Topics */}
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <ClipboardList className="h-4 w-4 text-green-500" />
                      Topics
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {week.topics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Assignments */}
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-purple-500" />
                      Assignments
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {week.assignments.map((assignment, index) => (
                        <li key={index}>{assignment}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="md:col-span-2">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-orange-500" />
                      Learning Outcomes
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {week.learningOutcomes.map((outcome, index) => (
                        <li key={index}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <Button 
            variant="default" 
            className={`${
              courseData?.courseStatus === "completed" 
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={() => handleCompleteCourse()}
            disabled={courseData?.courseStatus === "completed" || isLoading}
          >
            {isLoading ? (
              "Loading..."
            ) : courseData?.courseStatus === "completed" ? (
              "Course Completed"
            ) : (
              "Complete Course"
            )}
          </Button>
          <Button 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCertificationTest}
          >
            Take Certification
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Page;
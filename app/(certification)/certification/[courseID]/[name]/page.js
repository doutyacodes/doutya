"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, BookOpen, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

function CertificationIntro({ params }) {

  const { courseID, name } = params;  // Extract both courseID and name from params
  const router = useRouter();
  
  // Decode the name from the URL
  const certificationName = decodeURIComponent(name);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">{certificationName}</h1>
          <p className="text-lg text-gray-600">Validate your skills and boost your career prospects</p>
        </div>

        {/* Main Info Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>About This Certification</CardTitle>
            <CardDescription>
              Please review the information below before starting the test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>Duration: 45 minutes</span>
              </div> */}
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-500" />
                <span>Passing Score: 70%</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span>20 Questions</span>
              </div>
            </div>

            {/* Topics Covered */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Topics Covered:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">HTML5</Badge>
                <Badge variant="secondary">CSS3</Badge>
                <Badge variant="secondary">JavaScript</Badge>
                <Badge variant="secondary">React Fundamentals</Badge>
                <Badge variant="secondary">Web Security</Badge>
                <Badge variant="secondary">Responsive Design</Badge>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>Ensure you have a stable internet connection</li>
                <li>You cannot pause the test once started</li>
                <li>All questions must be attempted</li>
                <li>Results will be shown immediately after completion</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button 
            onClick={() => router.push(`/certification-quiz/${courseID}`)}
            className="w-full sm:w-auto" size="lg">
              Start Certification Test
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Additional Info Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Industry-recognized certification</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Showcase your expertise</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Access to exclusive resources</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <span>Basic understanding of web development</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <span>Familiarity with HTML, CSS, and JavaScript</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <span>Previous coding experience recommended</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}

export default CertificationIntro;
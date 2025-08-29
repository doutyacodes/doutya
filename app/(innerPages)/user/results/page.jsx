"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, User, Calendar, Target, CheckCircle, TrendingUp, Briefcase } from 'lucide-react';
import GlobalApi from '@/app/_services/GlobalApi';
import { useRouter } from 'next/navigation';
import "../_components/styles.css";

const AssessmentResultsPage = () => {
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const printRef = useRef();
  const router = useRouter()
  
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const language = localStorage.getItem("language") || "en";
      const response = await GlobalApi.GetUserId(token, language);
      
      if (response.status === 200) {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        setResultData(data);
      } else if (response.status === 202) {
        setAlertMessage(response.data.message || "Please complete the assessment first.");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setAlertMessage("Unable to load assessment results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleGoBack = () => {
    const storedUrl = localStorage.getItem("dashboardUrl");
    if (storedUrl) {
      router.push(storedUrl);
    }
  };

  // Use actual data if available
  const displayData = resultData;

  const getCareerTypeInfo = (type) => {
    const typeInfo = {
      'traditional': { label: 'Traditional', color: 'bg-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
      'trending': { label: 'Trending', color: 'bg-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
      'offbeat': { label: 'Offbeat', color: 'bg-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
      'futuristic': { label: 'Futuristic', color: 'bg-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
      'ai-proof': { label: 'AI-Proof', color: 'bg-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
      'entrepreneurial': { label: 'Entrepreneurial', color: 'bg-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
      'normal': { label: 'Standard', color: 'bg-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
      'hybrid': { label: 'Hybrid', color: 'bg-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
      'creative': { label: 'Creative', color: 'bg-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
      'sustainable': { label: 'Sustainable & Green', color: 'bg-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
      'social': { label: 'Social Impact', color: 'bg-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
      'tech': { label: 'Tech-Driven', color: 'bg-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
      'experiential': { label: 'Experiential', color: 'bg-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
      'digital': { label: 'Digital & Online', color: 'bg-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' }
    };
    return typeInfo[type] || typeInfo['normal'];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Your Results</h3>
          <p className="text-gray-600">Please wait while we prepare your comprehensive report...</p>
        </div>
      </div>
    );
  }

  if (alertMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Assessment Pending</h3>
            <p className="text-gray-600 mb-8">{alertMessage}</p>
            <button
              onClick={handleGoBack}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Continue Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Assessment data is currently unavailable.</p>
        </div>
      </div>
    );
  }

  const { user_profile, assessment_overview, detailed_results, scope_data } = displayData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden in print */}
      <div className="bg-white shadow-sm border-b print:hidden sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium">Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Assessment Report</h1>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="font-medium">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={printRef} className="max-w-6xl mx-auto px-6 py-8 print:p-0 print:max-w-none">
        
        {/* Print Header - Professional Centered Layout */}
        <div className="hidden print:block mb-8 page-break-section">
          <div className="text-center border-b-2 border-gray-300 pb-8 mb-8">
            <img 
              src="/assets/images/doutya4.png" 
              alt="Company Logo" 
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Professional Assessment Report</h1>
            <p className="text-gray-600 text-lg">Comprehensive Career & Personality Analysis</p>
            <p className="text-gray-500 mt-4">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Executive Profile Card - Page 1 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 page-break-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Executive Summary</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{user_profile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium text-gray-900">{user_profile?.age || 'Not specified'} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Focus Area:</span>
                    <span className="font-medium text-gray-900 capitalize">{user_profile?.career_focus}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-medium text-green-600">{assessment_overview?.assessment_completion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assessment Date:</span>
                    <span className="font-medium text-gray-900">
                      {user_profile?.assessment_date ? new Date(user_profile.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Report Status:</span>
                    <span className="font-medium text-green-600">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personality Analysis - Page 2 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 page-break-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Personality Profile</h2>
            <div className="w-24 h-1 bg-purple-600 mx-auto"></div>
          </div>

          <div className="mb-8">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Overview</h3>
              <p className="text-gray-700 leading-relaxed">{detailed_results?.personality_analysis?.overview}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Core Strengths</h3>
              <div className="space-y-3">
                {detailed_results?.personality_analysis?.strengths?.map((strength, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Advantages</h4>
                <ul className="space-y-2">
                  {detailed_results?.personality_analysis?.advantages?.map((advantage, index) => (
                    <li key={index} className="text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Development Areas</h3>
              <div className="space-y-3">
                {detailed_results?.personality_analysis?.weaknesses?.map((weakness, index) => (
                  <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-gray-700">{weakness}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Areas to Consider</h4>
                <ul className="space-y-2">
                  {detailed_results?.personality_analysis?.disadvantages?.map((disadvantage, index) => (
                    <li key={index} className="text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {disadvantage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Patterns</h3>
            <p className="text-gray-700 leading-relaxed">{detailed_results?.personality_analysis?.behavioral_tendencies}</p>
          </div>
        </div>

        {/* Career Interest Analysis - Page 3 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 page-break-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Career Interest Profile</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
          </div>

          <div className="mb-8">
            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Overview</h3>
              <p className="text-gray-700 leading-relaxed">{detailed_results?.career_analysis?.overview}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Career Strengths</h3>
              <div className="space-y-3">
                {detailed_results?.career_analysis?.strengths?.map((strength, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Growth Areas</h3>
              <div className="space-y-3">
                {detailed_results?.career_analysis?.weaknesses?.map((weakness, index) => (
                  <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-gray-700">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Style Preferences</h3>
            <p className="text-gray-700 leading-relaxed">{detailed_results?.career_analysis?.work_style_preferences}</p>
          </div>
        </div>

        {/* Strategic Insights - Page 4 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 page-break-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Career & Personality Insights</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
          </div>

          <div className="space-y-8">
            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Alignment</h3>
              <p className="text-gray-700 leading-relaxed">{detailed_results?.combined_insights?.alignment}</p>
            </div>

            <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Potential Challenges</h3>
              <p className="text-gray-700 leading-relaxed">{detailed_results?.combined_insights?.potential_conflicts}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Fit Assessment</h3>
              <p className="text-gray-700 leading-relaxed">{detailed_results?.combined_insights?.career_fit_summary}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Guidance</h3>
              <p className="text-gray-700 leading-relaxed">{detailed_results?.combined_insights?.guidance}</p>
            </div>
          </div>
        </div>

        {/* Scope-Specific Recommendations - Page 5+ */}
        {scope_data && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 page-break-section">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {user_profile?.career_focus === 'sector' ? 'Sector Analysis' : 
                 user_profile?.career_focus === 'cluster' ? 'Career Clusters' : 'Career Opportunities'}
              </h2>
              <div className="w-24 h-1 bg-rose-600 mx-auto"></div>
            </div>

            {/* Sector Analysis */}
            {user_profile?.career_focus === 'sector' && scope_data.matching_sectors && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {scope_data.matching_sectors.map((sector, index) => (
                    <div key={sector.id} className="space-y-6">
                      <div className="bg-rose-50 rounded-lg p-6 border border-rose-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{sector.name}</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{sector.brief_overview}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Why Suitable for You</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{sector.why_suitable}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Future Potential</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{sector.future_potential}</p>
                          </div>
                          
                          {sector.recommended_stream && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Recommended Stream</h4>
                              <p className="text-gray-700 text-sm leading-relaxed">{sector.recommended_stream}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cluster Analysis */}
            {user_profile?.career_focus === 'cluster' && Array.isArray(scope_data) && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {scope_data.map((cluster, index) => (
                    <div key={cluster.id} className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{cluster.name}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{cluster.brief_overview}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Why Suitable</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{cluster.why_suitable}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Future Potential</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{cluster.future_potential}</p>
                        </div>
                        
                        {cluster.ideal_stream && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Ideal Stream</h4>
                            <p className="text-gray-700 text-sm">{cluster.ideal_stream}</p>
                          </div>
                        )}
                        
                        {cluster.related_jobs && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Related Jobs</h4>
                            <div className="flex flex-wrap gap-2">
                              {JSON.parse(cluster.related_jobs).slice(0, 6).map((job, jobIndex) => (
                                <span key={jobIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {job}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Analysis */}
            {user_profile?.career_focus === 'career' && Array.isArray(scope_data) && (
              <div className="space-y-8">
                {scope_data.map((career, index) => {
                  const typeInfo = getCareerTypeInfo(career.type);
                  return (
                    <div key={index} className={`${typeInfo.bgColor} rounded-lg p-6 ${typeInfo.borderColor} border`}>
                      <div className="flex items-center mb-4">
                        <span className={`${typeInfo.color} text-white px-3 py-1 rounded-full text-sm font-medium mr-4`}>
                          {typeInfo.label}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{career.career_name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Why This Fits You</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{career.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">What It Involves</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{career.brief_overview}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Future Potential</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{career.future_potential}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Professional Footer */}
        <div className="text-center py-8 border-t border-gray-200 page-break-section">
          <img 
            src="/assets/images/small-logo.png" 
            alt="Logo" 
            className="h-12 w-12 mx-auto mb-4"
          />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your Professional Journey Starts Here</h3>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            This comprehensive analysis is based on validated personality and career interest assessments, 
            providing you with actionable insights for your professional development.
          </p>
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">
              © 2025 Xortcut Professional Assessment Services. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs">
              Report generated on {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          
          .page-break-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 0 !important;
            padding-bottom: 2rem !important;
          }
          
          .page-break-section:not(:last-child) {
            page-break-after: always !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-size: 11pt !important;
            line-height: 1.4 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .bg-gradient-to-r,
          .bg-gradient-to-br,
          .bg-gradient-to-l {
            background-image: none !important;
          }
          
          /* Ensure proper spacing for print */
          .space-y-8 > * + * {
            margin-top: 1.5rem !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 1rem !important;
          }
          
          .space-y-4 > * + * {
            margin-top: 0.75rem !important;
          }
          
          .space-y-3 > * + * {
            margin-top: 0.5rem !important;
          }
          
          .space-y-2 > * + * {
            margin-top: 0.25rem !important;
          }
          
          /* Print page margins and sizing */
          .max-w-6xl {
            max-width: 100% !important;
          }
          
          .px-6 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .py-8 {
            padding-top: 1.5rem !important;
            padding-bottom: 1.5rem !important;
          }
          
          /* Grid adjustments for print */
          .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          }
          
          .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          .md\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          
          .lg\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          /* Text sizing for print */
          .text-4xl {
            font-size: 2.25rem !important;
            line-height: 2.5rem !important;
          }
          
          .text-3xl {
            font-size: 1.875rem !important;
            line-height: 2.25rem !important;
          }
          
          .text-2xl {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
          }
          
          .text-xl {
            font-size: 1.25rem !important;
            line-height: 1.75rem !important;
          }
          
          .text-lg {
            font-size: 1.125rem !important;
            line-height: 1.75rem !important;
          }
          
          .text-sm {
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
          }
          
          .text-xs {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
          }
          
          /* Ensure proper box sizing */
          .rounded-lg {
            border-radius: 0.5rem !important;
          }
          
          .shadow-lg {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          
          /* Background colors for print */
          .bg-purple-50 { background-color: #faf5ff !important; }
          .bg-indigo-50 { background-color: #eef2ff !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-green-50 { background-color: #f0fdf4 !important; }
          .bg-emerald-50 { background-color: #ecfdf5 !important; }
          .bg-amber-50 { background-color: #fffbeb !important; }
          .bg-orange-50 { background-color: #fff7ed !important; }
          .bg-rose-50 { background-color: #fff1f2 !important; }
          .bg-yellow-50 { background-color: #fefce8 !important; }
          .bg-pink-50 { background-color: #fdf2f8 !important; }
          .bg-cyan-50 { background-color: #ecfeff !important; }
          .bg-teal-50 { background-color: #f0fdfa !important; }
          .bg-violet-50 { background-color: #f5f3ff !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          
          /* Border colors for print */
          .border-purple-200 { border-color: #e9d5ff !important; }
          .border-indigo-200 { border-color: #c7d2fe !important; }
          .border-blue-200 { border-color: #bfdbfe !important; }
          .border-green-200 { border-color: #bbf7d0 !important; }
          .border-emerald-200 { border-color: #a7f3d0 !important; }
          .border-amber-200 { border-color: #fde68a !important; }
          .border-orange-200 { border-color: #fed7aa !important; }
          .border-rose-200 { border-color: #fecaca !important; }
          .border-yellow-200 { border-color: #fef08a !important; }
          .border-pink-200 { border-color: #fbcfe8 !important; }
          .border-cyan-200 { border-color: #a5f3fc !important; }
          .border-teal-200 { border-color: #99f6e4 !important; }
          .border-violet-200 { border-color: #ddd6fe !important; }
          .border-gray-200 { border-color: #e5e7eb !important; }
          .border-gray-300 { border-color: #d1d5db !important; }
          
          /* Background colors for badges */
          .bg-blue-600 { background-color: #2563eb !important; color: white !important; }
          .bg-green-600 { background-color: #16a34a !important; color: white !important; }
          .bg-purple-600 { background-color: #9333ea !important; color: white !important; }
          .bg-indigo-600 { background-color: #4f46e5 !important; color: white !important; }
          .bg-orange-600 { background-color: #ea580c !important; color: white !important; }
          .bg-red-600 { background-color: #dc2626 !important; color: white !important; }
          .bg-gray-600 { background-color: #4b5563 !important; color: white !important; }
          .bg-teal-600 { background-color: #0d9488 !important; color: white !important; }
          .bg-pink-600 { background-color: #db2777 !important; color: white !important; }
          .bg-emerald-600 { background-color: #059669 !important; color: white !important; }
          .bg-yellow-600 { background-color: #ca8a04 !important; color: white !important; }
          .bg-cyan-600 { background-color: #0891b2 !important; color: white !important; }
          .bg-rose-600 { background-color: #e11d48 !important; color: white !important; }
          .bg-violet-600 { background-color: #7c3aed !important; color: white !important; }
          
          /* Small badge backgrounds for print */
          .bg-blue-100 { background-color: #dbeafe !important; }
          .text-blue-800 { color: #1e40af !important; }
          
          /* Ensure proper margins between pages */
          @page {
            size: A4;
            margin: 1.5cm 2cm;
          }
          
          /* Hide sticky elements and adjust layout */
          .sticky { position: static !important; }
          .z-50 { z-index: auto !important; }
          
          /* Flex adjustments for print */
          .flex-wrap {
            flex-wrap: wrap !important;
          }
          
          .gap-2 {
            gap: 0.5rem !important;
          }
          
          .gap-4 {
            gap: 1rem !important;
          }
          
          .gap-6 {
            gap: 1.5rem !important;
          }
          
          .gap-8 {
            gap: 2rem !important;
          }
          
          /* Ensure proper text alignment */
          .text-center {
            text-align: center !important;
          }
          
          .text-left {
            text-align: left !important;
          }
          
          /* Leading/line-height adjustments */
          .leading-relaxed {
            line-height: 1.625 !important;
          }
          
          /* Padding adjustments */
          .p-4 {
            padding: 1rem !important;
          }
          
          .p-6 {
            padding: 1.5rem !important;
          }
          
          .p-8 {
            padding: 2rem !important;
          }
          
          .px-3 {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          
          .py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          
          .mb-2 {
            margin-bottom: 0.5rem !important;
          }
          
          .mb-3 {
            margin-bottom: 0.75rem !important;
          }
          
          .mb-4 {
            margin-bottom: 1rem !important;
          }
          
          .mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          .mb-8 {
            margin-bottom: 2rem !important;
          }
          
          .mt-2 {
            margin-top: 0.5rem !important;
          }
          
          .mt-4 {
            margin-top: 1rem !important;
          }
          
          .mt-6 {
            margin-top: 1.5rem !important;
          }
          
          .mt-8 {
            margin-top: 2rem !important;
          }
          
          .pt-6 {
            padding-top: 1.5rem !important;
          }
          
          .pb-8 {
            padding-bottom: 2rem !important;
          }
          
          /* Width adjustments */
          .w-24 {
            width: 6rem !important;
          }
          
          .h-1 {
            height: 0.25rem !important;
          }
          
          .h-12 {
            height: 3rem !important;
          }
          
          .h-20 {
            height: 5rem !important;
          }
          
          .w-12 {
            width: 3rem !important;
          }
          
          .w-2 {
            width: 0.5rem !important;
          }
          
          .h-2 {
            height: 0.5rem !important;
          }
          
          /* Max width for text blocks */
          .max-w-2xl {
            max-width: 42rem !important;
          }
          
          /* Ensure proper display of elements */
          .mx-auto {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          .flex-shrink-0 {
            flex-shrink: 0 !important;
          }
          
          /* Font weights */
          .font-bold {
            font-weight: 700 !important;
          }
          
          .font-semibold {
            font-weight: 600 !important;
          }
          
          .font-medium {
            font-weight: 500 !important;
          }
          
          /* Text colors */
          .text-gray-900 {
            color: #111827 !important;
          }
          
          .text-gray-700 {
            color: #374151 !important;
          }
          
          .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .text-gray-500 {
            color: #6b7280 !important;
          }
          
          .text-gray-400 {
            color: #9ca3af !important;
          }
          
          .text-green-600 {
            color: #16a34a !important;
          }
          
          /* Rounded corners */
          .rounded-full {
            border-radius: 9999px !important;
          }
          
          .rounded-lg {
            border-radius: 0.5rem !important;
          }
          
          /* Border styles */
          .border {
            border-width: 1px !important;
          }
          
          .border-b-2 {
            border-bottom-width: 2px !important;
          }
          
          .border-t {
            border-top-width: 1px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AssessmentResultsPage;
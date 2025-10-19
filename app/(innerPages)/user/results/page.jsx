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
        let data = Array.isArray(response.data) ? response.data[0] : response.data;
        
        // Fix the data parsing issue
        data = parseResultData(data);
        
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

  // Function to properly parse and fix the data structure
  const parseResultData = (data) => {
    if (!data) return data;

    try {
      // If data is already parsed correctly, return as is
      if (typeof data === 'object' && data.user_profile && typeof data.user_profile === 'object') {
        // Check if personality_analysis needs parsing
        if (data.detailed_results?.personality_analysis && typeof data.detailed_results.personality_analysis === 'string') {
          data.detailed_results.personality_analysis = JSON.parse(data.detailed_results.personality_analysis);
        }
        return data;
      }

      // If data is a string, parse it
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (parsed.detailed_results?.personality_analysis && typeof parsed.detailed_results.personality_analysis === 'string') {
          parsed.detailed_results.personality_analysis = JSON.parse(parsed.detailed_results.personality_analysis);
        }
        return parsed;
      }

      // If data is the weird object format with numbered keys
      if (typeof data === 'object' && data[0] !== undefined) {
        // Convert the object to string first
        const dataString = Object.values(data).join('');
        const parsed = JSON.parse(dataString);
        if (parsed.detailed_results?.personality_analysis && typeof parsed.detailed_results.personality_analysis === 'string') {
          parsed.detailed_results.personality_analysis = JSON.parse(parsed.detailed_results.personality_analysis);
        }
        return parsed;
      }

      return data;
    } catch (error) {
      console.error('Error parsing result data:', error);
      return data;
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

  const displayData = resultData;

  const getCareerTypeInfo = (type) => {
    const typeInfo = {
      'traditional': { label: 'Traditional', color: 'bg-blue-600', bgColor: 'bg-blue-900/20 border-blue-700', borderColor: 'border-blue-700' },
      'trending': { label: 'Trending', color: 'bg-green-600', bgColor: 'bg-green-900/20 border-green-700', borderColor: 'border-green-700' },
      'offbeat': { label: 'Offbeat', color: 'bg-purple-600', bgColor: 'bg-purple-900/20 border-purple-700', borderColor: 'border-purple-700' },
      'futuristic': { label: 'Futuristic', color: 'bg-indigo-600', bgColor: 'bg-indigo-900/20 border-indigo-700', borderColor: 'border-indigo-700' },
      'ai-proof': { label: 'AI-Proof', color: 'bg-orange-600', bgColor: 'bg-orange-900/20 border-orange-700', borderColor: 'border-orange-700' },
      'entrepreneurial': { label: 'Entrepreneurial', color: 'bg-red-600', bgColor: 'bg-red-900/20 border-red-700', borderColor: 'border-red-700' },
      'normal': { label: 'Standard', color: 'bg-gray-600', bgColor: 'bg-gray-800/50 border-gray-600', borderColor: 'border-gray-600' },
      'hybrid': { label: 'Hybrid', color: 'bg-teal-600', bgColor: 'bg-teal-900/20 border-teal-700', borderColor: 'border-teal-700' },
      'creative': { label: 'Creative', color: 'bg-pink-600', bgColor: 'bg-pink-900/20 border-pink-700', borderColor: 'border-pink-700' },
      'sustainable': { label: 'Sustainable & Green', color: 'bg-emerald-600', bgColor: 'bg-emerald-900/20 border-emerald-700', borderColor: 'border-emerald-700' },
      'social': { label: 'Social Impact', color: 'bg-yellow-600', bgColor: 'bg-yellow-900/20 border-yellow-700', borderColor: 'border-yellow-700' },
      'tech': { label: 'Tech-Driven', color: 'bg-cyan-600', bgColor: 'bg-cyan-900/20 border-cyan-700', borderColor: 'border-cyan-700' },
      'experiential': { label: 'Experiential', color: 'bg-rose-600', bgColor: 'bg-rose-900/20 border-rose-700', borderColor: 'border-rose-700' },
      'digital': { label: 'Digital & Online', color: 'bg-violet-600', bgColor: 'bg-violet-900/20 border-violet-700', borderColor: 'border-violet-700' }
    };
    return typeInfo[type] || typeInfo['normal'];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a24] text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Analyzing Your Results</h3>
          <p className="text-gray-400">Please wait while we prepare your comprehensive report...</p>
        </div>
      </div>
    );
  }

  if (alertMessage) {
    return (
      <div className="min-h-screen bg-[#1a1a24] text-gray-200 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-900/20 border border-amber-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-200 mb-3">Assessment Pending</h3>
            <p className="text-gray-400 mb-8">{alertMessage}</p>
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
      <div className="min-h-screen bg-[#1a1a24] text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Assessment data is currently unavailable.</p>
        </div>
      </div>
    );
  }

  const { user_profile, assessment_overview, detailed_results, scope_data } = displayData;

  return (
    <div className="min-h-screen bg-[#1a1a24] text-gray-200">
      {/* Header - Hidden in print */}
      <div className="bg-gray-800 border-b border-gray-700 print:hidden sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium">Dashboard</span>
              </button>
              <h1 className="text-xl font-bold text-gray-200">Assessment Report</h1>
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
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 mb-8 page-break-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-200 mb-2">Executive Summary</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="font-medium text-gray-200">{user_profile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age:</span>
                    <span className="font-medium text-gray-200">{user_profile?.age || 'Not specified'} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Focus Area:</span>
                    <span className="font-medium text-gray-200 capitalize">{user_profile?.career_focus}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Assessment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completion Rate:</span>
                    <span className="font-medium text-green-400">{assessment_overview?.assessment_completion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assessment Date:</span>
                    <span className="font-medium text-gray-200">
                      {user_profile?.assessment_date ? new Date(user_profile.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Report Status:</span>
                    <span className="font-medium text-green-400">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personality Analysis - Page 2 */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 mb-8 page-break-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-200 mb-2">Personality Profile</h2>
            <div className="w-24 h-1 bg-purple-600 mx-auto"></div>
          </div>

          {detailed_results?.personality_analysis && (
            <>
              <div className="mb-8">
                <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-200 mb-3">Overview</h3>
                  <p className="text-gray-300 leading-relaxed">{detailed_results.personality_analysis.overview}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-200">Core Strengths</h3>
                  <div className="space-y-3">
                    {detailed_results.personality_analysis.strengths?.map((strength, index) => (
                      <div key={index} className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                        <p className="text-gray-300">{strength}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-200 mb-3">Key Advantages</h4>
                    <ul className="space-y-2">
                      {detailed_results.personality_analysis.advantages?.map((advantage, index) => (
                        <li key={index} className="text-gray-400 flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-200">Development Areas</h3>
                  <div className="space-y-3">
                    {detailed_results.personality_analysis.weaknesses?.map((weakness, index) => (
                      <div key={index} className="p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
                        <p className="text-gray-300">{weakness}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-200 mb-3">Areas to Consider</h4>
                    <ul className="space-y-2">
                      {detailed_results.personality_analysis.disadvantages?.map((disadvantage, index) => (
                        <li key={index} className="text-gray-400 flex items-start">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {disadvantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Behavioral Patterns</h3>
                <p className="text-gray-300 leading-relaxed">{detailed_results.personality_analysis.behavioral_tendencies}</p>
              </div>
            </>
          )}
        </div>

        {/* Career Interest Analysis - Page 3 */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 mb-8 page-break-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-200 mb-2">Career Interest Profile</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
          </div>

          {detailed_results?.career_analysis && (
            <>
              <div className="mb-8">
                <div className="bg-indigo-900/20 border border-indigo-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-200 mb-3">Overview</h3>
                  <p className="text-gray-300 leading-relaxed">{detailed_results.career_analysis.overview}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-200">Career Strengths</h3>
                  <div className="space-y-3">
                    {detailed_results.career_analysis.strengths?.map((strength, index) => (
                      <div key={index} className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                        <p className="text-gray-300">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-200">Growth Areas</h3>
                  <div className="space-y-3">
                    {detailed_results.career_analysis.weaknesses?.map((weakness, index) => (
                      <div key={index} className="p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
                        <p className="text-gray-300">{weakness}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Work Style Preferences</h3>
                <p className="text-gray-300 leading-relaxed">{detailed_results.career_analysis.work_style_preferences}</p>
              </div>
            </>
          )}
        </div>

        {/* Strategic Insights - Page 4 */}
        {detailed_results?.combined_insights && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 mb-8 page-break-section">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-200 mb-2">Career & Personality Insights</h2>
              <div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Profile Alignment</h3>
                <p className="text-gray-300 leading-relaxed">{detailed_results.combined_insights.alignment}</p>
              </div>

              <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Potential Challenges</h3>
                <p className="text-gray-300 leading-relaxed">{detailed_results.combined_insights.potential_conflicts}</p>
              </div>

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Career Fit Assessment</h3>
                <p className="text-gray-300 leading-relaxed">{detailed_results.combined_insights.career_fit_summary}</p>
              </div>

              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Strategic Guidance</h3>
                <p className="text-gray-300 leading-relaxed">{detailed_results.combined_insights.guidance}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scope-Specific Recommendations - Page 5+ */}
        {scope_data && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 mb-8 page-break-section">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-200 mb-2">
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
                      <div className="bg-rose-900/20 border border-rose-700 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-200 mb-4">{sector.name}</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Overview</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{sector.brief_overview}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Why Suitable for You</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{sector.why_suitable}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Future Potential</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{sector.future_potential}</p>
                          </div>
                          
                          {sector.recommended_stream && (
                            <div>
                              <h4 className="font-semibold text-gray-200 mb-2">Recommended Stream</h4>
                              <p className="text-gray-300 text-sm leading-relaxed">{sector.recommended_stream}</p>
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
                  {scope_data.map((clusterItem, index) => (
                    <div key={clusterItem.cluster_details?.id || index} className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Rank #{clusterItem.rank}
                          </div>
                          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {clusterItem.suitability_score}% Match
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-200 mb-4">{clusterItem.cluster}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-200 mb-2">Why This Fits You</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{clusterItem.reasoning}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-200 mb-2">Overview</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{clusterItem.cluster_details?.brief_overview}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-200 mb-2">Why Suitable</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{clusterItem.cluster_details?.why_suitable}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-200 mb-2">Future Potential</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{clusterItem.cluster_details?.future_potential}</p>
                        </div>
                        
                        {clusterItem.cluster_details?.ideal_stream && (
                          <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Ideal Stream</h4>
                            <p className="text-gray-300 text-sm">{clusterItem.cluster_details.ideal_stream}</p>
                          </div>
                        )}
                        
                        {clusterItem.cluster_details?.related_jobs && (
                          <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Related Jobs</h4>
                            <div className="flex flex-wrap gap-2">
                              {clusterItem.cluster_details.related_jobs.split(',').slice(0, 6).map((job, jobIndex) => (
                                <span key={jobIndex} className="px-3 py-1 bg-blue-900/30 text-blue-300 border border-blue-700 rounded-full text-xs">
                                  {job.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {clusterItem.cluster_details?.sector && (
                          <div>
                            <h4 className="font-semibold text-gray-200 mb-2">Sector</h4>
                            <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                              {clusterItem.cluster_details.sector}
                            </span>
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
                    <div key={index} className={`${typeInfo.bgColor} rounded-lg p-6 border`}>
                      <div className="flex items-center mb-4">
                        <span className={`${typeInfo.color} text-white px-3 py-1 rounded-full text-sm font-medium mr-4`}>
                          {typeInfo.label}
                        </span>
                        <h3 className="text-xl font-bold text-gray-200">{career.career_name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-200 mb-2">Why This Fits You</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{career.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-200 mb-2">What It Involves</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{career.brief_overview}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-200 mb-2">Future Potential</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{career.future_potential}</p>
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
        <div className="text-center py-8 border-t border-gray-700 page-break-section">
          <img 
            src="/assets/images/small-logo.png" 
            alt="Logo" 
            className="h-12 w-12 mx-auto mb-4"
          />
          <h3 className="text-xl font-bold text-gray-200 mb-2">Your Professional Journey Starts Here</h3>
          <p className="text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed">
            This comprehensive analysis is based on validated personality and career interest assessments, 
            providing you with actionable insights for your professional development.
          </p>
          <div className="space-y-2">
            <p className="text-gray-500 text-sm">
              © 2025 Xortcut Professional Assessment Services. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs">
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
            background: white !important;
          }
          
          /* Override dark theme for print */
          .bg-\\[\\#1a1a24\\] {
            background-color: white !important;
          }
          
          .bg-gray-800 {
            background-color: white !important;
            border: 1px solid #e5e7eb !important;
          }
          
          .text-gray-200 {
            color: #111827 !important;
          }
          
          .text-gray-300 {
            color: #374151 !important;
          }
          
          .text-gray-400 {
            color: #6b7280 !important;
          }
          
          .text-gray-500 {
            color: #9ca3af !important;
          }
          
          .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .border-gray-700 {
            border-color: #e5e7eb !important;
          }
          
          /* Print background colors */
          .bg-purple-900\\/20 { background-color: #faf5ff !important; }
          .bg-indigo-900\\/20 { background-color: #eef2ff !important; }
          .bg-blue-900\\/20 { background-color: #eff6ff !important; }
          .bg-green-900\\/20 { background-color: #f0fdf4 !important; }
          .bg-emerald-900\\/20 { background-color: #ecfdf5 !important; }
          .bg-amber-900\\/20 { background-color: #fffbeb !important; }
          .bg-orange-900\\/20 { background-color: #fff7ed !important; }
          .bg-rose-900\\/20 { background-color: #fff1f2 !important; }
          .bg-yellow-900\\/20 { background-color: #fefce8 !important; }
          .bg-pink-900\\/20 { background-color: #fdf2f8 !important; }
          .bg-cyan-900\\/20 { background-color: #ecfeff !important; }
          .bg-teal-900\\/20 { background-color: #f0fdfa !important; }
          .bg-violet-900\\/20 { background-color: #f5f3ff !important; }
          .bg-gray-800\\/50 { background-color: #f9fafb !important; }
          
          /* Print border colors */
          .border-purple-700 { border-color: #e9d5ff !important; }
          .border-indigo-700 { border-color: #c7d2fe !important; }
          .border-blue-700 { border-color: #bfdbfe !important; }
          .border-green-700 { border-color: #bbf7d0 !important; }
          .border-emerald-700 { border-color: #a7f3d0 !important; }
          .border-amber-700 { border-color: #fde68a !important; }
          .border-orange-700 { border-color: #fed7aa !important; }
          .border-rose-700 { border-color: #fecaca !important; }
          .border-yellow-700 { border-color: #fef08a !important; }
          .border-pink-700 { border-color: #fbcfe8 !important; }
          .border-cyan-700 { border-color: #a5f3fc !important; }
          .border-teal-700 { border-color: #99f6e4 !important; }
          .border-violet-700 { border-color: #ddd6fe !important; }
          .border-gray-600 { border-color: #e5e7eb !important; }
          
          /* Badge colors for print */
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
          .bg-blue-900\\/30 { background-color: #dbeafe !important; }
          .text-blue-300 { color: #1e40af !important; }
          
          /* Color adjustments for text */
          .text-green-400 { color: #16a34a !important; }
          .text-amber-400 { color: #d97706 !important; }
          
          @page {
            size: A4;
            margin: 1.5cm 2cm;
          }
        }
      `}</style>
    </div>
  );
};

export default AssessmentResultsPage;
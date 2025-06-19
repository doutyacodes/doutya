"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, User, Calendar, Target, CheckCircle, TrendingUp, Briefcase, Users, Lightbulb, Award, ChevronRight } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assessment results...</p>
        </div>
      </div>
    );
  }

  if (alertMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Incomplete</h3>
            <p className="text-gray-600 mb-6">{alertMessage}</p>
            <button
              onClick={handleGoBack}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Complete Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No assessment data available.</p>
        </div>
      </div>
    );
  }
  // Check if user is a kid based on the response
  const isKid = resultData.user_profile?.is_kid || false;

  const { user_profile, assessment_overview, detailed_results } = resultData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden in print */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 header-content">
            <div className="flex items-center space-x-4 header-left">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <img 
                src="/assets/images/small-logo.png" 
                alt="Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Assessment Results</h1>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center bg-orange-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-orange-600 transition-colors header-right"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={printRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        {/* Header for Print */}
        <div className="hidden print:block mb-8">
          <div className="flex items-center justify-between border-b pb-4">
            <img 
              src="/assets/images/doutya4.png" 
              alt="Company Logo" 
              className="h-12"
            />
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">Assessment Report</h1>
              <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-6 profile-header">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user_profile?.name}</h2>
                <p className="text-sm sm:text-base text-gray-600">Personal Development Report</p>
              </div>
            </div>
            <div className="text-center profile-completion">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Assessment Completion</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{assessment_overview?.assessment_completion}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 profile-details-grid">
            <div className="flex items-center space-x-3 profile-detail-item">
              <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-semibold">{user_profile?.age || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 profile-detail-item">
              <Target className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Career Focus</p>
                <p className="font-semibold capitalize">{user_profile?.career_focus}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 profile-detail-item sm:col-span-2 lg:col-span-1">
              <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Assessment Date</p>
                <p className="font-semibold">{user_profile?.assessment_date ? new Date(user_profile.assessment_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {detailed_results?.executive_summary && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-8 print-avoid-break">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Executive Summary</h3>
            <p className="text-gray-700 leading-relaxed">{detailed_results.executive_summary}</p>
          </div>
        )}

        {isKid ? (
          /* KIDS SECTIONS */
          <>
            {/* Fun Personality Insights for Kids */}
            {detailed_results?.personality_insights && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-section personality-insights">
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-orange-500 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">About Your Personality ✨</h3>
                </div>
                
                <div className="space-y-6 section-content">
                  {detailed_results.personality_insights.core_traits && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        🌟 What Makes You Special
                      </h4>
                      <p className="text-gray-700">{detailed_results.personality_insights.core_traits}</p>
                    </div>
                  )}
                  {detailed_results.personality_insights.fun_facts && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        🎉 Your Super Powers
                      </h4>
                      <p className="text-gray-700">{detailed_results.personality_insights.fun_facts}</p>
                    </div>
                  )}
                  {detailed_results.personality_insights.things_to_practice && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        🚀 Things to Practice
                      </h4>
                      <p className="text-gray-700">{detailed_results.personality_insights.things_to_practice}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Future Career Ideas for Kids */}
            {detailed_results?.career_recommendations && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
                <div className="flex items-center mb-6">
                  <Award className="w-6 h-6 text-orange-500 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Future Career Ideas 🚀</h3>
                </div>
                
                {detailed_results.career_recommendations.top_career_matches && detailed_results.career_recommendations.top_career_matches.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Jobs You Might Love When You Grow Up!</h4>
                    <div className="space-y-4">
                      {detailed_results.career_recommendations.top_career_matches.map((career, index) => (
                        <div key={index} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50 career-item">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-900 text-lg">{career.career}</h5>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-orange-500 h-3 rounded-full" 
                                  style={{ width: `${career.match_percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-lg font-bold text-orange-600">{career.match_percentage}%</span>
                            </div>
                          </div>
                          <p className="text-gray-600">✨ {career.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailed_results.career_recommendations.fun_activities && detailed_results.career_recommendations.fun_activities.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      🎨 Fun Activities to Try
                    </h4>
                    <ul className="space-y-2">
                      {detailed_results.career_recommendations.fun_activities.map((activity, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-2xl mr-3">🌟</span>
                          <span className="text-gray-700">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Growth & Learning for Kids */}
            {detailed_results?.development_opportunities && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
                <div className="flex items-center mb-6">
                  <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Growing and Learning 📚</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      🌱 Keep Growing
                    </h4>
                    <p className="text-gray-700">{detailed_results.development_opportunities.growth_areas}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      🎯 What to Focus On
                    </h4>
                    <p className="text-gray-700">{detailed_results.development_opportunities.skill_recommendations}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      🧠 How You Learn Best
                    </h4>
                    <p className="text-gray-700">{detailed_results.development_opportunities.learning_preferences}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
            <>
                {/* Personality Insights */}
                {detailed_results?.personality_insights && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-section personality-insights">
                  <div className="flex items-center mb-6">
                    <Users className="w-6 h-6 text-orange-500 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Personality Insights</h3>
                  </div>
                    
                    <div className="space-y-6">
                    {detailed_results.personality_insights.core_traits && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Core Traits</h4>
                        <p className="text-gray-700">{detailed_results.personality_insights.core_traits}</p>
                        </div>
                    )}
                    {detailed_results.personality_insights.behavioral_patterns && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Behavioral Patterns</h4>
                        <p className="text-gray-700">{detailed_results.personality_insights.behavioral_patterns}</p>
                        </div>
                    )}
                    {detailed_results.personality_insights.communication_style && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Communication Style</h4>
                        <p className="text-gray-700">{detailed_results.personality_insights.communication_style}</p>
                        </div>
                    )}
                    </div>
                </div>
                )}

                {/* Career Alignment */}
                {detailed_results?.career_alignment && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
                    <div className="flex items-center mb-6">
                    <Briefcase className="w-6 h-6 text-orange-500 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Career Alignment</h3>
                    </div>
                    
                    <div className="space-y-6">
                    {detailed_results.career_alignment.ideal_work_environment && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Ideal Work Environment</h4>
                        <p className="text-gray-700">{detailed_results.career_alignment.ideal_work_environment}</p>
                        </div>
                    )}
                    {detailed_results.career_alignment.leadership_style && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Leadership Style</h4>
                        <p className="text-gray-700">{detailed_results.career_alignment.leadership_style}</p>
                        </div>
                    )}
                    {detailed_results.career_alignment.collaboration_preferences && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Collaboration Preferences</h4>
                        <p className="text-gray-700">{detailed_results.career_alignment.collaboration_preferences}</p>
                        </div>
                    )}
                    </div>
                </div>
                )}

                {/* Career Recommendations */}
                {detailed_results?.career_recommendations && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
                    <div className="flex items-center mb-6">
                    <Award className="w-6 h-6 text-orange-500 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Career Recommendations</h3>
                    </div>
                    
                    {detailed_results.career_recommendations.top_career_matches && detailed_results.career_recommendations.top_career_matches.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Top Career Matches</h4>
                        <div className="space-y-4">
                          {detailed_results.career_recommendations.top_career_matches.map((career, index) => (
                            <div key={index} className="border rounded-lg p-4 career-item">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-gray-900">{career.career}</h5>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-orange-500 h-2 rounded-full" 
                                      style={{ width: `${career.match_percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold text-orange-600">{career.match_percentage}%</span>
                                </div>
                              </div>
                              {career.reasoning && <p className="text-gray-600 text-sm">{career.reasoning}</p>}
                            </div>
                          ))}
                        </div>
                    </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {detailed_results.career_recommendations.industries_to_explore && detailed_results.career_recommendations.industries_to_explore.length > 0 && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Industries to Explore</h4>
                        <ul className="space-y-2">
                            {detailed_results.career_recommendations.industries_to_explore.map((industry, index) => (
                            <li key={index} className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-orange-500 mr-2" />
                                <span className="text-gray-700">{industry}</span>
                            </li>
                            ))}
                        </ul>
                        </div>
                    )}
                    {detailed_results.career_recommendations.roles_to_avoid && detailed_results.career_recommendations.roles_to_avoid.length > 0 && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Roles to Consider Carefully</h4>
                        <ul className="space-y-2">
                            {detailed_results.career_recommendations.roles_to_avoid.map((role, index) => (
                            <li key={index} className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">{role}</span>
                            </li>
                            ))}
                        </ul>
                        </div>
                    )}
                    </div>
                </div>
                )}

                {/* Development Opportunities */}
                {detailed_results?.development_opportunities && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
                    <div className="flex items-center mb-6">
                    <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Development Opportunities</h3>
                    </div>
                    
                    <div className="space-y-6">
                    {detailed_results.development_opportunities.growth_areas && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Growth Areas</h4>
                        <p className="text-gray-700">{detailed_results.development_opportunities.growth_areas}</p>
                        </div>
                    )}
                    {detailed_results.development_opportunities.skill_recommendations && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Skill Recommendations</h4>
                        <p className="text-gray-700">{detailed_results.development_opportunities.skill_recommendations}</p>
                        </div>
                    )}
                    {detailed_results.development_opportunities.learning_preferences && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Learning Preferences</h4>
                        <p className="text-gray-700">{detailed_results.development_opportunities.learning_preferences}</p>
                        </div>
                    )}
                    </div>
                </div>
                )}

                {/* Action Plan */}
                {detailed_results?.action_plan && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
                    <div className="flex items-center mb-6">
                    <Lightbulb className="w-6 h-6 text-orange-500 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Action Plan</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {detailed_results.action_plan.immediate_steps && detailed_results.action_plan.immediate_steps.length > 0 && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Immediate Steps</h4>
                        <ul className="space-y-2">
                            {detailed_results.action_plan.immediate_steps.map((step, index) => (
                            <li key={index} className="flex items-start">
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                <span className="text-orange-600 text-sm font-semibold">{index + 1}</span>
                                </div>
                                <span className="text-gray-700">{step}</span>
                            </li>
                            ))}
                        </ul>
                        </div>
                    )}
                    {detailed_results.action_plan.long_term_goals && detailed_results.action_plan.long_term_goals.length > 0 && (
                        <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Long-term Goals</h4>
                        <ul className="space-y-2">
                            {detailed_results.action_plan.long_term_goals.map((goal, index) => (
                            <li key={index} className="flex items-start">
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                <span className="text-orange-600 text-sm font-semibold">{index + 1}</span>
                                </div>
                                <span className="text-gray-700">{goal}</span>
                            </li>
                            ))}
                        </ul>
                        </div>
                    )}
                    </div>
                    
                    {detailed_results.action_plan.networking_advice && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Networking Advice</h4>
                        <p className="text-gray-700">{detailed_results.action_plan.networking_advice}</p>
                    </div>
                    )}
                </div>
                )}
            </>
        )}
        {/* Footer */}
        <div className="text-center py-8 print:mt-8">
          <img 
            src="/assets/images/small-logo.png" 
            alt="Logo" 
            className="h-8 w-8 mx-auto mb-2"
          />
          <p className="text-gray-500 text-sm">
            This report is generated based on your personality and career interest assessments.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            © 2025 Xortcut. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultsPage;
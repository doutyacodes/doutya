// "use client"
// import React, { useState, useEffect, useRef } from 'react';
// import { ArrowLeft, Download, User, Calendar, Target, CheckCircle, TrendingUp, Briefcase, Users, Lightbulb, Award, ChevronRight } from 'lucide-react';
// import GlobalApi from '@/app/_services/GlobalApi';
// import { useRouter } from 'next/navigation';
// import "../_components/styles.css";

// const AssessmentResultsPage = () => {
//   const [resultData, setResultData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const printRef = useRef();
//   const router = useRouter()
//   const fetchResults = async () => {
//     setIsLoading(true);
//     try {
//       const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//       const language = localStorage.getItem("language") || "en";
//       const response = await GlobalApi.GetUserId(token, language);
      
//       if (response.status === 200) {
//         const data = Array.isArray(response.data) ? response.data[0] : response.data;
//         setResultData(data);
//       } else if (response.status === 202) {
//         setAlertMessage(response.data.message || "Please complete the assessment first.");
//       }
//     } catch (err) {
//       console.error("Error fetching results:", err);
//       setAlertMessage("Unable to load assessment results. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchResults();
//   }, []);

//   const handleDownloadPDF = () => {
//     window.print();
//   };

//   const handleGoBack = () => {
//     const storedUrl = localStorage.getItem("dashboardUrl");
//     if (storedUrl) {
//       router.push(storedUrl);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading your assessment results...</p>
//         </div>
//       </div>
//     );
//   }

//   if (alertMessage) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
//           <div className="text-center">
//             <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <CheckCircle className="w-8 h-8 text-orange-500" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Incomplete</h3>
//             <p className="text-gray-600 mb-6">{alertMessage}</p>
//             <button
//               onClick={handleGoBack}
//               className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
//             >
//               Complete Assessment
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!resultData) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600">No assessment data available.</p>
//         </div>
//       </div>
//     );
//   }
//   // Check if user is a kid based on the response
//   const isKid = resultData.user_profile?.is_kid || false;

//   const { user_profile, assessment_overview, detailed_results } = resultData;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header - Hidden in print */}
//       <div className="bg-white shadow-sm border-b print:hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between py-4 header-content">
//             <div className="flex items-center space-x-4 header-left">
//               <button
//                 onClick={handleGoBack}
//                 className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 mr-2" />
//                 <span className="hidden sm:inline">Back</span>
//               </button>
//               <img 
//                 src="/assets/images/small-logo.png" 
//                 alt="Logo" 
//                 className="h-8 w-8"
//               />
//               <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Assessment Results</h1>
//             </div>
//             <button
//               onClick={handleDownloadPDF}
//               className="flex items-center bg-orange-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-orange-600 transition-colors header-right"
//             >
//               <Download className="w-4 h-4 mr-2" />
//               <span className="text-sm sm:text-base">Download PDF</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div ref={printRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
//         {/* Header for Print */}
//         <div className="hidden print:block mb-8">
//           <div className="flex items-center justify-between border-b pb-4">
//             <img 
//               src="/assets/images/doutya4.png" 
//               alt="Company Logo" 
//               className="h-12"
//             />
//             <div className="text-right">
//               <h1 className="text-2xl font-bold text-gray-900">Assessment Report</h1>
//               <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
//             </div>
//           </div>
//         </div>

//         {/* User Profile Card */}
//         <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
//           <div className="flex items-center justify-between mb-6 profile-header">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center">
//                 <User className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
//               </div>
//               <div>
//                 <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user_profile?.name}</h2>
//                 <p className="text-sm sm:text-base text-gray-600">Personal Development Report</p>
//               </div>
//             </div>
//             <div className="text-center profile-completion">
//               <div className="text-xs sm:text-sm text-gray-500 mb-1">Assessment Completion</div>
//               <div className="text-xl sm:text-2xl font-bold text-green-600">{assessment_overview?.assessment_completion}</div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 profile-details-grid">
//             <div className="flex items-center space-x-3 profile-detail-item">
//               <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
//               <div>
//                 <p className="text-sm text-gray-500">Age</p>
//                 <p className="font-semibold">{user_profile?.age || 'Not specified'}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3 profile-detail-item">
//               <Target className="w-5 h-5 text-orange-500 flex-shrink-0" />
//               <div>
//                 <p className="text-sm text-gray-500">Career Focus</p>
//                 <p className="font-semibold capitalize">{user_profile?.career_focus}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3 profile-detail-item sm:col-span-2 lg:col-span-1">
//               <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
//               <div>
//                 <p className="text-sm text-gray-500">Assessment Date</p>
//                 <p className="font-semibold">{user_profile?.assessment_date ? new Date(user_profile.assessment_date).toLocaleDateString() : 'N/A'}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Executive Summary */}
//         {detailed_results?.executive_summary && (
//           <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 mb-8 print-avoid-break">
//             <h3 className="text-xl font-bold text-gray-900 mb-4">Executive Summary</h3>
//             <p className="text-gray-700 leading-relaxed">{detailed_results.executive_summary}</p>
//           </div>
//         )}

//         {isKid ? (
//           /* KIDS SECTIONS */
//           <>
//             {/* Fun Personality Insights for Kids */}
//             {detailed_results?.personality_insights && (
//               <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-section personality-insights">
//                 <div className="flex items-center mb-6">
//                   <Users className="w-6 h-6 text-orange-500 mr-3" />
//                   <h3 className="text-xl font-bold text-gray-900">About Your Personality ✨</h3>
//                 </div>
                
//                 <div className="space-y-6 section-content">
//                   {detailed_results.personality_insights.core_traits && (
//                     <div className="p-4 bg-blue-50 rounded-lg">
//                       <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                         🌟 What Makes You Special
//                       </h4>
//                       <p className="text-gray-700">{detailed_results.personality_insights.core_traits}</p>
//                     </div>
//                   )}
//                   {detailed_results.personality_insights.fun_facts && (
//                     <div className="p-4 bg-green-50 rounded-lg">
//                       <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                         🎉 Your Super Powers
//                       </h4>
//                       <p className="text-gray-700">{detailed_results.personality_insights.fun_facts}</p>
//                     </div>
//                   )}
//                   {detailed_results.personality_insights.things_to_practice && (
//                     <div className="p-4 bg-yellow-50 rounded-lg">
//                       <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                         🚀 Things to Practice
//                       </h4>
//                       <p className="text-gray-700">{detailed_results.personality_insights.things_to_practice}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Future Career Ideas for Kids */}
//             {detailed_results?.career_recommendations && (
//               <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
//                 <div className="flex items-center mb-6">
//                   <Award className="w-6 h-6 text-orange-500 mr-3" />
//                   <h3 className="text-xl font-bold text-gray-900">Future Career Ideas 🚀</h3>
//                 </div>
                
//                 {detailed_results.career_recommendations.top_career_matches && detailed_results.career_recommendations.top_career_matches.length > 0 && (
//                   <div className="mb-6">
//                     <h4 className="font-semibold text-gray-900 mb-4">Jobs You Might Love When You Grow Up!</h4>
//                     <div className="space-y-4">
//                       {detailed_results.career_recommendations.top_career_matches.map((career, index) => (
//                         <div key={index} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50 career-item">
//                           <div className="flex items-center justify-between mb-2">
//                             <h5 className="font-semibold text-gray-900 text-lg">{career.career}</h5>
//                             <div className="flex items-center space-x-2">
//                               <div className="w-20 bg-gray-200 rounded-full h-3">
//                                 <div 
//                                   className="bg-orange-500 h-3 rounded-full" 
//                                   style={{ width: `${career.match_percentage}%` }}
//                                 ></div>
//                               </div>
//                               <span className="text-lg font-bold text-orange-600">{career.match_percentage}%</span>
//                             </div>
//                           </div>
//                           <p className="text-gray-600">✨ {career.reasoning}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {detailed_results.career_recommendations.fun_activities && detailed_results.career_recommendations.fun_activities.length > 0 && (
//                   <div className="p-4 bg-purple-50 rounded-lg">
//                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
//                       🎨 Fun Activities to Try
//                     </h4>
//                     <ul className="space-y-2">
//                       {detailed_results.career_recommendations.fun_activities.map((activity, index) => (
//                         <li key={index} className="flex items-center">
//                           <span className="text-2xl mr-3">🌟</span>
//                           <span className="text-gray-700">{activity}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Growth & Learning for Kids */}
//             {detailed_results?.development_opportunities && (
//               <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
//                 <div className="flex items-center mb-6">
//                   <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
//                   <h3 className="text-xl font-bold text-gray-900">Growing and Learning 📚</h3>
//                 </div>
                
//                 <div className="space-y-6">
//                   <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
//                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                       🌱 Keep Growing
//                     </h4>
//                     <p className="text-gray-700">{detailed_results.development_opportunities.growth_areas}</p>
//                   </div>
//                   <div className="p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
//                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                       🎯 What to Focus On
//                     </h4>
//                     <p className="text-gray-700">{detailed_results.development_opportunities.skill_recommendations}</p>
//                   </div>
//                   <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
//                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                       🧠 How You Learn Best
//                     </h4>
//                     <p className="text-gray-700">{detailed_results.development_opportunities.learning_preferences}</p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         ) : (
//             <>
//                 {/* Personality Insights */}
//                 {detailed_results?.personality_insights && (
//                 <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-section personality-insights">
//                   <div className="flex items-center mb-6">
//                     <Users className="w-6 h-6 text-orange-500 mr-3" />
//                     <h3 className="text-xl font-bold text-gray-900">Personality Insights</h3>
//                   </div>
                    
//                     <div className="space-y-6">
//                     {detailed_results.personality_insights.core_traits && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Core Traits</h4>
//                         <p className="text-gray-700">{detailed_results.personality_insights.core_traits}</p>
//                         </div>
//                     )}
//                     {detailed_results.personality_insights.behavioral_patterns && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Behavioral Patterns</h4>
//                         <p className="text-gray-700">{detailed_results.personality_insights.behavioral_patterns}</p>
//                         </div>
//                     )}
//                     {detailed_results.personality_insights.communication_style && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Communication Style</h4>
//                         <p className="text-gray-700">{detailed_results.personality_insights.communication_style}</p>
//                         </div>
//                     )}
//                     </div>
//                 </div>
//                 )}

//                 {/* Career Alignment */}
//                 {detailed_results?.career_alignment && (
//                 <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
//                     <div className="flex items-center mb-6">
//                     <Briefcase className="w-6 h-6 text-orange-500 mr-3" />
//                     <h3 className="text-xl font-bold text-gray-900">Career Alignment</h3>
//                     </div>
                    
//                     <div className="space-y-6">
//                     {detailed_results.career_alignment.ideal_work_environment && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Ideal Work Environment</h4>
//                         <p className="text-gray-700">{detailed_results.career_alignment.ideal_work_environment}</p>
//                         </div>
//                     )}
//                     {detailed_results.career_alignment.leadership_style && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Leadership Style</h4>
//                         <p className="text-gray-700">{detailed_results.career_alignment.leadership_style}</p>
//                         </div>
//                     )}
//                     {detailed_results.career_alignment.collaboration_preferences && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Collaboration Preferences</h4>
//                         <p className="text-gray-700">{detailed_results.career_alignment.collaboration_preferences}</p>
//                         </div>
//                     )}
//                     </div>
//                 </div>
//                 )}

//                 {/* Career Recommendations */}
//                 {detailed_results?.career_recommendations && (
//                 <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
//                     <div className="flex items-center mb-6">
//                     <Award className="w-6 h-6 text-orange-500 mr-3" />
//                     <h3 className="text-xl font-bold text-gray-900">Career Recommendations</h3>
//                     </div>
                    
//                     {detailed_results.career_recommendations.top_career_matches && detailed_results.career_recommendations.top_career_matches.length > 0 && (
//                     <div className="mb-6">
//                         <h4 className="font-semibold text-gray-900 mb-4">Top Career Matches</h4>
//                         <div className="space-y-4">
//                           {detailed_results.career_recommendations.top_career_matches.map((career, index) => (
//                             <div key={index} className="border rounded-lg p-4 career-item">
//                               <div className="flex items-center justify-between mb-2">
//                                 <h5 className="font-semibold text-gray-900">{career.career}</h5>
//                                 <div className="flex items-center space-x-2">
//                                   <div className="w-16 bg-gray-200 rounded-full h-2">
//                                     <div 
//                                       className="bg-orange-500 h-2 rounded-full" 
//                                       style={{ width: `${career.match_percentage}%` }}
//                                     ></div>
//                                   </div>
//                                   <span className="text-sm font-semibold text-orange-600">{career.match_percentage}%</span>
//                                 </div>
//                               </div>
//                               {career.reasoning && <p className="text-gray-600 text-sm">{career.reasoning}</p>}
//                             </div>
//                           ))}
//                         </div>
//                     </div>
//                     )}

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {detailed_results.career_recommendations.industries_to_explore && detailed_results.career_recommendations.industries_to_explore.length > 0 && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-3">Industries to Explore</h4>
//                         <ul className="space-y-2">
//                             {detailed_results.career_recommendations.industries_to_explore.map((industry, index) => (
//                             <li key={index} className="flex items-center">
//                                 <ChevronRight className="w-4 h-4 text-orange-500 mr-2" />
//                                 <span className="text-gray-700">{industry}</span>
//                             </li>
//                             ))}
//                         </ul>
//                         </div>
//                     )}
//                     {detailed_results.career_recommendations.roles_to_avoid && detailed_results.career_recommendations.roles_to_avoid.length > 0 && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-3">Roles to Consider Carefully</h4>
//                         <ul className="space-y-2">
//                             {detailed_results.career_recommendations.roles_to_avoid.map((role, index) => (
//                             <li key={index} className="flex items-center">
//                                 <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
//                                 <span className="text-gray-600">{role}</span>
//                             </li>
//                             ))}
//                         </ul>
//                         </div>
//                     )}
//                     </div>
//                 </div>
//                 )}

//                 {/* Development Opportunities */}
//                 {detailed_results?.development_opportunities && (
//                 <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
//                     <div className="flex items-center mb-6">
//                     <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
//                     <h3 className="text-xl font-bold text-gray-900">Development Opportunities</h3>
//                     </div>
                    
//                     <div className="space-y-6">
//                     {detailed_results.development_opportunities.growth_areas && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Growth Areas</h4>
//                         <p className="text-gray-700">{detailed_results.development_opportunities.growth_areas}</p>
//                         </div>
//                     )}
//                     {detailed_results.development_opportunities.skill_recommendations && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Skill Recommendations</h4>
//                         <p className="text-gray-700">{detailed_results.development_opportunities.skill_recommendations}</p>
//                         </div>
//                     )}
//                     {detailed_results.development_opportunities.learning_preferences && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-2">Learning Preferences</h4>
//                         <p className="text-gray-700">{detailed_results.development_opportunities.learning_preferences}</p>
//                         </div>
//                     )}
//                     </div>
//                 </div>
//                 )}

//                 {/* Action Plan */}
//                 {detailed_results?.action_plan && (
//                 <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print-avoid-break">
//                     <div className="flex items-center mb-6">
//                     <Lightbulb className="w-6 h-6 text-orange-500 mr-3" />
//                     <h3 className="text-xl font-bold text-gray-900">Action Plan</h3>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {detailed_results.action_plan.immediate_steps && detailed_results.action_plan.immediate_steps.length > 0 && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-3">Immediate Steps</h4>
//                         <ul className="space-y-2">
//                             {detailed_results.action_plan.immediate_steps.map((step, index) => (
//                             <li key={index} className="flex items-start">
//                                 <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
//                                 <span className="text-orange-600 text-sm font-semibold">{index + 1}</span>
//                                 </div>
//                                 <span className="text-gray-700">{step}</span>
//                             </li>
//                             ))}
//                         </ul>
//                         </div>
//                     )}
//                     {detailed_results.action_plan.long_term_goals && detailed_results.action_plan.long_term_goals.length > 0 && (
//                         <div>
//                         <h4 className="font-semibold text-gray-900 mb-3">Long-term Goals</h4>
//                         <ul className="space-y-2">
//                             {detailed_results.action_plan.long_term_goals.map((goal, index) => (
//                             <li key={index} className="flex items-start">
//                                 <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
//                                 <span className="text-orange-600 text-sm font-semibold">{index + 1}</span>
//                                 </div>
//                                 <span className="text-gray-700">{goal}</span>
//                             </li>
//                             ))}
//                         </ul>
//                         </div>
//                     )}
//                     </div>
                    
//                     {detailed_results.action_plan.networking_advice && (
//                     <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//                         <h4 className="font-semibold text-gray-900 mb-2">Networking Advice</h4>
//                         <p className="text-gray-700">{detailed_results.action_plan.networking_advice}</p>
//                     </div>
//                     )}
//                 </div>
//                 )}
//             </>
//         )}
//         {/* Footer */}
//         <div className="text-center py-8 print:mt-8">
//           <img 
//             src="/assets/images/small-logo.png" 
//             alt="Logo" 
//             className="h-8 w-8 mx-auto mb-2"
//           />
//           <p className="text-gray-500 text-sm">
//             This report is generated based on your personality and career interest assessments.
//           </p>
//           <p className="text-gray-400 text-xs mt-1">
//             © 2025 Xortcut. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssessmentResultsPage;

"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, User, Calendar, Target, CheckCircle, TrendingUp, Briefcase, Users, Award, ChevronRight, Star, Zap, Shield, Flame, Building2, Palette, Code, Heart } from 'lucide-react';
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

  // Use actual data if available, otherwise use mock data
  const displayData = resultData ;

  const getTypeIcon = (type) => {
    const typeMap = {
      'traditional': Shield,
      'trending': TrendingUp,
      'ai-proof': Zap,
      'emerging': Star
    };
    return typeMap[type] || Briefcase;
  };

  const getTypeColor = (type) => {
    const colorMap = {
      'traditional': 'blue',
      'trending': 'green',
      'ai-proof': 'purple',
      'emerging': 'orange'
    };
    return colorMap[type] || 'gray';
  };

  const getSectorIcon = (sectorName) => {
    const iconMap = {
      'Business Strategy': Building2,
      'Technology Innovation': Code,
      'Creative Arts': Palette,
      'Healthcare Sciences': Heart,
      'Consulting Services': Users
    };
    return iconMap[sectorName] || Building2;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Analyzing Your Results</h3>
          <p className="text-slate-600">Please wait while we prepare your comprehensive report...</p>
        </div>
      </div>
    );
  }

  if (alertMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-slate-200">
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Assessment Pending</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">{alertMessage}</p>
            <button
              onClick={handleGoBack}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Assessment data is currently unavailable.</p>
        </div>
      </div>
    );
  }

  const { user_profile, assessment_overview, detailed_results, scope_data } = displayData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header - Hidden in print */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 print:hidden sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleGoBack}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline font-medium">Dashboard</span>
              </button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/assets/images/small-logo.png" 
                  alt="Logo" 
                  className="h-8 w-8"
                />
                <h1 className="text-xl font-bold text-slate-900">Professional Assessment Report</h1>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="font-medium">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={printRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        
        {/* Print Header */}
        <div className="hidden print:block mb-12 print-avoid-break">
          <div className="flex items-center justify-between border-b border-slate-300 pb-6">
            <img 
              src="/assets/images/doutya4.png" 
              alt="Company Logo" 
              className="h-16"
            />
            <div className="text-right">
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Professional Assessment Report</h1>
              <p className="text-slate-600 text-lg">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Executive Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 print-avoid-break">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{user_profile?.name}</h2>
                <p className="text-slate-600 text-lg">Comprehensive Career & Personality Analysis</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 lg:gap-8">
              <div className="text-center">
                <div className="text-sm font-medium text-slate-500 mb-1">Completion Rate</div>
                <div className="text-2xl font-bold text-emerald-600">{assessment_overview?.assessment_completion}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-500 mb-1">Assessment Date</div>
                <div className="text-lg font-semibold text-slate-800">
                  {user_profile?.assessment_date ? new Date(user_profile.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center space-x-4">
              <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-500">Age Group</p>
                <p className="text-lg font-semibold text-slate-800">{user_profile?.age || 'Not specified'} years</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Target className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-500">Focus Area</p>
                <p className="text-lg font-semibold text-slate-800 capitalize">{user_profile?.career_focus}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-500">Report Status</p>
                <p className="text-lg font-semibold text-emerald-600">Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-200 print-avoid-break">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Executive Summary</h3>
          </div>
          <div className="prose prose-lg prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed text-lg">
              Based on your comprehensive assessment, you demonstrate a unique combination of strategic thinking and innovative problem-solving capabilities. 
              Your profile indicates strong potential for leadership roles that require both analytical depth and creative vision. This report provides detailed 
              insights into your personality traits, career interests, and specific recommendations tailored to your {user_profile?.career_focus} focus.
            </p>
          </div>
        </div> */}

        {/* Personality Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 print-avoid-break">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Personality Profile</h3>
          </div>

          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              {/* <h4 className="text-xl font-bold text-slate-900 mb-3">{detailed_results?.personality_analysis?.type}</h4> */}
              <p className="text-slate-700 leading-relaxed">{detailed_results?.personality_analysis?.overview}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Core Strengths */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-emerald-600" />
                </div>
                Core Strengths
              </h4>
              <div className="space-y-4">
                {detailed_results?.personality_analysis?.strengths?.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700">{strength}</p>
                  </div>
                ))}
              </div>
              
              <h5 className="text-md font-semibold text-slate-800 mt-8 mb-4">Key Advantages</h5>
              <div className="space-y-3">
                {detailed_results?.personality_analysis?.advantages?.map((advantage, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2"></div>
                    <p className="text-slate-600 text-sm">{advantage}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Areas */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <Target className="w-4 h-4 text-amber-600" />
                </div>
                Development Opportunities
              </h4>
              <div className="space-y-4">
                {detailed_results?.personality_analysis?.weaknesses?.map((weakness, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <Target className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700">{weakness}</p>
                  </div>
                ))}
              </div>
              
              <h5 className="text-md font-semibold text-slate-800 mt-8 mb-4">Areas to Consider</h5>
              <div className="space-y-3">
                {detailed_results?.personality_analysis?.disadvantages?.map((disadvantage, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-2"></div>
                    <p className="text-slate-600 text-sm">{disadvantage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Behavioral Patterns</h4>
            <p className="text-slate-700 leading-relaxed">{detailed_results?.personality_analysis?.behavioral_tendencies}</p>
          </div>
        </div>

        {/* Career Interest Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 print-avoid-break">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Career Interest Profile</h3>
          </div>

          <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
              {/* <h4 className="text-xl font-bold text-slate-900 mb-3">{detailed_results?.career_interest_analysis?.type}</h4> */}
              <p className="text-slate-700 leading-relaxed">{detailed_results?.career_interest_analysis?.overview}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                Career Strengths
              </h4>
              <div className="space-y-4">
                {detailed_results?.career_interest_analysis?.strengths?.map((strength, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-slate-700">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Award className="w-4 h-4 text-orange-600" />
                </div>
                Growth Areas
              </h4>
              <div className="space-y-4">
                {detailed_results?.career_interest_analysis?.weaknesses?.map((weakness, index) => (
                  <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-slate-700">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Work Style Preferences</h4>
            <p className="text-slate-700 leading-relaxed">{detailed_results?.career_interest_analysis?.work_style_preferences}</p>
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 print-avoid-break">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Strategic Career Insights</h3>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Profile Alignment</h4>
              <p className="text-slate-700 leading-relaxed">{detailed_results?.combined_insights?.alignment}</p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Potential Challenges</h4>
              <p className="text-slate-700 leading-relaxed">{detailed_results?.combined_insights?.potential_conflicts}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Career Fit Assessment</h4>
              <p className="text-slate-700 leading-relaxed">{detailed_results?.combined_insights?.career_fit_summary}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Strategic Guidance</h4>
              <p className="text-slate-700 leading-relaxed">{detailed_results?.combined_insights?.guidance}</p>
            </div>
          </div>
        </div>

        {/* Sector/Cluster/Career Specific Recommendations */}
        {scope_data && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 print-avoid-break">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mr-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {user_profile?.career_focus === 'sector' ? 'Sector Analysis' : 
                 user_profile?.career_focus === 'cluster' ? 'Career Clusters' : 'Career Opportunities'}
              </h3>
            </div>

            {/* Sector Display */}
            {user_profile?.career_focus === 'sector' && scope_data.matching_sectors && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                    <Star className="w-6 h-6 text-rose-500 mr-3" />
                    Recommended Sectors
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scope_data.matching_sectors.map((sector, index) => {
                      const IconComponent = getSectorIcon(sector.name);
                      return (
                        <div key={sector.id} className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200 hover:shadow-lg transition-shadow">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center mr-4">
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900">{sector.name}</h5>
                              <div className="flex items-center mt-1">
                                <Star className="w-4 h-4 text-rose-500 mr-1" />
                                <span className="text-sm font-medium text-rose-600">Highly Recommended</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed">{sector.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {scope_data.other_sectors && scope_data.other_sectors.length > 0 && (
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                      <Building2 className="w-6 h-6 text-slate-500 mr-3" />
                      Additional Sectors to Consider
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {scope_data.other_sectors.slice(0, 4).map((sector, index) => {
                        const IconComponent = getSectorIcon(sector.name);
                        return (
                          <div key={sector.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center mb-3">
                              <div className="w-10 h-10 bg-slate-400 rounded-lg flex items-center justify-center mr-3">
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                              <h5 className="font-semibold text-slate-900">{sector.name}</h5>
                            </div>
                            <p className="text-slate-600 text-sm">{sector.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cluster Display */}
            {user_profile?.career_focus === 'cluster' && Array.isArray(scope_data) && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scope_data.map((cluster, index) => (
                    <div key={cluster.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="text-lg font-bold text-slate-900">{cluster.name}</h5>
                      </div>
                      <p className="text-slate-700 mb-4 leading-relaxed">{cluster.description}</p>
                      
                      {cluster.related_jobs && (
                        <div>
                          <h6 className="font-semibold text-slate-800 mb-2">Related Opportunities:</h6>
                          <div className="flex flex-wrap gap-2">
                            {JSON.parse(cluster.related_jobs).slice(0, 5).map((job, jobIndex) => (
                              <span key={jobIndex} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {job}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Display */}
            {user_profile?.career_focus === 'career' && Array.isArray(scope_data) && (
              <div className="space-y-8">
                {/* Group careers by type */}
                {['traditional', 'trending', 'ai-proof', 'emerging'].map((type) => {
                  const careersOfType = scope_data.filter(career => career.type === type);
                  if (careersOfType.length === 0) return null;
                  
                  const TypeIcon = getTypeIcon(type);
                  const typeColor = getTypeColor(type);
                  
                  return (
                    <div key={type} className="space-y-4">
                      <h4 className="text-xl font-bold text-slate-900 flex items-center capitalize">
                        <div className={`w-10 h-10 bg-${typeColor}-500 rounded-lg flex items-center justify-center mr-4`}>
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        {type} Careers
                        <span className="ml-3 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                          {careersOfType.length} matches
                        </span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {careersOfType.map((career, index) => (
                          <div key={index} className={`bg-gradient-to-br from-${typeColor}-50 to-${typeColor}-100 rounded-xl p-6 border border-${typeColor}-200`}>
                            <div className="flex items-center mb-3">
                              <div className={`w-8 h-8 bg-${typeColor}-500 rounded-lg flex items-center justify-center mr-3`}>
                                <Briefcase className="w-4 h-4 text-white" />
                              </div>
                              <h5 className="font-bold text-slate-900">{career.career_name}</h5>
                            </div>
                            
                            <div className="space-y-3">
                              <div className={`p-3 bg-${typeColor}-100 rounded-lg`}>
                                <h6 className="font-semibold text-slate-800 mb-1">Why This Fits You:</h6>
                                <p className="text-slate-700 text-sm">
                                  {type === 'traditional' && "This established career path aligns with your systematic approach and preference for proven methodologies."}
                                  {type === 'trending' && "This growing field matches your innovative mindset and adaptability to emerging market demands."}
                                  {type === 'ai-proof' && "This role leverages your human-centered skills that complement rather than compete with technology."}
                                  {type === 'emerging' && "This cutting-edge opportunity suits your forward-thinking nature and willingness to pioneer new domains."}
                                </p>
                              </div>
                              
                              <div className={`p-3 bg-white/60 rounded-lg`}>
                                <h6 className="font-semibold text-slate-800 mb-1">Career Type Benefits:</h6>
                                <p className="text-slate-600 text-sm">
                                  {type === 'traditional' && "Stability, clear advancement paths, established industry standards, and proven success frameworks."}
                                  {type === 'trending' && "High growth potential, competitive compensation, dynamic work environment, and innovation opportunities."}
                                  {type === 'ai-proof' && "Long-term security, human interaction focus, creative problem-solving, and irreplaceable skill development."}
                                  {type === 'emerging' && "First-mover advantages, unlimited growth potential, cutting-edge technology exposure, and industry leadership opportunities."}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Professional Development Roadmap */}
        {/* <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 print-avoid-break">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mr-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Professional Development Roadmap</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">Immediate Actions</h4>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h5 className="font-semibold text-emerald-800 mb-2">Skill Assessment</h5>
                  <p className="text-emerald-700 text-sm">Evaluate your current competencies against market demands in your target area.</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h5 className="font-semibold text-emerald-800 mb-2">Network Building</h5>
                  <p className="text-emerald-700 text-sm">Connect with professionals in your areas of interest through industry events and platforms.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">Short-term Goals</h4>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-2">Targeted Learning</h5>
                  <p className="text-blue-700 text-sm">Pursue relevant certifications or courses that align with your career objectives.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-2">Experience Building</h5>
                  <p className="text-blue-700 text-sm">Seek projects or roles that provide exposure to your target field or function.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">Long-term Vision</h4>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-800 mb-2">Leadership Development</h5>
                  <p className="text-purple-700 text-sm">Build management and strategic thinking capabilities for senior-level positions.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-800 mb-2">Industry Expertise</h5>
                  <p className="text-purple-700 text-sm">Develop deep domain knowledge and thought leadership in your chosen specialization.</p>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Key Recommendations */}
        {/* <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white print-avoid-break">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Key Success Strategies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-amber-400 mb-3">Maximize Your Strengths</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-amber-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Leverage your analytical capabilities in strategic decision-making roles</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-amber-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Seek opportunities that combine leadership with innovation</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-amber-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Build teams that complement your strategic thinking style</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-amber-400 mb-3">Professional Growth</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-amber-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Focus on developing emotional intelligence and interpersonal skills</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-amber-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Practice patience with implementation and execution phases</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-blue-400 mb-3">Career Positioning</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Target roles that offer both strategic responsibility and creative challenges</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Consider organizations undergoing transformation or growth phases</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Build expertise in emerging technologies or methodologies</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-emerald-400 mb-3">Long-term Success</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-emerald-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Develop thought leadership through industry contributions</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-emerald-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-slate-200">Mentor others to build your network and influence</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div> */}

        {/* Footer */}
        <div className="text-center py-12 print:mt-12 print-avoid-break">
          <div className="max-w-2xl mx-auto">
            <img 
              src="/assets/images/small-logo.png" 
              alt="Logo" 
              className="h-12 w-12 mx-auto mb-4"
            />
            <h4 className="text-xl font-bold text-slate-900 mb-2">Your Professional Journey Starts Here</h4>
            <p className="text-slate-600 mb-4 leading-relaxed">
              This comprehensive analysis is based on validated personality and career interest assessments, 
              providing you with actionable insights for your professional development.
            </p>
            <p className="text-slate-400 text-sm">
              © 2025 Xortcut Professional Assessment Services. All rights reserved.
            </p>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-400">
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
      </div>

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:mt-8 { margin-top: 2rem !important; }
          .print\\:mt-12 { margin-top: 3rem !important; }
          
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          .print-section {
            break-before: auto !important;
            break-after: auto !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-size: 12pt !important;
            line-height: 1.4 !important;
          }
          
          .bg-gradient-to-r,
          .bg-gradient-to-br,
          .bg-gradient-to-l {
            background-image: none !important;
            background-color: #f8fafc !important;
          }
          
          .text-white {
            color: #1e293b !important;
          }
          
          .bg-slate-900,
          .bg-slate-800 {
            background-color: #f1f5f9 !important;
            color: #1e293b !important;
          }
        }
        
        @page {
          size: A4;
          margin: 1.5cm;
        }
      `}</style>
    </div>
  );
};

export default AssessmentResultsPage;
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, Circle, Filter, RotateCcw, TrendingUp } from 'lucide-react';

const ALL_CLUSTERS = [
  "Crop Agriculture",
  "Horticulture & Floriculture",
  "Animal Husbandry & Dairy",
  "Poultry & Small Livestock",
  "Fisheries & Aquaculture",
  "Apiculture & Sericulture",
  "Forestry & Silviculture",
  "Wildlife & Protected Area Management",
  "Soil & Land Management",
  "Water Systems & Hydrology",
  "Oceans & Marine Resources",
  "Atmosphere & Climate Science",
  "Mining & Extraction",
  "Renewable Energy Resources",
  "Environmental Conservation & Restoration",
  "Civil & Structural Engineering",
  "Architecture & Urban Design",
  "Building Services",
  "Manufacturing & Industrial Engineering",
  "Robotics & Automation Systems",
  "Electrical & Electronics Engineering",
  "Computer & Software Engineering",
  "Applied AI & Data Engineering",
  "Telecom & Networks Engineering",
  "Energy & Power Systems Engineering",
  "Chemical & Process Engineering",
  "Materials & Metallurgy",
  "Automotive & Mobility Engineering",
  "Aerospace & Spacecraft Systems",
  "Bioprocess & Pharma Manufacturing",
  "Biomedical Devices & Health Tech",
  "Defense & Security Engineering",
  "Medicine & Clinical Practice",
  "Nursing & Paramedical",
  "Dentistry & Oral Health",
  "Pharmacy & Pharmacology",
  "Physiotherapy & Rehabilitation",
  "Nutrition & Dietetics",
  "Psychology & Mental Health",
  "Sports Health & Exercise Science",
  "Public Health & Epidemiology",
  "Community & Primary Care",
  "Geriatrics & Elder Care",
  "Disability & Rehabilitation Care",
  "Medical Laboratory Science",
  "Diagnostics & Imaging Technology",
  "Genomics & Precision Medicine",
  "Health Informatics & Hospital Administration",
  "Physics",
  "Chemistry",
  "Biological Sciences",
  "Earth & Environmental Sciences",
  "Astronomy & Space Sciences",
  "Mathematics & Statistics",
  "Computer Science",
  "Data Science & Methods",
  "Social Sciences",
  "Economics",
  "History & Archaeology",
  "Philosophy & Ethics",
  "Education & Pedagogy",
  "Linguistics & Cognitive Science",
  "Libraries, Archives & Knowledge Curation",
  "Law & Justice",
  "Public Administration & Civil Services",
  "Public Policy & Regulation",
  "Diplomacy & International Relations",
  "Defense Forces & Strategic Studies",
  "Policing & Internal Security",
  "Disaster & Emergency Management",
  "Urban & Municipal Administration",
  "Logistics & Supply Chain Management",
  "Banking & Financial Services",
  "Insurance & Actuarial Services",
  "Accounting, Audit & Taxation",
  "Entrepreneurship & Business Management",
  "Marketing, Sales & Business Development",
  "Retail & Consumer Services",
  "Human Resources & People Operations",
  "Real Estate & Property Services",
  "Transport & Mobility Operations",
  "Cybersecurity Governance & Digital Law",
  "Visual Arts",
  "Performing Arts",
  "Film & Television Production",
  "Writing & Literature",
  "Journalism & News Media",
  "Publishing & Book Industry",
  "Digital Content & Social Media",
  "Game Design & Interactive Media",
  "Graphic & Communication Design",
  "Fashion & Textile Design",
  "Advertising & Creative Strategy",
  "UI/UX & Product Communication",
  "Sports & Performance",
  "Events & Live Experiences",
  "Hospitality & Tourism",
  "Culinary Arts & Gastronomy",
  "Heritage, Museums & Curation",
  "Wellness & Lifestyle Experiences"
];

export default function ClusterChecklist() {
  const [completedClusters, setCompletedClusters] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'incomplete'
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter clusters based on search and completion status
  const filteredClusters = useMemo(() => {
    let clusters = ALL_CLUSTERS;

    // Apply search filter
    if (searchTerm) {
      clusters = clusters.filter(cluster =>
        cluster.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply completion filter
    if (filter === 'completed') {
      clusters = clusters.filter(cluster => completedClusters.has(cluster));
    } else if (filter === 'incomplete') {
      clusters = clusters.filter(cluster => !completedClusters.has(cluster));
    }

    return clusters;
  }, [searchTerm, filter, completedClusters]);

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return ALL_CLUSTERS
      .filter(cluster =>
        cluster.toLowerCase().includes(searchTerm.toLowerCase()) &&
        cluster.toLowerCase() !== searchTerm.toLowerCase()
      )
      .slice(0, 5);
  }, [searchTerm]);

  const toggleCluster = (cluster) => {
    const newCompleted = new Set(completedClusters);
    if (newCompleted.has(cluster)) {
      newCompleted.delete(cluster);
    } else {
      newCompleted.add(cluster);
    }
    setCompletedClusters(newCompleted);
  };

  const resetAll = () => {
    setCompletedClusters(new Set());
    setSearchTerm('');
    setFilter('all');
  };

  const completedCount = completedClusters.size;
  const totalCount = ALL_CLUSTERS.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const toggleClusterFromSearch = (cluster) => {
    toggleCluster(cluster);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Career Cluster Progress Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Track your exploration of {totalCount} career clusters
          </p>
        </div>

        {/* Progress Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-3">
                <Circle className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
            <div className="text-center">
              <button
                onClick={resetAll}
                className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-3 hover:bg-red-200 transition-colors duration-200"
              >
                <RotateCcw className="w-8 h-8 text-red-600" />
              </button>
              <div className="text-sm text-gray-600">Reset All</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{completedCount} of {totalCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="relative flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clusters..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex-1"
                      >
                        <span className="text-gray-900">{suggestion}</span>
                        {completedClusters.has(suggestion) && (
                          <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />
                        )}
                      </div>
                      <button
                        onClick={() => toggleClusterFromSearch(suggestion)}
                        className={`ml-4 p-1 rounded-full transition-colors duration-200 ${
                          completedClusters.has(suggestion)
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {completedClusters.has(suggestion) ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                All ({totalCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  filter === 'completed'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setFilter('incomplete')}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  filter === 'incomplete'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Circle className="w-4 h-4 mr-2" />
                Incomplete ({totalCount - completedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredClusters.length}</span> cluster(s)
            {searchTerm && (
              <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>
            )}
          </p>
        </div>

        {/* Cluster List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {filteredClusters.length === 0 ? (
            <div className="text-center py-12">
              <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No clusters found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? `No clusters match "${searchTerm}"`
                  : filter === 'completed' 
                    ? "No completed clusters yet" 
                    : "No incomplete clusters"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredClusters.map((cluster, index) => {
                const isCompleted = completedClusters.has(cluster);
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer group ${
                      isCompleted ? 'bg-green-50' : ''
                    }`}
                    onClick={() => toggleCluster(cluster)}
                  >
                    <div className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-medium transition-all duration-200 ${
                          isCompleted 
                            ? 'text-green-800 line-through' 
                            : 'text-gray-900 group-hover:text-indigo-600'
                        }`}>
                          {cluster}
                        </h3>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {isCompleted ? 'Completed' : 'Click to mark complete'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Keep track of your career exploration journey across all industries!</p>
        </div>
      </div>
    </div>
  );
}
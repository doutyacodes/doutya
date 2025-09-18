import React, { useState, useEffect } from 'react';
import { X, MapPin, GraduationCap, Building, Award, CheckCircle } from 'lucide-react';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { toast } from 'react-hot-toast';

const LocationDetailsModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedCareers = [], // Array of career names
  clusters = [], // Array of cluster names
  sectors = [], // Array of sector names
  loading = false 
}) => {
  const [currentCountry, setCurrentCountry] = useState(null);
  const [schoolingLocation, setSchoolingLocation] = useState(null);
  const [graduationLocation, setGraduationLocation] = useState(null);
  const [postGraduationLocation, setPostGraduationLocation] = useState(null);
  const [userGrade, setUserGrade] = useState(null);
  const [fetchingUserData, setFetchingUserData] = useState(true);

  const countryOptions = countryList().getData();

  // Determine education level based on grade
  const getEducationLevel = (grade) => {
    if (!grade) return 'school';
    
    const gradeStr = grade.toString().toLowerCase();
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(gradeStr)) {
      return 'school';
    } else if (gradeStr === 'college' || gradeStr === 'graduation') {
      return 'graduation';
    } else if (gradeStr === 'post graduate' || gradeStr === 'postgraduate') {
      return 'postgraduate';
    } else if (gradeStr === 'completed-education' || gradeStr === 'completed education') {
      return 'completed-education';
    }
    return 'school';
  };

  const educationLevel = getEducationLevel(userGrade);

  // Fetch user details when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserDetails();
    }
  }, [isOpen]);

  const fetchUserDetails = async () => {
    try {
      setFetchingUserData(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const response = await fetch('/api/user/details', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserGrade(data.grade);
      } else {
        toast.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Error fetching user details');
    } finally {
      setFetchingUserData(false);
    }
  };

  // Get question text based on education level
  const getQuestionText = (level) => {
    const isCurrentLevel = educationLevel === level;
    
    switch (level) {
      case 'school':
        return educationLevel === 'completed-education' 
          ? "Where did you complete your schooling?" 
          : isCurrentLevel 
          ? "Where are you currently doing your schooling?" 
          : "Where do you intend to do your schooling?";
      case 'graduation':
        return educationLevel === 'completed-education' 
          ? "Where did you complete your graduation?" 
          : isCurrentLevel 
          ? "Where are you currently doing your graduation?" 
          : "Where do you intend to do your graduation?";
      // case 'postgraduate':
      //   return educationLevel === 'completed-education' 
      //     ? "Where did you complete your post-graduation?" 
      //     : isCurrentLevel 
      //     ? "Where are you currently doing your post-graduation?" 
      //     : "Where do you intend to do your post-graduation?";
      default:
        return "";
    }
  };

  // Determine which questions to show based on current education level
  const shouldShowQuestion = (level) => {
    switch (educationLevel) {
      case 'school':
        return true; // Show all questions
      case 'graduation':
        return level !== 'school'; // Don't show school question
      case 'postgraduate':
        return level === 'postgraduate'; // Only show postgraduate question
      case 'completed-education':
        return true; // Show all questions as they've completed all levels
      default:
        return true;
    }
  };

  // Get the display name for education level
  const getEducationLevelDisplay = (level) => {
    switch (level) {
      case 'school':
        return 'School';
      case 'graduation':
        return 'Graduation';
      case 'postgraduate':
        return 'Post-Graduate';
      case 'completed-education':
        return 'Completed Education';
      default:
        return 'School';
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!currentCountry) {
      toast.error('Please select your current country');
      return;
    }

    // Validate based on education level
    if (shouldShowQuestion('school') && !schoolingLocation) {
      toast.error('Please select schooling location');
      return;
    }
    
    if (shouldShowQuestion('graduation') && !graduationLocation) {
      toast.error('Please select graduation location');
      return;
    }
    
    // if (shouldShowQuestion('postgraduate') && !postGraduationLocation) {
    //   toast.error('Please select post-graduation location');
    //   return;
    // }

    const locationData = {
      currentCountry: currentCountry?.value || currentCountry?.label,
      schoolingLocation: shouldShowQuestion('school') ? (schoolingLocation?.value || schoolingLocation?.label) : null,
      graduationLocation: shouldShowQuestion('graduation') ? (graduationLocation?.value || graduationLocation?.label) : null,
      postGraduationLocation: shouldShowQuestion('postgraduate') ? (postGraduationLocation?.value || postGraduationLocation?.label) : null,
    };

    onSave(locationData);
  };

  const handleClose = () => {
    // Reset form
    setCurrentCountry(null);
    setSchoolingLocation(null);
    setGraduationLocation(null);
    setPostGraduationLocation(null);
    onClose();
  };

  // Generate display text for selected items
  const getDisplayText = () => {
    const items = [];
    if (selectedCareers.length > 0) items.push(`Career${selectedCareers.length > 1 ? 's' : ''}: ${selectedCareers.join(', ')}`);
    if (clusters.length > 0) items.push(`Cluster${clusters.length > 1 ? 's' : ''}: ${clusters.join(', ')}`);
    if (sectors.length > 0) items.push(`Sector${sectors.length > 1 ? 's' : ''}: ${sectors.join(', ')}`);
    return items.join(' | ');
  };

  // Get appropriate icon based on education level
  const getEducationIcon = () => {
    switch (educationLevel) {
      case 'completed-education':
        return CheckCircle;
      default:
        return GraduationCap;
    }
  };

  const EducationIcon = getEducationIcon();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-blue-600" />
              Location Details
            </h2>
            {getDisplayText() && (
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {getDisplayText()}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {fetchingUserData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading user details...</p>
            </div>
          ) : (
            <>
              {/* Current Country */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                  Current Country *
                </label>
                <Select
                  options={countryOptions}
                  value={currentCountry}
                  onChange={setCurrentCountry}
                  placeholder="Select your current country"
                  className="react-select"
                  classNamePrefix="react-select"
                  isDisabled={loading}
                />
              </div>

              {/* Schooling Location */}
              {shouldShowQuestion('school') && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-1 text-gray-500" />
                    {getQuestionText('school')} *
                  </label>
                  <Select
                    options={countryOptions}
                    value={schoolingLocation}
                    onChange={setSchoolingLocation}
                    placeholder="Select schooling location"
                    className="react-select"
                    classNamePrefix="react-select"
                    isDisabled={loading}
                  />
                </div>
              )}

              {/* Graduation Location */}
              {shouldShowQuestion('graduation') && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Building className="w-4 h-4 mr-1 text-gray-500" />
                    {getQuestionText('graduation')} *
                  </label>
                  <Select
                    options={countryOptions}
                    value={graduationLocation}
                    onChange={setGraduationLocation}
                    placeholder="Select graduation location"
                    className="react-select"
                    classNamePrefix="react-select"
                    isDisabled={loading}
                  />
                </div>
              )}

              {/* Post-graduation Location */}
              {/* {shouldShowQuestion('postgraduate') && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Award className="w-4 h-4 mr-1 text-gray-500" />
                    {getQuestionText('postgraduate')} *
                  </label>
                  <Select
                    options={countryOptions}
                    value={postGraduationLocation}
                    onChange={setPostGraduationLocation}
                    placeholder="Select post-graduation location"
                    className="react-select"
                    classNamePrefix="react-select"
                    isDisabled={loading}
                  />
                </div>
              )} */}

              {/* Current Education Level Info */}
              <div className={`border rounded-lg p-4 ${
                educationLevel === 'completed-education' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center">
                  <EducationIcon className={`w-5 h-5 mr-2 ${
                    educationLevel === 'completed-education' 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      educationLevel === 'completed-education' 
                        ? 'text-green-800' 
                        : 'text-blue-800'
                    }`}>
                      Current Education Level: {getEducationLevelDisplay(educationLevel)}
                    </p>
                    <p className={`text-xs mt-1 ${
                      educationLevel === 'completed-education' 
                        ? 'text-green-600' 
                        : 'text-blue-600'
                    }`}>
                      {educationLevel === 'completed-education' 
                        ? 'Questions are about where you completed your education'
                        : 'Questions are customized based on your current education level'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || fetchingUserData}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .react-select__control {
          border: 2px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 4px !important;
          box-shadow: none !important;
          background-color: white !important;
        }
        
        .react-select__control:hover {
          border-color: #d1d5db !important;
        }
        
        .react-select__control--is-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 1px #3b82f6 !important;
        }
        
        .react-select__menu {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          z-index: 9999 !important;
        }
        
        .react-select__menu-list {
          background-color: white !important;
          border-radius: 8px !important;
          padding: 4px !important;
        }
        
        .react-select__option {
          background-color: white !important;
          color: #374151 !important;
          padding: 8px 12px !important;
          cursor: pointer !important;
          border-radius: 4px !important;
          margin: 1px 0 !important;
        }
        
        .react-select__option:hover,
        .react-select__option--is-focused {
          background-color: #dbeafe !important;
          color: #1f2937 !important;
        }
        
        .react-select__option--is-selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        .react-select__option--is-selected:hover {
          background-color: #2563eb !important;
          color: white !important;
        }
        
        .react-select__single-value {
          color: #374151 !important;
        }
        
        .react-select__placeholder {
          color: #9ca3af !important;
        }
        
        .react-select__input-container {
          color: #374151 !important;
        }
        
        .react-select__indicators {
          color: #6b7280 !important;
        }
        
        .react-select__dropdown-indicator {
          color: #6b7280 !important;
        }
        
        .react-select__dropdown-indicator:hover {
          color: #374151 !important;
        }
        
        .react-select__clear-indicator {
          color: #6b7280 !important;
        }
        
        .react-select__clear-indicator:hover {
          color: #374151 !important;
        }
        
        .react-select__value-container {
          padding: 2px 8px !important;
        }
        
        .react-select__control--is-disabled {
          background-color: #f9fafb !important;
          border-color: #e5e7eb !important;
          opacity: 0.6 !important;
        }
        
        .react-select__control--is-disabled .react-select__single-value {
          color: #6b7280 !important;
        }
      `}</style>
    </div>
  );
};

export default LocationDetailsModal;
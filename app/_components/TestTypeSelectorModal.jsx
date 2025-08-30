import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const TestTypeSelectorModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('mbti');
  const [mbtiType, setMbtiType] = useState('');
  const [riasecTypes, setRiasecTypes] = useState([]);
  const [existingData, setExistingData] = useState({ mbti: null, riasec: null });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // MBTI types with descriptions
  const mbtiTypes = [
    // Analysts
    { code: 'INTJ', name: 'The Architect', description: 'Imaginative and strategic thinkers' },
    { code: 'INTP', name: 'The Thinker', description: 'Innovative inventors with unquenchable thirst for knowledge' },
    { code: 'ENTJ', name: 'The Commander', description: 'Bold, imaginative and strong-willed leaders' },
    { code: 'ENTP', name: 'The Debater', description: 'Smart and curious thinkers who love intellectual challenges' },
    
    // Diplomats  
    { code: 'INFJ', name: 'The Advocate', description: 'Creative and insightful, inspired and independent' },
    { code: 'INFP', name: 'The Mediator', description: 'Poetic, kind and altruistic people' },
    { code: 'ENFJ', name: 'The Protagonist', description: 'Charismatic and inspiring leaders' },
    { code: 'ENFP', name: 'The Campaigner', description: 'Enthusiastic, creative and sociable free spirits' },
    
    // Sentinels
    { code: 'ISTJ', name: 'The Logistician', description: 'Practical and fact-minded, reliable and responsible' },
    { code: 'ISFJ', name: 'The Protector', description: 'Warm-hearted and dedicated, always ready to protect' },
    { code: 'ESTJ', name: 'The Executive', description: 'Excellent administrators, unsurpassed at managing things' },
    { code: 'ESFJ', name: 'The Consul', description: 'Extraordinarily caring, social and popular people' },
    
    // Explorers
    { code: 'ISTP', name: 'The Virtuoso', description: 'Bold and practical experimenters' },
    { code: 'ISFP', name: 'The Adventurer', description: 'Flexible and charming artists, ready to explore' },
    { code: 'ESTP', name: 'The Entrepreneur', description: 'Smart, energetic and perceptive people' },
    { code: 'ESFP', name: 'The Entertainer', description: 'Spontaneous, energetic and enthusiastic people' }
  ];

  // RIASEC types
  const riasecOptions = [
    { code: 'R', name: 'Realistic', description: 'Practical, hands-on, physical work' },
    { code: 'I', name: 'Investigative', description: 'Analytical, intellectual, scientific work' },
    { code: 'A', name: 'Artistic', description: 'Creative, expressive, imaginative work' },
    { code: 'S', name: 'Social', description: 'Helping, teaching, serving others' },
    { code: 'E', name: 'Enterprising', description: 'Leading, persuading, managing others' },
    { code: 'C', name: 'Conventional', description: 'Organizing, processing data, detail work' }
  ];

  // Fetch existing data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingData();
    }
  }, [isOpen]);

  const fetchExistingData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/test-types/check`, {
        method: "GET", // or POST if needed
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setExistingData(data);
        if (data.mbti) {
          setMbtiType(data.mbti.type_sequence);
        }
        if (data.riasec) {
          setRiasecTypes(data.riasec.type_sequence.split(''));
        }
      } else {
        setError(data.message || 'Failed to fetch existing data');
      }
    } catch (err) {
      setError('Network error while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleRiasecToggle = (code) => {
    if (existingData.riasec) return; // Don't allow changes if already exists
    
    setRiasecTypes(prev => {
      const newTypes = prev.includes(code) 
        ? prev.filter(t => t !== code)
        : [...prev, code];
      
      // Maintain order based on selection
      return newTypes;
    });
  };

  const handleSave = async () => {
    if (activeTab === 'mbti' && !mbtiType) {
      setError('Please select an MBTI type');
      return;
    }
    
    if (activeTab === 'riasec' && riasecTypes.length < 3) {
      setError('Please select at least 3 RIASEC types');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        quizId: activeTab === 'mbti' ? 1 : 2,
        typeSequence: activeTab === 'mbti' ? mbtiType : riasecTypes.join('')
      };

      const response = await fetch('/api/test-types/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${activeTab.toUpperCase()} type saved successfully!`);
        // Reload the page after successful save
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        // Refresh existing data
        fetchExistingData();
      } else {
        setError(data.message || 'Failed to save type');
      }
    } catch (err) {
      setError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = (tab) => {
    return tab === 'mbti' ? existingData.mbti : existingData.riasec;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Test Type Selector</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'mbti'
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
            onClick={() => setActiveTab('mbti')}
          >
            MBTI Types
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'riasec'
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
            onClick={() => setActiveTab('riasec')}
          >
            RIASEC Types
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {activeTab === 'mbti' && (
                <div>
                  {isReadOnly('mbti') && (
                    <div className="mb-4 p-3 bg-yellow-900 border border-yellow-700 rounded flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span className="text-sm">MBTI type already set and cannot be changed</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {['Analysts', 'Diplomats', 'Sentinels', 'Explorers'].map((group, groupIndex) => {
                      const groupTypes = mbtiTypes.slice(groupIndex * 4, (groupIndex + 1) * 4);
                      return (
                        <div key={group}>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">{group}</h3>
                          <div className="space-y-1 mb-4">
                            {groupTypes.map((type) => (
                              <label
                                key={type.code}
                                className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                                  mbtiType === type.code
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600'
                                } ${isReadOnly('mbti') ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name="mbti"
                                  value={type.code}
                                  checked={mbtiType === type.code}
                                  onChange={(e) => !isReadOnly('mbti') && setMbtiType(e.target.value)}
                                  disabled={isReadOnly('mbti')}
                                  className="sr-only"
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{type.code} - {type.name}</div>
                                  <div className="text-sm text-gray-300">{type.description}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'riasec' && (
                <div>
                  {isReadOnly('riasec') && (
                    <div className="mb-4 p-3 bg-yellow-900 border border-yellow-700 rounded flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span className="text-sm">RIASEC type already set and cannot be changed</span>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Select at least 3 types in your preferred order:
                    </p>
                    {riasecTypes.length > 0 && (
                      <div className="text-sm text-blue-400 mb-2">
                        Current selection: {riasecTypes.join('')}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {riasecOptions.map((option) => (
                      <label
                        key={option.code}
                        className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                          riasecTypes.includes(option.code)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600'
                        } ${isReadOnly('riasec') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={riasecTypes.includes(option.code)}
                          onChange={() => handleRiasecToggle(option.code)}
                          disabled={isReadOnly('riasec')}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {option.code} - {option.name}
                            {riasecTypes.includes(option.code) && (
                              <span className="ml-2 text-xs bg-blue-700 px-2 py-1 rounded">
                                Position: {riasecTypes.indexOf(option.code) + 1}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-300">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mx-6 mb-4 p-3 bg-green-900 border border-green-700 rounded text-green-200">
            {success}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isReadOnly(activeTab)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Type'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestTypeSelectorModal;
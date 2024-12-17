"use client"
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { 
  FaClipboardList, 
  FaCheck, 
  FaTimes, 
  FaFilter 
} from 'react-icons/fa';

const TestsPage = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();

  // Simulated fetch of tests (replace with actual API call)
  useEffect(() => {
    const fetchTests = async () => {
      try {
        // Replace with actual API call to get tests
        const mockTests = [
        //   { id: 1, subject: 'Mathematics', completed: false },
        //   { id: 2, subject: 'Science', completed: true },
        //   { id: 3, subject: 'English', completed: false },
        ];
        setTests(mockTests);
        setFilteredTests(mockTests);
      } catch (error) {
        console.error('Failed to fetch tests', error);
      }
    };

    fetchTests();
  }, []);

  // Filter tests
  useEffect(() => {
    let filtered = tests;
    switch (activeFilter) {
      case 'completed':
        filtered = tests.filter(test => test.completed);
        break;
      case 'not-completed':
        filtered = tests.filter(test => !test.completed);
        break;
      default:
        filtered = tests;
    }
    setFilteredTests(filtered);
  }, [activeFilter, tests]);

  // Handle test navigation
  const handleTestNavigation = (test) => {
    if (test.completed) {
      // Navigate to view results page
      router.push(`/results/${test.id}`);
    } else {
      // Navigate to test page
      router.push(`/test/${test.id}`);
    }
  };

  // Render filter buttons
  const renderFilterButtons = () => {
    const filters = [
      { key: 'all', label: 'All Tests', icon: FaClipboardList },
      { key: 'completed', label: 'Completed', icon: FaCheck },
      { key: 'not-completed', label: 'Not Completed', icon: FaTimes }
    ];

    return (
      <div className="flex justify-center gap-4 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${activeFilter === filter.key 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}
            `}
          >
            <filter.icon className="w-4 h-4" />
            {filter.label}
          </button>
        ))}
      </div>
    );
  };

  // Render no tests message
  const renderNoTestsMessage = () => (
    <div className="bg-gray-800/50 rounded-xl p-10 text-center border border-gray-700">
      <div className="bg-gray-900 rounded-full p-4 mb-6 inline-block">
        <FaClipboardList className="w-8 h-8 text-gray-500" />
      </div>
      <h2 className="text-2xl font-semibold mb-4 text-white">No Tests Available</h2>
      <p className="text-gray-400 max-w-md mx-auto">
        There are currently no tests assigned to you. Check back later or contact your institution.
      </p>
    </div>
  );

  // Render tests grid
  const renderTestsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTests.map((test) => (
        <div 
          key={test.id}
          onClick={() => handleTestNavigation(test)}
          className="
            bg-gray-800/50 rounded-xl p-6 border border-gray-700 
            transition-all hover:border-gray-600 cursor-pointer
            flex items-center justify-between
          "
        >
          <div className="flex items-center gap-4">
            <div className={`
              p-3 rounded-lg
              ${test.completed 
                ? 'bg-green-500/10' 
                : 'bg-blue-500/10'
              }
            `}>
              <FaClipboardList className={`
                w-6 h-6
                ${test.completed 
                  ? 'text-green-400' 
                  : 'text-blue-400'
                }
              `} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{test.subject}</h3>
              <p className={`
                text-sm
                ${test.completed 
                  ? 'text-green-400' 
                  : 'text-blue-400'
                }
              `}>
                {test.completed ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>
          <div className={`
            p-2 rounded-full
            ${test.completed 
              ? 'bg-green-500/20' 
              : 'bg-blue-500/20'
            }
          `}>
            {test.completed ? <FaCheck className="text-green-400" /> : <FaTimes className="text-blue-400" />}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen p-6 sm:p-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Tests</h1>
        <p className="text-gray-400">View and manage your assigned tests</p>
      </div>

      {renderFilterButtons()}

      <div className="container mx-auto">
        {filteredTests.length > 0 
          ? renderTestsGrid() 
          : renderNoTestsMessage()
        }
      </div>
    </div>
  );
};

export default TestsPage;
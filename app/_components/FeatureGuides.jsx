import React from 'react';

export const featureGuides = {
  roadmap: {
    title: "Roadmap: Your Career Navigation Tool",
    content: (
      <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
        <p className="text-gray-300">
          The Roadmap is a comprehensive tracking system divided into three key areas 
          to ensure balanced personal and professional development:
        </p>
        <div className="space-y-3">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">📚</span>
              <h3 className="text-lg font-semibold text-white">Educational Milestones</h3>
            </div>
            <p className="text-gray-400">
              Divided into Academic and Certification tracks:
              • Academic Milestones: Self-verified educational achievements
              • Certification Milestones: Professional certifications and skill validations
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">💪</span>
              <h3 className="text-lg font-semibold text-white">Physical Milestones</h3>
            </div>
            <p className="text-gray-400">
              Track and achieve physical wellness goals that complement your 
              professional development.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">🧠</span>
              <h3 className="text-lg font-semibold text-white">Mental Milestones</h3>
            </div>
            <p className="text-gray-400">
              Focus on personal growth through activities like reading, 
              stress management, and mental resilience building.
            </p>
          </div>
        </div>
      </div>
    )
  },
  tests: {
    title: "Assessment: Continuous Learning & Assessment",
    content: (
      <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
        <p className="text-gray-300">
          Our comprehensive testing system helps you track and enhance your skills:
        </p>
        <div className="space-y-3">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">📝</span>
              <h3 className="text-lg font-semibold text-white">Weekly Tests</h3>
            </div>
            <p className="text-gray-400">
              Targeted tests for each subject related to your selected career. 
              Assess your knowledge, identify strengths, and focus on improvement areas.
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">📊</span>
              <h3 className="text-lg font-semibold text-white">Test History</h3>
            </div>
            <p className="text-gray-400">
              Track your progress over time. Review past performance, 
              understand improvement areas, and monitor your learning journey.
            </p>
          </div>
        </div>
      </div>
    )
  },
  feedback: {
    title: "Feedback: Your Growth Compass",
    content: (
      <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
        <p className="text-gray-300">
          Gain insights into your professional development through comprehensive feedback:
        </p>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-3xl mr-3">📈</span>
            <h3 className="text-lg font-semibold text-white">Monthly Performance Evaluation</h3>
          </div>
          <p className="text-gray-400">
            Receive detailed monthly assessments based on your test scores, 
            completed activities, and overall progress. Understand your 
            strengths and areas for improvement.
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-3xl mr-3">🎯</span>
            <h3 className="text-lg font-semibold text-white">Career Progress Insights</h3>
          </div>
          <p className="text-gray-400">
            Comprehensive career feedback providing a holistic view of 
            your professional growth, skill development, and potential opportunities.
          </p>
        </div>
      </div>
    )
  },
  challenges: {
    title: "Challenges: Skill Enhancement Platform",
    content: (
      <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
        <p className="text-gray-300">
          Transform learning into an engaging and rewarding experience:
        </p>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-3xl mr-3">🏆</span>
            <h3 className="text-lg font-semibold text-white">Activity-Based Learning</h3>
          </div>
          <p className="text-gray-400">
            Complete diverse challenges designed to enhance your skills. 
            Submit your work for verification and earn rewards. Each challenge 
            is a step towards professional mastery.
          </p>
        </div>
        <p className="text-gray-300 text-center">
          Challenges are curated to provide practical, hands-on experience 
          in your chosen career path.
        </p>
      </div>
    )
  },
  community: {
    title: "Community: Connect & Grow Together",
    content: (
      <div className="flex flex-col items-center space-y-4 text-center h-[500px] md:h-[350px] overflow-y-auto">
        <p className="text-gray-300">
          Your professional network starts here:
        </p>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-3xl mr-3">👥</span>
            <h3 className="text-lg font-semibold text-white">Career-Specific Communities</h3>
          </div>
          <p className="text-gray-400">
            Connect with peers in careers you&apos;ve selected. Share achievements, 
            learn from other&apos;s experiences, and build meaningful professional relationships.
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-3xl mr-3">🤝</span>
            <h3 className="text-lg font-semibold text-white">Collaborative Growth</h3>
          </div>
          <p className="text-gray-400">
            Engage in discussions, share insights, and support each other&apos;s 
            professional journeys.
          </p>
        </div>
      </div>
    )
  }
};
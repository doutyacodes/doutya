import { useState } from "react";
import Overview from "../About/Overview.jsx";
import CareerPath from "../CareerPathTab/CareerPath";

export default function CareerOverView({ selectedCareer, setMainTab }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "careerPath", label: "Career Path" },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-4">
      {/* Modern Tab Navigation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-lg"></div>
        <div className="relative backdrop-blur-sm bg-gray-800/40 border border-gray-700/50 rounded-lg p-2 shadow-xl">
          <div className="flex gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`group relative flex-1 px-4 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 hover:scale-105 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 border border-orange-400/50"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/60 hover:text-white border border-gray-600/30 hover:border-gray-500/50"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="relative z-10">{tab.label.toUpperCase()}</span>
                {activeTab === tab.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-md animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 rounded-lg"></div>
        <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 rounded-lg shadow-2xl min-h-[400px]">
          {activeTab === "overview" && (
            <div className="p-4">
              <Overview selectedCareer={selectedCareer} />
            </div>
          )}

          {activeTab === "careerPath" && (
            <CareerPath selectedCareer={selectedCareer} />
          )}
        </div>
      </div>
    </div>
  );
}

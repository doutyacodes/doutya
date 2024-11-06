import GlobalApi from '@/app/_services/GlobalApi';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CareerPath from '../CareerPathTab/CareerPath';
import Overview from '../About/Overview.jsx';

export default function CareerOverView({ selectedCareer, setMainTab }) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { key: "overview", label: "Overview" },
        { key: "careerPath", label: "Career Path" },
    ]

    const handleTabClick = (tab) => {
      setActiveTab(tab);
    };

    return (
        <>
            <button
                onClick={()=>setMainTab("roadmap")}
                className="flex items-center text-gray-300 hover:text-gray-100 mb-4"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
            </button>

            <div className="flex flex-row gap-4 text-xs md:text-base min-w-20 mt-4 w-full overflow-x-scroll justify-center items-center">
                {tabs.map((tab) => (
                <>
                    <button
                    key={tab.key}
                    className={`flex-1 rounded px-4 py-2 lg:py-3 font-semibold lg:text-lg text-sm text-center focus:outline-none ${
                        activeTab === tab.key
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }`}
                    // className={`${
                    //     activeTab === tab.key
                    //     ? "text-orange-600"
                    //     : "text-gray-800 hover:bg-gray-700"
                    // } text-white font-semibold py-2 px-3 md:min-w-32`}
                    onClick={() => setActiveTab(tab.key)}
                    >
                    {tab.label.toUpperCase()}
                    </button>
                </>
                ))}
            </div>
            <div className='mt-4'>
                {activeTab === "overview" && (
                    <Overview selectedCareer={selectedCareer} />
                )}

                {activeTab === "careerPath" && (
                    <CareerPath selectedCareer={selectedCareer} />
                )}
            </div>
        </>
    );    
}

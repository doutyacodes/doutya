// import GlobalApi from '@/app/_services/GlobalApi';
// import { CheckCircle } from 'lucide-react';
// import React, { useState } from 'react';
// import toast from 'react-hot-toast';

// function RoadMap({ selectedCareer, roadMapLoading }) {
//   const [activeTab, setActiveTab] = useState('Educational Milestones');
//   const [completedTasks, setCompletedTasks] = useState({});
  
//   // Extract milestones from selectedCareer
//   const milestones = selectedCareer.milestones.reduce((acc, milestone) => {
//     const { milestoneCategoryName, ...milestoneData } = milestone;
//     if (!acc[milestoneCategoryName]) {
//       acc[milestoneCategoryName] = [];
//     }
//     acc[milestoneCategoryName].push(milestoneData);
//     return acc;
//   }, {});
  
//   const handleComplete = async (tab, milestoneId) => {
//     const isCompleted = !completedTasks[tab]?.[milestoneId];
//     setCompletedTasks((prevState) => ({
//       ...prevState,
//       [tab]: {
//         ...prevState[tab],
//         [milestoneId]: isCompleted,
//       },
//     }));
  
//     try {
      
//       const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
//       const data = {
//         milestoneId,
//         completed: isCompleted,
//       };
  
//       const response = await GlobalApi.UpdateMileStoneStatus(data, token);
  
//       if (response.status === 201) {
//         toast.success("Milestone status updated");
//       } else {
//         const errorMessage = response.data?.message || "Failed to update status.";
//         toast.error(`Error: ${errorMessage}`);
//       }
//     } catch (err) {
//       // Handle any errors that occurred during the API call
//       toast.error("An unexpected error occurred.");
//     }
//   };

//   return (
//     <div className="p-4 bg-white">

//        {/* Loading Message */}
//        {roadMapLoading ? (
//         <div className="flex items-center justify-center h-[300px]">
//           <p className="text-gray-700">Generating roadmap data, please wait...</p>
//         </div>
//         ):(
//           <>
//             {/* Tabs */}
//             <div className="flex mb-4">
//               {Object.keys(milestones).map((tab) => (
//                 <button
//                   key={tab}
//                   className={`flex-1 px-4 py-2 font-semibold text-lg text-center focus:outline-none ${
//                     activeTab === tab
//                       ? 'bg-orange-400 text-white'
//                       : 'bg-green-300 text-black hover:bg-green-400'
//                   }`}
//                   onClick={() => setActiveTab(tab)}
//                 >
//                   {tab.toUpperCase()}
//                 </button>
//               ))}
//             </div>

//             {/* Tab Content */}
//             <div className="bg-orange-100 p-6 shadow-lg min-h-[300px]">
              
//               {milestones[activeTab]?.length > 0 ? (
//                 milestones[activeTab]?.map((item) => (
//                   <div key={item.milestoneId} className="mb-6 flex items-center justify-between">
//                     <div className="flex-1">
//                       <h3 className="font-bold text-lg text-black">
//                         {/* • {item.milestoneTitle}: <span className="font-normal">{item.milestoneDescription}</span> */}
//                         • <span className="font-normal">{item.milestoneDescription}</span>

//                       </h3>
//                       {/* <p className="italic text-gray-700">(How To: {item.milestoneHowTo})</p> */}
//                     </div>
//                     <button
//                       onClick={() => handleComplete(activeTab, item.milestoneId)}
//                       className={`ml-4 px-4 py-2 font-semibold text-white rounded-lg flex items-center justify-center w-[150px] ${
//                         item.milestoneCompletionStatus ? 'bg-green-500' : 'bg-sky-500'
//                       }`}
//                     >
//                       {item.milestoneCompletionStatus ? (
//                         <>
//                           <CheckCircle className="mr-2" /> Completed
//                         </>
//                       ) : (
//                         'Complete'
//                       )}
//                     </button>

//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-600 text-center">No milestones available for this category.</p>
//               )}
//             </div>
//             </>
//           )}
//     </div>
//   );
// }

// export default RoadMap;


import GlobalApi from '@/app/_services/GlobalApi';
import { CheckCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function RoadMap({ selectedCareer, roadMapLoading }) {
  const [activeTab, setActiveTab] = useState('Educational Milestones');
  const [milestones, setMilestones] = useState({});
  
  useEffect(() => {
    // Extract milestones from selectedCareer
    const extractedMilestones = selectedCareer.milestones.reduce((acc, milestone) => {
      const { milestoneCategoryName, ...milestoneData } = milestone;
      if (!acc[milestoneCategoryName]) {
        acc[milestoneCategoryName] = [];
      }
      acc[milestoneCategoryName].push(milestoneData);
      return acc;
    }, {});
    setMilestones(extractedMilestones);
  }, [selectedCareer]);

  const handleComplete = async (tab, milestoneId) => {
    // Immediately update the UI
    setMilestones(prevMilestones => ({
      ...prevMilestones,
      [tab]: prevMilestones[tab].map(milestone => 
        milestone.milestoneId === milestoneId 
          ? {...milestone, milestoneCompletionStatus: !milestone.milestoneCompletionStatus}
          : milestone
      )
    }));

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const data = {
        milestoneId,
        completed: !milestones[tab].find(m => m.milestoneId === milestoneId).milestoneCompletionStatus,
      };

      const response = await GlobalApi.UpdateMileStoneStatus(data, token);

      if (response.status === 201) {
        toast.success("Milestone status updated");
      } else {
        // If the API call fails, revert the UI change
        setMilestones(prevMilestones => ({
          ...prevMilestones,
          [tab]: prevMilestones[tab].map(milestone => 
            milestone.milestoneId === milestoneId 
              ? {...milestone, milestoneCompletionStatus: !milestone.milestoneCompletionStatus}
              : milestone
          )
        }));
        const errorMessage = response.data?.message || "Failed to update status.";
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (err) {
      // If an error occurs, revert the UI change
      setMilestones(prevMilestones => ({
        ...prevMilestones,
        [tab]: prevMilestones[tab].map(milestone => 
          milestone.milestoneId === milestoneId 
            ? {...milestone, milestoneCompletionStatus: !milestone.milestoneCompletionStatus}
            : milestone
        )
      }));
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="p-4 bg-white">
      {roadMapLoading ? (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-700">Generating roadmap data, please wait...</p>
        </div>
      ) : (
        <>
          <div className="flex mb-4">
            {Object.keys(milestones).map((tab) => (
              <button
                key={tab}
                className={`flex-1 px-4 py-2 font-semibold text-lg text-center focus:outline-none ${
                  activeTab === tab
                    ? 'bg-orange-400 text-white'
                    : 'bg-green-300 text-black hover:bg-green-400'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-orange-100 p-6 shadow-lg min-h-[300px]">
            {milestones[activeTab]?.length > 0 ? (
              milestones[activeTab]?.map((item) => (
                <div key={item.milestoneId} className="mb-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-black">
                      • <span className="font-normal">{item.milestoneDescription}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => handleComplete(activeTab, item.milestoneId)}
                    className={`ml-4 px-4 py-2 font-semibold text-white rounded-lg flex items-center justify-center w-[150px] ${
                      item.milestoneCompletionStatus ? 'bg-green-500' : 'bg-sky-500'
                    }`}
                  >
                    {item.milestoneCompletionStatus ? (
                      <>
                        <CheckCircle className="mr-2" /> Completed
                      </>
                    ) : (
                      'Complete'
                    )}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No milestones available for this category.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RoadMap;
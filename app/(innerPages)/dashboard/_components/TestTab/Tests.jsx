import ContentGenerationLoading from "@/app/_components/ContentGenerationLoading";
import FeatureGuideWrapper from "@/app/_components/FeatureGuideWrapper";
import LoadingOverlay from "@/app/_components/LoadingOverlay";
import GlobalApi from "@/app/_services/GlobalApi";
import { EyeIcon, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import HistoryView from "../TestHistory/HistoryView";
import ViewResult from "../ViewResult/ViewResult";

function Tests({ selectedCareer }) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectTestId, setSubjectTestId] = useState(null);
  const router = useRouter();

  const currentYear = selectedCareer.weekData.yearsSinceJoined;
  const currentWeek = selectedCareer.weekData.weekNumber;

  console.log("selectedcreer", selectedCareer);

  useEffect(() => {
    const getSubjects = async () => {
      setIsLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await GlobalApi.GetSubjects(
          selectedCareer.scope_grp_id,
          token
        );

        if (response.status === 200) {
          // Check for a 200 status code
          console.log("log", response.data.subjects);
          const results = response.data.subjects;
          setSubjects(results);
        } else {
          toast.error("Failed to fetch Subjects. Please try again later.");
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          toast.error(`Error: ${err.response.data.message}`);
        } else {
          toast.error("Failed to fetch Test data. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getSubjects();
  }, [selectedCareer]);

  const WeeklyTestsView = () =>
    subjects.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.subjectId}
            className="group relative cursor-pointer"
          >
            {/* Modern Card Design */}
            <div className="relative overflow-hidden rounded-2xl transition-all duration-300 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-700/10 to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div
                className={`relative backdrop-blur-sm border-2 rounded-2xl p-6 shadow-xl transition-all duration-300 min-h-[160px] flex flex-col justify-between
                            ${
                              subject.completed === "yes"
                                ? "bg-gradient-to-br from-emerald-600/30 to-green-600/30 border-emerald-500/40 hover:border-emerald-400/60 shadow-emerald-500/20"
                                : "bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-blue-500/40 hover:border-blue-400/60 shadow-blue-500/20"
                            }`}
              >
                {/* Subject Name */}
                <div className="flex-1 flex items-center justify-center">
                  <h3 className="text-lg font-bold text-center text-white leading-tight">
                    {subject.subjectName}
                  </h3>
                </div>

                {/* Status Badge */}
                {subject.completed === "yes" && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      ✅ Completed
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {subject.completed === "yes" ? (
                    <button
                      onClick={() => handleResultsNavigation(subject)}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View Results</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTakeTestClick(subject)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Take Test</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-400 text-lg">No subjects found for this week</p>
        <p className="text-gray-500 text-sm mt-2">
          Check back later for new assessments
        </p>
      </div>
    );

  const handleTakeTestClick = (subject) => {
    // console.log("the testId", testId);
    router.push(`/testsSection/${subject.subjectId}`);
  };

  const handleResultsNavigation = (subject) => {
    setSelectedSubjectId(subject.subjectId);
    setSubjectTestId(subject.testID);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <div>
          <div className="font-semibold">
            <LoadingOverlay loadText={"Loading..."} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <FeatureGuideWrapper featureKey="tests">
      <div className="w-full mx-auto">
        {subjectTestId ? (
          <ViewResult
            testID={subjectTestId}
            setSubjectTestId={setSubjectTestId}
          />
        ) : (
          <>
            {/* Main Tabs */}
            <div className="w-full bg-gray-900 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => setActiveTab("weekly")}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${
                      activeTab === "weekly"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                  >
                    <span className="uppercase text-sm">
                      WEEKLY ASSESSMENTS
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded transition-colors duration-300 ${
                      activeTab === "history"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                  >
                    <span className="uppercase text-sm">TEST HISTORY</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-xl">WEEK - {currentWeek}/52</h2>
              </div>

              {activeTab === "weekly" ? (
                <>
                  {/* Loading Modal */}
                  <ContentGenerationLoading
                    isOpen={isLoading}
                    onClose={() => setIsLoading(false)}
                    page="test" // Change this based on your current page
                    showDelay={1000} // Only show if loading takes more than 1 second
                    // Optional: auto close after 30 seconds
                    // autoCloseDelay={30000}
                  />

                  <WeeklyTestsView />
                </>
              ) : (
                <HistoryView
                  selectedCareer={selectedCareer}
                  currentWeek={currentWeek}
                />
              )}
            </div>
          </>
        )}
      </div>
    </FeatureGuideWrapper>
  );
}

export default Tests;

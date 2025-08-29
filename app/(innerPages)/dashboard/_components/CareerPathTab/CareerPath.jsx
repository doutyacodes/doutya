import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function CareerPath({ selectedCareer }) {
    const [isLoading, setIsLoading] = useState(false);
    const [careerPathData, setCareerPathData] = useState([]);
    const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';

    useEffect(() => {
        const getCareerPaths = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await GlobalApi.GetCareerPath(selectedCareer.id, token, language);
                if (response.status === 200) {
                    const careerPath = response.data.careerPath;
                    setCareerPathData(careerPath);
                } else {
                    toast.error('Failed to fetch career path data. Please try again later.');
                }
            } catch (err) {
                toast.error('Failed to fetch career path data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        getCareerPaths();
    }, [selectedCareer, language]);

    const Section = ({ title, content, icon, gradient = false }) => (
        <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 via-gray-700/10 to-gray-800/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 transition-all duration-300 group-hover:border-gray-600/60 group-hover:shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                    {icon && <span className="text-orange-400 text-xl">{icon}</span>}
                    <h3 className={`text-lg font-bold ${gradient ? 'bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent' : 'text-orange-400'}`}>
                        {title}
                    </h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm">{content}</p>
            </div>
        </div>
    );

    const TreeNode = ({ title, content, icon, position = 'center', isLast = false, connectTo = null }) => (
        <div className={`relative flex ${position === 'left' ? 'justify-start' : position === 'right' ? 'justify-end' : 'justify-center'}`}>
            {/* Vertical Connection Line */}
            {!isLast && (
                <div className="absolute top-full left-1/2 transform -translate-x-0.5 w-0.5 h-8 bg-gradient-to-b from-orange-400 to-transparent"></div>
            )}
            
            {/* Horizontal Connection Lines */}
            {connectTo && (
                <div className={`absolute top-1/2 ${connectTo === 'left' ? 'right-full' : 'left-full'} w-8 h-0.5 bg-gradient-to-${connectTo === 'left' ? 'l' : 'r'} from-orange-400 to-transparent`}></div>
            )}

            {/* Node Content */}
            <div className="group relative z-10 max-w-xs">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gray-800/80 backdrop-blur-sm border-2 border-gray-700/50 rounded-2xl p-4 transition-all duration-300 group-hover:border-orange-400/60 group-hover:shadow-lg group-hover:shadow-orange-500/20 group-hover:scale-105">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg">
                            {icon}
                        </div>
                        <h3 className="text-base font-bold text-orange-400">
                            {title}
                        </h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm">{content}</p>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center text-white">
                <LoadingOverlay loadText={"Loading..."} />
            </div>
        );
    }

    return (
        <div className="py-6 px-2 scrollbar-hide">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                    Career Path: {selectedCareer?.career_name || selectedCareer?.name}
                </h2>
                <div className="w-20 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
            </div>

            {careerPathData ? (
                <div className="space-y-8">

                    {/* 1. Education Foundation Box */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-cyan-600/15 to-indigo-600/15 rounded-2xl"></div>
                        <div className="relative backdrop-blur-sm bg-gray-800/60 border-2 border-blue-500/30 rounded-2xl py-6 px-2 shadow-xl">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 text-center">
                                🎓 Education Foundation
                            </h3>
                            <div className="relative">
                                {/* Horizontal connection between education and skills */}
                                <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 opacity-50"></div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                    <div className="flex lg:justify-start justify-center">
                                        <TreeNode 
                                            title="Education" 
                                            content={careerPathData.education} 
                                            icon="📚"
                                            position="left"
                                        />
                                    </div>
                                    <div className="flex lg:justify-end justify-center">
                                        <TreeNode 
                                            title="Skills Development" 
                                            content={careerPathData.specialized_skills_development} 
                                            icon="🛠️"
                                            position="right"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Professional Path Box */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-red-500/20 to-pink-600/20 rounded-2xl"></div>
                        <div className="relative backdrop-blur-sm bg-gray-800/70 border-2 border-orange-500/40 rounded-2xl py-6 px-2 shadow-xl">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6 text-center">
                                🚀 Professional Career Path
                            </h3>
                            <div className="relative">
                                {/* Desktop: Horizontal branching, Mobile: Center vertical stacking */}
                                <div className="hidden lg:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-50"></div>
                                <div className="lg:hidden absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 via-red-400 to-pink-400 opacity-50"></div>
                                
                                <div className="space-y-8 lg:space-y-8">
                                    {/* Three career levels - Grid on desktop, center-aligned stack on mobile */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                                        <div className="flex lg:justify-start justify-center">
                                            <TreeNode 
                                                title="Entry Level" 
                                                content={careerPathData.entry_level_jobs} 
                                                icon="🚀"
                                                position="left"
                                            />
                                        </div>
                                        <div className="flex lg:justify-center justify-center">
                                            <TreeNode 
                                                title="Mid-Level Career" 
                                                content={careerPathData.mid_level_career} 
                                                icon="📈"
                                                position="center"
                                            />
                                        </div>
                                        <div className="flex lg:justify-end justify-center">
                                            <TreeNode 
                                                title="Senior Roles" 
                                                content={careerPathData.senior_roles} 
                                                icon="👑"
                                                position="right"
                                            />
                                        </div>
                                    </div>

                                    {/* Entrepreneurial Branch (if exists) */}
                                    {careerPathData.entrepreneurial_path && (
                                        <div className="relative">
                                            <div className="hidden lg:block absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 opacity-50"></div>
                                            <div className="pt-4 flex justify-center">
                                                <TreeNode 
                                                    title="Entrepreneurial Path" 
                                                    content={careerPathData.entrepreneurial_path} 
                                                    icon="💡"
                                                    position="center"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Growth & Future Box */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-green-500/20 to-teal-600/20 rounded-2xl"></div>
                        <div className="relative backdrop-blur-sm bg-gray-800/70 border-2 border-emerald-500/40 rounded-2xl py-6 px-2 shadow-xl">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-6 text-center">
                                🌟 Growth & Future Prospects
                            </h3>
                            <div className="relative">
                                {/* Horizontal connection line */}
                                <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-50"></div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                    <div className="flex lg:justify-start justify-center">
                                        <TreeNode 
                                            title="Key Milestones" 
                                            content={careerPathData.key_learning_milestones} 
                                            icon="🎯"
                                            position="left"
                                        />
                                    </div>
                                    <div className="flex lg:justify-end justify-center">
                                        <TreeNode 
                                            title="Future Prospects" 
                                            content={careerPathData.future_prospects} 
                                            icon="🔮"
                                            position="right"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Challenges & Opportunities Box */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-yellow-500/20 to-orange-600/20 rounded-2xl"></div>
                        <div className="relative backdrop-blur-sm bg-gray-800/70 border-2 border-amber-500/40 rounded-2xl py-6 px-2 shadow-xl">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-6 text-center">
                                ⚡ Challenges & Opportunities
                            </h3>
                            <div className="relative">
                                {/* Horizontal connection between challenges and opportunities */}
                                <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 opacity-50"></div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                    <div className="flex lg:justify-start justify-center">
                                        <TreeNode 
                                            title="Challenges" 
                                            content={careerPathData.challenges} 
                                            icon="🚧"
                                            position="left"
                                        />
                                    </div>
                                    <div className="flex lg:justify-end justify-center">
                                        <TreeNode 
                                            title="Opportunities" 
                                            content={careerPathData.opportunities} 
                                            icon="🌟"
                                            position="right"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Overview & Summary Box */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-violet-600/20 to-indigo-600/20 rounded-2xl"></div>
                        <div className="relative backdrop-blur-sm bg-gray-800/70 border-2 border-purple-500/40 rounded-2xl py-6 px-2 shadow-xl">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-6 text-center">
                                📋 Career Overview & Summary
                            </h3>
                            <div className="relative">
                                {/* Horizontal connection line */}
                                <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 opacity-50"></div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                    <div className="flex lg:justify-start justify-center">
                                        <TreeNode 
                                            title="Career Overview" 
                                            content={careerPathData.overview} 
                                            icon="🎯"
                                            position="left"
                                        />
                                    </div>
                                    <div className="flex lg:justify-end justify-center">
                                        <TreeNode 
                                            title="Career Summary" 
                                            content={careerPathData.career_path_summary} 
                                            icon="📋"
                                            position="right"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌳</div>
                    <p className="text-gray-400 text-lg">No Career Path Data Available</p>
                    <p className="text-gray-500 text-sm mt-2">Your career tree is waiting to grow</p>
                </div>
            )}
        </div>
    );
}

export default CareerPath;

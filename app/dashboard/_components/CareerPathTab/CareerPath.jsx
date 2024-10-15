import LoadingOverlay from '@/app/_components/LoadingOverlay'
import GlobalApi from '@/app/_services/GlobalApi'
import { decryptText } from '@/utils/encryption'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

function CareerPath({selectedCareer}) {

    const [isLoading, setIsLoading] = useState(false)
    const [careerPathData, setCareerPathData] = useState([])
    // const t = useTranslations('FeedbackPage');
    const language = localStorage.getItem('language') || 'en';
    console.log(selectedCareer);
    

    useEffect(() => {
        const getCareerPaths = async () => {
            setIsLoading(true)
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetCareerPath(selectedCareer.id, token, language);
                if (response.status === 200) {  
                    const careerPath = response.data.careerPath;
                    console.log("careerPath", careerPath);
                    
                    setCareerPathData(careerPath); 
                } else {
                    toast.error('Failed to fetch careerPath data. Please try again later.');
                }
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(`Error: ${err.response.data.message}`);
                } else {
                    toast.error('Failed to fetch careerPath data. Please try again later.');
                }
            } finally {
                setIsLoading(false)
            }
        }

        getCareerPaths()
    }, [selectedCareer])


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

    const Section = ({ title, content }) => (
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-blue-600">{title}</h3>
            <p className="text-gray-700">{content}</p>
        </div>
    );

  return (
    <div>
        <div className="grid grid-cols-1 gap-6 mt-4 bg-white max-h-screen overflow-scroll p-10 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Career Path: {selectedCareer?.career_name}</h2>
            {careerPathData ? (
                <div className="space-y-8">
                    <Section title="Overview" content={careerPathData.overview} />
                    
                    <div className="bg-blue-50 p-6 rounded-md">
                        <h3 className="text-2xl font-semibold mb-4 text-blue-800">Step-by-Step Career Path</h3>
                        <Section title="Education" content={careerPathData.education} />
                        <Section title="Specialized Skills Development" content={careerPathData.specialized_skills_development} />
                        <Section title="Entry Level Jobs" content={careerPathData.entry_level_jobs} />
                        <Section title="Mid-Level Career" content={careerPathData.mid_level_career} />
                        <Section title="Senior Roles" content={careerPathData.senior_roles} />
                        {careerPathData.entrepreneurial_path && (
                            <Section title="Entrepreneurial Path" content={careerPathData.entrepreneurial_path} />
                        )}
                    </div>
                    
                    <Section title="Key Learning Milestones" content={careerPathData.key_learning_milestones} />
                    
                    <div className="bg-gray-50 p-6 rounded-md">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Challenges & Opportunities</h3>
                        <Section title="Challenges" content={careerPathData.challenges} />
                        <Section title="Opportunities" content={careerPathData.opportunities} />
                    </div>
                    
                    <Section title="Future Prospects" content={careerPathData.future_prospects} />
                    <Section title="Career Path Summary" content={careerPathData.career_path_summary} />
                </div>
            ) : (
                <p className="text-gray-600">No Career Path Data Available.</p>
            )}
        </div>
    </div>
  )
}

export default CareerPath

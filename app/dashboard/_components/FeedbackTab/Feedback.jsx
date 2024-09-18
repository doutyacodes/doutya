import LoadingOverlay from '@/app/_components/LoadingOverlay'
import GlobalApi from '@/app/_services/GlobalApi'
import { decryptText } from '@/utils/encryption'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function Feedback({selectedCareer}) {

    const [isLoading, setIsLoading] = useState(false)
    const [feedBackData, setfeedBackData] = useState([])

    const router = useRouter();

    useEffect(() => {
        const getFeedBacks = async () => {
            setIsLoading(true)
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const response = await GlobalApi.GetFeedBackData(selectedCareer.career_group_id, token);
                if (response.status === 200) {  
                    const feedback = response.data.feedback;
                    
                    // Check if feedback is a string, or needs parsing (if it's stored as JSON in the DB)
                    const parsedFeedback = typeof feedback === 'string' ? feedback : JSON.parse(feedback);
                    
                    console.log(parsedFeedback)
                    setfeedBackData(parsedFeedback); 
                } else {
                    toast.error('Failed to fetch feedback data. Please try again later.');
                }
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(`Error: ${err.response.data.message}`);
                } else {
                    toast.error('Failed to fetch feedback data. Please try again later.');
                }
            } finally {
                setIsLoading(false)
            }
        }

        getFeedBacks()
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

  return (
    <div>
        <div className="grid grid-cols-1 gap-6 mt-4 bg-white p-10 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Career Feedback</h2>
            {feedBackData ? (
                <div className="bg-gray-100 p-6 rounded-md shadow-md">
                    <p className="text-lg text-gray-700">
                        {feedBackData}
                    </p>
                </div>
            ) : (
                <p className="text-gray-600">No feedback available at the moment.</p>
            )}
        </div>
    </div>
  )
}

export default Feedback

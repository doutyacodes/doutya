"use client"
import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

function page() {

    const [carrerData, setCarrerData] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const router = useRouter();
  
    useEffect(() => {
      const authCheck = ()=>{
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem("token");
          if(!token){
            router.push('/login');
            setIsAuthenticated(false)
          }else{
            setIsAuthenticated(true)
          }
        }
      };
      authCheck()
    }, [router]);

    useEffect(()=>{
        const getCareers = async () => {
            setIsLoading(true)
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null; 
                const response = await GlobalApi.GetCarrerData(token);
                if (response.status === 201) {  // Check for a 200 status code
                    setCarrerData(response.data);
                } else {
                    toast.error('Failed to fetch career data. Please try again later.');
                }
            } catch (err) {
                
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(`Error: ${err.response.data.message}`);
                } else {
                    toast.error('Failed to fetch career data. Please try again later.');
                }
            } finally {
                setIsLoading(false)
            }
        }

        getCareers()
    }, [])

    if (isLoading || !isAuthenticated) {
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
    <div className='w-4/5 mx-auto'>
        <Toaster/>
        <p className='text-center text-white text-3xl mb-8'>Careers</p>
        <div className='flex flex-col text-white gap-5'>
            {isLoading ? (
                <div className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl'>
                    Loading careers...
                </div>
            ) : carrerData ? (
                carrerData?.map((career, index) => (
                    <div
                        key={index}
                        className={'relative bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer mb-4 '}

                    >
                        <h2 className='text-xl font-bold text-blue-600 mb-4'>{career.career_name}</h2>
                        <p className='mb-4'><strong>Reason for Recommendation:</strong> {career.reason_for_recommendation}</p>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2'>Roadmap:</h3>
                        <ul className='list-disc ml-5 mb-4'>
                            {career.roadmap.split(',').map((step, idx) => (
                                <li key={idx}>{step.trim()}</li>
                            ))}
                        </ul>
                        <p className='mb-4'><strong>Feedback:</strong> {career.feedback}</p>
                        <p className='mb-4'><strong>Present Trends:</strong> {career.present_trends}</p>
                        <p className='mb-4'><strong>Future Prospects:</strong> {career.future_prospects}</p>
                        <p><strong>User Description:</strong> {career.user_description}</p>
                    </div>
                ))
            ) : null}
        </div>
    </div>
  )
}

export default page

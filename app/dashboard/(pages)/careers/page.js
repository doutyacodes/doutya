"use client"
import LoadingOverlay from '@/app/_components/LoadingOverlay';
import GlobalApi from '@/app/_services/GlobalApi';
import { PlusIcon } from 'lucide-react';
// import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import AddCareer from '../../_components/AddCareer/AddCareer';

function page() {

    const [carrerData, setCarrerData] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [showDialogue, setShowDialogue] = useState(false)
    const [careerName, setCareerName] = useState('');
    const router = useRouter();

  //   const carrerData = [
  //     {
  //         "id": 0,
  //         "user_id": 10,
  //         "career_name": "Teacher",
  //         "reason_for_recommendation": "Teaching allows for the sharing of knowledge and nurturing the growth of students, perfectly matching the individual's supportive nature.",
  //         "roadmap": "Complete a Bachelor's degree in Education or a relevant subject, Gain experience through student-teaching programs, Obtain teaching certification/licensure in the desired grade level or subject area, Pursue professional development opportunities, Consider earning a Master’s degree for advancement and potential leadership roles",
  //         "present_trends": "Education technology is being increasingly integrated into classrooms, creating a demand for educators who are skilled in digital tools.",
  //         "future_prospects": "The need for qualified teachers is projected to remain strong, particularly in STEM subjects and in rural areas.",
  //         "user_description": "These individuals are patient, methodical, and able to create structured environments, making them effective educators.",
  //         "created_at": "2024-09-02T21:45:20.000Z",
  //         "feedback": "As a teacher in Afghanistan, you show natural abilities for organizing, caring and supportive work, which aligns with your personal traits. Yet, there's always room for improvement. One area could be honing your time management skills, which could improve the flow and efficiency of your lessons. This will not only help you in creating a structured learning environment but also ensure every learners' time is valued, thereby increasing their attention span. Additionally, as someone inclined towards guidelines and workflow, make sure to create a balance between sticking to established systems and embracing change, innovating in lessons to keep the class actively engaged. Enhancing these areas might improve your pupils' learning experience and your teaching performance."
  //     },
  //     {
  //         "id": 0,
  //         "user_id": 10,
  //         "career_name": "Nurse",
  //         "reason_for_recommendation": "This career allows individuals to provide care and support to others, aligning well with the nurturing and dedicated nature of this personality type.",
  //         "roadmap": "Complete high school diploma or equivalent, Pursue a nursing degree (Associate's or Bachelor's), Pass the NCLEX-RN exam to become a licensed registered nurse, Gain practical experience through internships or clinical rotations, Consider specializations or certifications in areas of interest",
  //         "present_trends": "There is a growing demand for healthcare professionals, particularly in primary care and elderly care, due to an aging population.",
  //         "future_prospects": "Nursing is projected to grow significantly in the coming years, with increasing opportunities in various medical settings.",
  //         "user_description": "Individuals with this personality type are known for their compassion, reliability, and attention to detail, making them excellent caregivers.",
  //         "created_at": "2024-09-02T21:45:20.000Z",
  //         "feedback": "As a nurse in Afghanistan, you demonstrate solid skills in caring for others, resulting from your compassionate and detailed-oriented personality. Areas for improvement would include time management and organizational ability. You should focus on becoming more efficient in handling multiple tasks and managing your time effectively. This can make your work less stressful and more productive. Improvement in these areas can enable you to keep track of important information, manage your workload, and provide timely healthcare services. Keyboarding or computer skills are another area of improvement and implementing these skills will allow you to record and retrieve patient information more efficiently. Lastly, given the challenging setup of Afghanistan, being adaptive and resilient in harsh conditions would be a significant asset. Considering these improvements can further enhance your effectiveness in your field."
  //     },
  //     {
  //         "id": 0,
  //         "user_id": 10,
  //         "career_name": "Administrative Assistant",
  //         "reason_for_recommendation": "This role involves supporting others in an organization, which can be fulfilling for someone who enjoys helping and organizing.",
  //         "roadmap": "Complete high school diploma or equivalent, Pursue an Associate's degree or certification in office administration or a related field, Gain experience through internships or entry-level positions, Develop skills in communication, organization, and office software, Consider further education for advancement opportunities",
  //         "present_trends": "There is a consistent demand for administrative support in various industries, especially with the rise of remote work.",
  //         "future_prospects": "The role of administrative assistants is expected to evolve with technology, but the need for organizational skills will remain important.",
  //         "user_description": "These individuals are organized, detail-oriented, and thrive on providing support to help others succeed, making them well-suited for administrative roles.",
  //         "created_at": "2024-09-02T21:45:20.000Z",
  //         "feedback": "In your role as an Administrative Assistant, your steady and meticulous approach is greatly valued. However, there are areas where improvement could enhance your overall performance. Prioritizing tasks can sometimes be complex due to the desire to avoid conflict; setting clear deadlines can help avoid last minute rushes whilst ensuring you distribute your effort effectively. Similarly, your organizational skills could be improved. While you are already well-regarded for your attention to detail, managing your time more efficiently will greatly contribute to overall productivity. Lastly, try to develop your assertiveness skills so you can more effectively express your ideas and suggestions. Remember that your insights are valuable to your team, and confidence in your contributions will benefit not only your personal growth but also the success of your collective work in Afghanistan."
  //     }
  // ]
  
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
      // Set the first career as the default selected
      if (carrerData.length > 0) {
        setSelectedCareer(carrerData[0]);
      }
    }, [carrerData])

    const handleCareerClick = (career) => {
        setSelectedCareer(career);
    };

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

    useEffect(()=>{
        getCareers()
    }, [])

    const handleSubmit = async() => {
      setIsLoading(true)
      try {
          const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
          const response = await GlobalApi.SaveInterestedCareer(token,careerName);
                  
          if (response && response.status === 201) { // Check for a successful response
              console.log('Career saved successfully');
          } else {
              // Handle the case where the response was not successful
              console.error('Failed to save career:', response);
          }
      } catch (error) {
          console.error('Failed to save career data:', error); // Log the error for debugging purposes
          if (error.response && error.response.status === 400) {
              // Handle unauthorized access
              toast.error('Enter a valid career name');
          } else {
              toast.error('Failed to save career data. Please try again later.');
          }

      } finally {
          // Call getCareers regardless of the outcome of the API call
          getCareers();
          setShowDialogue(false)
          setIsLoading(false)
      }
  }


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
      <Toaster />
      
      {/* Dialog Component */}
      {/* {showDialogue &&  */}
        <AddCareer 
            isOpen={showDialogue} 
            onClose={() => setShowDialogue(false)}
            getCareers = {getCareers}
            setCareerName = {setCareerName}
            careerName = {careerName}
            handleSubmit={handleSubmit}
        />
      {/* } */}

      <p className='text-center text-white text-3xl mb-8'>Careers</p>
      <div className='flex justify-start gap-5 text-white bg-gradient-to-r from-teal-200 to-orange-200 p-20 rounded-xl mb-10 overflow-x-auto'>
        {
            carrerData && carrerData.map((career, index) => (
                <div
                    key={index}
                    onClick={() => handleCareerClick(career)}
                    className={`w-48 h-48 p-2 shadow-xl rounded-xl flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150 active:scale-95
                    ${selectedCareer && selectedCareer.id === career.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white'}`}
                >
                    <p className='text-center text-lg font-bold text-blue-900 mb-4'>{career.career_name}</p>
                </div>
            ))
        }

        <div className='w-48 h-48 p-5 shadow-sm bg-white rounded-xl flex justify-center items-center transition-transform transform hover:scale-105 cursor-pointer duration-150 active:scale-95'
            onClick={() => setShowDialogue(true)}>
            <PlusIcon className='text-gray-600 font-thin h-20 w-20' />
        </div>
    </div>

      <div className='flex flex-col text-white gap-5'>
          {selectedCareer && (
              <div
                  className={'relative bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer mb-4 '}
              >
                  <h2 className='text-xl font-bold text-blue-600 mb-4'>{selectedCareer.career_name}</h2>
                  <p className='mb-4'><strong>Reason for Recommendation:</strong> {selectedCareer.reason_for_recommendation}</p>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>Roadmap:</h3>
                  <ul className='list-disc ml-5 mb-4'>
                      {selectedCareer.roadmap.split(',').map((step, idx) => (
                          <li key={idx}>{step.trim()}</li>
                      ))}
                  </ul>
                  <p className='mb-4'><strong>Feedback:</strong> {selectedCareer.feedback}</p>
                  <p className='mb-4'><strong>Present Trends:</strong> {selectedCareer.present_trends}</p>
                  <p className='mb-4'><strong>Future Prospects:</strong> {selectedCareer.future_prospects}</p>
                  <p><strong>User Description:</strong> {selectedCareer.user_description}</p>
              </div>
          )}
      </div>
    </div>
  )
}

export default page

import GlobalApi from '@/app/_services/GlobalApi'
import React, { useEffect, useState } from 'react'

function Results() {
    const [resultData, setResultData] = useState([]);
    const [loading,setLoading]=useState(false);
    const[error,setError]=useState('');
    useEffect(() => {
        async function fetchResults() {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
                const userId = await GlobalApi.GetUserId( token );
                const userSequence = await GlobalApi.GetUserSequence(userId);

                const data = await GlobalApi.GetResults(userSequence);
                setResultData(data.data[0]);

            } catch (err) {
                setError('Failed to fetch results.');
            } finally {
                setLoading(false);
            }
        }
        fetchResults();
    }, []);

    useEffect(() => {
        if (resultData) {
            console.log('Result Data Updated:', resultData);
        }
    }, [resultData]);

    const { description, strengths, weaknesses, opportunities, threats, careers, leastSuitableCareers } = resultData;
    return (
        <div className='w-4/5 mx-auto'>
            <p className='text-center text-white text-3xl'>Results</p>
            <div className='flex flex-col text-white gap-5'>
                <div className=''>
                    <p>
                        Description
                    </p>
                    <div className='bg-white px-10 py-6 text-sm text-gray-600 rounded-xl transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                            {description}
                        </p>
                    </div>
                </div>

                <div className=''>
                    <p>
                        Strengths
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.strengths.split('\r\n').map((strength, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{strength}</div>
                        ))}
                    </div>
                </div>

                <div>
                    <p>
                        Weaknesses
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.weaknesses.split('\r\n').map((weakness, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{weakness}</div>
                        ))}
                    </div>

                </div>
                <div>
                    <p>
                        Opportunities
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.opportunities.split('\r\n').map((opportunity, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{opportunity}</div>
                        ))}
                    </div>
                </div>
                <div>
                    <p>
                        Threats
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                        {resultData.threats.split('\r\n').map((threat, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{threat}</div>
                        ))}
                    </div>
                </div>
                <div>
                    <p>
                        Most Suitable Careers
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-sm text-gray-600'>
                        
                        {resultData.most_suitable_careers.split('\r\n').map((career, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{career}</div>
                        ))}
                    </div>
                </div>
                <div>
                    <p>
                        Least Suitable Careers
                    </p>
                    <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-sm text-gray-600'>
                        {resultData.least_suitable_careers.split('\r\n').map((least_career, index) => (
                            <div key={index} className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>{least_career}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className=''>
                <p>
                    Strengths
                </p> 
                <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                    <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Innovative and visionary
                        </p>
                    </div>     
                    <div  className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Quick-witted and clever
                        </p>
                    </div> 
                    <div className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Energetic and enthusiastic
                        </p>
                    </div> 
                    <div  className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Love challenges and debates
                        </p>
                    </div> 
                    <div  className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Value knowledge and competence
                        </p>
                    </div>    
                </div>       
            </div>

            <div>
                <p>
                    Weaknesses
                </p>
                <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                    <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Can be argumentative
                        </p>
                    </div>     
                    <div  className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        May struggle with routine tasks
                        </p>
                    </div> 
                    <div className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Can be insensitive in debates
                        </p>
                    </div> 
                    <div  className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Prone to overthinking and procrastination
                        </p>
                    </div>   
                </div>    
 
            </div>
            <div>
                <p>
                    Opportunities
                </p>
                <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                    <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Thrive in roles that require problem-solving and creativity
                        </p>
                    </div>     
                    <div  className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Opportunities in entrepreneurship, consulting, and innovation
                        </p>
                    </div> 
                    <div className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Can leverage debating skills in law or politics
                        </p>
                    </div> 
                </div>    
            </div>
            <div>
                <p>
                    Threats
                </p>
                <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-center text-sm text-gray-600'>
                    <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Risk of alienating others with constant debating
                        </p>
                    </div>     
                    <div  className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        May struggle with projects that lack variety
                        </p>
                    </div> 
                    <div className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p>
                        Potential for conflicts in interpersonal relationships
                        </p>
                    </div> 
                </div>    
            </div>
            <div>
                <p>
                    Most Suitable Careers
                </p>
                <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-sm text-gray-600'>
                    <div className='bg-white px-8 py-5 rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p className='text-lg mb-3'>Entrepreneur</p>
                        <p className='text-base'>Reasons:</p>
                        <p>
                        You are innovative and thrive in fast-paced environments, making them well-suited for the dynamic and risk-taking world of entrepreneurship.
                        </p>
                    </div>     
                    <div className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p className='text-lg mb-3'>Management Consultant</p>
                        <p className='text-base'>Reasons:</p>
                        <p>
                        You enjoy problem-solving and working on complex challenges, making them effective consultants in improving business strategies.
                        </p>
                    </div> 
                    <div className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p className='text-lg mb-3'>Marketing Manager</p>
                        <p className='text-base'>Reasons:</p>
                        <p>
                        You are creative and enjoy leading marketing campaigns, where their innovative ideas and persuasive skills are valuable.
                        </p>
                    </div> 
                    <div className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p className='text-lg mb-3'>Journalist</p>
                        <p className='text-base'>Reasons:</p>
                        <p>
                        Your curiosity and passion for uncovering and sharing stories make them well-suited for investigative journalism.
                        </p>
                    </div> 
                    <div  className='bg-white px-3 md:px-4 lg:px-8 py-4 lg:py-5 text-black rounded-xl flex-1 transition-transform transform hover:scale-105 cursor-pointer'>
                        <p className='text-lg mb-3'>Lawyer</p>
                        <p className='text-base'>Reasons:</p>
                        <p>
                        You enjoy debate and exploring different angles of an issue, making them effective in legal roles where argumentation and strategy are key.
                        </p>
                    </div>    
                </div> 
            </div>
            <div>
                <p>
                    Least Suitable Careers
                </p>
                <div className='md:flex flex-wrap gap-4 max-md:space-y-4 text-sm text-gray-600'>
                    <div className='bg-white px-8 py-5 rounded-xl cursor-pointer flex-1 transition-transform transform hover:scale-105'>
                        <p className='text-lg mb-3'>Accountant</p>
                        <p className='text-base'>Reasons:</p>
                        <p>
                        The routine and detail-oriented nature of accounting may be stifling for You, who prefer dynamic and intellectually stimulating work.
                        </p>
                    </div>     
                </div>    
            </div>
        </div>
    )
}

export default Results

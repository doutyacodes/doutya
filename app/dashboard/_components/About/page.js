import GlobalApi from '@/app/_services/GlobalApi';
import React, { useEffect, useState } from 'react';

export default function About({ selectedCareer }) {
    const [loading, setLoading] = useState(false);   // Define loading state
    const [singleCareer, setSingleCareer] = useState(null); // Define singleCareer state
    const language = 'en'; // Add language or pass it via props

    useEffect(() => {
        const fetchCareer = async () => {
            setLoading(true);
            try {
                // Fetch career name asynchronously
                const careerName = await GlobalApi.getCareerName(selectedCareer.career_group_id);

                const career_name=careerName.data.career;
                
                // Validate career_name
                if (!career_name || typeof career_name !== "string") {
                    throw new Error("Invalid career name provided.");
                }

                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

                // Fetch career result using token, career name, and language
                const response = await GlobalApi.getResult2Career(token, career_name, language);

                if (response.status === 200) {
                    const result = response.data.result;
                    console.log(result)
                    // Check if result is an array and has data
                    if (Array.isArray(result) && result.length > 0) {
                        const parsedResult = result[0]; // Access the first item in the array
                        setSingleCareer(parsedResult);  // Set the career data
                    } else {
                        console.error("Unexpected result format:", result);
                        throw new Error("Unexpected result format from API.");
                    }
                } else {
                    console.error("Error fetching career data:", response.status, response.statusText);
                    throw new Error(`API error: ${response.statusText}`);
                }
            } catch (err) {
                console.error("Failed to fetch career results:", err);
            } finally {
                setLoading(false);  // Stop loading when done
            }
        };

        if (selectedCareer.career_group_id) {
            fetchCareer();  // Invoke the function
        }
    }, [selectedCareer.career_group_id]);  // Add selectedCareer as dependency

    return (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 min-h-screen">
            {loading ? (
                <p className="text-center text-lg text-blue-600 font-semibold">Loading...</p>
            ) : singleCareer ? (
                <div className="grid grid-cols-1 gap-6">
                    {/* Present Trends Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Present Trends</h2>
                        <p className="text-gray-700">{singleCareer.present_trends}</p>
                    </div>
    
                    {/* Future Prospects Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Future Prospects</h2>
                        <p className="text-gray-700">{singleCareer.future_prospects}</p>
                    </div>
    
                    {/* Beyond Prospects Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Beyond Prospects</h2>
                        <p className="text-gray-700">{singleCareer.beyond_prospects}</p>
                    </div>
    
                    {/* Expenses Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Expenses</h2>
                        <p className="text-gray-700">{singleCareer.expenses}</p>
                    </div>
    
                    {/* Salary Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Salary</h2>
                        <p className="text-gray-700">{singleCareer.salary}</p>
                    </div>
                </div>
            ) : (
                <p className="text-center text-red-500 font-semibold">No career data available</p>
            )}
        </div>
    );    
    
}

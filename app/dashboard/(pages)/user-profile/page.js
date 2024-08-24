"use client"
import React, { useEffect, useState } from 'react'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Edit } from 'lucide-react';
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import GlobalApi from '@/app/_services/GlobalApi';
import { encryptText } from '@/utils/encryption';
import toast, { Toaster } from 'react-hot-toast';
import LoadingOverlay from '@/app/_components/LoadingOverlay';

function page() {

const [isCollegeStudent, setIsCollegeStudent] = useState(false);
const [isEditable, setIsEditable] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [userData, setUserdata] = useState(false)
const [isSubmit, setIsSubmit] = useState(false);

const router = useRouter();
const [isAuthenticated, setIsAuthenticated] = useState(true)

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

const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setError
    } = useForm();


// useEffect(() => {
//     const subscription = watch((value, { name, type }) => {
//         console.log("Form values:", value); // Log all form data
//         console.log("Changed field:", name, "Type of change:", type); // Log which field changed
//     });
//     return () => subscription.unsubscribe(); // Cleanup the subscription
// }, [watch]);

const getUserData = async()=>{
    setIsLoading(true)
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const resp = await GlobalApi.GetUserData(token);
        setUserdata(resp.data); 

      } catch (error) {
        console.error('Error Fetching GetQuizData data:', error);
      }finally {
          setIsLoading(false);
      }
}

    useEffect(() =>{
        getUserData();
    }, [])

    // Set the form fields with the response data
    useEffect(() => {
    const yearMonth = userData.yearOfPassing && userData.monthOfPassing
        ? `${userData.yearOfPassing}-${userData.monthOfPassing.padStart(2, '0')}`
        : '';
        reset({
            name: userData.name,
            gender: userData.gender,
            mobile: userData.mobile,
            birth_date: userData.birth_date ? new Date(userData.birth_date).toISOString().split('T')[0]: '',
            password: userData.password,
            confirmPassword: userData.password,
            username: userData.username,
            education: userData.education,
            student: userData.student,
            college: userData.college,
            university: userData.university,
            yearMonthOfPassing: yearMonth
        });
    }, [reset, userData]);

const onSubmit = async(data) => {
    setIsSubmit(true);

    if (data.password !== data.confirmPassword) {
        setError("confirmPassword", {
            type: "manual",
            message: "Passwords do not match"
        });
        return;
    }
    const encryptedPassword = encryptText(data.password);
    data.password = encryptedPassword;
    if(data.college!="" && data.university!="")
    {
        const encryptedCollege=encryptText(data.college);
        const  encryptedUniversity=encryptText(data.university);
        data.college=encryptedCollege;
        data.university=encryptedUniversity;
    }
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const response = await GlobalApi.UpdateUser(data, token);
        
        
        if (response.status === 201) {
            toast.success("User Data Updated");
            getUserData();
        }
        else {
            // Handle any other unexpected status codes
            const errorMessage = response.data?.message || "Failed to add data.";
            toast.error(`Error: ${errorMessage}`);
        }
    } catch (err) {
        // Handle any errors that occurred during the API call
        if (err && err.response) {
                const { response } = err;
                if (response.status === 409) {
                    const errorMessage = response.data?.message || "Username is already taken";
                    console.log("Error message:", errorMessage);
                    setError("username", {
                        type: "manual",
                        message: errorMessage
                    });
                    toast.error(errorMessage); // Display toast error message
                } else {
                    const errorMessage = response.data?.message || "Failed to add data.";
                    toast.error(`Error: ${errorMessage}`);
                }
            } else {
                // Handle unexpected errors
                toast.error("An unexpected error occurred.");
        }
    } finally {
        setIsSubmit(false);
    }
}

if(isLoading || !isAuthenticated){
    return (
        <div className='h-screen flex items-center justify-center text-white'>
            <div>
                <div className='font-semibold'>
                     <LoadingOverlay loadText={"Loading..."}/>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className='container mx-auto bg-white rounded'>
    <Toaster
      position="top-center"
      reverseOrder={false}
      />
        <div className='flex flex-col text-white gap-5 py-5'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className='flex justify-between'>
                            <div>
                                <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                    Welcome to your profile! Here you can view and manage your personal details, account settings, and preferences..
                                </p>
                            </div>
                            <div className="mt-6 gap-x-6">
                                <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent the default form submission behavior
                                    setIsEditable(true);
                                }} 
                                className="rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm bg-yellow-500 hover:bg-yellow-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                Edit Profile
                                </button>
                            </div>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-1">
                                <label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900">
                                    Gender
                                </label>
                                <div className="mt-2 w-full">
                                    <select
                                    disabled={!isEditable} 
                                    id="gender"
                                    name="gender"
                                    autoComplete="gender"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    {...register("gender")}
                                    >
                                    <option value="">select</option>
                                    <option>Mr</option>
                                    <option>Miss</option>
                                    <option>Mrs</option>
                                    </select>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                    Name
                                </label>
                                <div className="mt-2">
                                    <input
                                    disabled={!isEditable} 
                                    {...register("name")}
                                    id="name"
                                    name="name"
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                    Username
                                </label>
                                <div className="mt-2">
                                    <input
                                    disabled={!isEditable} 
                                    {...register("username")}
                                    id="username"
                                    name="username"
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm "
                                    />
                                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                                </div>
                            </div>

                            {/* <div className='sm:col-span-6'> */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                        <input
                                            disabled={!isEditable} 
                                            type="password"
                                            {...register("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message: "Password must be at least 6 characters long"
                                                },
                                                pattern: {
                                                    value: /(?=.*[!@#$%^&*])/,
                                                    message: "Password must contain at least one special character"
                                                }
                                            })}
                                            className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                                    </div>
        
                                    <div className="sm:col-span-2">
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                        <input
                                            disabled={!isEditable} 
                                            type="password"
                                            {...register("confirmPassword",)}
                                            className={`mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                            required
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                    </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                                disabled={!isEditable} 
                                type="number"
                                {...register("mobile",{
                                    minLength: {
                                        value: 10,
                                        message: "Number should contain 10 digits"
                                    }
                                })}
                                className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                disabled={!isEditable} 
                                type="date"
                                {...register("birth_date")}
                                className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="collegeStudent" className="block text-sm font-medium text-gray-700 mr-4">Are you a college student?</label>
                            <div className="space-x-4">
                                <label className='mt-1 block w-full px-3 py-2'>
                                    <input
                                        disabled={!isEditable} 
                                        type="radio"
                                        {...register("student")}
                                        value="no"
                                        // checked={collegeStudent === 'yes'}
                                        onChange={() => setIsCollegeStudent(false)}
                                        className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-gray-700 mr-5">No</span>
                                    <input
                                        disabled={!isEditable} 
                                        type="radio"
                                        {...register("student")}
                                        value="yes"
                                        // checked={collegeStudent === 'yes'}
                                        onChange={() => setIsCollegeStudent(true)}
                                        className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-gray-700">Yes</span>
                                </label>
                            </div>
                        </div>


                        {isCollegeStudent ? (
                            <>
                                <div className="sm:col-span-2">
                                    <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
                                    <input
                                        disabled={!isEditable} 
                                        type="text"
                                        {...register("college")}
                                        className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="university" className="block text-sm font-medium text-gray-700">University</label>
                                    <input
                                        disabled={!isEditable} 
                                        type="text"
                                        {...register("university")}
                                        className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>


                                <div className="sm:col-span-2">
                                    <label htmlFor="yearMonthOfPassing" className="block text-sm font-medium text-gray-700">Year&Month of Passing</label>
                                    <input
                                        id="yearMonthOfPassing"
                                        name="yearMonthOfPassing"
                                        disabled={!isEditable} 
                                        type="month"
                                        {...register("yearMonthOfPassing")}
                                        className="mt-1 block w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="currentEnrollment" className="block text-sm font-medium leading-6 text-gray-900">
                                        Current Enrollment
                                    </label>
                                    <div className="mt-2 w-full">
                                        <select
                                        disabled={!isEditable} 
                                        id="currentEnrollment"
                                        name="currentEnrollment"
                                        autoComplete="education"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        {...register("education")}
                                        >
                                        <option value="">select</option>
                                        <option>High School</option>
                                        <option>Associate Degree</option>
                                        <option>Bachelor's Degree</option>
                                        <option>Master's Degree</option>
                                        <option>Doctorate</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                            ) : (
                                <div className="sm:col-span-2">
                                    <label htmlFor="highestDegree" className="block text-sm font-medium leading-6 text-gray-900">
                                        Highest Degree
                                    </label>
                                    <div className="mt-2 w-full">
                                        <select
                                        disabled={!isEditable} 
                                        id="highestDegree"
                                        name="highestDegree"
                                        autoComplete="education"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        {...register("education")}
                                        >
                                        <option value="">select</option>
                                        <option>High School</option>
                                        <option>Associate Degree</option>
                                        <option>Bachelor's Degree</option>
                                        <option>Master's Degree</option>
                                        <option>Doctorate</option>
                                        </select>
                                    </div>
                                </div>
                            )
                        }

                    </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        disabled={!isEditable || isSubmit}
                        type="submit"
                        className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                            !isEditable || isSubmit
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' // Disabled styling
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                        }`}
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default page

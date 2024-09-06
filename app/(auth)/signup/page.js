"use client"
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { encryptText } from '@/utils/encryption';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculateAge } from "@/lib/ageCalculate";
import countryList from 'react-select-country-list';
import Select from 'react-select';

function SignUp() {
    const [isCollegeStudent, setIsCollegeStudent] = useState(false);
    const [countryOptions] = useState(countryList().getData());
    const [selectedCountry, setSelectedCountry] = useState(null); 
    const router = useRouter();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setError
    } = useForm();

    const onSubmit = async(data) => {
        if (data.password !== data.confirmPassword) {
            setError("confirmPassword", {
                type: "manual",
                message: "Passwords do not match"
            });
            return;
        }
        const encryptedPassword = encryptText(data.password);
        data.password = encryptedPassword;

       
        if (isCollegeStudent && data.college && data.university) {
            data.college = encryptText(data.college);
            data.university = encryptText(data.university);
        }
        data.country = selectedCountry?.label;
        try {
            const response = await GlobalApi.CreateNewUser(data);
    
            if (response.status === 201) {
                const { token } = response.data.data;
                localStorage.setItem('token', token);
                reset();

              
                const age = calculateAge(data.dob);

                toast.success("Successfully added to the database!");

              
                if (age <= 9) {
                    localStorage.setItem('dashboardUrl', '/dashboard_kids');
                    router.push('/dashboard_kids');
                } 
                else if (age <= 13) {
                    localStorage.setItem('dashboardUrl', '/dashboard_junior');
                    router.push('/dashboard_junior');
                } 
                else {
                    localStorage.setItem('dashboardUrl', '/dashboard');
                    router.push('/dashboard');
                }
            } else {
                const errorMessage = response.data?.message || "Failed to add data.";
                toast.error(`Error: ${errorMessage}`);
            }
            console.log(data)
        } catch (err) {
            console.error('Error:', err);
            toast.error(`Error: ${err.message}`);
        }
    }

    const collegeStudent = watch("student");

    return (
        <div className="flex items-center justify-center min-h-screen pt-8 pb-8">
            <Toaster />
            
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg ">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <select
                                id="honorific"
                                name="honorific"
                                className="mt-6 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                {...register("gender")}
                            >
                                <option value=''>Gender</option>
                                <option className=" font-serif" value='Mr'>Mr</option>
                                <option value='Miss'>Miss</option>
                                <option value='Mrs'>Mrs</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                {...register("name")}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            {...register("username")}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            {...register("confirmPassword",)}
                            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
                            required
                        />
                        {errors.confirmPassword && (
                            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <input
                            type="number"
                            {...register("mobile",{
                                minLength: {
                                    value: 10,
                                    message: "Number should contain 10 digits"
                                }
                            })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                        {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Select Your Country</label>
                        <Select
                            options={countryOptions} 
                            value={selectedCountry}
                            onChange={setSelectedCountry} 
                            className="mt-1 block w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            {...register("dob", {
                            required: "Date of birth is required",
                            validate: {
                                notTooYoung: (value) => {
                                    const today = new Date();
                                    const selectedDate = new Date(value);
                                    const minAllowedDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
                                    return selectedDate <= minAllowedDate || "Age must be a minimum of 5 years.";
                                }
                            }
                            })}
                            max={new Date().toISOString().split("T")[0]}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"                        />
                        {errors.dob && <p className="mt-2 text-sm text-red-600">{errors.dob.message}</p>}
                    </div>
                    <br />
                    <div className="mb-4 flex items-center">
                        <label htmlFor="collegeStudent" className="block text-sm font-medium text-gray-700 mr-4">Are you a college student?</label>
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    {...register("student")}
                                    value="no"
                                    onChange={() => setIsCollegeStudent(false)}
                                    className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-gray-700 mr-5">No</span>
                                <input
                                    type="radio"
                                    {...register("student")}
                                    value="yes"
                                    onChange={() => setIsCollegeStudent(true)}
                                    className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-gray-700">Yes</span>
                            </label>
                        </div>
                    </div>

                    {isCollegeStudent && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
                                <input
                                    type="text"
                                    {...register("college")}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="university" className="block text-sm font-medium text-gray-700">University</label>
                                <input
                                    type="text"
                                    {...register("university")}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </>
                    )}

                    <div className="mb-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </form>
                <div className="flex justify-between">
                    <Link href="/login" className="text-sm text-gray-500">Already Registered? Log In</Link>
                    <Link href="/" className="text-sm text-gray-500">Forgot Password?</Link>
                </div>
            </div>
        </div>
    )
}

export default SignUp;

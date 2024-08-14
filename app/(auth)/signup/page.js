"use client"
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { encryptText } from '@/utils/encryption';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SignUp() {
    const [isCollegeStudent, setIsCollegeStudent] = useState(false);
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
        if(data.college!="" && data.university!="")
        {
            const encryptedCollege=encryptText(data.college);
            const  encryptedUniversity=encryptText(data.university);
            data.college=encryptedCollege;
            data.university=encryptedUniversity;
        }
        try {
            const resp = await GlobalApi.CreateNewUser(data);
            if (resp) {
                reset();
                toast.success("Successfully added to database!");
                router.push('/login');
            } else {
                toast.error("Error: Failed to add data.");
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
        }
    }

    const collegeStudent = watch("student");
    console.log(collegeStudent)

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-8 pb-8">
            <Toaster/>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
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
                                <option value='Mr'>Mr</option>
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
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            {...register("birth_date")}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <label htmlFor="collegeStudent" className="block text-sm font-medium text-gray-700 mr-4">Are you a college student?</label>
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    {...register("student")}
                                    value="no"
                                    // checked={collegeStudent === 'yes'}
                                    onChange={() => setIsCollegeStudent(false)}
                                    className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-gray-700 mr-5">No</span>
                                <input
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

                            <div className="mb-4">
                                <label htmlFor="yearOfPassing" className="block text-sm font-medium text-gray-700">Year of Passing</label>
                                <input
                                    type="number"
                                    {...register("yearOfPassing")}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="monthOfPassing" className="block text-sm font-medium text-gray-700">Month of Passing</label>
                                <input
                                    type="month"
                                    {...register("monthOfPassing")}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="currentEnrollment" className="block text-sm font-medium text-gray-700">Current Enrollment</label>
                                <select
                                    id="currentEnrollment"
                                    name="currentEnrollment"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        </>
                    ) : (
                        <div className="mb-4">
                            <label htmlFor="highestDegree" className="block text-sm font-medium text-gray-700">Highest Degree</label>
                            <select
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                {...register("education")}
                            >
                                <option>High School</option>
                                <option>Associate Degree</option>
                                <option>Bachelor's Degree</option>
                                <option>Master's Degree</option>
                                <option>Doctorate</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Sign Up
                    </button>
                </form>
                <br />
                <span className='text-emerald-600'>Already have an account? <Link className='text-gray-500 hover:text-black' href="/login">Login</Link></span>
            </div>
        </div>
    )
}

export default SignUp;

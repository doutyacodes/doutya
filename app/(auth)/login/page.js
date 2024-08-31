"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form"
import { useRouter } from 'next/navigation';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';

function calculateAge(birthDateString) {
  const birthDate = new Date(birthDateString); 
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}


function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const resp = await GlobalApi.LoginUser(data);
      console.log('response',resp);
      if (resp.status === 200) {
        const birth_date = resp.data.birth_date;
        const age = calculateAge(birth_date);

        if (resp.data.token) {
          localStorage.setItem('token', resp.data.token);
        }
        toast.success("Logged in successfully");
        reset();
        if (age < 14) {
          router.push('/dashboard_kids');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error('Invalid username or password');
      }
    } catch (err) {
      toast.error('Invalid username or password');
    }
  };

  return (
    <div>
      <Toaster></Toaster>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                {...register("username")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                {...register("password")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <span className='text-emerald-600'>Don't have an account? <Link className='text-gray-500 hover:text-black' href="/signup">SignUp</Link></span>
            <br /> <br />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

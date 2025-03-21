"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';
import { calculateAge } from "@/lib/ageCalculate";
import { useTranslations } from 'next-intl';
import Image from 'next/image';

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
  const [selectedLanguage, setSelectedLanguage] = useState('en'); 
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setSelectedLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      // Get auth_token from cookies
      const cookies = document.cookie.split("; ").find(row => row.startsWith("auth_token="));
      const authToken = cookies ? cookies.split("=")[1] : null;

      if (token && authToken) {
        router.replace("/dashboard"); // Redirect only if both exist
      } else {
        localStorage.clear(); // Clear localStorage if either token is missing
      }
    }
  }, [router]);

  const onSubmit = async (data) => {
    try {
      const resp = await GlobalApi.LoginUser(data);
      if (resp.status === 200) {
        // const birth_date = resp.data.birth_date;
        // const age = calculateAge(birth_date);

        // if (resp.data.token) {
        //   localStorage.setItem('token', resp.data.token);
        // }
        // toast.success("Logged in successfully");
        // reset();
        // // console.log("response",resp.data)
        // if (age <= 9) {
        //   localStorage.setItem('dashboardUrl', '/dashboard_kids');
        //   router.push('/dashboard_kids');
        // } 
        // else if (age <= 13) {
        //   localStorage.setItem('dashboardUrl', '/dashboard_junior');
        //   resp.data.quizCompleted ? router.push('/dashboard/careers'):router.push('/dashboard_junior');
        // } 
        // else {
        //   localStorage.setItem('dashboardUrl', '/dashboard');
        //   resp.data.quizCompleted ? router.push('/dashboard/careers'):router.push('/dashboard');
        // }
        const { birth_date, token, navigateUrl } = resp.data;
        const age = calculateAge(birth_date);
    
        if (token) {
          localStorage.setItem('token', token);
        }

         // Set the age-appropriate dashboard URL in localStorage
        let dashboardUrl = '/dashboard'; // Default for age > 13

        if (age <= 9) {
          dashboardUrl = '/dashboard_kids';
        } else if (age <= 13) {
          dashboardUrl = '/dashboard_junior';
        }

        localStorage.setItem('dashboardUrl', dashboardUrl);
        // Handle navigation with backend-provided URL
        const isDefaultUrl = navigateUrl === '/default';  // Check for the default URL

        if (isDefaultUrl) {
          // Use age-based URL if backend sends the default URL
          router.push(dashboardUrl);

          localStorage.setItem('navigateUrl', dashboardUrl);
        } else {
          // Use backend-provided URL if it's not the default
          router.push(navigateUrl);

          localStorage.setItem('navigateUrl', navigateUrl);

        }

        toast.success("Logged in successfully");
        reset();

      } else {
        toast.error('Invalid username or password');
      }
    } catch (err) {
      toast.error('Invalid username or password');
    }
  };
 
  const t = useTranslations('LoginPage');
  const s = useTranslations('SignupPage');

  return (
    <div>
      <Toaster />
      <div className="flex items-center flex-col gap-2 justify-center min-h-screen px-3 bg-black bg-opacity-90">
        <div>
          <Image
            src={"/assets/images/logo-full.png"}
            width={140}
            height={120}
          />
        </div>
        <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">{t('title')}</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">{t('username')}</label>
              <input
                type="text"
                {...register("username")}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">{t('password')}</label>
              <input
                type="password"
                {...register("password")}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                required
              />
            </div>
            <span className='text-gray-400'>{t('NoAccount')} <Link className='text-blue-500 hover:text-blue-400' href="/signup">{t('Signup')}</Link></span>
            <br /> <br />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {t('LoginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

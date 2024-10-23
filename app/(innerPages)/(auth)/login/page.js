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
    const authCheck = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          router.push("/dashboard");
        } 
      }
    };
    authCheck();
  }, [router]);

  const onSubmit = async (data) => {
    try {
      const resp = await GlobalApi.LoginUser(data);
      if (resp.status === 200) {
        const birth_date = resp.data.birth_date;
        const age = calculateAge(birth_date);

        if (resp.data.token) {
          localStorage.setItem('token', resp.data.token);
        }
        toast.success("Logged in successfully");
        reset();
        // console.log("response",resp.data)
        if (age <= 9) {
          localStorage.setItem('dashboardUrl', '/dashboard_kids');
          router.push('/dashboard_kids');
        } 
        else if (age <= 13) {
          localStorage.setItem('dashboardUrl', '/dashboard_junior');
          resp.data.quizCompleted ? router.push('/dashboard/careers'):router.push('/dashboard_junior');
        } 
        else {
          localStorage.setItem('dashboardUrl', '/dashboard');
          resp.data.quizCompleted ? router.push('/dashboard/careers'):router.push('/dashboard');
        }
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
      <div className="flex items-center flex-col gap-2 justify-center min-h-screen px-3">
        <div>
        <Image
              
              src={"/assets/images/logo-full.png"}
              width={140}
              height={120}
            />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          
          <h1 className="text-2xl font-bold mb-6 text-center">{t('title')}</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">{t('username')}</label>
              <input
                type="text"
                {...register("username")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('password')}</label>
              <input
                type="password"
                {...register("password")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              <Link href="/" className="text-sm text-gray-500">{s('forgotPassword')}</Link>
            </div>
            <span className='text-slate-400'>{t('NoAccount')} <Link className='text-blue-500 hover:text-blue-600' href="/signup">{t('Signup')}</Link></span>
            <br /> <br />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

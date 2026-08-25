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
import GoogleAuthButton from '@/components/GoogleAuthButton';

function Login() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [checking, setChecking] = useState(true);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  const t = useTranslations('LoginPage');
  const s = useTranslations('SignupPage');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setSelectedLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/check');
        if (res.ok) {
          const url = localStorage.getItem("navigateUrl") || "/dashboard";
          router.replace(url);
        } else {
          setChecking(false);
        }
      } catch (err) {
        setChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const onSubmit = async (data) => {
    try {
      const resp = await GlobalApi.LoginUser(data);
      if (resp.status === 200) {
        const { birth_date, token, navigateUrl, class: userClass } = resp.data;

        if (token) {
          localStorage.setItem('token', token);
        }

        let dashboardUrl = '/dashboard';
        if (["5", "6", "7"].includes(userClass)) {
          dashboardUrl = '/dashboard_junior';
        }
        localStorage.setItem('dashboardUrl', dashboardUrl);

        const isDefaultUrl = navigateUrl === '/default';
        if (isDefaultUrl) {
          localStorage.setItem('navigateUrl', dashboardUrl);
          router.push(dashboardUrl);
        } else {
          localStorage.setItem('navigateUrl', navigateUrl);
          router.push(navigateUrl);
        }

        toast.success("Logged in successfully");
        reset();
      } else {
        toast.error(resp?.data?.message || 'Invalid username or password');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Invalid username or password');
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setIsSubmittingGoogle(true);
    try {
      const res = await fetch("/api/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google authentication failed");
      }

      if (data.status === "LOGGED_IN") {
        const { token, navigateUrl, class: userClass } = data;

        if (token) {
          localStorage.setItem("token", token);
        }

        let dashboardUrl = "/dashboard";
        if (["5", "6", "7"].includes(userClass)) {
          dashboardUrl = "/dashboard_junior";
        }
        localStorage.setItem("dashboardUrl", dashboardUrl);

        const isDefaultUrl = navigateUrl === "/default";
        if (isDefaultUrl) {
          localStorage.setItem("navigateUrl", dashboardUrl);
          router.push(dashboardUrl);
        } else {
          localStorage.setItem("navigateUrl", navigateUrl || dashboardUrl);
          router.push(navigateUrl || dashboardUrl);
        }

        toast.success("Logged in successfully");
      } else if (data.status === "NEW_USER") {
        // Save Google profile into sessionStorage and redirect to /signup so user can complete school/college selection
        sessionStorage.setItem("googleAuthProfile", JSON.stringify(data.googleProfile));
        router.push("/signup");
      }
    } catch (err) {
      toast.error(err.message || "Google sign in failed");
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Toaster />
      <div className="flex items-center flex-col gap-6 justify-center min-h-screen px-4 py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl blur-xl"></div>
          <div className="relative p-4">
            <Image
              src={"/assets/images/logo-full.png"}
              width={160}
              height={140}
              alt="Logo"
              className="filter drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
          <div className="relative backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
            </div>

            {/* Google Sign In Button */}
            <div className="mb-5">
              <GoogleAuthButton
                text="Sign in with Google"
                onSuccess={handleGoogleSuccess}
                onError={(err) => toast.error(err)}
                disabled={isSubmittingGoogle}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-700/80" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                or with username
              </span>
              <div className="flex-1 h-px bg-gray-700/80" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                  {t('username')}
                </label>
                <input
                  type="text"
                  {...register("username")}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  {t('password')}
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="text-center">
                <span className='text-gray-300 text-sm'>
                  {t('NoAccount')}{' '}
                  <Link
                    className='text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200'
                    href="/signup"
                  >
                    {t('Signup')}
                  </Link>
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
              >
                {t('LoginButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

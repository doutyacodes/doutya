"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import GlobalApi from '@/app/_services/GlobalApi';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { decryptURLText } from '@/utils/encryption';
import { requestPhoneOtp, verifyPhoneOtp, maskPhoneNumber } from '@/lib/phoneAuth';
import { Loader2, ArrowLeft, ShieldCheck, Phone } from 'lucide-react';

function Login() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [checking, setChecking] = useState(true);
  const [inviteToken, setInviteToken] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);

  // OTP Verification States
  // Steps: 'credentials' | 'otp' | 'phone-input'
  const [loginStep, setLoginStep] = useState('credentials');
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const [targetPhone, setTargetPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const t = useTranslations('LoginPage');
  const s = useTranslations('SignupPage');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setSelectedLanguage(savedLanguage);
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const interval = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  // Check if school invite token or stored school data is available
  useEffect(() => {
    try {
      let token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("invite") : null;
      if (!token && typeof window !== "undefined") {
        token = sessionStorage.getItem("school_invite_token");
      }
      if (token) {
        setInviteToken(token);
        sessionStorage.setItem("school_invite_token", token);
        try {
          const dec = decryptURLText(token);
          if (dec) {
            const parsed = JSON.parse(dec);
            if (parsed.name || parsed.id || parsed.institutionId) {
              GlobalApi.GetInstitutionInfoByInvite(token)
                .then((res) => {
                  if (res?.data?.institution) {
                    setSchoolInfo(res.data.institution);
                  }
                })
                .catch(() => {});
            }
          }
        } catch (e) {}
      } else if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user_institution");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.name) setSchoolInfo(parsed);
          } catch (e) {}
        }
      }
    } catch (e) {}
  }, []);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/check', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const url = localStorage.getItem("navigateUrl") || "/dashboard";
          // If the saved URL is verification-pending or login, do not redirect to it
          if (url && !url.includes("verification-pending") && !url.includes("login")) {
            router.replace(url);
            return;
          } else {
            localStorage.removeItem("navigateUrl");
            router.replace("/dashboard");
            return;
          }
        } else {
          // If not authenticated, ensure any stale verification-pending navigateUrl is purged
          const savedUrl = localStorage.getItem("navigateUrl");
          if (savedUrl && (savedUrl.includes("verification-pending") || savedUrl.includes("login"))) {
            localStorage.removeItem("navigateUrl");
          }
          setChecking(false);
        }
      } catch (err) {
        setChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // Step 1: Pre-check credentials and initiate OTP send
  const onSubmitCredentials = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username.trim(),
          password: data.password,
          action: 'pre-check',
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || 'Invalid username or password');
        setIsSubmitting(false);
        return;
      }

      setPendingCredentials(data);

      if (result.mobile) {
        // User has a registered mobile number in DB -> send OTP immediately
        setTargetPhone(result.mobile);
        setIsSendingOtp(true);
        try {
          const { confirmation } = await requestPhoneOtp(result.mobile, 'login-recaptcha-container');
          setConfirmationResult(confirmation);
          setLoginStep('otp');
          setOtpCountdown(30);
          toast.success(`Verification code sent to ${maskPhoneNumber(result.mobile)}`);
        } catch (otpErr) {
          console.error('OTP send error:', otpErr);
          toast.error(otpErr.message || 'Failed to send OTP to registered phone.');
        } finally {
          setIsSendingOtp(false);
        }
      } else {
        // Account has no mobile registered (e.g. legacy account) -> prompt to link mobile
        setLoginStep('phone-input');
      }
    } catch (err) {
      console.error('Login pre-check error:', err);
      toast.error('Unable to connect to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1b: User provides phone number when not on file
  const handleSendCustomPhoneOtp = async () => {
    if (!targetPhone || targetPhone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsSendingOtp(true);
    try {
      const { confirmation } = await requestPhoneOtp(targetPhone, 'login-recaptcha-container');
      setConfirmationResult(confirmation);
      setLoginStep('otp');
      setOtpCountdown(30);
      toast.success(`Verification code sent to ${maskPhoneNumber(targetPhone)}`);
    } catch (err) {
      console.error('OTP send error:', err);
      toast.error(err.message || 'Failed to send OTP. Please check the number.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendLoginOtp = async () => {
    if (otpCountdown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    try {
      const { confirmation } = await requestPhoneOtp(targetPhone, 'login-recaptcha-container');
      setConfirmationResult(confirmation);
      setOtpCountdown(30);
      toast.success('New verification code sent');
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP and complete final login
  const handleVerifyOtpAndLogin = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      // 1. Verify code with Firebase
      await verifyPhoneOtp(confirmationResult, otpCode);

      // 2. Complete login with backend
      const resp = await GlobalApi.LoginUser({
        username: pendingCredentials.username.trim(),
        password: pendingCredentials.password,
        mobile: targetPhone,
      });

      if (resp.status === 200) {
        const { birth_date, token, navigateUrl, class: userClass } = resp.data;

        if (token) {
          localStorage.setItem('token', token);
        }

        if (schoolInfo) {
          try {
            localStorage.setItem("user_institution", JSON.stringify(schoolInfo));
          } catch (e) {}
        }

        let dashboardUrl = '/dashboard';
        const sectorGrades = ["LKG", "UKG", "lkg", "ukg", "1", "2", "3", "4", "5", "6", "7"];
        const clusterGrades = ["8", "9", "10"];
        const normalizedUserClass = userClass ? String(userClass).trim() : "";

        if (sectorGrades.includes(normalizedUserClass)) {
          dashboardUrl = '/dashboard_kids';
        } else if (clusterGrades.includes(normalizedUserClass)) {
          dashboardUrl = '/dashboard_junior';
        }
        localStorage.setItem('dashboardUrl', dashboardUrl);

        const isDefaultUrl = navigateUrl === '/default';
        if (isDefaultUrl) {
          localStorage.setItem('navigateUrl', dashboardUrl);
          router.push(dashboardUrl);
        } else {
          localStorage.setItem('navigateUrl', navigateUrl || dashboardUrl);
          router.push(navigateUrl || dashboardUrl);
        }

        toast.success("Logged in successfully");
        reset();
      } else {
        toast.error(resp?.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('OTP Verification / Login error:', err);
      toast.error(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">

        {/* Main Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-xl">

          {/* Header */}
          <div className="text-center mb-6">
            {schoolInfo?.logo && (
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl p-2.5 shadow-md flex items-center justify-center mb-3">
                <img
                  src={schoolInfo.logo}
                  alt={schoolInfo.name || "School Logo"}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {schoolInfo?.name || t('title')}
            </h1>

            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto my-3"></div>

            <p className="text-xs sm:text-sm text-gray-400">
              {schoolInfo ? "Student Portal Login" : "Sign in to your account"}
            </p>
          </div>

          {/* STEP 1: Enter Username & Password */}
          {loginStep === 'credentials' && (
            <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-300 mb-1.5">
                  {t('username')}
                </label>
                <input
                  type="text"
                  {...register("username", { required: true })}
                  className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm transition-all"
                  placeholder="Enter your username or email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1.5">
                  {t('password')}
                </label>
                <input
                  type="password"
                  {...register("password", { required: true })}
                  className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="text-center pt-1">
                <span className="text-xs text-gray-400">
                  {t('NoAccount')}{' '}
                  <Link
                    className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                    href={inviteToken ? `/signup?invite=${encodeURIComponent(inviteToken)}` : "/signup"}
                  >
                    {t('Signup')}
                  </Link>
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isSendingOtp}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting || isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Sending OTP...</span>
                    </>
                  ) : (
                    t('LoginButton')
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 1B: Link Mobile Phone (Only if user has no phone on record) */}
          {loginStep === 'phone-input' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3 text-orange-400">
                  <Phone className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-white">Link Mobile Number</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Your account requires a verified mobile number for OTP login.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Mobile Number <span className="text-orange-400">*</span>
                </label>
                <input
                  type="tel"
                  autoFocus
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="e.g. 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleSendCustomPhoneOtp}
                disabled={isSendingOtp || !targetPhone}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setLoginStep('credentials')}
                  className="text-xs text-gray-400 hover:text-gray-300 flex items-center justify-center gap-1 mx-auto transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Enter OTP Code */}
          {loginStep === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3 text-orange-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-semibold text-white">Two-Step Verification</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Enter the 6-digit code sent to{" "}
                  <span className="text-gray-200 font-mono font-medium">{maskPhoneNumber(targetPhone)}</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-3 bg-gray-900/80 border border-gray-600 rounded-xl text-center text-xl font-mono tracking-[0.5em] text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOtpAndLogin}
                disabled={isVerifyingOtp || otpCode.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep('credentials');
                    setOtpCode('');
                  }}
                  className="text-gray-400 hover:text-gray-300 flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleResendLoginOtp}
                  disabled={isSendingOtp || otpCountdown > 0}
                  className="text-orange-400 hover:text-orange-300 disabled:text-gray-500 font-medium transition"
                >
                  {isSendingOtp ? "Sending..." : otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend Code"}
                </button>
              </div>
            </div>
          )}

          {/* Invisible Recaptcha Container for Login */}
          <div id="login-recaptcha-container"></div>

          {/* Subtle Powered by Xortcut Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-5 mt-5 border-t border-gray-700/60">
            <span>Powered by</span>
            <Image
              src="/assets/images/xortcut-icon-small.png"
              width={14}
              height={14}
              alt="Xortcut"
              className="h-3 w-auto opacity-70"
            />
            <span className="font-medium text-gray-400">Xortcut</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;

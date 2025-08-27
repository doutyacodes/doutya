"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Footer from "./_components/Footer";
import Header from "./_components/Header";

const Page = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const CTAButton = ({ children, href, phone, primary = false, className = "" }) => (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      {phone ? (
        <a
          href={`tel:${phone}`}
          className={`relative overflow-hidden px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            primary 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
          } shadow-lg ${className}`}
        >
          <span className="relative z-10">{children}</span>
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
        </a>
      ) : (
        <Link
          href={href}
          className={`relative overflow-hidden px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
            primary 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
          } shadow-lg ${className}`}
        >
          <span className="relative z-10">{children}</span>
          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
        </Link>
      )}
    </motion.div>
  );

  const SectionWrapper = ({ children, className = "", id }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1
    });

    return (
      <motion.section
        id={id}
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={staggerContainer}
        className={`py-12 sm:py-16 lg:py-20 ${className}`}
      >
        {children}
      </motion.section>
    );
  };

  const StatCard = ({ number, text, delay = 0 }) => (
    <motion.div
      variants={fadeInUp}
      className="text-center p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 hover:bg-white/15 transition-colors duration-300"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-400 mb-2">{number}</div>
      <div className="text-sm sm:text-base text-gray-200">{text}</div>
    </motion.div>
  );

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-5 sm:pt-40">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/assets/videos/bg.mp4" type="video/mp4" />
        </video>
        
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20 z-20"
        />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden z-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white/20 rounded-full"
              initial={{ 
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0, 
                y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0
              }}
              animate={{
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
                y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative z-40 container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            style={{ y: textY }}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
            >
              Career Clarity for Every Student
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4"
            >
              AI-powered guidance that helps students find the right path, reassures parents, 
              and gives schools & colleges a complete Career Guidance Cell — without hiring counselors.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-8 sm:gap-4 justify-center items-center px-4"
            >
              <CTAButton phone="+919876543210" primary className="w-full sm:w-auto">
                🎓 Book a Demo for Your School/College
              </CTAButton>
              <CTAButton href="/login" className="w-full sm:w-auto">
                👩‍🎓 Take the Career Test ₹499
              </CTAButton>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <SectionWrapper className="bg-gradient-to-r from-red-900/20 to-orange-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
              Why Career Guidance Is Broken
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <StatCard number="93%" text="Students pick careers without expert guidance" delay={0} />
            <StatCard number="₹2L+" text="Average cost of hiring counselors annually" delay={0.1} />
            <StatCard number="70%" text="Parents rely on outdated advice" delay={0.2} />
            <StatCard number="5 Years" text="Average time wasted on wrong career choices" delay={0.3} />
          </motion.div>

          <motion.div variants={fadeInUp} className="text-center">
            <p className="text-lg sm:text-xl lg:text-2xl text-red-300 font-semibold">
              Wrong choices = wasted years, wasted money, frustrated students.
            </p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* The Solution Section */}
      <SectionWrapper className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
              Your AI-Powered Career Guidance Cell
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
              Transform your institution with comprehensive career guidance that works
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {[
              {
                icon: "✅",
                title: "One Test → Clear Career Map",
                description: "Comprehensive assessment reveals each student's ideal career path with actionable insights.",
                color: "bg-emerald-500"
              },
              {
                icon: "✅",
                title: "Personalized Monthly Guidance",
                description: "Continuous support and handholding to keep students on track throughout their journey.",
                color: "bg-purple-500"
              },
              {
                icon: "✅",
                title: "Institutional Dashboard",
                description: "Complete insights for administrators without needing additional counseling staff.",
                color: "bg-blue-500"
              },
              {
                icon: "✅",
                title: "Parent-Ready Reports",
                description: "Detailed reports that build parent satisfaction and institutional trust.",
                color: "bg-pink-500"
              }
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${item.color} rounded-full flex items-center justify-center mr-3 sm:mr-4`}>
                    <span className="text-lg sm:text-xl lg:text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{item.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          
        </div>
      </SectionWrapper>

      {/* How It Works Section */}
      <SectionWrapper id="how-it-works" className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
              Simple, Scalable, Smart
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                step: "01",
                title: "Take the Test",
                description: "Students complete our AI-driven comprehensive assessment",
                image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
              },
              {
                step: "02", 
                title: "Get the Report",
                description: "Receive personalized career roadmap with study/skill strategy",
                image: "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg"
              },
              {
                step: "03",
                title: "Stay on Track", 
                description: "Monthly guidance, challenges, and progress updates",
                image: "https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg"
              },
              {
                step: "04",
                title: "Get Insights",
                description: "Institutions receive batch-level analytics and parent communication",
                image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center group"
              >
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">{item.description}</p>
                <div className="aspect-video bg-white/5 backdrop-blur-md rounded-lg sm:rounded-xl overflow-hidden border border-white/10 group-hover:border-purple-400/50 transition-colors duration-300">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* For Schools & Colleges Section */}
      <SectionWrapper id="for-schools" className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
              Turnkey Career Guidance for Your Campus
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div variants={fadeInUp}>
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {[
                  "No need to hire costly counselors",
                  "Every student gets personalized clarity", 
                  "Parents see school/college as future-ready",
                  "Batch-level insights help principals & placement cells"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm sm:text-base">✓</span>
                    </div>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-200">{benefit}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 sm:mt-12">
                <CTAButton phone="+919876543210" primary>
                  Book a Free Demo
                </CTAButton>
              </div>
            </motion.div>

            <motion.div variants={scaleIn}>
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg"
                  alt="School Campus"
                  className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-2xl sm:rounded-3xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* For Students & Parents Section */}
      <SectionWrapper id="for-students" className="bg-gradient-to-r from-emerald-900/20 to-green-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
              Clarity. Confidence. Direction.
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {[
              {
                emoji: "🎓",
                title: "Students",
                description: "Discover careers that fit your strengths & interests with AI-powered precision."
              },
              {
                emoji: "👨‍👩‍👦",
                title: "Parents",
                description: "Get peace of mind with a clear, structured roadmap for your child's future."
              },
              {
                emoji: "🧭",
                title: "Practical Strategies",
                description: "Learning style insights, skill gaps, and study tips included in every report."
              }
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 text-center hover:bg-white/10 transition-colors duration-300">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">{item.emoji}</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="text-center">
            <CTAButton href="/login">
              Take the Career Test ₹499
            </CTAButton>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Learning Styles Section */}
      <SectionWrapper className="bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
              We Don't Just Tell You What Career Fits.<br className="hidden sm:block"/>
              We Tell You How to Get There.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div variants={scaleIn} className="order-2 lg:order-1">
              <img 
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
                alt="Learning Styles"
                className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-2xl"
              />
            </motion.div>

            <motion.div variants={staggerContainer} className="order-1 lg:order-2">
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {[
                  {
                    icon: "👁️",
                    title: "Identify Your Learning Style",
                    description: "Visual, auditory, or kinesthetic - we help you understand how you learn best"
                  },
                  {
                    icon: "📚",
                    title: "Custom Study Strategies", 
                    description: "Personalized approaches for exams & skill-building based on your learning type"
                  },
                  {
                    icon: "🎯",
                    title: "Smart Preparation",
                    description: "Helps students prepare smarter, not harder, with targeted guidance"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-start space-x-3 sm:space-x-4"
                  >
                    <div className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm sm:text-base text-gray-300">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* Pricing Section */}
      <SectionWrapper id="pricing" className="bg-gradient-to-r from-indigo-900/20 to-blue-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
              Simple & Affordable
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                title: "Career Test",
                subtitle: "One-Time",
                price: "₹999",
                description: "per student",
                features: [
                  "Comprehensive AI assessment",
                  "Detailed career report",
                  "Learning style analysis",
                  "Skill gap identification"
                ],
                cta: "Take the Test",
                href: "/login"
              },
              {
                title: "Monthly Handholding",
                subtitle: "Ongoing Support", 
                price: "₹149",
                description: "/month",
                features: [
                  "Monthly guidance sessions",
                  "Progress tracking",
                  "Study strategies",
                  "Career updates"
                ],
                cta: "Get Support",
                href: "/login",
                popular: true
              },
              {
                title: "Schools & Colleges",
                subtitle: "Bulk Pricing",
                price: "₹499",
                description: "/student onwards",
                features: [
                  "Institutional dashboard",
                  "Batch analytics", 
                  "Parent communication",
                  "Custom branding"
                ],
                cta: "Book Demo",
                phone: "+919876543210"
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className={`relative bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border ${
                  plan.popular ? 'border-purple-400 ring-2 ring-purple-400/50' : 'border-white/10'
                } text-center hover:bg-white/10 transition-colors duration-300`}
              >
                {/* {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                    Most Popular
                  </div>
                )} */}
                
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.title}</h3>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">{plan.subtitle}</p>
                
                <div className="mb-6 sm:mb-8">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{plan.price}</span>
                  <p className="text-sm sm:text-base text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-2 sm:space-y-3 lg:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center space-x-2">
                      <span className="text-emerald-400 text-sm sm:text-base">✓</span>
                      <span className="text-sm sm:text-base text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.phone ? (
                  <CTAButton phone={plan.phone} primary={plan.popular} className="w-full sm:w-auto">
                    {plan.cta}
                  </CTAButton>
                ) : (
                  <CTAButton href={plan.href} primary={plan.popular} className="w-full sm:w-auto">
                    {plan.cta}
                  </CTAButton>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Trust Section */}
      <SectionWrapper className="bg-gradient-to-r from-gray-900/20 to-slate-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 lg:gap-8 mb-6 sm:mb-8 text-gray-400">
              <span className="text-sm sm:text-base lg:text-lg">Built with Educators</span>
              <span className="text-lg sm:text-xl lg:text-2xl">|</span>
              <span className="text-sm sm:text-base lg:text-lg">Powered by AI</span>
              <span className="text-lg sm:text-xl lg:text-2xl">|</span>
              <span className="text-sm sm:text-base lg:text-lg">Trusted by Institutions</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400 mb-2">1,000+</div>
                <div className="text-sm sm:text-base text-gray-300">Students Guided</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400 mb-2">10+</div>
                <div className="text-sm sm:text-base text-gray-300">Schools & Colleges</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                type: "Student",
                quote: "Xortcut helped me discover my passion for UX design. The career roadmap was exactly what I needed!",
                name: "Priya S.",
                role: "Class 12 Student"
              },
              {
                type: "Parent", 
                quote: "Finally, a clear path for my daughter's future. The detailed report gave us confidence in her choices.",
                name: "Rajesh Kumar",
                role: "Parent"
              },
              {
                type: "Principal",
                quote: "Our students are more focused and parents are happier. Xortcut transformed our career guidance approach.",
                name: "Dr. Meera Sharma",
                role: "Principal, Delhi Public School"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300"
              >
                <div className="text-emerald-400 mb-3 sm:mb-4 font-semibold text-sm sm:text-base">{testimonial.type} Testimonial</div>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="text-white font-semibold text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-gray-400 text-xs sm:text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* FAQ Section */}
      <SectionWrapper className="bg-gradient-to-r from-slate-900/20 to-gray-900/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {[
              {
                question: "How accurate is the test?",
                answer: "Our AI-powered assessment has 98.65% accuracy based on thousands of student outcomes and continuous learning algorithms."
              },
              {
                question: "Is it only for Class 12?",
                answer: "No! Xortcut works for students from Class 6 onwards, as well as graduates and young professionals looking to pivot their careers."
              },
              {
                question: "Can parents access the report?",
                answer: "Yes, parents receive a detailed, easy-to-understand report with actionable insights and recommendations."
              },
              {
                question: "What if I change my mind later?",
                answer: "Career paths can evolve! Our monthly handholding service helps you adapt and pivot as your interests and market conditions change."
              },
              {
                question: "How is Xortcut different from a psychometric test?",
                answer: "Unlike static psychometric tests, Xortcut provides dynamic, AI-powered guidance with ongoing support, learning strategies, and real-world career insights."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300"
              >
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4">{faq.question}</h3>
                <p className="text-sm sm:text-base text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Final CTA Section */}
      <SectionWrapper className="bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
              Don't gamble with careers.<br className="hidden sm:block"/>
              Bring AI-powered clarity to your students.
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center">
              <CTAButton phone="+919876543210" primary className="w-full sm:w-auto">
                🎓 Book a Demo for Your School/College
              </CTAButton>
              <CTAButton href="/login" className="w-full sm:w-auto">
                👩‍🎓 Take the Career Test
              </CTAButton>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      <Footer />
      
      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-pink-900 p-3 sm:p-4 md:hidden z-50 border-t border-white/20">
        <div className="flex space-x-2 sm:space-x-3">
          <a
            href="tel:+919876543210"
            className="flex-1 bg-white text-purple-900 text-center py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm"
          >
            🎓 Book Demo
          </a>
          <Link
            href="/login"
            className="flex-1 bg-emerald-500 text-white text-center py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm"
          >
            👩‍🎓 Take Test
          </Link>
        </div>
      </div>

      {/* Sticky Footer for Desktop */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <div className="bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-2xl">
          <div className="flex flex-col space-y-3">
            <a
              href="tel:+919876543210"
              className="bg-white text-purple-900 text-center py-2 px-4 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors duration-200"
            >
              🎓 Book Demo
            </a>
            <Link
              href="/login"
              className="bg-emerald-500 text-white text-center py-2 px-4 rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors duration-200"
            >
              👩‍🎓 Take Test
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
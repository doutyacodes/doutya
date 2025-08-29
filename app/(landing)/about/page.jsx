"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { SparklesIcon, LightBulbIcon, UsersIcon, ShieldCheckIcon, RocketLaunchIcon, HeartIcon, AcademicCapIcon, ChartBarIcon, TrophyIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import Image from "next/image";
import Link from "next/link";

const AboutPage = () => {
  const doutyaUrl = "https://doutya.com";
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

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
        className={`py-12 lg:py-20 ${className}`}
      >
        {children}
      </motion.section>
    );
  };

  const HeroSection = () => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    
    return (
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24 lg:pt-32">
        {/* Clean background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, purple 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-4 lg:px-6 text-center">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="flex justify-center mb-6 lg:mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/10">
                <SparklesIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white/80 font-medium">About Us</span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl lg:text-5xl xl:text-6xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
            >
              Building what every school in India{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                has always lacked
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-base lg:text-lg text-white/70 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              A Career Guidance Cell that actually works. India has 250 million students, but less than 2% receive structured career guidance.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#the-problem"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-base"
              >
                The Problem We Solve
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#our-story"
                className="px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-base"
              >
                Our Story
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  };

  const TheProblemSection = () => {
    return (
      <SectionWrapper id="the-problem" className="bg-gradient-to-r from-red-900/20 to-orange-900/20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                The Problem We Decided to Fix
              </h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div variants={fadeInUp}>
              <div className="space-y-6">
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">The Reality</h3>
                  <p className="text-white/70 leading-relaxed text-base lg:text-lg">
                    India has <span className="text-white font-semibold">250 million students</span>, but less than <span className="text-red-400 font-semibold">2% receive structured career guidance</span>. The rest rely on guesswork, relatives, and outdated stereotypes.
                  </p>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">The Cost</h3>
                  <p className="text-white/70 leading-relaxed text-base lg:text-lg">
                    The cost is measured in <span className="text-white font-semibold">wasted years, wrong degrees, and untapped futures</span>.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-purple-900/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Our Solution</h3>
                  <p className="text-white/70 leading-relaxed text-base lg:text-lg">
                    <span className="text-white font-semibold">We decided to fix this.</span> Xortcut is India's first AI-powered Career Guidance Cell that works.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
                      250M
                    </div>
                    <p className="text-white/60 text-sm mb-4">Students in India</p>
                    <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      &lt;2%
                    </div>
                    <p className="text-white/60 text-sm">Get Career Guidance</p>
                  </div>
                  <Image 
                    src="/assets/images/about.svg" 
                    width={300} 
                    height={300} 
                    alt="The Problem"
                    className="w-full h-auto max-w-sm mx-auto"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>
    );
  };

  const WhatXortcutDoesSection = () => {
    const features = [
      {
        icon: AcademicCapIcon,
        title: "Scientific AI Assessments",
        description: "Discover the right strengths, interests, and career paths through scientific AI assessments.",
        color: "from-blue-500 to-indigo-500"
      },
      {
        icon: UsersIcon,
        title: "Continuous Monthly Handholding",
        description: "Receive continuous, affordable handholding — not just once, but every month as they grow.",
        color: "from-emerald-500 to-teal-500"
      },
      {
        icon: ChartBarIcon,
        title: "Direct Industry Connect",
        description: "Engage directly with companies via challenges, internships, and projects — turning classrooms into pipelines for jobs.",
        color: "from-purple-500 to-pink-500"
      }
    ];

    return (
      <SectionWrapper>
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                Xortcut: More Than a Test
              </h2>
            </div>
            <p className="text-white/70 max-w-3xl mx-auto leading-relaxed text-base lg:text-lg">
              It doesn't stop at a test or a counselling session — it is a multi-year journey that helps every student
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>
    );
  };

  const ProvenAISection = () => {
    return (
      <SectionWrapper className="bg-gradient-to-r from-slate-900/20 to-gray-900/20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full" />
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  And This Isn't Theory
                </h2>
              </div>
              
              <p className="text-white/70 mb-6 leading-relaxed text-base lg:text-lg">
                <span className="text-white font-semibold">Our AI is already proven.</span> We built <Link href={doutyaUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">Doutya</Link>, India's only AI-powered current affairs and debate coach, trusted by aspirants of UPSC, PSC, NDA, SSC, and other prestigious exams.
              </p>
              
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrophyIcon className="w-6 h-6 text-yellow-400" />
                  <h4 className="text-lg font-semibold text-white">
                    <Link href={doutyaUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 transition-colors">Doutya</Link> Powers India's Elite
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-emerald-400">UPSC</div>
                    <div className="text-sm text-white/60">Civil Services</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-blue-400">State PSCs</div>
                    <div className="text-sm text-white/60">State Services</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-purple-400">NDA</div>
                    <div className="text-sm text-white/60">Defense Services</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-pink-400">SSC</div>
                    <div className="text-sm text-white/60">Central Govt</div>
                  </div>
                </div>
              </div>
              
              <p className="text-lg lg:text-xl text-white font-medium">
                <span className="text-emerald-400">If it can train the future officers and leaders of the country, it can certainly guide your students toward the right career.</span>
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-center">
                  <div className="mb-6">
                    <Link href={doutyaUrl} target="_blank" rel="noopener noreferrer" className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2 hover:from-emerald-300 hover:to-teal-300 transition-colors block">
                      Doutya
                    </Link>
                    <p className="text-white/60 text-sm">Proven AI Technology</p>
                  </div>
                  <Image 
                    src="/assets/images/about.svg" 
                    width={300} 
                    height={300} 
                    alt="Proven AI Technology"
                    className="w-full h-auto max-w-sm mx-auto"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>
    );
  };

  const MissingInfrastructureSection = () => {
    return (
      <SectionWrapper>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div variants={fadeInUp} className="relative lg:order-2">
              <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors duration-300">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <BuildingOffice2Icon className="w-4 h-4 text-white" />
                </div>
                <Image 
                  src="/assets/images/trophy1.webp" 
                  width={400} 
                  height={400} 
                  alt="Missing Infrastructure"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  The Missing Infrastructure
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Xortcut is not another counselling service.
                  </h4>
                  <p className="text-white/70 text-base leading-relaxed">
                    It is the <span className="text-white font-semibold">missing infrastructure of Indian education.</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-white/70 text-base lg:text-lg leading-relaxed">
                    The same way schools need electricity, internet, and labs, they now need a <span className="text-white font-semibold">Career Guidance Cell</span>.
                  </p>
                  
                  <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-purple-900/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <p className="text-lg lg:text-xl text-white font-medium text-center">
                      We're here to make that possible.
                    </p>
                  </div>
                </div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8"
              >
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-base"
                >
                  🏗️ Build Your Career Cell
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>
    );
  };

  const OurStorySection = () => {
    return (
      <SectionWrapper id="our-story" className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                Our Story
              </h2>
            </div>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div variants={fadeInUp} className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">
                A Simple, Painful Truth
              </h3>
              <p className="text-white/70 leading-relaxed text-base lg:text-lg mb-4">
                Our story began with a simple, painful truth: Every year, millions of students in India ask, <span className="text-white font-semibold">"What should I do with my life?"</span> — and almost all of them get the wrong answer.
              </p>
              <p className="text-white/70 leading-relaxed text-base lg:text-lg">
                We watched this cycle play out for decades. Bright kids trapped in careers they never wanted. Parents forced to spend lakhs on trial-and-error degrees. Institutions reduced to exam factories.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">
                The Question That Changed Everything
              </h3>
              <p className="text-white/70 leading-relaxed text-base lg:text-lg mb-4">
                Meanwhile, our team was busy building <Link href={doutyaUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">Doutya</Link> — an AI-powered platform that helps aspirants crack India's toughest exams like UPSC, PSC, NDA, and SSC. We saw how AI could train students to think critically, debate intelligently, and prepare for the country's most elite positions.
              </p>
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6">
                <p className="text-white/70 leading-relaxed text-base lg:text-lg">
                  <span className="text-white font-semibold">That's when the question hit us:</span> If AI can prepare future civil servants and officers, why can't it guide school students at the most crucial decision point of their lives?
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-purple-900/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 lg:p-8 mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">
                That Was the Birth of Xortcut
              </h3>
              <p className="text-white/70 leading-relaxed text-base lg:text-lg mb-4">
                What started as an experiment grew into a full-fledged Career Guidance Cell: AI-powered tests to identify the right path, continuous mentorship plans, and direct industry connect through challenges, internships, and opportunities.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">
                Our Mission Today
              </h3>
              <p className="text-white/70 leading-relaxed text-base lg:text-lg mb-6">
                We're not here to be another app. We're here to <span className="text-white font-semibold">replace career confusion with clarity — at scale.</span>
              </p>
              <p className="text-white/70 leading-relaxed text-base lg:text-lg mb-6">
                From high schools in Kerala to universities in Delhi, from aspirants in small towns to global students — the mission is the same:
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-white font-medium">• Every student deserves direction</p>
                <p className="text-white font-medium">• Every school deserves a Career Guidance Cell</p>
                <p className="text-white font-medium">• Every country deserves a generation that doesn't waste its potential</p>
              </div>
              <p className="text-lg lg:text-xl text-white font-semibold">
                This is not just our story. It's the story of the future workforce of India.
              </p>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>
    );
  };

  const CTASection = () => {
    return (
      <SectionWrapper>
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-purple-900/20 backdrop-blur-xl rounded-2xl border border-white/10 p-6 lg:p-12"
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-6">
              Ready to build India's missing infrastructure?
            </h3>
            <p className="text-base lg:text-lg text-white/70 mb-6 lg:mb-8 leading-relaxed">
              Join us in replacing career confusion with clarity. Help your institution become future-ready with India's first AI-powered Career Guidance Cell.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="tel:+919876543210"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 text-base"
              >
                📞 Book a Demo for Your Institution
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-base"
              >
                🎓 Try Career Assessment
              </motion.a>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    );
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      <Header dark={true} />
      
      <HeroSection />
      <TheProblemSection />
      <WhatXortcutDoesSection />
      <ProvenAISection />
      <MissingInfrastructureSection />
      <OurStorySection />
      <CTASection />

      <Footer />
    </main>
  );
};

export default AboutPage;
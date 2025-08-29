"use client";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { motion, useInView } from "framer-motion";
import { 
  HeartIcon, 
  TrophyIcon, 
  LightBulbIcon, 
  UsersIcon, 
  BoltIcon, 
  ChatBubbleBottomCenterTextIcon, 
  ClockIcon, 
  FaceSmileIcon,
  SparklesIcon 
} from "@heroicons/react/24/outline";
import React, { useRef } from "react";

const Principle = () => {
  const principles = [
    {
      id: 1,
      title: "CREATE RAVING FANS",
      description: "We don't want just students; we only want raving fans. We prioritize helping students who are truly committed to their career journey, and do our utmost to create the best possible guidance and service experience. You cannot go wrong by making a student succeed.",
      icon: HeartIcon,
    },
    {
      id: 2,
      title: "WANT MORE",
      description: "We are never completely satisfied with our accomplishments. When we achieve new milestones, we celebrate, and then imagine new ones. Across the platform and company we're building, this applies to everything we do. Every individual and team at Xortcut strive to be the best at their craft.",
      icon: TrophyIcon,
    },
    {
      id: 3,
      title: "CHALLENGE CONVENTIONAL WISDOM",
      description: "Conventional wisdom yields conventional results. We want extraordinary results. We encourage ourselves to question common assumptions about career guidance. This doesn't mean we're doing the opposite of conventional wisdom, but the notion that 'everybody is doing it that way' just doesn't cut it at Xortcut.",
      icon: LightBulbIcon,
    },
    {
      id: 4,
      title: "WIN AS A TEAM",
      description: "Team members optimize for the team win, and we strive to hire people who prioritize team wins above their own. We're here to win as a team and help every student succeed.",
      icon: UsersIcon,
    },
    {
      id: 5,
      title: "ACT NOW",
      description: "Instead of spending too much time discussing how we're going to act, we simply act. We keep 'work about work' and 'plans for having plans' to the necessary minimum. Speed and execution matter in transforming career guidance.",
      icon: BoltIcon,
    },
    {
      id: 6,
      title: "NO SUGAR",
      description: "As difficult as they may be, we prefer to know the facts. Sugar-coating does not help make decisions or solve problems quickly. We encourage every team member to be direct, speak their mind, and expect the same from their peers.",
      icon: ChatBubbleBottomCenterTextIcon,
    },
    {
      id: 7,
      title: "FAVOR THE LONG TERM",
      description: "Our vision of revolutionizing career guidance will take time to fulfill. When conflicted with taking a shortcut now vs. doing the right thing for the long term, we favor the long term impact on students' lives.",
      icon: ClockIcon,
    },
    {
      id: 8,
      title: "ENJOY THE RIDE",
      description: "Last but not least: While we're very serious about our work transforming education, we don't take ourselves too seriously. Have fun and enjoy the ride as we build the future of career guidance!",
      icon: FaceSmileIcon,
    },
  ];

  const PrincipleCard = ({ principle, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const Icon = principle.icon;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="group relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 lg:p-8 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20"
      >
        {/* Background Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Number Badge */}
        <div className="absolute top-4 lg:top-6 right-4 lg:right-6 flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-white/5 text-sm lg:text-base font-bold text-white/40 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-300">
          {principle.id.toString().padStart(2, '0')}
        </div>

        {/* Icon */}
        <div className="relative mb-6 flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl bg-white/5 group-hover:bg-purple-500/20 transition-all duration-300">
          <Icon className="h-7 w-7 lg:h-8 lg:w-8 text-white/60 group-hover:text-purple-300 transition-colors duration-300" />
        </div>

        {/* Title */}
        <h3 className="relative mb-4 text-lg lg:text-xl font-bold text-white/90 group-hover:text-white transition-colors duration-300 leading-tight">
          {principle.title}
        </h3>

        {/* Description */}
        <p className="relative text-sm lg:text-base leading-relaxed text-white/70 group-hover:text-white/80 transition-colors duration-300">
          {principle.description}
        </p>
      </motion.div>
    );
  };

  const containerRef = useRef(null);
  const isContainerInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                scale: Math.random() * 0.5 + 0.5
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <Header dark={true} />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="relative z-10 container mx-auto px-4 lg:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex justify-center mb-6 lg:mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/10">
                <SparklesIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white/80 font-medium">How We Operate</span>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight tracking-tight"
            >
              Operating{" "}
              <br className="hidden lg:block" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Principles
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg lg:text-xl text-white/70 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              The fundamental operating principles that drive how we work, collaborate, and deliver exceptional career guidance experiences at Xortcut.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#principles"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-lg"
              >
                Explore Principles
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/leadership-principles"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-lg"
              >
                Leadership Principles
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="relative p-8 lg:p-12 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-50" />
              <div className="relative">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  How We Operate at Xortcut
                </h2>
                <p className="text-lg lg:text-xl text-white/70 leading-relaxed font-light">
                  These operating principles define our day-to-day approach to building revolutionary career guidance technology. They guide our decisions, shape our culture, and ensure we deliver exceptional value to students and educators worldwide.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principles Grid */}
      <section id="principles" ref={containerRef} className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isContainerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Our Operating Principles
            </h2>
            <p className="text-lg lg:text-xl text-white/70 font-light">
              How we work together to transform career guidance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {principles.map((principle, index) => (
              <PrincipleCard key={principle.id} principle={principle} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="relative p-8 lg:p-12 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-50" />
              <div className="relative">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Ready to Operate with Excellence?
                </h2>
                <p className="text-lg lg:text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                  Join our team and help us execute on these principles to revolutionize how students discover their career paths.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/careers"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-lg"
                  >
                    Join Our Mission
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/about"
                    className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-lg"
                  >
                    Learn More
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Principle;
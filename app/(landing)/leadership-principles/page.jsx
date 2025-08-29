"use client";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { motion, useInView } from "framer-motion";
import { StarIcon, LightBulbIcon, UsersIcon, ChatBubbleLeftRightIcon, ScaleIcon, AcademicCapIcon, RocketLaunchIcon, HeartIcon, ExclamationTriangleIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import React, { useRef } from "react";

const Principle = () => {
  const principles = [
    {
      id: 1,
      title: "INSIST ON GREAT TALENT",
      description:
        "Only with excellent people can Xortcut be successful in the long run. We'd rather grow slower than lower the bar for hiring and maintaining exceptional talent. Ideally we are looking for people who are as good if not better than us.",
      icon: StarIcon,
    },
    {
      id: 2,
      title: "CULTIVATE BELONGING AND DIVERSITY",
      description:
        "Our responsibility transcends hitting our goals and KPIs. We know that Xortcut—and the world—will be a better place when people from diverse backgrounds, races, genders, cultures, sexual orientations, ages, and experiences thrive. We work hard to ensure that everyone feels they belong at Xortcut and make the extra effort to bring them in.",
      icon: UsersIcon,
    },
    {
      id: 3,
      title: "EMPOWER YOUR TEAM",
      description:
        "We hire, grow, and nurture great people so they can do great things at Xortcut. We provide our teams with direction and context, then trust and empower them to make it happen. Part of empowering your team is understanding that we all make mistakes. We see mistakes as opportunities for learning and development.",
      icon: RocketLaunchIcon,
    },
    {
      id: 4,
      title: "SHARE. A LOT.",
      description:
        "Without information and context, team members can't make decisions and achieve great results. We promote a culture of open information sharing and encourage our teams to communicate transparently across the organization. We err on the side of over-sharing and communicate frequently and clearly to our teams and to our own leadership.",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      id: 5,
      title: "ENCOURAGE DEBATE",
      description:
        "We don't have all the answers. With great people by our side, we listen intently and encourage them to express their ideas and opinions, especially when they are different from our own. We celebrate and encourage their feedback. We don't make decisions by committee, yet we are genuinely interested in hearing a diverse set of views prior to making a decision.",
      icon: ScaleIcon,
    },
    {
      id: 6,
      title: "DEVELOP AND GROW",
      description:
        "One of our core responsibilities is to mentor and coach our team members. We take time to develop and grow successful team members and take pride in their success, even if it materializes in other teams or even other companies.",
      icon: AcademicCapIcon,
    },
    {
      id: 7,
      title: "GO BIG",
      description:
        "We set ambitious goals that feel uncomfortable and are hard to achieve. We are aware we may not fully achieve them, but we'd rather strive for great things than take the easy route. We're willing to take calculated risks to yield those big outcomes and experiment with new ideas so we can make Xortcut exceptional.",
      icon: LightBulbIcon,
    },
    {
      id: 8,
      title: "WE ARE ALL TEAM XORTCUT",
      description:
        "We're all part of the same team—Team Xortcut. Xortcut's long-term success will be determined by collaboration between teams. We won't get there by narrowly focusing on our own team goals. Instead, we operate as one team to help us win.",
      icon: HeartIcon,
    },
    {
      id: 9,
      title: "MAKE TOUGH CALLS",
      description:
        "As leaders, we're often required to make uncomfortable decisions that may make us or others around us unhappy. Letting inertia guide us or following the path of least resistance may be easier in the short term, but will not get us to where we need to be. Instead, we act swiftly and decisively, making the best choice for Xortcut.",
      icon: ExclamationTriangleIcon,
    },
    {
      id: 10,
      title: "NO ROYALTY",
      description:
        "Leadership is about responsibility, not superiority. We all play an important role in Xortcut's success. We act humbly and modestly, serving our team members, and building relationships as humans regardless of our titles.",
      icon: ShieldCheckIcon,
    },
    {
      id: 11,
      title: "HONE YOUR CRAFT",
      description:
        "We aim to build one of the world's best companies. We aim not only to grow bigger, but keep getting better at most things we do. This means to continuously improve and be the best at our craft, both within our area of expertise and as leaders. We learn from the best, encourage those who strive to excel, and help our teams achieve higher standards.",
      icon: SparklesIcon,
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
                <span className="text-sm text-white/80 font-medium">Leadership Excellence</span>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight tracking-tight"
            >
              Leadership{" "}
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
              The core values and beliefs that guide our leadership philosophy at Xortcut. 
              These principles shape how we build, lead, and grow together as we revolutionize career guidance through AI.
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
                href="/careers"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-lg"
              >
                Join Our Team
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
                  What Does It Mean to Lead at Xortcut?
                </h2>
                <p className="text-lg lg:text-xl text-white/70 leading-relaxed font-light">
                  We're on a mission to transform how students discover and pursue their career paths through AI-powered guidance. Leadership at Xortcut means empowering the next generation while building a culture of excellence, innovation, and belonging.
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
              Our Core Principles
            </h2>
            <p className="text-lg lg:text-xl text-white/70 font-light">
              The foundation of everything we do
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
                  Ready to Lead with Us?
                </h2>
                <p className="text-lg lg:text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                  Join our mission to revolutionize career guidance and help millions of students discover their potential.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/careers"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-lg"
                  >
                    Explore Opportunities
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
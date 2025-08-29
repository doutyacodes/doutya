"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useMemo } from "react";
import { SparklesIcon, MapPinIcon, ClockIcon, BriefcaseIcon, UserGroupIcon, CodeBracketIcon, PaintBrushIcon, ChartBarIcon, MegaphoneIcon, CogIcon, HeartIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import Image from "next/image";
import Link from "next/link";

const CareersPage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
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

  // Comprehensive job openings data
  const jobOpenings = [
    {
      id: 1,
      title: "Senior AI/ML Engineer",
      department: "Engineering",
      location: "Bangalore",
      type: "Full-time",
      experience: "3-5 years",
      description: "Build and scale AI models that power career assessments for millions of students across India.",
      requirements: ["Python", "TensorFlow", "PyTorch", "MLOps", "AWS"],
      icon: CodeBracketIcon,
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: 2,
      title: "Product Manager - Career Intelligence",
      department: "Product",
      location: "Mumbai",
      type: "Full-time",
      experience: "4-7 years",
      description: "Lead product strategy for our AI-powered career guidance platform, working directly with schools and students.",
      requirements: ["Product Strategy", "User Research", "Analytics", "EdTech", "B2B SaaS"],
      icon: ChartBarIcon,
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: 3,
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "2-4 years",
      description: "Develop scalable web applications that serve career guidance to students and institutions nationwide.",
      requirements: ["React", "Node.js", "Next.js", "PostgreSQL", "TypeScript"],
      icon: CodeBracketIcon,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 4,
      title: "UI/UX Designer",
      department: "Design",
      location: "Pune",
      type: "Full-time",
      experience: "2-5 years",
      description: "Design intuitive experiences for students, parents, and educators using our career guidance platform.",
      requirements: ["Figma", "User Research", "Prototyping", "Design Systems", "EdTech"],
      icon: PaintBrushIcon,
      color: "from-pink-500 to-red-500"
    },
    {
      id: 5,
      title: "Growth Marketing Manager",
      department: "Marketing",
      location: "Delhi",
      type: "Full-time",
      experience: "3-6 years",
      description: "Drive user acquisition and engagement for our AI-powered career guidance platform.",
      requirements: ["Digital Marketing", "Analytics", "SEO/SEM", "Content Marketing", "EdTech"],
      icon: MegaphoneIcon,
      color: "from-orange-500 to-yellow-500"
    },
    {
      id: 6,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Bangalore",
      type: "Full-time",
      experience: "3-5 years",
      description: "Build and maintain robust infrastructure to support our growing platform and AI workloads.",
      requirements: ["AWS", "Kubernetes", "Docker", "CI/CD", "Monitoring"],
      icon: CogIcon,
      color: "from-gray-500 to-slate-500"
    },
    {
      id: 7,
      title: "Data Scientist",
      department: "Data",
      location: "Hyderabad",
      type: "Full-time",
      experience: "2-4 years",
      description: "Analyze student career data to improve our AI models and generate insights for institutions.",
      requirements: ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization"],
      icon: ChartBarIcon,
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 8,
      title: "Business Development Manager",
      department: "Sales",
      location: "Mumbai",
      type: "Full-time",
      experience: "4-8 years",
      description: "Build partnerships with schools and colleges to implement our Career Guidance Cell nationwide.",
      requirements: ["B2B Sales", "EdTech", "Relationship Building", "Presentation Skills", "CRM"],
      icon: BriefcaseIcon,
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: 9,
      title: "Content Strategist",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      experience: "2-4 years",
      description: "Create compelling content that educates students, parents, and institutions about career guidance.",
      requirements: ["Content Writing", "SEO", "Social Media", "EdTech", "Research Skills"],
      icon: MegaphoneIcon,
      color: "from-teal-500 to-green-500"
    },
    {
      id: 10,
      title: "Customer Success Manager",
      department: "Success",
      location: "Chennai",
      type: "Full-time",
      experience: "3-6 years",
      description: "Ensure schools and colleges successfully implement and get value from our Career Guidance Cell.",
      requirements: ["Customer Success", "EdTech", "Project Management", "Communication", "Analytics"],
      icon: HeartIcon,
      color: "from-rose-500 to-pink-500"
    },
    {
      id: 11,
      title: "Frontend Developer - React",
      department: "Engineering",
      location: "Bangalore",
      type: "Full-time",
      experience: "1-3 years",
      description: "Build beautiful, responsive user interfaces for our career guidance platform.",
      requirements: ["React", "JavaScript", "CSS", "TypeScript", "Responsive Design"],
      icon: CodeBracketIcon,
      color: "from-violet-500 to-purple-500"
    },
    {
      id: 12,
      title: "HR Business Partner",
      department: "People",
      location: "Mumbai",
      type: "Full-time",
      experience: "5-8 years",
      description: "Support our growing team culture and help us scale our people operations.",
      requirements: ["HR Strategy", "Talent Acquisition", "Employee Relations", "Culture Building", "Startups"],
      icon: UserGroupIcon,
      color: "from-amber-500 to-orange-500"
    }
  ];

  const departments = ["all", "Engineering", "Product", "Design", "Marketing", "Data", "Sales", "Success", "People"];
  const locations = ["all", "Bangalore", "Mumbai", "Delhi", "Pune", "Remote", "Hyderabad", "Chennai"];

  const filteredJobs = useMemo(() => {
    return jobOpenings.filter(job => {
      const matchesDepartment = selectedDepartment === "all" || job.department === selectedDepartment;
      const matchesLocation = selectedLocation === "all" || job.location === selectedLocation;
      return matchesDepartment && matchesLocation;
    });
  }, [selectedDepartment, selectedLocation]);

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
                <span className="text-sm text-white/80 font-medium">Join Our Mission</span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl lg:text-5xl xl:text-6xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
            >
              Become a{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Xortian
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-base lg:text-lg text-white/70 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Join us in building India's missing educational infrastructure. Help millions of students discover their perfect career path with AI-powered guidance.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#open-positions"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-base"
              >
                View Open Positions
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#why-xortcut"
                className="px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-base"
              >
                Why Xortcut?
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  };

  const WhyXortcutSection = () => {
    const benefits = [
      {
        icon: RocketLaunchIcon,
        title: "Shape India's Future",
        description: "Work on technology that directly impacts millions of students' career decisions.",
        color: "from-blue-500 to-indigo-500"
      },
      {
        icon: HeartIcon,
        title: "Meaningful Work",
        description: "Every line of code, design, and strategy contributes to solving India's career guidance crisis.",
        color: "from-pink-500 to-red-500"
      },
      {
        icon: UserGroupIcon,
        title: "Amazing Team",
        description: "Work with passionate individuals who are building the future of education technology.",
        color: "from-emerald-500 to-teal-500"
      },
      {
        icon: SparklesIcon,
        title: "Cutting-Edge Tech",
        description: "Work with latest AI/ML technologies, proven by our success with Doutya platform.",
        color: "from-purple-500 to-pink-500"
      },
      {
        icon: ChartBarIcon,
        title: "Growth & Learning",
        description: "Rapid career growth in a fast-scaling EdTech startup with massive potential.",
        color: "from-orange-500 to-yellow-500"
      },
      {
        icon: BriefcaseIcon,
        title: "Great Benefits",
        description: "Competitive salary, equity, health insurance, flexible work, and learning budget.",
        color: "from-cyan-500 to-blue-500"
      }
    ];

    return (
      <SectionWrapper id="why-xortcut" className="bg-gradient-to-r from-slate-900/20 to-gray-900/20">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                Why Join Xortcut?
              </h2>
            </div>
            <p className="text-white/70 max-w-3xl mx-auto leading-relaxed text-base lg:text-lg">
              Be part of India's EdTech revolution. Help us build the Career Guidance Cell that every school needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {benefit.description}
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

  const OpenPositionsSection = () => {
    return (
      <SectionWrapper id="open-positions">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full" />
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                Open Positions
              </h2>
            </div>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed text-base lg:text-lg">
              Join our mission to revolutionize career guidance in India
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeInUp} className="mb-8 lg:mb-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex flex-wrap gap-2">
                <span className="text-white/60 text-sm font-medium mr-2">Department:</span>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedDepartment === dept
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-400/30'
                        : 'bg-white/[0.02] text-white/70 border border-white/10 hover:bg-white/[0.05] hover:text-white/90'
                    }`}
                  >
                    {dept === "all" ? "All" : dept}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center items-center mt-4">
              <span className="text-white/60 text-sm font-medium mr-2">Location:</span>
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedLocation === loc
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white border border-emerald-400/30'
                      : 'bg-white/[0.02] text-white/70 border border-white/10 hover:bg-white/[0.05] hover:text-white/90'
                  }`}
                >
                  {loc === "all" ? "All" : loc}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Job Listings */}
          <div className="grid gap-6 lg:gap-8">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => {
                const IconComponent = job.icon;
                return (
                  <motion.div
                    key={job.id}
                    variants={fadeInUp}
                    whileHover={{ y: -2 }}
                    className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6 lg:p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 bg-gradient-to-r ${job.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                            {job.title}
                          </h3>
                          <p className="text-white/70 text-sm mb-4 leading-relaxed">
                            {job.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <BriefcaseIcon className="w-4 h-4 text-purple-400" />
                              <span className="text-white/60 text-sm">{job.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="w-4 h-4 text-emerald-400" />
                              <span className="text-white/60 text-sm">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-blue-400" />
                              <span className="text-white/60 text-sm">{job.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserGroupIcon className="w-4 h-4 text-pink-400" />
                              <span className="text-white/60 text-sm">{job.experience}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.slice(0, 3).map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70 border border-white/20"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.requirements.length > 3 && (
                              <span className="px-2 py-1 text-xs text-white/50">
                                +{job.requirements.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                        >
                          Apply Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                variants={fadeInUp}
                className="text-center py-12 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-xl flex items-center justify-center">
                  <BriefcaseIcon className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white/80 mb-2">No positions found</h3>
                <p className="text-white/60 mb-6">Try adjusting your filters to see more opportunities</p>
                <button
                  onClick={() => {
                    setSelectedDepartment("all");
                    setSelectedLocation("all");
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
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
              Don't see the perfect role?
            </h3>
            <p className="text-base lg:text-lg text-white/70 mb-6 lg:mb-8 leading-relaxed">
              We're always looking for exceptional talent to join our mission. Send us your resume and tell us how you'd like to contribute to revolutionizing career guidance in India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:careers@xortcut.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 text-base"
              >
                📧 Send Your Resume
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-base"
              >
                🏢 Learn About Us
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
      <WhyXortcutSection />
      <OpenPositionsSection />
      <CTASection />

      <Footer />
    </main>
  );
};

export default CareersPage;
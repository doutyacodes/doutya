"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useMemo } from "react";
import { MagnifyingGlassIcon, ChevronDownIcon, SparklesIcon, AcademicCapIcon, UserGroupIcon, ShieldCheckIcon, RocketLaunchIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import faqData from "@/data/faq.json";

const FaqPage = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  const toggleExpanded = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = Object.entries(faqData);
    
    if (activeCategory !== "all") {
      filtered = filtered.filter(([categoryName]) => 
        categoryName.toLowerCase().includes(activeCategory)
      );
    }
    
    if (searchQuery) {
      filtered = filtered.map(([categoryName, questions]) => [
        categoryName,
        questions.filter(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ]).filter(([, questions]) => questions.length > 0);
    }
    
    return filtered;
  }, [searchQuery, activeCategory]);

  const categories = [
    { id: "all", name: "All Categories", icon: SparklesIcon, count: Object.values(faqData).flat().length },
    { id: "general", name: "General", icon: LightBulbIcon, count: faqData["General / Product FAQs"]?.length || 0 },
    { id: "parent", name: "Parents & Students", icon: UserGroupIcon, count: faqData["Parent / Student FAQs"]?.length || 0 },
    { id: "school", name: "Institutions", icon: AcademicCapIcon, count: faqData["School / College FAQs"]?.length || 0 },
    { id: "privacy", name: "Privacy", icon: ShieldCheckIcon, count: faqData["Privacy & Data FAQs"]?.length || 0 },
    { id: "vision", name: "Future", icon: RocketLaunchIcon, count: faqData["Vision / Future FAQs"]?.length || 0 },
  ];

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

  const AccordionItem = ({ question, answer, categoryIndex, itemIndex, delay = 0 }) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const isExpanded = expandedItems[key];

    return (
      <motion.div
        layout
        variants={fadeInUp}
        className="group relative bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden hover:border-white/20 transition-all duration-500 hover:bg-white/[0.04]"
        whileHover={{ y: -2 }}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <button
          onClick={() => toggleExpanded(categoryIndex, itemIndex)}
          className="w-full p-5 lg:p-6 text-left flex items-start justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-purple-400/30 rounded-xl transition-all duration-300"
        >
          <div className="flex-1">
            <h3 className="text-base lg:text-lg font-semibold text-white/90 group-hover:text-white transition-colors duration-300 leading-relaxed">
              {question}
            </h3>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-shrink-0 mt-1"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-300">
              <ChevronDownIcon className="w-4 h-4 text-white/60 group-hover:text-purple-300" />
            </div>
          </motion.div>
        </button>
        
        <motion.div
          initial={false}
          animate={{ 
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="overflow-hidden"
        >
          <div className="px-5 lg:px-6 pb-4 lg:pb-5">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 leading-relaxed text-sm lg:text-base whitespace-pre-line">
                {answer}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const CategorySection = ({ categoryName, questions, categoryIndex }) => {
    if (questions.length === 0) return null;
    
    return (
      <motion.div 
        layout
        variants={fadeInUp} 
        className="mb-12 lg:mb-20"
      >
        <motion.div 
          className="flex items-center gap-4 mb-8 lg:mb-12"
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-2 h-12 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {categoryName}
          </h2>
          {/* <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/60 font-medium">
            {questions.length} questions
          </span> */}
        </motion.div>
        
        <div className="grid gap-4 lg:gap-6">
          {questions.map((faq, index) => (
            <AccordionItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              categoryIndex={categoryIndex}
              itemIndex={index}
              delay={index * 0.05}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  const SearchAndFilter = () => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="mb-16 lg:mb-24"
      >
        {/* Search Bar */}
        <motion.div 
          variants={fadeInUp}
          className="relative max-w-2xl mx-auto mb-8 lg:mb-12"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-white/20 transition-all duration-300 text-lg"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-3 lg:gap-4"
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 lg:px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-400/30'
                    : 'bg-white/[0.02] text-white/70 border border-white/10 hover:bg-white/[0.05] hover:text-white/90 hover:border-white/20'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* <IconComponent className="w-4 h-4" /> */}
                <span className="text-sm lg:text-base">{category.name}</span>
                
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    );
  };

  const HeroSection = () => {
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
    
    return (
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24 lg:pt-32">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            style={{ y }}
            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-blue-900/20"
          />
          
          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
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
        
        <div className="relative z-10 container mx-auto px-4 lg:px-6 text-center">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="flex justify-center mb-6 lg:mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/10">
                <SparklesIcon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white/80 font-medium">Frequently Asked Questions</span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight tracking-tight"
            >
              Questions?
              <br className="hidden lg:block" />
              We have{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                answers
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg lg:text-xl text-white/70 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Everything you need to know about Xortcut's AI-powered career guidance platform. 
              Can't find what you're looking for? We're here to help.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#search"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-lg"
              >
                Browse FAQs
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="tel:+919876543210"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-lg"
              >
                Contact Support
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-x-hidden">
      <Header dark={true} />
      
      <HeroSection />
      
      {/* Main Content */}
      <section id="search" className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <SearchAndFilter />
          
          <motion.div 
            layout
            className="max-w-4xl mx-auto"
          >
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(([categoryName, questions], categoryIndex) => (
                <CategorySection
                  key={categoryIndex}
                  categoryName={categoryName}
                  questions={questions}
                  categoryIndex={categoryIndex}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 lg:py-24"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-2xl font-semibold text-white/80 mb-4">No results found</h3>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  We couldn't find any FAQs matching your search. Try adjusting your keywords or browse all categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors duration-200"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-purple-900/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:p-16"
          >
            <h3 className="text-3xl lg:text-5xl font-bold text-white mb-6 lg:mb-8">
              Still need help?
            </h3>
            <p className="text-lg lg:text-xl text-white/70 mb-8 lg:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Our team is ready to answer your questions and help you get started with Xortcut's career guidance platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="tel:+919876543210"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 text-lg"
              >
                📞 Schedule a Call
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 text-lg"
              >
                🚀 Get Started Now
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default FaqPage;

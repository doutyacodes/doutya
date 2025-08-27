"use client"
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import {
  FaBriefcase,
  FaInfoCircle,
  FaUserTie,
  FaBlog,
  FaPodcast,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaArrowUp
} from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
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

  const quickLinks = [
    { title: 'About', href: '/about', icon: <FaInfoCircle className="w-4 h-4" /> },
    { title: 'Careers', href: '/careers', icon: <FaBriefcase className="w-4 h-4" /> },
    { title: 'Leadership Principles', href: '/leadership-principles', icon: <FaUserTie className="w-4 h-4" /> },
    { title: 'Operating Principles', href: '/operating-principles', icon: <FaUserTie className="w-4 h-4" /> },
  ];

  const resources = [
    { title: 'Blog', href: '/blog', icon: <FaBlog className="w-4 h-4" /> },
    { title: 'Podcasts', href: '/podcasts', icon: <FaPodcast className="w-4 h-4" /> },
    { title: 'FAQ', href: '/faq' },
  ];

  const socialLinks = [
    { icon: <FaLinkedin />, href: '#', label: 'LinkedIn' },
    { icon: <FaTwitter />, href: '#', label: 'Twitter' },
    { icon: <FaInstagram />, href: '#', label: 'Instagram' },
    { icon: <FaYoutube />, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, purple 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.1 }}
          variants={staggerContainer}
          className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <div className="mb-6">
                <Image 
                  src="/assets/images/logo-full.png" 
                  width={150} 
                  height={50} 
                  alt="Xortcut Logo" 
                  className="h-10 sm:h-12 w-auto mb-4"
                />
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md">
                  AI-powered career guidance that helps students find the right path, 
                  reassures parents, and gives institutions complete career guidance solutions.
                </p>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p>AWHO, Whitefield - Hoskote Rd,</p>
                    <p>Whitefield, SV, Kannamangala,</p>
                    <p>Bengaluru, Karnataka 560067</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="w-4 h-4 text-emerald-400" />
                  <a href="mailto:hello@xortcut.com" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors">
                    hello@xortcut.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="w-4 h-4 text-emerald-400" />
                  <a href="tel:+919876543210" className="text-sm text-gray-300 hover:text-emerald-400 transition-colors">
                    +91 9876543210
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-lg font-bold text-white mb-4 sm:mb-6">Company</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="flex items-center space-x-2 text-sm text-gray-300 hover:text-purple-400 transition-colors duration-200 group"
                    >
                      <span className="text-purple-400 group-hover:scale-110 transition-transform">
                        {link.icon}
                      </span>
                      <span>{link.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-lg font-bold text-white mb-4 sm:mb-6">Resources</h3>
              <ul className="space-y-3">
                {resources.map((resource, index) => (
                  <li key={index}>
                    <Link 
                      href={resource.href}
                      className="flex items-center space-x-2 text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200 group"
                    >
                      {resource.icon && (
                        <span className="text-emerald-400 group-hover:scale-110 transition-transform">
                          {resource.icon}
                        </span>
                      )}
                      <span>{resource.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* CTA Section */}
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl border border-white/10">
                <h4 className="text-base font-semibold text-white mb-2">Ready to get started?</h4>
                <p className="text-sm text-gray-300 mb-4">Take your career test today</p>
                <Link
                  href="/login"
                  className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Footer */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, threshold: 0.1 }}
          variants={fadeInUp}
          className="border-t border-white/10"
        >
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400">
                  Copyright © {new Date().getFullYear()} Xortcut Inc. All rights reserved.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 hidden sm:block">Follow us:</span>
                <div className="flex space-x-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 bg-white/10 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Back to Top Button */}
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="Back to top"
              >
                <FaArrowUp className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
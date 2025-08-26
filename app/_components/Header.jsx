"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BsPersonWorkspace } from "react-icons/bs";
import { FaBlog, FaInfoCircle, FaPodcast, FaUserTie } from "react-icons/fa";
import { IoIosClose, IoIosMenu } from "react-icons/io";

const Header = ({ dark = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darks, setDarks] = useState(dark);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const pathname = usePathname();

  const companyData = [
    {
      title: "About",
      description: "Learn what binds us together at Xortcut",
      href: "/about",
      icon: <FaInfoCircle className="w-4 h-4 text-purple-400" />,
    },
    {
      title: "Leadership Principles",
      description: "What it means to lead at Xortcut",
      href: "/leadership-principles",
      icon: <FaUserTie className="w-4 h-4 text-purple-400" />,
    },
    {
      title: "Operating Principles",
      description: "The rules that drive our day to day",
      href: "/operating-principles",
      icon: <BsPersonWorkspace className="w-4 h-4 text-purple-400" />,
    },
  ];

  const resourceData = [
    {
      title: "Blog",
      description: "Latest insights and career guidance tips",
      href: "/blog",
      icon: <FaBlog className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: "Podcasts",
      description: "Expert discussions on career development",
      href: "/podcasts",
      icon: <FaPodcast className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const navItems = [
    {
      name: "Careers",
      href: "/careers",
      type: "link",
    },
    {
      name: "Resources",
      type: "dropdown",
      items: resourceData,
    },
    {
      name: "Company",
      type: "dropdown",
      items: companyData,
    },
    {
      name: "FAQ",
      href: "/faq",
      type: "link",
    },
  ];

  const DropdownMenu = ({ items, title }) => (
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen pt-2 hidden group-hover:block transition-opacity duration-300 z-50">
      <div className="bg-white/95 backdrop-blur-lg border border-white/20 shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group/item"
              >
                <Link
                  href={item.href}
                  className="block p-4 rounded-xl hover:bg-gray-50/80 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <h3 className="font-semibold text-gray-800 text-sm group-hover/item:text-purple-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MobileMenuItem = ({ item, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-gray-100 last:border-b-0"
    >
      {item.type === "link" ? (
        <Link
          href={item.href}
          onClick={() => setIsOpen(false)}
          className="block px-6 py-4 text-gray-700 hover:text-purple-600 hover:bg-gray-50 transition-colors duration-200"
        >
          {item.name}
        </Link>
      ) : (
        <div className="px-6 py-4">
          <div className="font-semibold text-gray-800 mb-3">{item.name}</div>
          <div className="space-y-2 pl-4">
            {item.items.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                href={subItem.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                {subItem.icon}
                <span>{subItem.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-lg shadow-xl border-b border-white/10"
          : darks
          ? "bg-transparent"
          : "bg-slate-900/90 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Link href="/">
              <Image
                src={
                  darks && !isScrolled
                    ? "/assets/images/doutya4.png"
                    : "/assets/images/logo-full.png"
                }
                width={240}
                height={80}
                alt="Xortcut Logo"
                className="h-16 sm:h-20 w-auto"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.type === "link" ? (
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-colors duration-200 hover:text-purple-400 ${
                      !darks || isScrolled ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <>
                    <button
                      className={`text-sm font-medium transition-colors duration-200 hover:text-purple-400 ${
                        !darks || isScrolled ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </button>
                    <DropdownMenu items={item.items} title={item.name} />
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Explore Now
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  !darks || isScrolled
                    ? "text-white hover:bg-white/10"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                {isOpen ? <IoIosClose size={24} /> : <IoIosMenu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-xl"
          >
            <div className="container mx-auto">
              <div className="py-4">
                {navItems.map((item, index) => (
                  <MobileMenuItem key={index} item={item} index={index} />
                ))}

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="px-6 py-4 border-t border-gray-200"
                >
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Explore Now
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;

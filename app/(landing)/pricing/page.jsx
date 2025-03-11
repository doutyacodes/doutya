"use client"
import Header from '@/app/_components/Header';
// pages/plans.js

import { motion } from 'framer-motion';

const plans = [
  {
    name: "Basic Plan",
    price: "Free",
    features: [
      "Access to core career suggestions",
      "Up to 2 career paths",
      "Guided self-discovery tools",
    ],
    bgColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    shadowColor: "shadow-blue-500/40",
  },
  {
    name: "Pro Plan",
    price: "₹99/month",
    features: [
      "Pro Certificate download",
      "Career suggestions across multiple countries",
      "Up to 5 career paths",
      "Custom career additions",
      "Detailed career feedback",
    ],
    bgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
    shadowColor: "shadow-yellow-500/40",
  },
];

const PlanCard = ({ plan }) => (
  <motion.div
    className={`relative ${plan.bgColor} text-white p-8 rounded-lg ${plan.shadowColor} shadow-lg hover:shadow-2xl transition-shadow duration-300`}
    whileHover={{ scale: 1.05 }}
  >
    <h2 className="text-3xl font-bold mb-4">{plan.name}</h2>
    <p className="text-2xl font-semibold mb-6">{plan.price}</p>
    <ul className="space-y-4 mb-8">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <span className="text-lg mr-2">✔️</span>
          <p>{feature}</p>
        </li>
      ))}
    </ul>
    <button className="bg-gray-900 px-6 py-3 rounded-md font-semibold shadow-lg hover:bg-gray-800 transition">
      {plan.name === "Pro Plan" ? "Get Pro" : "Get Started"}
    </button>
  </motion.div>
);

const PlansPage = () => {
  return (
    <div className="w-full">
        <Header />
    <div className="container mx-auto p-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-5xl font-bold text-center mb-12 text-white"
      >
        Choose Your Xortcut Plan
      </motion.h1>
      <div className="grid gap-10 md:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>

      {/* Features Details Section */}
      <section className="mt-16">
        <h2 className="text-4xl font-bold text-center mb-8 text-white">
          What’s Included
        </h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row gap-8 justify-center items-start text-gray-800"
        >
          <motion.div
            variants={{ visible: { opacity: 1, x: 0 }, hidden: { opacity: 0, x: -50 } }}
            transition={{ duration: 0.5 }}
            className="flex-1 bg-white p-8 rounded-lg shadow-lg min-h-[300px]"
          >
            <h3 className="text-2xl font-semibold mb-4">Basic Plan Features</h3>
            <ul className="list-disc ml-4 space-y-2">
              <li>Access to core career suggestions</li>
              <li>Up to 2 career paths</li>
              <li>Guided self-discovery tools</li>
            </ul>
          </motion.div>
          <motion.div
            variants={{ visible: { opacity: 1, x: 0 }, hidden: { opacity: 0, x: 50 } }}
            transition={{ duration: 0.5 }}
            className="flex-1 bg-white p-8 rounded-lg shadow-lg min-h-[300px]"
          >
            <h3 className="text-2xl font-semibold mb-4">Pro Plan Features</h3>
            <ul className="list-disc ml-4 space-y-2">
              <li>Pro Certificate download</li>
              <li>Career suggestions across multiple countries</li>
              <li>Up to 5 career paths</li>
              <li>Custom career additions</li>
              <li>Detailed career feedback</li>
            </ul>
          </motion.div>
        </motion.div>
      </section>
    </div>
    </div>
  );
};

export default PlansPage;

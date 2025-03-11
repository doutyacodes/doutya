"use client"
// components/FaqSection.js

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

// Full FAQ data
const faqData = {
  kids: [
    {
      question: "What is Xortcut Kids designed to do?",
      answer: "Parents: Xortcut Kids introduces younger children to self-discovery in a playful and engaging way, helping them learn about their interests, strengths, and foundational skills. This phase is more exploratory, using games, simple questions, and fun activities to highlight each child’s preferences.\n\nStudents: Xortcut Kids helps you find out what you enjoy and what you’re good at by letting you try out different fun activities! It’s like a game where you get to discover what makes you unique.",
    },
    {
      question: "How does Xortcut assess my child’s strengths and interests?",
      answer: "Parents: Xortcut uses age-appropriate quizzes, mini-projects, and interactive games that align with educational and cognitive psychology principles to help children explore different interests and strengths naturally.",
    },
    {
      question: "Will my child’s data be safe on Xortcut?",
      answer: "Parents: Absolutely. Xortcut ensures strict privacy and data protection, compliant with global standards. Information provided is only accessible to you and your child.",
    },
    {
      question: "What kind of activities can my child expect?",
      answer: "Students: You can expect fun activities like drawing, building simple things with blocks, or answering questions about things you like! Each activity helps you find out what you’re awesome at.",
    },
    {
      question: "Can my child’s progress on Xortcut Kids affect their career path later?",
      answer: "Parents: While Xortcut Kids is more focused on exploration than concrete guidance, these early interests and skills can provide foundational insights for future recommendations as they advance through other Xortcut age groups.",
    },
  ],
  junior: [
    {
      question: "What is the goal of Xortcut Junior?",
      answer: "Parents: Xortcut Junior builds on the initial exploration stage, offering more structured guidance. This stage introduces the concept of “passions” and “skills,” helping pre-teens understand their potential and identify emerging interests.\n\nStudents: Xortcut Junior helps you understand what you’re good at and what you enjoy doing. It’s a great way to see what hobbies or interests you might like to follow as you grow up!",
    },
    {
      question: "How are strengths and interests evaluated for Junior students?",
      answer: "Parents: Through in-depth assessments, including quizzes, personality analyses, and challenge-based tasks, Xortcut identifies core skills and interests. Junior students can also start setting basic goals and exploring potential career ideas in an age-appropriate way.",
    },
    {
      question: "What are the benefits of Xortcut Junior for my child’s development?",
      answer: "Parents: By starting to engage with concepts like strengths, skills, and early career interests, children at this age build self-confidence, understand more about their potential, and gain insights into various fields.",
    },
    {
      question: "What kind of tests and challenges are included?",
      answer: "Students: You’ll find quizzes and challenges, like solving fun puzzles, creating mini-projects, or learning about different kinds of jobs. These are fun and designed to show you more about what you like.",
    },
    {
      question: "How can Xortcut Junior support my child’s academic journey?",
      answer: "Parents: By aligning interests with subjects, Xortcut helps students see the relevance of their academic work. For example, a child who enjoys creative tasks may be encouraged to pursue subjects like art or design.",
    },
    {
      question: "Is there any parental involvement needed?",
      answer: "Parents: Xortcut provides insights and results from the assessments that parents can review. Encouraging children to complete their challenges and discussing results helps reinforce their learning and development.",
    },
  ],
  senior: [
    {
      question: "What’s the objective of Xortcut Senior?",
      answer: "Parents: Xortcut Senior is designed to offer serious, future-focused guidance. Here, teens start narrowing down their interests to potential career paths. The program includes in-depth assessments, real-world challenges, and milestone tracking to give students a realistic sense of their career options.\n\nStudents: Xortcut Senior helps you find the best career paths that fit with what you like and what you’re good at. You get real advice and tips on how to work toward your dream career step by step.",
    },
    {
      question: "How does Xortcut help seniors identify their career path?",
      answer: "Parents: The Senior group includes more advanced tests, aptitude assessments, and real-world simulations that allow teens to experience different career options. Xortcut then suggests actionable steps to reach those goals, such as internships, projects, or relevant courses.",
    },
    {
      question: "Can Xortcut help my teen choose a college or course stream?",
      answer: "Parents: Yes, Xortcut offers tailored suggestions based on identified strengths and interests, recommending relevant subjects, degree programs, and even colleges that align with their career ambitions.",
    },
    {
      question: "How does Xortcut track milestones and progress?",
      answer: "Students: Xortcut sets you up with milestones or goals based on what you want to achieve in your career. As you complete them, you see your progress, which keeps you motivated and lets you know you’re on the right track.",
    },
    {
      question: "Is there any interaction with mentors or industry professionals?",
      answer: "Parents: Xortcut Senior includes optional mentorship opportunities, connecting students with professionals in their field of interest. These interactions provide real-world insights and guidance, helping students refine their choices.",
    },
    {
      question: "What if my child changes their mind about their chosen path?",
      answer: "Parents: Xortcut is designed to be flexible. While it helps students identify and pursue a chosen path, it also allows them to explore other options.",
    },
  ],
};

const FaqSection = ({ data }) => (
  <div>
    {data.map((item, index) => (
      <FaqItem key={index} question={item.question} answer={item.answer} />
    ))}
  </div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg p-4 mb-4"
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center cursor-pointer"
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} className="text-xl">
          <FaPlus />
        </motion.div>
      </div>
      {isOpen && (
        <motion.p
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2 text-gray-700"
        >
          {answer}
        </motion.p>
      )}
    </motion.div>
  );
};

const FAQ = () => {
  const [selectedTab, setSelectedTab] = useState('kids');

  const tabCategories = {
    kids: 'Xortcut Kids',
    junior: 'Xortcut Junior',
    senior: 'Xortcut Senior',
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
      <div className="flex justify-center max-md:flex-col gap-5 mb-8">
        {Object.keys(tabCategories).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`text-xl font-semibold px-4 py-2 rounded-lg ${
              selectedTab === tab ? 'bg-[#3e0075] text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {tabCategories[tab]}
          </button>
        ))}
      </div>
      <div className="w-full h-full"> 
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FaqSection data={faqData[selectedTab]} />
      </motion.div>
      </div>
    </div>
  );
};

export default FAQ;

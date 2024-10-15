"use client"
import React from 'react';
import Footer from '@/app/_components/Footer';
import Header from '@/app/_components/Header';

const BlogPage = () => {
  // Blog data
  const blog = {
    title: 'The Birth of Xortlist: A New Era in Career Guidance',
    author: 'By Kiran Roice',
    content: [
      `As I sit down to reflect on the journey that led to the creation of Xortlist, I am filled with gratitude and excitement for what lies ahead. This journey began with a simple realization: the traditional methods of career guidance were no longer sufficient for the challenges faced by today's youth.`,
      `For years, I worked in various roles within the corporate sector, where I had the privilege of meeting and interviewing countless aspiring candidates. Over time, I conducted interviews with nearly 3,000 young individuals, each one brimming with potential and ambition. However, what struck me the most was the overwhelming sense of confusion and uncertainty that many of them experienced.`,
      `Despite their talents, so many young people were unsure of their strengths and what truly ignited their passions. They felt pressured to conform to conventional career paths, often led astray by misleading advice that resulted in poor decisions. I saw firsthand how this confusion could derail promising futures, leaving candidates with ill-suited degrees and limited opportunities. It was disheartening to witness the potential of these young minds going untapped, and it sparked something within me.`,
      `In that moment of reflection, I realized that there was a pressing need for a new approach to career guidance—one that was personalized, intuitive, and powered by technology. I envisioned a platform that would not only help individuals uncover their strengths and passions but also provide clear, actionable pathways to achieving their career goals.`,
      `Thus, the concept of Xortlist was born.`,
      `The journey to bring Xortlist to life was anything but easy. It took a dedicated team of passionate individuals, each committed to the vision of transforming career guidance. Shabeer, our lead developer, worked tirelessly, guiding our technical team with a relentless pursuit of excellence. Alongside him, our talented developers—Jino, Avni, Mrunal, Shristi, and Wachan—poured their hearts and souls into this project, often putting in sleepless nights to ensure that every detail was perfect.`,
      `Together, we faced numerous challenges, from designing an intuitive user interface to developing advanced AI algorithms that would analyze individual strengths and interests effectively. Each team member brought their unique skills and perspectives, collaborating seamlessly to overcome obstacles and refine our platform. Their hard work and dedication were instrumental in shaping Xortlist into what it is today.`,
      `After months of brainstorming, development, and testing, we launched Xortlist with a simple yet powerful vision: to empower young individuals to take control of their career journeys. Our platform not only provides personalized career recommendations but also creates actionable roadmaps to guide users every step of the way. Through milestone tracking and real-time feedback, we aim to inspire confidence and clarity in their pursuits.`,
      `As we celebrate the launch of Xortlist, I am reminded that this is just the beginning. Our journey is about creating a supportive community that fosters growth, exploration, and achievement. We are committed to continuously improving our platform and adapting to the evolving needs of the next generation.`,
      `To all the young dreamers out there: Xortlist is here for you. We are excited to accompany you on your career journey, illuminating the paths that lead to your dreams. Together, let’s redefine career guidance and make your aspirations a reality.`,
      `Thank you for joining us on this adventure!`,
      `With excitement,`,
      `Kiran Roice`,
      `CEO, Xortlist`
    ]
  };

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Header */}
      <Header dark={true} />

      {/* Blog content section */}
      <div className="container mx-auto py-10 px-4 lg:px-0">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-6 animate-fadeInUp">
          {blog.title}
        </h1>
        <p className="text-center text-gray-500 italic mb-6 animate-fadeIn">
          {blog.author}
        </p>
        
        <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed text-gray-700">
          {blog.content.map((paragraph, index) => (
            <p key={index} className="animate-fadeIn">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Animation styles */}
      <style jsx>{`
        .animate-fadeIn {
          opacity: 0;
          animation: fadeIn 1s ease-in-out forwards;
        }
        .animate-fadeInUp {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 1s ease-in-out forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default BlogPage;

"use client";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import Link from "next/link";

const BlogPage = () => {
  const blog = {
    title: "The Birth of Xortlist: A New Era in Career Guidance",
    author: "Kiran Roice",
    date: "12 October, 2024",
    image: "https://images.pexels.com/photos/3184290/pexels-photo-3184290.jpeg",
    content: `
      As I sit down to reflect on the journey that led to the creation of Xortlist, I am filled with gratitude and excitement for what lies ahead. This journey began with a simple realization: the traditional methods of career guidance were no longer sufficient for the challenges faced by today's youth. 
      
      For years, I worked in various roles within the corporate sector, where I had the privilege of meeting and interviewing countless aspiring candidates. Over time, I conducted interviews with nearly 3,000 young individuals, each one brimming with potential and ambition. However, what struck me the most was the overwhelming sense of confusion and uncertainty that many of them experienced.
      
     Despite their talents, so many young people were unsure of their strengths and what truly ignited their passions. They felt pressured to conform to conventional career paths, often led astray by misleading advice that resulted in poor decisions. I saw firsthand how this confusion could derail promising futures, leaving candidates with ill-suited degrees and limited opportunities. It was disheartening to witness the potential of these young minds going untapped, and it sparked something within me.

     In that moment of reflection, I realized that there was a pressing need for a new approach to career guidance—one that was personalized, intuitive, and powered by technology. I envisioned a platform that would not only help individuals uncover their strengths and passions but also provide clear, actionable pathways to achieving their career goals.

     Thus, the concept of Xortlist was born.

      The journey to bring Xortlist to life was anything but easy. It took a dedicated team of passionate individuals, each committed to the vision of transforming career guidance. Shabeer, our lead developer, worked tirelessly, guiding our technical team with a relentless pursuit of excellence. Alongside him, our talented developers—Jino, Avni, Mrunal, Shristi, and Wachan—poured their hearts and souls into this project, often putting in sleepless nights to ensure that every detail was perfect.

      
    Together, we faced numerous challenges, from designing an intuitive user interface to developing advanced AI algorithms that would analyze individual strengths and interests effectively. Each team member brought their unique skills and perspectives, collaborating seamlessly to overcome obstacles and refine our platform. Their hard work and dedication were instrumental in shaping Xortlist into what it is today.

      After months of brainstorming, development, and testing, we launched Xortlist with a simple yet powerful vision: to empower young individuals to take control of their career journeys. Our platform not only provides personalized career recommendations but also creates actionable roadmaps to guide users every step of the way. Through milestone tracking and real-time feedback, we aim to inspire confidence and clarity in their pursuits.

     As we celebrate the launch of Xortlist, I am reminded that this is just the beginning. Our journey is about creating a supportive community that fosters growth, exploration, and achievement. We are committed to continuously improving our platform and adapting to the evolving needs of the next generation.

     To all the young dreamers out there: Xortlist is here for you. We are excited to accompany you on your career journey, illuminating the paths that lead to your dreams. Together, let’s redefine career guidance and make your aspirations a reality.

    `,
  };

  return (
    <div className="w-full bg-[#f5f7fa] min-h-screen">
      <Header dark={true} />
      <div className="container mx-auto p-6 space-y-10">
        {/* Blog Header */}
        <div className="w-full text-center space-y-5">
          <h1 className="text-4xl font-extrabold text-gray-800">
            {blog.title}
          </h1>
          <p className="text-md text-gray-500">By {blog.author}</p>
          <p className="text-md text-gray-400">{blog.date}</p>
        </div>

        {/* Image Section */}
        <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={blog.image}
            alt="Xortlist Blog Image"
            fill
            objectFit="cover"
            className="transform hover:scale-105 transition duration-500 ease-in-out"
          />
        </div>

        {/* Blog Content */}
        <div className="prose lg:prose-xl  mx-auto text-gray-700 leading-8">
          {blog.content.split("\n").map((paragraph, index) => (
            <p key={index} className="animate-fadeIn">
              {paragraph.trim()}
            </p>
          ))}
        </div>

        {/* Call to Action */}
        <div className="flex justify-center mt-10">
          <Link
            href={"/"}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-lg font-semibold shadow-md transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Discover More at Xortlist
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;

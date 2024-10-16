import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import Image from "next/image";
import React from "react";

const page = () => {
  const data = {
    sections: [
      {
        title: "Customer Service",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "hexagon",
        color: "bg-yellow-500",
      },
      {
        title: "Diversity",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "hexagon",
        color: "bg-teal-500",
      },
      {
        title: "Trust",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "rectangle",
        color: "bg-blue-500",
      },
      {
        title: "Innovation",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "rectangle",
        color: "bg-pink-500",
      },
    ],
  };
  const getShapeClass = (shape) => {
    switch (shape) {
      case "hexagon":
        return "hexagon-shape";
      case "rectangle":
        return "rectangle-shape";
      default:
        return "";
    }
  };
  const content = `After interviewing nearly 3,000 candidates over 15 years, Kiran Roice, founder and CEO of Xortlist, had witnessed the struggles many young individuals faced. Each interview revealed a common theme: despite their talent and ambition, most of the students felt lost, overwhelmed, and uncertain about their future career paths. Many candidates were unaware of their strengths or true passions. Even when they believed they had found their calling, they were uncertain how to pursue it or if it was even achievable. It was disheartening to see so much potential overshadowed by a lack of clarity and direction. Too often, they succumbed to misleading advice, leading them down unproductive paths and resulting in poor choices, such as dropping out of programs or graduating with ill-suited degrees. 

He listened as candidates expressed their frustrations—feeling pressured to conform to traditional roles, paralyzed by an overwhelming variety of options, and hopeless due to a lack of guidance. This desperate search for clarity in an increasingly complex world became a recurring theme. Inspired by these conversations, he recognized the inadequacy of traditional career guidance methods. The one-size-fits-all approach simply wasn’t sufficient. Young people needed a personalized, intuitive platform that not only suggested potential career paths but also guided them through the entire journey.

Drawing from his experiences and insights from countless interviews, Kiran envisioned Xortlist. This platform would harness AI technology to analyze individual strengths and interests, offering tailored career suggestions that resonate with each unique personality. He understood that empowering youth required not just suggestions, but also actionable roadmaps to help them achieve their goals.

Thus, Xortlist was born out of a passion for helping others, driven by the belief that everyone deserves the chance to pursue a fulfilling career. Committed to supporting young people at every step of their career journeys, Kiran and the team at Xortlist aimed to create an innovative platform where users could explore diverse career options, set achievable milestones, and receive real-time feedback—all designed to inspire confidence and clarity.

Today, Xortlist stands as a beacon of hope for the next generation, transforming how young people view their futures. We remain steadfast in the mission to illuminate paths to success, inspire dreams, and help youth thrive in a world full of possibilities.  Kiran’s journey from interviewing thousands of aspirants to launching this groundbreaking platform embodies the essence of Xortlist: a commitment to fostering clarity, direction, empowerment for every individual and redefining career guidance — one dream at a time.`;

  return (
    <main className="relative w-full ">
        <Header />
      <div className=" md:min-h-screen bg-[#3e0075] py-4">

        <div className=" md:min-h-screen  py-4">
          <div className="container mx-auto px-3">
            <div className="flex max-md:flex-col w-full pt-5">
              <div className="w-full space-y-1 flex flex-col justify-center">
                <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center mb-4">
                  The Story of Xortlist: A Vision Born from Experience
                </h1>

                <>
                  {content.split("\n").map((paragraph, index) => (
                    <div className="prose lg:prose-xl  mx-auto text-white leading-8">
                      <p key={index}>{paragraph.trim()}</p>
                    </div>
                  ))}
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default page;

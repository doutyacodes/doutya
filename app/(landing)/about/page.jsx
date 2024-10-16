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
        shape: "hexagon",
        color: "bg-blue-500",
      },
      {
        title: "Innovation",
        image:
          "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
        shape: "hexagon",
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
  return (
    <main className="relative w-full ">
      <div className=" md:min-h-screen bg-[#3e0075] py-4">
        <Header />
          {/* <div className="  bg-[#1d0254] py-4">
            <div className="container mx-auto px-3">
              <div className="flex max-md:flex-col w-full pt-5">
                <div className="w-full space-y-5 flex flex-col justify-center">
                  <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center">
                    About Us
                  </h1>

                  <>
                    <p className="text-white font-medium text-sm text-justify tracking-wide">
                      At Xortlist, we are dedicated to revolutionizing career
                      guidance for the next generation. Our innovative platform
                      leverages advanced AI technology to analyze individual
                      strengths and interests, providing personalized career
                      suggestions that align with each user’s unique
                      personality. With a diverse database of career
                      options—ranging from traditional to trending and offbeat
                      paths—Xortlist empowers young people to explore a variety
                      of opportunities. Our actionable roadmaps guide users
                      every step of the way, offering milestone tracking and
                      real-time feedback to inspire confidence and clarity in
                      their career journeys. Join us as we help you discover and
                      achieve a fulfilling career that resonates
                      with your passions!
                    </p>
                  </>
                </div>
              </div>
            </div>
          </div> */}
        <div className="container mx-auto px-3">
          <div className="flex max-md:flex-col w-full pt-5">
            <div className="w-full space-y-5 flex flex-col justify-center">
              <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center">
                WE ARE XORTLIST
              </h1>
              <h6 className="text-white font-medium text-sm max-md:text-center">
                At Xortlist, our mission is to empower individuals to discover
                their unique strengths and passions through personalized career
                guidance. We leverage advanced AI technology to provide tailored
                career suggestions and actionable roadmaps, ensuring that every
                user can confidently navigate their journey towards a fulfilling
                and successful career. We strive to illuminate pathways that
                inspire clarity, direction, and hope for the future,
                transforming how young people approach their careers.
              </h6>
            </div>
            <Image src={"/assets/images/about.svg"} width={800} height={800} />
          </div>
        </div>
        <div className="container mx-auto px-3 mt-6">
          <div className="flex flex-row-reverse max-md:flex-col w-full pt-5">
            <div className="w-full space-y-5 flex flex-col justify-center">
              <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center">
                ABOUT XORTLIST
              </h1>
              <h6 className="text-white font-medium text-sm max-md:text-center">
              At Xortlist, we are dedicated to revolutionizing career guidance for the next generation. Our innovative platform leverages advanced AI technology to analyze individual strengths and interests, providing personalized career suggestions that align with each user’s unique personality. With a diverse database of career options—ranging from traditional to trending and offbeat paths—Xortlist empowers young people to explore a variety of opportunities. Our actionable roadmaps guide users every step of the way, offering milestone tracking and real-time feedback to inspire confidence and clarity in their career journeys. Join us as we help you discover and achieve a fulfilling career that resonates with your passions!
              </h6>
            </div>
            <Image src={"/assets/images/about.svg"} width={800} height={800} />
          </div>
        </div>
      </div>

   
      <div className=" bg-white px-4 mx-auto py-10">
        <div className="container px-4 mx-auto py-10">
          <div className="grid grid-cols-12 gap-6">
            {data.sections.map((section, index) => (
              <div
                key={index}
                className="flex col-span-6 flex-col items-center"
              >
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-40 md:h-[50vh] object-cover rounded-lg mb-4"
                />
                <div
                  className={`relative px-4 py-2 rounded-md flex justify-center items-center ${
                    section.color
                  } ${getShapeClass(section.shape)}`}
                >
                  <h3 className="text-white font-bold text-center">
                    {section.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default page;

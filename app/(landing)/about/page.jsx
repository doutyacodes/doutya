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
      </div>

      <div className=" md:min-h-screen bg-[#1d0254] py-4">
        <div className="container mx-auto px-3">
          <div className="flex max-md:flex-col w-full pt-5">
            <div className="w-full space-y-5 flex flex-col justify-center">
              <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center">
                The Story of Xortlist: A Vision Born from Experience
              </h1>

              <>
                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  In a world bursting with opportunities yet riddled with
                  confusion, Kiran Roice, the founder and CEO of Xortlist,
                  embarked on a journey to transform how young people approach
                  their careers. Having spent years in the corporate landscape,
                  Kiran was no stranger to the challenges faced by aspiring
                  professionals. However, it wasn’t until a pivotal moment that
                  the idea for Xortlist took root.
                </p>

                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  After conducting job interviews with nearly 3,000 aspiring
                  candidates, over a span of a decade, Kiran witnessed firsthand
                  the struggles many young individuals faced. It was
                  disheartening to see so much potential overshadowed by a lack
                  of clarity and direction. Each interview revealed a common
                  thread: despite their talent and ambition, many young people
                  felt lost, overwhelmed, and uncertain about their future
                  career paths.
                </p>

                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  Many of these candidates didn’t even know what their strengths
                  were or where their passions truly lay. Even when they
                  believed they had found their calling, they were unsure how to
                  pursue it, or if it was achievable at all. Too often, they
                  fell prey to misleading and fraudulent advice, which led them
                  down the wrong career paths—resulting in poor choices that
                  left them dropping out of programs or graduating with
                  ill-suited degrees and limited opportunities.
                </p>

                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  Kiran listened as candidates shared their frustrations—how
                  they felt pressured to conform to traditional roles, how the
                  overwhelming variety of options left them paralyzed, and how
                  the lack of guidance left them feeling hopeless about their
                  futures. It was a recurring theme: a desperate search for
                  clarity and direction in an increasingly complex world.
                </p>
                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  Inspired by these conversations, Kiran realized that the
                  traditional methods of career guidance were inadequate. The
                  one-size-fits-all approach simply wasn’t cutting it. Young
                  people needed something more—a personalized, intuitive
                  platform that not only suggested potential career paths but
                  also guided them through the entire journey.
                </p>
                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  Drawing from their own experiences and the insights gained
                  from countless interviews, Kiran began to envision Xortlist.
                  They envisioned a platform that harnessed the power of AI
                  technology to analyze individual strengths and interests,
                  offering tailored career suggestions that resonate with each
                  unique personality. Kiran knew that to empower the youth, the
                  platform needed to provide not just suggestions but also
                  actionable roadmaps to help them achieve their goals.
                </p>
                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  Thus, Xortlist was born out of a passion for helping others,
                  fueled by the belief that every individual deserves the chance
                  to pursue a fulfilling career. With a commitment to supporting
                  young people through every step of their career journeys,
                  Kiran and the team at Xortlist set out to create an innovative
                  platform where users could explore diverse career options, set
                  achievable milestones, and receive real-time feedback—all
                  designed to inspire confidence and clarity.
                </p>
                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  Today, Xortlist stands as a beacon of hope for the next
                  generation, transforming the way young people view their
                  futures. Kiran’s journey from interviewing thousands of
                  aspirants to launching a groundbreaking platform embodies the
                  essence of Xortlist: a commitment to fostering clarity,
                  direction, and empowerment for every individual.
                </p>
                <p className="text-white font-medium text-sm text-justify tracking-wide">
                  As Xortlist continues to evolve, Kiran remains steadfast in
                  their mission: to illuminate paths to success, inspire dreams,
                  and ultimately help the youth thrive in a world full of
                  possibilities. Together, with the support of advanced AI and a
                  compassionate community, Xortlist is redefining career
                  guidance—one dream at a time.
                </p>
              </>
            </div>
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

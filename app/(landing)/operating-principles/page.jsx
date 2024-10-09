import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { Blend } from "lucide-react";
import Image from "next/image";
import React from "react";

const Principle = () => {
  const principles = [
    {
      id: 1,
      title: "INSIST ON GREAT TALENT",
      description:
        "Only with excellent people can Xortlist be successful in the long run. We’d rather grow slower than lower the bar for hiring and maintaining exceptional talent. Ideally we are looking for people who are as good if not better than us.",
    },
    {
      id: 2,
      title: "CULTIVATE BELONGING AND DIVERSITY",
      description:
        "Our responsibility transcends hitting our goals and KPIs. We know that Xortlist—and the world—will be a better place when people from diverse backgrounds, races, genders, cultures, sexual orientations, ages, and experiences thrive. We work hard to ensure that everyone feels they belong at Xortlist and make the extra effort to bring them in.",
    },
    {
      id: 3,
      title: "EMPOWER YOUR TEAM",
      description:
        "We hire, grow, and nurture great people so they can do great things at Xortlist. We provide our teams with direction and context, then trust and empower them to make it happen. Part of empowering your team is understanding that we all make mistakes. We see mistakes as opportunities for learning and development.",
    },
    {
      id: 4,
      title: "SHARE. A LOT.",
      description:
        "Without information and context, Gongsters can’t make decisions and achieve great results. We promote a culture of open information sharing and encourage our teams to communicate transparently across the organization. We err on the side of over-sharing and communicate frequently and clearly to our teams and to our own leadership.",
    },
    {
      id: 5,
      title: "ENCOURAGE DEBATE",
      description:
        "We don’t have all the answers. With great people by our side, we listen intently and encourage them to express their ideas and opinions, especially when they are different from our own. We celebrate and encourage their feedback. We don’t make decisions by committee, yet we are genuinely interested in hearing a diverse set of views prior to making a decision.",
    },
    {
      id: 6,
      title: "DEVELOP AND GROW",
      description:
        "One of our core responsibilities is to mentor and coach our team members. We take time to develop and grow successful Gongsters and take pride in their success, even if it materializes in other teams or even other companies.",
    },
    {
      id: 7,
      title: "Go Big",
      description:
        "We set ambitious goals that feel uncomfortable and are hard to achieve. We are aware we may not fully achieve them, but we’d rather strive for great things than take the easy route. We’re willing to take calculated risks to yield those big outcomes and experiment with new ideas so we can make Xortlist exceptional.",
    },
    {
      id: 8,
      title: "WE ARE ALL TEAM XORTLIST",
      description:
        "We’re all part of the same team—Team Xortlist. Xortlist’s long-term success will be determined by collaboration between teams. We won’t get there by narrowly focusing on our own team goals. Instead, we operate as one team to help us win.",
    },
    {
      id: 9,
      title: "MAKE TOUGH CALLS",
      description:
        "As leaders, we’re often required to make uncomfortable decisions that may make us or others around us unhappy. Letting inertia guide us or following the path of least resistance may be easier in the short term, but will not get us to where we need to be. Instead, we act swiftly and decisively, making the best choice for Xortlist.",
    },
    {
      id: 10,
      title: "NO ROYALTY",
      description:
        "Leadership is about responsibility, not superiority. We all play an important role in Xortlist’s success. We act humbly and modestly, serving our team members, and building relationships as humans regardless of our titles.",
    },
    {
      id: 11,
      title: "HONE YOUR CRAFT",
      description:
        "We aim to build one of the world’s best companies. We aim not only to grow bigger, but keep getting better at most things we do. This means to continuously improve and be the best at our craft, both within our area of expertise and as leaders. We learn from the best, encourage those who strive to excel, and help our teams achieve higher standards.",
    },
  ];
  const renderprincipleGrid = () => {
    return principles.map((principle, index) => (
      <div
        key={index}
        className="relative p-4 border group rounded-xl min-h-[50vh] md:min-h-[70vh] bg-white shadow-xl overflow-hidden shadow-[#f5edff]"
      >
        <div className="text-red-600 my-4">
          <Blend />
        </div>
        <div className="">
          <p className="text-[#3e0075] text-2xl font-extrabold tracking-tighter bg-white py-[1px] px-2 rounded-full ">
            {principle.title}
          </p>
        </div>
        <h3 className="text-sm font-medium mt-7 text-[#3e0075]">
          {principle.description}
        </h3>
        <div className="absolute top-4 right-5 ">
          <p className="text-slate-700/20 text-9xl font-extrabold">{principle.id}</p>
        </div>
      </div>
    ));
  };
  return (
    <main className="relative w-full bg-white">
      <div className=" md:min-h-screen bg-[#3e0075] py-4">
      <Header />
      <div className="max-w-[1200px] mx-auto px-3">
          <div className="flex max-md:flex-col w-full pt-5">
            <div className="w-full space-y-10 flex flex-col justify-center">
              <h1 className="text-white text-6xl max-md:text-4xl font-bold max-md:text-center">
                WE ARE XORTLIST
              </h1>
              <h6 className="text-white font-medium text-sm max-md:text-center">
                We’re on a mission to help companies transform their revenue
                organizations by harnessing customer interactions to increase
                business efficiency, improve decision-making and accelerate
                revenue growth.
              </h6>
            </div>
            <Image
              src={"/assets/images/about.svg"}
              className="max-md:mt-10"
              width={800}
              height={800}
            />
          </div>
        </div>
      </div>
      <div className="bg-[#f5edff]">
        <div className="max-w-[1200px] py-5 mx-auto px-3">
          <div className="w-full space-y-10 flex flex-col justify-center">
            <h1 className="text-[#3e0075] text-4xl font-bold max-md:text-center">
              WHAT DOES IT MEAN TO LEAD AT XORTLIST?
            </h1>
            <h6 className="text-[#3e0075] font-medium text-sm max-md:text-center">
              We’re on a mission to help companies transform their revenue
              organizations by harnessing customer interactions to increase
              business efficiency, improve decision-making and accelerate
              revenue growth.
            </h6>
          </div>
        </div>
      </div>

      <div className="bg-[#fefdfe]">
        <div className="max-w-[1200px] py-5 mx-auto px-3">
          <div className="grid grid-cols-1  md:grid-cols-3  gap-6 mt-10">
            {renderprincipleGrid()}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Principle;

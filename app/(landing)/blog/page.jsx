import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const page = () => {
  const featured = [
    {
      id: 1,
      tag: "Technology",
      title: "The Future of AI in Everyday Life",
      created_date: "2024-10-04",
      image: "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
    },
    {
      id: 2,
      tag: "Health",
      title: "How Technology is Revolutionizing Healthcare",
      created_date: "2024-09-25",
      image: "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
    },
    {
      id: 3,
      tag: "Education",
      title: "The Impact of Online Learning Platforms",
      created_date: "2024-09-15",
      image: "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
    },
  ];
  const fullData = [
    {
      tag: "Technology",
      blogs: [
        {
          id: 1,
          title: "The Future of AI in Everyday Life",
          created_date: "2024-10-04",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "Discover how artificial intelligence is transforming our daily lives and what the future holds.",
        },
        {
          id: 2,
          title: "Top 10 Emerging Tech Trends in 2024",
          created_date: "2024-09-28",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "A look at the top tech trends that are set to revolutionize industries across the globe.",
        },
        {
          id: 3,
          title: "How 5G is Changing the Digital Landscape",
          created_date: "2024-09-15",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "An in-depth exploration of how 5G is enhancing connectivity and digital experiences.",
        },
      ],
    },
    {
      tag: "Health",
      blogs: [
        {
          id: 4,
          title: "How Technology is Revolutionizing Healthcare",
          created_date: "2024-09-25",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "Learn about the latest innovations in health tech and how they are transforming patient care.",
        },
        {
          id: 5,
          title: "Telemedicine: The Future of Healthcare?",
          created_date: "2024-09-10",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "Exploring the rise of telemedicine and its potential to reshape healthcare services.",
        },
        {
          id: 6,
          title: "Wearable Health Tech: A New Era of Fitness",
          created_date: "2024-09-05",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "How wearable devices are helping people monitor their health and stay fit in real-time.",
        },
      ],
    },
    {
      tag: "Education",
      blogs: [
        {
          id: 7,
          title: "The Impact of Online Learning Platforms",
          created_date: "2024-09-15",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "An overview of how digital platforms are transforming traditional education systems.",
        },
        {
          id: 8,
          title: "The Rise of AI in Education",
          created_date: "2024-09-22",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "How artificial intelligence is being used to enhance learning and teaching methods.",
        },
        {
          id: 9,
          title: "Gamification in Education: Engaging the New Generation",
          created_date: "2024-09-08",
          image:
            "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
          description:
            "A look at how game-based learning is helping students stay engaged and motivated.",
        },
      ],
    },
  ];
  return (
    <div className="w-full bg-[#fbf8ff] min-h-screen">
      <header className="h-20 bg-red-400 w-full" />

      <div className="w-full mx-auto max-w-[1200px] p-3 space-y-5">
        <div className="grid grid-cols-12 w-full gap-3">
          {featured?.length > 0 &&
            featured?.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className={cn(
                    "w-full relative h-72 md:h-[70vh] rounded-md group",
                    index == 0
                      ? "md:col-span-6 col-span-12"
                      : "col-span-6 md:col-span-3"
                  )}
                >
                  <Image
                    src={item.image}
                    fill
                    objectFit="cover"
                    className="group-hover:scale-105 duration-300 transition-all ease-in-out rounded-md"
                  />
                  <div className="absolute z-20 top-0 left-0 w-full h-full flex flex-col justify-end gap-3 p-3">
                    <p className="bg-red-500 text-white uppercase p-1 w-fit text-xs">
                      {item.tag}
                    </p>
                    <h1 className="md:text-xl text-white font-bold">
                      {item.title}
                    </h1>
                    <p className="text-xs uppercase text-white">
                      {item.created_date}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="grid grid-cols-12 w-full gap-3">
  {fullData?.length > 0 &&
    fullData?.map((item2, index) => {
      return (
        <div className="w-full col-span-12" key={index}>
          <h2 className="font-bold text-xl">{item2.tag}</h2>
          {/* Custom HR styling */}
          <hr
            className="w-full mb-3"
            style={{
              border: "none",
              height: "2px",
              background:
                "linear-gradient(to right, red " +
                item2.tag.length * 8 +
                "px, #000 0)",
            }}
          />
          {/* Blogs scrollable horizontally without scrollbar */}
          <div className="flex overflow-x-auto space-x-4 pb-3 scrollbar-hide">
            {item2?.blogs?.length > 0 &&
              item2?.blogs.map((item, index2) => {
                return (
                  <div
                    key={index2 + 121212}
                    className="relative w-64 flex-none rounded-md"
                  >
                    <Image
                      src={item.image}
                      width={300}
                      height={180}
                      objectFit="cover"
                      className="rounded-md"
                    />
                    <div className="w-full h-full flex flex-col gap-3 p-3">
                      <h1 className="text-xl font-bold">{item.title}</h1>
                      <p className="text-xs uppercase">{item.created_date}</p>
                      <p className="text-xs">{item.description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      );
    })}
</div>

      </div>
    </div>
  );
};

export default page;

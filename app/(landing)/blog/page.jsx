"use client";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BlogPage = () => {
  
const router = useRouter()
  return (
    <div className="w-full bg-[#f5f7fa] min-h-screen">
      <Header dark={true} />
      <div className="container mx-auto px-3 py-3">
        <div onClick={()=>router.push("/blog/1")} className="w-full relative cursor-pointer">
          <div className="w-full h-full relative md:min-h-[70vh] min-h-[30vh] ">
            <Image
              src={
                "https://images.pexels.com/photos/3184290/pexels-photo-3184290.jpeg"
              }
              className="mx-auto rounded-lg"
              objectFit="cover"
              fill
            />
          </div>
          <div className="md:absolute my-3 max-md:bg-white rounded-md p-2 bottom-10 max-md:shadow-md md:w-80 left-10 space-y-4">
            <p className="md:text-white p-2 rounded-lg text-xs bg-violet-600 w-fit">
              Technology
            </p>
            <h3 className="font-bold md:text-white">
            The Birth of Xortcut: A New Era in Career Guidance
            </h3>
            <div className="flex gap-5 items-center">
              <div className="flex gap-2 items-center">
                <CircleUser size={20} className="text-black md:text-white" />
                <p className="text-black md:text-white text-xs">
                  Kiran Roice
                </p>
              </div>
              <p className="text-black md:text-white text-xs">
              12 October, 2024
              </p>
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-lg mt-3">
          {blogList?.length > 0 &&
            blogList?.map((item) => {
              return (
                <Link href={"/blog/1"} className="w-full p-3 shadow-md bg-white rounded-md" key={item.id}>
                  <div className="relative w-full h-72">
                  <Image
                    src={
                      "https://images.pexels.com/photos/3184290/pexels-photo-3184290.jpeg"
                    }
                    fill
                    className="rounded-md"
                  />
                  </div>
                  <p className=" ml-3 px-3 p-1 bg-violet-200 text-violet-600 w-fit text-xs mt-2 rounded-xl">
                    {item.tag}
                  </p>

                  <h1 className="mt-3 font-bold">{item.title}</h1>
                  <div className="flex gap-5 items-center mt-3">
                    <div className="flex gap-2 items-center">
                      <CircleUser size={20} className="text-black " />
                      <p className="text-black  text-xs">{item.name}</p>
                    </div>
                    <p className="text-black  text-xs">{item.date}</p>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;

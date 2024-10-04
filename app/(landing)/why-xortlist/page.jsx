import { FlameKindling } from "lucide-react";
import Link from "next/link";
import React from "react";
import { IoIosArrowRoundDown } from "react-icons/io";

const page = () => {
  const productList = [
    {
      id: 1,
      title: "Improve team productivity",
      slug: "improve-team-productivity",
    },
    {
      id: 2,
      title: "Increase pipeline predictability",
      slug: "increase-pipeline-predictability",
    },
    {
      id: 3,
      title: "Drive revenue growth",
      slug: "drive-revenue-growth",
    },
    {
      id: 4,
      title: "All describe my goals",
      slug: "all-describe-my-goals",
    },
  ];

  return (
    <main className="relative w-full bg-[#fbf8ff] min-h-screen">
      <header className="h-20 bg-red-400 w-full" />
      <section className="max-w-[1200px] mx-auto p-3 items-center w-full flex flex-col gap-7">
        <h6 className="text-center text-sm font-bold text-[#9069e7]">
          WHY XORTLIST?
        </h6>
        <h1 className="text-center  tracking-tight text-3xl sm:text-4xl md:text-5xl font-bold text-[#3e0075] uppercase w-4/5">
          Achieve your revenue goals with Xortlist
        </h1>
        <p className="text-center font-medium text-sm text-[#9069e7] w-4/5">
          See how Xortlist drives revenue outcomes with a powerful suite of AI
          features.
        </p>
      </section>
      <section className="max-w-[1200px] mx-auto p-3 w-full space-y-4">
        <div className="w-full flex gap-1 items-center">
          <p className=" font-bold text-sm text-[#3e0075]">
            What best describes your goal?
          </p>
          <IoIosArrowRoundDown color="#3e0075" size={20} />
        </div>
        <div className="grid w-full grid-cols-12 gap-5">
          {productList?.length > 0 &&
            productList?.map((item) => {
              return (
                <Link
                  href={`/why-xortlist/#${item.slug}`}
                  className="md:col-span-6 col-span-12 w-full bg-[#e5e0ee] hover:opacity-70 rounded-lg p-4 "
                >
                  <div className="flex gap-4 items-center max-sm:min-h-14">
                    <FlameKindling className="text-[#3e0075]" />
                    <p className="text-xl md:text-lg text-[#3e0075] font-semibold">
                      {item.title}
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </main>
  );
};

export default page;

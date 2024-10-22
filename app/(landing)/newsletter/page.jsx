"use client"
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import { useRouter } from "next/navigation";

export default function NewsletterPage() {
  const newsletters = [
    {
      id: 1,
      title: "Building a Remote-First Company Culture",
      description:
        "Learn how to foster a strong company culture, even when your team is fully remote.",
      date: "October 5, 2024",
    },
    {
      id: 2,
      title: "How to Scale Your Startup in 2024",
      description:
        "Best practices and tips for scaling your startup effectively in the coming year.",
      date: "September 20, 2024",
    },
    {
      id: 3,
      title: "The Future of AI in Business",
      description:
        "A deep dive into how AI will revolutionize the business world in the next decade.",
      date: "August 15, 2024",
    },
  ];
  const router = useRouter();
  return (
    <div className="bg-gray-100 min-h-screen ">
    <Header />
    <div className="max-w-6xl mx-auto p-8">
        {/* Newsletter Subscription Section */}
        <div className="bg-green-600 text-white p-6 rounded-lg mb-12">
          <h1 className="text-4xl font-bold">Subscribe to Our Newsletter</h1>
          <p className="mt-4">
            Stay updated with the latest news, trends, and tips from our team
            directly in your inbox.
          </p>
          <form className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-lg bg-white text-black w-full sm:w-2/3"
              />
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg w-full sm:w-1/3">
                Subscribe
              </button>
            </div>
          </form>
        </div>

        {/* Past Newsletters */}
        <h2 className="text-3xl font-semibold mb-8">Latest Newsletters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsletters.map((newsletter) => (
            <div
              key={newsletter.id}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <h3 className="text-xl font-semibold">{newsletter.title}</h3>
              <p className="text-gray-600 mt-2">{newsletter.description}</p>
              <p className="text-gray-500 mt-2">{newsletter.date}</p>
              <button
                onClick={() => router.push(`/newsletter/${newsletter.id}`)}
                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg"
              >
                Read More
              </button>
            </div>
          ))}
        </div>
        {/* Past Newsletters */}
        <h2 className="text-3xl font-semibold mb-8 mt-8">Past Newsletters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsletters.map((newsletter) => (
            <div
              key={newsletter.id}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <h3 className="text-xl font-semibold">{newsletter.title}</h3>
              <p className="text-gray-600 mt-2">{newsletter.description}</p>
              <p className="text-gray-500 mt-2">{newsletter.date}</p>
              <button
                onClick={() => router.push(`/newsletter/${newsletter.id}`)}
                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg"
              >
                Read More
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />

    </div>
  );
}

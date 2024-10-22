'use client';
import { useParams, useRouter } from 'next/navigation';

const dummyNewsletters = [
  {
    id: 1,
    title: 'Building a Remote-First Company Culture',
    date: 'October 5, 2024',
    content: `
      In a remote-first world, fostering a strong company culture becomes a challenge, but it is still essential. 
      Learn how to keep your team connected, engaged, and productive while working from home.
      
      - Build trust within your team
      - Schedule regular check-ins
      - Use technology to bridge gaps
      
      The future of work is remote, but culture should still be strong!
    `,
  },
  {
    id: 2,
    title: 'How to Scale Your Startup in 2024',
    date: 'September 20, 2024',
    content: `
      Scaling a startup is more than just increasing your customer base or revenue. In this newsletter, we dive 
      deep into strategies for scaling sustainably.
      
      - Focus on your product-market fit
      - Build a strong team
      - Ensure operational efficiency
      
      Learn how successful founders have scaled their startups while maintaining control and growing steadily.
    `,
  },
  {
    id: 3,
    title: 'The Future of AI in Business',
    date: 'August 15, 2024',
    content: `
      AI is transforming every industry, but its potential in business is particularly exciting. This newsletter explores 
      how AI will impact the business world in the next decade.
      
      - Automation and AI in customer service
      - AI-driven marketing insights
      - The rise of AI in decision-making
      
      Discover how to prepare your business for an AI-driven future.
    `,
  },
];

export default function NewsletterDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  
  // Find the newsletter by ID
  const newsletter = dummyNewsletters.find((news) => news.id === parseInt(id));

  if (!newsletter) {
    return <p className="text-center mt-16 text-xl text-gray-600">Newsletter not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-8 lg:p-12">
        {/* Header section */}
        <header className="mb-6">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{newsletter.title}</h1>
          <p className="text-gray-500 text-sm">{newsletter.date}</p>
        </header>

        {/* Divider */}
        <div className="border-t-2 border-gray-200 my-4"></div>

        {/* Content section */}
        <section className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
          {newsletter.content.split('\n').map((line, index) => (
            <p key={index} className="mb-4">{line}</p>
          ))}
        </section>

        {/* Call to action */}
        <div className="mt-8">
          <button 
            onClick={() => router.push('/newsletter')}
            className="inline-block bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg shadow-md transition-colors"
          >
            Back to Newsletters
          </button>
        </div>
      </div>
    </div>
  );
}

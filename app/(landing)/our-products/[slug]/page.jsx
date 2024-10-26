"use client"
import Header from '@/app/_components/Header';
// pages/products/[slug].js

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

const productDetails = {
  kids: {
    title: "Xortlist Kids",
    subtitle: "Exploration for Ages 6-9",
    heroImage: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    intro:
      "Xortlist Kids offers a playful environment for younger children to explore their interests and strengths. Through games, activities, and interactive quizzes, children uncover their unique qualities in a fun, engaging way.",
    features: [
      { title: "Playful Exploration", description: "Engaging activities designed to help children discover their interests through play." },
      { title: "Personalized Learning", description: "Age-appropriate quizzes and activities tailored for young minds." },
      { title: "Safe and Secure", description: "Strict privacy and data protection, keeping children’s information secure." },
    ],
    testimonials: [
      { name: "Jane Doe", feedback: "Xortlist Kids helped my child discover new interests in a safe, fun environment!" },
      { name: "John Smith", feedback: "A fantastic tool for young kids to learn about themselves in an interactive way." },
    ],
    cta: "Start the journey with Xortlist Kids today!",
  },
  junior: {
    title: "Xortlist Junior",
    subtitle: "Guided Growth for Ages 10-13",
    heroImage: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    intro:
      "Xortlist Junior provides structured assessments and fun challenges, helping pre-teens align their interests with academic and extracurricular paths. Discover your passions and unlock potential with Xortlist Junior.",
    features: [
      { title: "Skill Building", description: "Encourages development of emerging skills through interactive challenges." },
      { title: "Goal Setting", description: "Teaches pre-teens to set basic goals and start exploring potential careers." },
      { title: "Parental Insights", description: "Provides valuable feedback for parents on their child’s progress and interests." },
    ],
    testimonials: [
      { name: "Alice Johnson", feedback: "The guided challenges are perfect for my pre-teen to discover their strengths." },
      { name: "Michael Brown", feedback: "Xortlist Junior gave my child the confidence to explore new interests." },
    ],
    cta: "Encourage growth with Xortlist Junior!",
  },
  senior: {
    title: "Xortlist Senior",
    subtitle: "Future Focused for Ages 14-17",
    heroImage: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    intro:
      "Xortlist Senior equips teens with the tools they need to make informed decisions about their future. Through advanced assessments and real-world simulations, teens can explore career paths and set achievable goals.",
    features: [
      { title: "Career Exploration", description: "Hands-on simulations and assessments for discovering career paths." },
      { title: "Mentorship Opportunities", description: "Connects students with professionals for real-world insights." },
      { title: "Milestone Tracking", description: "Helps teens track progress toward their goals and future career." },
    ],
    testimonials: [
      { name: "David White", feedback: "Xortlist Senior helped my teenager decide on their future path with confidence." },
      { name: "Laura Green", feedback: "Amazing guidance and mentorship opportunities for young adults." },
    ],
    cta: "Start planning your future with Xortlist Senior!",
  },
};

const ProductDetail = () => {
    const router = useParams();
    // console.log(router)
    const { slug } = router;
    const product = productDetails[slug];

  if (!product) return <p>Loading...</p>;

  return (
    <div className="w-full">
        <Header />
    <div className="container mx-auto p-6">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="min-h-screen flex flex-col justify-center items-center text-center bg-cover bg-center relative"
        style={{ backgroundImage: `url(${product.heroImage})` }}
      >
        <div className="bg-black bg-opacity-50 w-full h-full absolute top-0 left-0 z-0"></div>
        <div className="relative z-10 p-8 max-w-2xl mx-auto text-white">
          <h1 className="text-5xl font-bold mb-4">{product.title}</h1>
          <h2 className="text-2xl mb-4">{product.subtitle}</h2>
          <p className="text-lg">{product.intro}</p>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="my-16">
        <h2 className="text-4xl font-bold text-white text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {product.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-6 shadow-lg rounded-lg text-center"
            >
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="my-16 bg-gray-100 p-8 rounded-lg">
        <h2 className="text-4xl font-bold text-center mb-8">What Parents & Students Say</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {product.testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-6 shadow-lg rounded-lg text-center max-w-md mx-auto"
            >
              <p className="italic text-gray-700 mb-4">"{testimonial.feedback}"</p>
              <p className="font-semibold text-gray-800">- {testimonial.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="my-16 flex flex-col items-center text-center bg-yellow-400 p-8 rounded-lg"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{product.cta}</h2>
        <button className="mt-4 px-8 py-4 text-lg font-semibold text-gray-900 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition">
          Get Started
        </button>
      </motion.section>
    </div>
    </div>
  );
};

export default ProductDetail;

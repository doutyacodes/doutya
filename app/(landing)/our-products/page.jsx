"use client"
// pages/products.js

import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const products = [
  {
    name: "Xortlist Kids",
    subtitle: "Exploration for Ages 6-9",
    description:
      "An engaging introduction to self-discovery, helping children uncover their unique strengths and interests through playful activities and games. Perfect for younger kids ready to explore!",
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    slug: "kids",
  },
  {
    name: "Xortlist Junior",
    subtitle: "Guided Growth for Ages 10-13",
    description:
      "Building on early exploration, Xortlist Junior offers structured assessments that help pre-teens identify and develop emerging skills and passions in a fun and interactive way.",
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    slug: "junior",
  },
  {
    name: "Xortlist Senior",
    subtitle: "Future Focused for Ages 14-17",
    description:
      "A comprehensive guidance program for teens ready to explore career paths. Xortlist Senior provides advanced assessments, milestone tracking, and mentorship opportunities.",
    image: "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
    slug: "senior",
  },
];

const ProductSection = ({ product }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.25,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.7 }}
      className="min-h-screen flex flex-col justify-center bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: `url(${product.image})` }}
    >
      <div className="bg-black bg-opacity-50 p-8 sm:p-16 md:p-24 lg:p-32 xl:p-48 text-center space-y-6">
        <h2 className="text-5xl font-bold mb-4">{product.name}</h2>
        <h3 className="text-2xl mb-4">{product.subtitle}</h3>
        <p className="text-lg max-w-xl mx-auto mb-6">{product.description}</p>
        <Link href={`/our-products/${product.slug}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="mt-6 px-6 py-3 text-lg font-semibold text-gray-900 bg-yellow-400 rounded-lg shadow-lg hover:bg-yellow-500 transition"
          >
            Learn More
          </motion.button>
        </Link>
      </div>
    </motion.section>
  );
};

const ProductsPage = () => {
  return (
    <div className="overflow-hidden">
      <h1 className="text-4xl text-center font-bold my-12 text-white">Explore Xortlist Programs</h1>
      {products.map((product) => (
        <ProductSection key={product.slug} product={product} />
      ))}
    </div>
  );
};

export default ProductsPage;

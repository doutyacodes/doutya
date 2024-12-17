"use client"

import { motion } from 'framer-motion';

const dummyData = [
  {
    id: 1,
    name: 'Apple Inc.',
    image: 'https://wowfy.in/testusr/images/apple-logo.jpg',
    description: 'Apple Inc. designs, manufactures, and markets mobile communication and media devices.',
  },
  {
    id: 2,
    name: 'Microsoft Corporation',
    image: 'https://wowfy.in/testusr/images/microsoft.png',
    description: 'Microsoft develops, licenses, and supports a range of software products, services, and devices.',
  },
  // Add more dummy data if needed
];

export default function ResultsPage() {
  const searchQuery = 'Apple'; // Replace dynamically with search query
  const results = dummyData; // Replace with API data or dummy data

  return (
    <div className="min-h-screen bg-[#2a2b27] text-white p-6">
      {/* Static Text */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">
          {results.length > 0 ? `Results related to "${searchQuery}"` : 'No companies available'}
        </h1>
        {results.length === 0 && (
          <p className="mt-2 text-gray-400">Try searching for a different company.</p>
        )}
      </div>

      {/* Results List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {results.map((company) => (
          <motion.div
            key={company.id}
            className="bg-[#1f1f1b] p-6 rounded-lg shadow-md hover:shadow-lg transition border border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={company.image}
                alt={company.name}
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold mt-4 mb-2">{company.name}</h2>
            <p className="text-gray-400 text-sm ">
              {company.description.length > 100
                ? company.description.slice(0, 100) + '...'
                : company.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State Animation */}
      {results.length === 0 && (
        <motion.div
          className="flex flex-col items-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="https://via.placeholder.com/200"
            alt="No Data"
            className="mb-4"
          />
          <p className="text-lg font-medium">No companies match your search.</p>
        </motion.div>
      )}
    </div>
  );
}

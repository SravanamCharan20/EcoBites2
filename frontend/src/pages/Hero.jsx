import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="w-full mt-32 bg-[#fff] flex items-center rounded-full justify-center relative overflow-hidden">
      {/* Background Circles */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-20"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1.2 }}
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute w-full h-full"
        >
          <circle cx="200" cy="200" r="150" fill="#FFEB3B" />
          <circle cx="1200" cy="200" r="200" fill="#03A9F4" />
        </svg>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl lg:text-7xl font-extrabold text-[#0a1f44] mb-4">
          Empowering Communities with Ecobites
        </h1>
        <p className="text-lg lg:text-xl text-gray-700 mb-6 max-w-xl">
          Share your extra food and essentials, connect with your community, 
          and support sustainable living. With Ecobites, giving back has never been easier.
        </p>
        <div className="flex justify-center space-x-6">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105">
            Get Started
          </button>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute bottom-10 left-10 opacity-30"
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className="w-24 h-24"
        >
          <circle cx="50" cy="50" r="30" fill="#4CAF50" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-10 right-10 opacity-30"
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className="w-24 h-24"
        >
          <rect x="15" y="15" width="70" height="70" fill="#FF5722" />
        </svg>
      </motion.div>
    </section>
  );
};

export default HeroSection;
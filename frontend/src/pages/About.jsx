import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-200 to-blue-200 flex flex-col font-sans overflow-hidden">

      {/* Hero Section with Animated Background */}
      <section className="relative w-full flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#fff] to-teal-400 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="relative text-center p-10 z-10"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
        >
          <h1 className="text-6xl font-extrabold text-gray-800 mb-6">About Ecobites</h1>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto">
            A community-driven platform dedicated to reducing waste and providing essentials to those in need.
          </p>
        </motion.div>
      </section>

      {/* Our Mission and Vision */}
      <section className="w-full py-24 px-6 md:px-12 max-w-7xl mx-auto text-center bg-white shadow-lg rounded-lg">
        <h2 className="text-5xl font-bold text-gray-800 mb-12">Our Mission & Vision</h2>
        <div className="flex flex-col md:flex-row justify-around">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="bg-gradient-to-tr from-yellow-400 to-red-400 shadow-lg rounded-lg p-10 m-4 transition-transform duration-300 w-80"
          >
            <h3 className="text-3xl font-semibold text-white mb-4">Mission</h3>
            <p className="text-gray-200">
              To empower communities by reducing waste and ensuring access to essential goods for everyone.
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            className="bg-gradient-to-tr from-purple-400 to-pink-400 shadow-lg rounded-lg p-10 m-4 transition-transform duration-300 w-80"
          >
            <h3 className="text-3xl font-semibold text-white mb-4">Vision</h3>
            <p className="text-gray-200">
              To create a sustainable future where resources are shared, waste is minimized, and communities flourish.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Values with Icons */}
      <section className="py-24 bg-gradient-to-bl from-green-200 to-blue-200">
        <h2 className="text-5xl font-bold text-gray-800 text-center mb-16">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-12 max-w-7xl mx-auto">
          {["Sustainability", "Community", "Innovation"].map((value, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-white shadow-xl rounded-lg p-10 text-center transition-transform duration-300"
            >
              <div className="bg-gradient-to-tr from-green-500 to-blue-500 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-8 h-8">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm0 22c-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm-1-15h2v6h-2V7zm0 8h2v2h-2v-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">{value}</h3>
              <p className="text-gray-600 mt-2">
                Embracing {value.toLowerCase()} as a fundamental principle to guide our actions and decisions.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-24 bg-white">
        <h2 className="text-5xl font-bold text-gray-800 text-center mb-16">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-12 max-w-7xl mx-auto">
          {[
            { name: 'John Doe', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6' },
            { name: 'Jane Smith', role: 'Operations Manager', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
            { name: 'Emily Johnson', role: 'Community Outreach', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36' }
          ].map((member, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-100 shadow-lg rounded-lg p-6 text-center transition-transform duration-300"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-md"
              />
              <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
              <p className="text-green-600 font-semibold">{member.role}</p>
              <p className="text-gray-600 mt-2">
                {member.name.split(' ')[0]} leads with passion, ensuring that every initiative reflects our values.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-r from-green-400 to-blue-600 text-center text-white shadow-lg">
        <h2 className="text-5xl font-bold mb-4">Get Involved!</h2>
        <p className="text-lg mb-8">
          Join us in our mission to reduce waste and support those in need. Together, we can make a difference!
        </p>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold shadow-xl transition duration-300"
        >
          Join Us
        </motion.button>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-gray-300 py-8 text-center">
        <p className="text-lg">&copy; 2024 Ecobites. Together, we create a better world.</p>
      </footer>
    </div>
  );
};

export default About;
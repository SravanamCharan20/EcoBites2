import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        navigate('/signin');
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - Header and Description */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Header Section */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
            <p className="text-lg font-light text-gray-300">
              Join our community of donors
            </p>
          </div>

          {/* Description Card */}
          <motion.div 
            className="bg-gray-50 rounded-3xl p-6 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Joining</h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span>Make a difference in your community</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span>Track your donations and impact</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span>Connect with other donors</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Right Column - Sign Up Form */}
        <div className="col-span-full lg:col-span-8">
          <motion.div 
            className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Username Field */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FiUser className="text-gray-400 text-xl" />
                  <label htmlFor="username" className="text-lg font-medium text-gray-900">
                    Username
                  </label>
                </div>
                <input
                  type="text"
                  id="username"
                  onChange={handleChange}
                  required
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Choose a username"
                  aria-label="Username"
                />
              </div>

              {/* Email Field */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FiMail className="text-gray-400 text-xl" />
                  <label htmlFor="email" className="text-lg font-medium text-gray-900">
                    Email Address
                  </label>
                </div>
                <input
                  type="email"
                  id="email"
                  onChange={handleChange}
                  required
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter your email"
                  aria-label="Email"
                />
              </div>

              {/* Password Field */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FiLock className="text-gray-400 text-xl" />
                  <label htmlFor="password" className="text-lg font-medium text-gray-900">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  id="password"
                  onChange={handleChange}
                  required
                  className="w-full mt-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Create a password"
                  aria-label="Password"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-50 text-red-600 rounded-xl"
                  aria-live="assertive"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? <SyncLoader size={6} color="#fff" /> : 'Create Account'}
                </button>

                <div className="text-center">
                  <span className="text-gray-600">Already have an account? </span>
                  <Link
                    to="/signin"
                    className="text-gray-900 hover:text-gray-700 font-medium transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

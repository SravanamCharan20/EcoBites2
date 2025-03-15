import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../reducers/userSlice';
import { SyncLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleGoogleSignIn = () => {
    localStorage.setItem('redirectPath', from);
    window.location.href = '/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem('access_token', data.token);
        dispatch(setUser({ token: data.token, user: data.user }));
        navigate(from);
      } else {
        setMessage(data.message || 'Invalid credentials, please try again.');
      }
    } catch (error) {
      setLoading(false);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Left Column - Header and Description */}
        <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
          {/* Header Section */}
          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-lg font-light text-gray-300">
              Sign in to your account to continue
            </p>
          </div>

          {/* Description Card */}
          <motion.div 
            className="bg-gray-50 rounded-3xl p-6 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Sign In?</h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span>Access your donation history</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span>Track your impact</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span>Manage your profile</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Right Column - Sign In Form */}
        <div className="col-span-full lg:col-span-8">
          <motion.div 
            className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8 space-y-6">
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm"
              >
                <FcGoogle className="text-xl" />
                <span>Continue with Google</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Enter your password"
                  />
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-50 text-red-600 rounded-xl"
                  >
                    {message}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? <SyncLoader size={6} color="#fff" /> : 'Sign In'}
                </button>

                <div className="text-center">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link
                    to="/signup"
                    className="text-gray-900 hover:text-gray-700 font-medium transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
